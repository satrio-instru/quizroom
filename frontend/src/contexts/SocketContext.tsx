import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { User, AllowedSubmissions } from '../types/types';
import { config } from '../config';

interface UserAccess {
  npm: string;
  name: string;
  unlimited: boolean;
  expiresAt: number | null;
  schedule: string | null;
}

interface StoredSession {
  roomId: string;
  npm: string;
  userId?: string;
  access?: UserAccess;
}

interface SocketContextType {
  socket: Socket | null;
  quizState: any | null;
  user: User | null;
  userId: string | null;
  currentRoomId: string | null;
  participantNpm: string | null;
  userAccess: UserAccess | null;
  joinError: string | null;
  isConnected: boolean;
  joinRoom: (roomId: string, npm: string) => void;
  leaveRoom: () => void;
  submitAnswer: (roomId: string, problemId: string, optionSelected: AllowedSubmissions) => void;
  createRoom: (npm: string) => void;
  clearJoinError: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);
const SESSION_STORAGE_KEY = 'quizroom:participant-session';

const getStoredSession = (): StoredSession | null => {
  try {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return rawSession ? JSON.parse(rawSession) as StoredSession : null;
  } catch {
    return null;
  }
};

const saveStoredSession = (session: StoredSession) => {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const clearStoredSession = () => {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const storedSession = getStoredSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [quizState, setQuizState] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(storedSession?.userId ?? null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(storedSession?.roomId ?? null);
  const [participantNpm, setParticipantNpm] = useState<string | null>(storedSession?.npm ?? null);
  const [userAccess, setUserAccess] = useState<UserAccess | null>(storedSession?.access ?? null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // BUG FIX [8.19]: Add reconnection strategy for Render.com cold starts
    const newSocket = io(config.socketUrl, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    const onConnect = () => {
      setIsConnected(true);
      const session = getStoredSession();
      if (session?.roomId && session?.npm) {
        newSocket.emit('join', { roomId: session.roomId, npm: session.npm });
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onInit = (data: any) => {
      if (data.userId && data.state !== null && data.state !== undefined) {
        setUserId(data.userId);
        setCurrentRoomId(data.roomId);
        setParticipantNpm(data.npm);
        setUserAccess(data.access);
        setJoinError(null);

        // BUG FIX [8.11]: Set user state from init data
        setUser({
          id: data.userId,
          name: data.access?.name ?? data.npm,
          npm: data.npm,
          points: 0,
          accessExpiresAt: data.access?.expiresAt,
          unlimitedAccess: data.access?.unlimited,
        });

        saveStoredSession({
          roomId: data.roomId,
          npm: data.npm,
          userId: data.userId,
          access: data.access,
        });
        setQuizState(data.state);
      } else {
        // Room doesn't exist or couldn't join
        clearStoredSession();
        setUserId(null);
        setUser(null);
        setUserAccess(null);
        setQuizState({ type: 'room_not_found' });
      }
    };

    const onJoinRejected = (data: any) => {
      clearStoredSession();
      setUserId(null);
      setCurrentRoomId(null);
      setParticipantNpm(null);
      setUser(null);
      setUserAccess(null);
      setJoinError(data.message ?? 'NPM tidak diizinkan masuk.');
      setQuizState(null);
    };

    const onProblem = (data: any) => {
      setQuizState({
        type: 'question',
        problem: data.problem
      });
    };

    const onLeaderboard = (data: any) => {
      setQuizState({
        type: 'leaderboard',
        leaderboard: data.leaderboard
      });
    };

    // BUG FIX [8.20]: Add quizEnd handler
    const onQuizEnd = (data: any) => {
      setQuizState({
        type: 'ended',
        leaderboard: data.leaderboard
      });
    };

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('init', onInit);
    newSocket.on('joinRejected', onJoinRejected);
    newSocket.on('problem', onProblem);
    newSocket.on('leaderboard', onLeaderboard);
    newSocket.on('quizEnd', onQuizEnd);

    return () => {
      // BUG FIX [8.10]: Explicit listener cleanup
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.off('init', onInit);
      newSocket.off('joinRejected', onJoinRejected);
      newSocket.off('problem', onProblem);
      newSocket.off('leaderboard', onLeaderboard);
      newSocket.off('quizEnd', onQuizEnd);
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId: string, npm: string) => {
    if (socket) {
      setJoinError(null);
      socket.emit('join', { roomId, npm });
      setCurrentRoomId(roomId);
      setParticipantNpm(npm);
    }
  };

  const createRoom = (npm: string) => {
    // Generate a random room ID for the user
    const roomId = crypto.randomUUID().slice(0, 8);
    if (socket) {
      socket.emit('join', { roomId, npm });
      setCurrentRoomId(roomId);
      setParticipantNpm(npm);
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoomId) {
      socket.emit('leave', { roomId: currentRoomId });
      clearStoredSession();
      setCurrentRoomId(null);
      setParticipantNpm(null);
      setUserId(null);
      setUser(null);
      setUserAccess(null);
      setQuizState(null);
    }
  };

  const clearJoinError = () => {
    setJoinError(null);
  };

  const submitAnswer = (roomId: string, problemId: string, optionSelected: AllowedSubmissions) => {
    if (socket && userId) {
      socket.emit('submit', {
        roomId,
        problemId,
        submission: optionSelected,
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        quizState,
        user,
        userId,
        currentRoomId,
        participantNpm,
        userAccess,
        joinError,
        isConnected,
        joinRoom,
        leaveRoom,
        submitAnswer,
        createRoom,
        clearJoinError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
