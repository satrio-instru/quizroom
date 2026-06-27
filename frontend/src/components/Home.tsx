import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { useSocket } from '../contexts/SocketContext';

export const Home = () => {
    const [npm, setNpm] = useState('');
    const [roomId, setRoomId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const { joinRoom, isConnected, joinError, clearJoinError, currentRoomId, quizState } = useSocket();
    const navigate = useNavigate();
    const isNpmValid = /^\d+$/.test(npm);

    // Navigate only after server confirms join
    useEffect(() => {
        if (isJoining && currentRoomId && quizState && quizState.type !== 'room_not_found') {
            setIsJoining(false);
            navigate(`/quiz/${currentRoomId}`);
        }
        if (isJoining && quizState?.type === 'room_not_found') {
            setIsJoining(false);
        }
        if (isJoining && joinError) {
            setIsJoining(false);
        }
        // Reset isJoining if disconnected
        if (isJoining && !isConnected) {
            setIsJoining(false);
        }
    }, [currentRoomId, quizState, joinError, isJoining, navigate, isConnected]);

    const handleJoinRoom = () => {
        if (isNpmValid && roomId.trim()) {
            setIsJoining(true);
            clearJoinError();
            joinRoom(roomId.trim(), npm.trim());
        }
    };

    const handleNpmChange = (value: string) => {
        clearJoinError();
        setNpm(value.replace(/\D/g, ''));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-800">Quiz App</CardTitle>
                    <CardDescription>
                        Join an existing quiz or create a new one
                    </CardDescription>
                    <div className="flex items-center justify-center mt-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="ml-2 text-sm text-gray-600">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="join" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="join">Join Quiz</TabsTrigger>
                            <TabsTrigger value="create">Create Quiz</TabsTrigger>
                        </TabsList>

                        <TabsContent value="join" className="space-y-4">
                            {joinError && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertDescription className="text-red-700">{joinError}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="join-npm">NPM</Label>
                                <Input
                                    id="join-npm"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Masukkan NPM"
                                    value={npm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNpmChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="room-id">Room ID</Label>
                                <Input
                                    id="room-id"
                                    placeholder="Ask your instructor for the room ID"
                                    value={roomId}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && isNpmValid && roomId.trim() && handleJoinRoom()}
                                />
                            </div>
                            <Button
                                onClick={handleJoinRoom}
                                className="w-full"
                                disabled={!isNpmValid || !roomId.trim() || !isConnected || isJoining}
                            >
                                {!isConnected ? 'Connecting...' : isJoining ? 'Joining...' : 'Join Quiz'}
                            </Button>
                        </TabsContent>

                        <TabsContent value="create" className="space-y-4">
                            <div className="space-y-4 flex flex-col items-center p-10">
                                <div className="text-center space-y-4">
                                    <h3 className="font-semibold text-lg">Create Your Own Quiz</h3>
                                    <p className="text-gray-600 text-sm">
                                        To create and manage quizzes, switch to Admin Mode using the button in the top-right corner.
                                    </p>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-blue-800 text-sm">
                                            <strong>Admin Features:</strong>
                                            <br />• Create quiz rooms
                                            <br />• Add questions and answers
                                            <br />• Control quiz flow
                                            <br />• Monitor live results
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};
