import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useSocket } from '../contexts/SocketContext';
import type { AllowedSubmissions } from '../types/types';
import { Plus, Trash2, Save, RefreshCw, Upload } from 'lucide-react';
import { fetchParticipants, saveParticipants, type ParticipantRow } from '../lib/supabase';

interface ParticipantScheduleDraft {
  id: number;
  npm: string;
  name: string;
  date: string;
  day: string;
  startTime: string;
  durationMinutes: string;
  endTime: string;
}

const createScheduleDraft = (id: number): ParticipantScheduleDraft => ({
  id,
  npm: '',
  name: '',
  date: '',
  day: '',
  startTime: '',
  durationMinutes: '20',
  endTime: '',
});

export const Admin = () => {
    
  const { socket, isConnected } = useSocket();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [currentQuizState, setCurrentQuizState] = useState<any>(null);
  const [activeQuizzes, setActiveQuizzes] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Problem creation form
  const [problemTitle, setProblemTitle] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<AllowedSubmissions>(0);
  const [participantSchedules, setParticipantSchedules] = useState<ParticipantScheduleDraft[]>([
    createScheduleDraft(1),
  ]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<string>('');
  const [scheduleError, setScheduleError] = useState<string>('');

  // Listen for authentication events (always active)
  useEffect(() => {
    if (socket) {
      socket.on('adminAuth', (data) => {
        if (data.success) {
          setIsAuthenticated(true);
          setError('');
          setSuccess('');
        } else {
          setError('Invalid admin password');
          setIsAuthenticated(false);
          setSuccess('');
        }
      });

      return () => {
        socket.off('adminAuth');
      };
    }
  }, [socket]);

  // Auto-load participants from Supabase when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      handleLoadParticipants();
    }
  }, [isAuthenticated]);

  // Listen for admin events (only when authenticated)
  useEffect(() => {
    if (socket && isAuthenticated) {
      // Load rooms from Supabase
      socket.emit('getRooms');
      socket.on('roomsList', (rooms: any[]) => {
        setActiveQuizzes(rooms.map(r => r.room_id));
      });

      socket.on('quizCreated', (data) => {
        const msg = data.questionCount > 0
          ? `Room "${data.roomId}" berhasil dibuat dengan ${data.questionCount} soal!`
          : `Room "${data.roomId}" berhasil dibuat!`;
        setSuccess(msg);
        setActiveQuizzes(prev => prev.includes(data.roomId) ? prev : [...prev, data.roomId]);
        setTimeout(() => setSuccess(''), 5000);
      });

      socket.on('problemAdded', () => {
        setSuccess('Problem added successfully!');
        setProblemTitle('');
        setProblemDescription('');
        setOptions(['', '', '', '']);
        setCorrectAnswer(0);
        setTimeout(() => setSuccess(''), 3000);
      });

      socket.on('quizStateUpdate', (data) => {
        setCurrentQuizState(data);
      });

      socket.on('error', (data) => {
        setError(data.message);
        setSuccess('');
      });

      return () => {
        socket.off('roomsList');
        socket.off('quizCreated');
        socket.off('problemAdded');
        socket.off('quizStateUpdate');
        socket.off('error');
      };
    }
  }, [socket, isAuthenticated]);  const handleLogin = () => {
    if (socket && password.trim()) {
      console.log('Attempting admin login with password:', password.trim());
      socket.emit('joinAdmin', { password: password.trim() });
      setError('');
      setSuccess('Authenticating...');
    } else if (!socket) {
      setError('Not connected to server');
    } else {
      setError('Please enter a password');
    }
  };

  const handleCreateQuiz = () => {
    if (!socket || !isConnected) {
      setError('Tidak terhubung ke server. Coba refresh halaman.');
      return;
    }
    if (!roomId.trim()) {
      setError('Masukkan Room ID terlebih dahulu.');
      return;
    }
    socket.emit('createQuiz', { roomId: roomId.trim() });
    setSuccess(`Membuat room "${roomId.trim()}"...`);
    setError('');
  };

  const handleCreateProblem = () => {
    if (socket && roomId.trim() && problemTitle.trim() && problemDescription.trim()) {
      const problem = {
        title: problemTitle.trim(),
        description: problemDescription.trim(),
        options: options.map((option, index) => ({
          id: index,
          title: option.trim()
        })).filter(option => option.title !== ''),
        answer: correctAnswer
      };
      
      if (problem.options.length < 2) {
        setError('Please provide at least 2 options');
        return;
      }

      socket.emit('createProblem', { roomId: roomId.trim(), problem });
      setError('');
    }
  };

  const handleNext = () => {
    if (!socket || !isConnected) {
      setError('Tidak terhubung ke server. Coba refresh halaman.');
      return;
    }
    if (!roomId.trim()) {
      setError('Masukkan Room ID terlebih dahulu.');
      return;
    }
    socket.emit('next', { roomId: roomId.trim() });
    setSuccess('Maju ke soal berikutnya...');
    setError('');
  };

  const handleStartQuiz = () => {
    if (!socket || !isConnected) {
      setError('Tidak terhubung ke server. Coba refresh halaman.');
      return;
    }
    if (!roomId.trim()) {
      setError('Masukkan Room ID terlebih dahulu.');
      return;
    }
    socket.emit('start', { roomId: roomId.trim() });
    setSuccess(`Memulai quiz di room "${roomId.trim()}"...`);
    setError('');
  };

  const handleGetQuizState = () => {
    if (!socket || !isConnected) {
      setError('Tidak terhubung ke server. Coba refresh halaman.');
      return;
    }
    if (!roomId.trim()) {
      setError('Masukkan Room ID terlebih dahulu.');
      return;
    }
    socket.emit('getQuizState', { roomId: roomId.trim() });
    setSuccess('Memuat status quiz...');
    setError('');
  };

  // BUG FIX [8.17]: Add logout functionality
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setCurrentQuizState(null);
    setActiveQuizzes([]);
    setError('');
    setSuccess('');
  };

  // Load participants from Supabase
  const handleLoadParticipants = async () => {
    setScheduleLoading(true);
    setScheduleError('');
    setScheduleStatus('');
    try {
      const data = await fetchParticipants();
      if (data.length === 0) {
        setScheduleStatus('Belum ada data peserta di server.');
        return;
      }
      const drafts: ParticipantScheduleDraft[] = data.map((row, i) => ({
        id: row.id ?? Date.now() + i,
        npm: row.npm ?? '',
        name: row.name ?? '',
        date: row.date ?? '',
        day: row.day ?? '',
        startTime: row.start_time ?? '',
        durationMinutes: row.duration_minutes ?? '20',
        endTime: row.end_time ?? '',
      }));
      setParticipantSchedules(drafts);
      setScheduleStatus(`Berhasil memuat ${drafts.length} peserta dari server.`);
      setTimeout(() => setScheduleStatus(''), 3000);
    } catch (err) {
      setScheduleError('Gagal memuat data dari server.');
    } finally {
      setScheduleLoading(false);
    }
  };

  // Save participants to Supabase
  const handleSaveParticipants = async () => {
    setScheduleSaving(true);
    setScheduleError('');
    setScheduleStatus('');
    try {
      const rows: ParticipantRow[] = participantSchedules.map(s => ({
        npm: s.npm,
        name: s.name,
        date: s.date,
        day: s.day,
        start_time: s.startTime,
        duration_minutes: s.durationMinutes,
        end_time: s.endTime,
      }));
      const result = await saveParticipants(rows);
      if (result.success) {
        const count = rows.filter(r => r.npm.trim()).length;
        setScheduleStatus(`Berhasil menyimpan ${count} peserta ke server!`);
        // Tell backend to refresh its cache
        if (socket) {
          socket.emit('refreshParticipants');
        }
        setTimeout(() => setScheduleStatus(''), 3000);
      } else {
        setScheduleError(`Gagal menyimpan: ${result.error}`);
      }
    } catch (err) {
      setScheduleError('Gagal menyimpan data ke server.');
    } finally {
      setScheduleSaving(false);
    }
  };

  // Import from JSON (for bulk import from PESERTA.md script)
  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text) as ParticipantScheduleDraft[];
        if (Array.isArray(data) && data.length > 0) {
          setParticipantSchedules(data.map((d, i) => ({ ...d, id: d.id ?? Date.now() + i })));
          setScheduleStatus(`Berhasil import ${data.length} peserta dari file JSON.`);
          setTimeout(() => setScheduleStatus(''), 3000);
        }
      } catch {
        setScheduleError('File JSON tidak valid.');
      }
    };
    input.click();
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addParticipantSchedule = () => {
    setParticipantSchedules(prev => [
      ...prev,
      createScheduleDraft(Date.now()),
    ]);
  };

  const removeParticipantSchedule = (id: number) => {
    setParticipantSchedules(prev => prev.length === 1 ? prev : prev.filter(schedule => schedule.id !== id));
  };

  const updateParticipantSchedule = (
    id: number,
    field: keyof Omit<ParticipantScheduleDraft, 'id'>,
    value: string
  ) => {
    const normalizedValue = field === 'npm' || field === 'durationMinutes'
      ? value.replace(/\D/g, '')
      : value;

    setParticipantSchedules(prev => prev.map(schedule => (
      schedule.id === id
        ? { ...schedule, [field]: normalizedValue }
        : schedule
    )));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Admin Login</CardTitle>
            <CardDescription>
              Enter admin password to access quiz management
            </CardDescription>
            <div className="flex items-center justify-center mt-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="ml-2 text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={!password.trim() || !isConnected}
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Quiz Admin Panel
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Manage quizzes, problems, and control flow</CardDescription>
          </CardHeader>
        </Card>

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="quiz">Quiz Management</TabsTrigger>
            <TabsTrigger value="problems">Create Problems</TabsTrigger>
            <TabsTrigger value="schedule">Jadwal Peserta</TabsTrigger>
            <TabsTrigger value="control">Quiz Control</TabsTrigger>
            <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quiz" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Quiz</CardTitle>
                  <CardDescription>Set up a new quiz room</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-id">Room ID</Label>
                    <Input
                      id="room-id"
                      placeholder="Enter unique room ID (e.g., quiz-001)"
                      value={roomId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateQuiz} 
                    disabled={!roomId.trim()}
                    className="w-full"
                  >
                    Create Quiz Room
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Active Quizzes
                    <Button size="sm" variant="outline" onClick={() => socket?.emit('getRooms')}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </CardTitle>
                  <CardDescription>Room dari Supabase (persist, tidak hilang)</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeQuizzes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Belum ada room. Ketik Room ID dan klik Create.</p>
                  ) : (
                    <div className="space-y-2">
                      {activeQuizzes.map((quiz) => (
                        <div key={quiz} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{quiz}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRoomId(quiz)}
                          >
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="problems" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Problem</CardTitle>
                <CardDescription>
                  {roomId ? `Adding to room: ${roomId}` : 'Select a room ID first'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!roomId && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertDescription className="text-yellow-700">
                      Please select or create a room first in the Quiz Management tab
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="problem-title">Problem Title</Label>
                  <Input
                    id="problem-title"
                    placeholder="Enter a clear, concise question title"
                    value={problemTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProblemTitle(e.target.value)}
                    disabled={!roomId}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="problem-description">Problem Description</Label>
                  <Input
                    id="problem-description"
                    placeholder="Enter detailed question description"
                    value={problemDescription}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProblemDescription(e.target.value)}
                    disabled={!roomId}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Answer Options</Label>
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-8 text-sm font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(index, e.target.value)}
                        disabled={!roomId}
                      />
                      <Button
                        variant={correctAnswer === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCorrectAnswer(index as AllowedSubmissions)}
                        disabled={!roomId}
                      >
                        {correctAnswer === index ? '✓ Correct' : 'Mark Correct'}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateProblem} 
                    disabled={!roomId.trim() || !problemTitle.trim() || !problemDescription.trim() || options.filter(o => o.trim()).length < 2}
                    className="flex-1"
                  >
                    Add Problem to Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  Jadwal Peserta
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleLoadParticipants} size="sm" variant="outline" disabled={scheduleLoading} className="w-full md:w-auto">
                      <RefreshCw className={`mr-2 h-4 w-4 ${scheduleLoading ? 'animate-spin' : ''}`} />
                      {scheduleLoading ? 'Memuat...' : 'Muat dari Server'}
                    </Button>
                    <Button onClick={handleSaveParticipants} size="sm" disabled={scheduleSaving} className="w-full md:w-auto">
                      <Save className={`mr-2 h-4 w-4 ${scheduleSaving ? 'animate-spin' : ''}`} />
                      {scheduleSaving ? 'Menyimpan...' : 'Simpan ke Server'}
                    </Button>
                    <Button onClick={handleImportJSON} size="sm" variant="outline" className="w-full md:w-auto">
                      <Upload className="mr-2 h-4 w-4" />
                      Import JSON
                    </Button>
                    <Button onClick={addParticipantSchedule} size="sm" variant="outline" className="w-full md:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Baris
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Data peserta tersimpan di Supabase. Klik "Muat dari Server" untuk memuat data, edit, lalu "Simpan ke Server".
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 rounded-md border bg-white p-3 text-sm font-medium text-gray-600 md:grid-cols-[1.1fr_1.4fr_1fr_0.8fr_0.9fr_0.8fr_0.9fr_44px]">
                  <span>NPM</span>
                  <span>Nama</span>
                  <span>Tanggal</span>
                  <span>Hari</span>
                  <span>Jam Mulai</span>
                  <span>Menit</span>
                  <span>Jam Selesai</span>
                  <span />
                </div>

                <div className="space-y-3">
                  {participantSchedules.map((schedule, index) => (
                    <div
                      key={schedule.id}
                      className="grid gap-3 rounded-md border bg-white p-3 md:grid-cols-[1.1fr_1.4fr_1fr_0.8fr_0.9fr_0.8fr_0.9fr_44px]"
                    >
                      <div className="space-y-1">
                        <Label htmlFor={`schedule-npm-${schedule.id}`} className="md:hidden">NPM</Label>
                        <Input
                          id={`schedule-npm-${schedule.id}`}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="2517041001"
                          value={schedule.npm}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParticipantSchedule(schedule.id, 'npm', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`schedule-name-${schedule.id}`} className="md:hidden">Nama</Label>
                        <Input
                          id={`schedule-name-${schedule.id}`}
                          placeholder={`Peserta ${index + 1}`}
                          value={schedule.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParticipantSchedule(schedule.id, 'name', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`schedule-date-${schedule.id}`} className="md:hidden">Tanggal</Label>
                        <Input
                          id={`schedule-date-${schedule.id}`}
                          type="date"
                          value={schedule.date}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParticipantSchedule(schedule.id, 'date', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`schedule-day-${schedule.id}`} className="md:hidden">Hari</Label>
                        <Input
                          id={`schedule-day-${schedule.id}`}
                          placeholder="Hari 1"
                          value={schedule.day}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParticipantSchedule(schedule.id, 'day', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`schedule-start-${schedule.id}`} className="md:hidden">Jam Mulai</Label>
                        <Input
                          id={`schedule-start-${schedule.id}`}
                          type="time"
                          value={schedule.startTime}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParticipantSchedule(schedule.id, 'startTime', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`schedule-duration-${schedule.id}`} className="md:hidden">Menit</Label>
                        <Input
                          id={`schedule-duration-${schedule.id}`}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="20"
                          value={schedule.durationMinutes}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParticipantSchedule(schedule.id, 'durationMinutes', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`schedule-end-${schedule.id}`} className="md:hidden">Jam Selesai</Label>
                        <Input
                          id={`schedule-end-${schedule.id}`}
                          type="time"
                          value={schedule.endTime}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParticipantSchedule(schedule.id, 'endTime', e.target.value)}
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Hapus peserta"
                          onClick={() => removeParticipantSchedule(schedule.id)}
                          disabled={participantSchedules.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {scheduleStatus && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">{scheduleStatus}</AlertDescription>
                  </Alert>
                )}

                {scheduleError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{scheduleError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 md:flex-row md:items-center md:justify-between">
                  <span>Total baris jadwal: {participantSchedules.length}</span>
                  <span>Data tersimpan di Supabase. Klik "Simpan ke Server" untuk menyimpan perubahan.</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="control" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Controls</CardTitle>
                  <CardDescription>
                    {roomId ? `Controlling room: ${roomId}` : 'Masukkan Room ID untuk mengontrol quiz'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="control-room-id">Room ID</Label>
                    <Input
                      id="control-room-id"
                      placeholder="Masukkan Room ID (contoh: UAP-PTI-2025)"
                      value={roomId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-600">
                      {isConnected ? 'Terhubung ke server' : 'Tidak terhubung — coba refresh halaman'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleStartQuiz}
                      disabled={!roomId.trim() || !isConnected}
                      size="lg"
                      className="w-full"
                    >
                      Start Quiz
                    </Button>

                    <Button
                      onClick={handleNext}
                      disabled={!roomId.trim() || !isConnected}
                      size="lg"
                      variant="outline"
                      className="w-full"
                    >
                      Next Question
                    </Button>
                  </div>

                  <Button
                    onClick={handleGetQuizState}
                    disabled={!roomId.trim() || !isConnected}
                    variant="secondary"
                    className="w-full"
                  >
                    Refresh Quiz State
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Quiz State</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentQuizState ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge variant={currentQuizState.type === 'question' ? 'default' : 'secondary'}>
                          {currentQuizState.type || 'Unknown'}
                        </Badge>
                      </div>
                      {currentQuizState.problem && (
                        <>
                          <div className="flex justify-between">
                            <span className="font-medium">Current Problem:</span>
                            <span>{currentQuizState.problem.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Options:</span>
                            <span>{currentQuizState.problem.options?.length || 0}</span>
                          </div>
                        </>
                      )}
                      {currentQuizState.leaderboard && (
                        <div className="flex justify-between">
                          <span className="font-medium">Players:</span>
                          <span>{currentQuizState.leaderboard.length}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No quiz state available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Quiz Monitor</CardTitle>
                <CardDescription>
                  Real-time monitoring of quiz activity
                  {roomId && ` for room: ${roomId}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <Label htmlFor="monitor-room-id">Room ID</Label>
                  <Input
                    id="monitor-room-id"
                    placeholder="Masukkan Room ID (contoh: UAP-PTI-2025)"
                    value={roomId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value)}
                  />
                </div>
                {!roomId ? (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertDescription className="text-yellow-700">
                      Masukkan Room ID untuk memonitor quiz
                    </AlertDescription>
                  </Alert>
                ) : currentQuizState ? (
                  <div className="space-y-4">
                    {currentQuizState.type === 'question' && currentQuizState.problem && (
                      <div className="border rounded p-4 bg-blue-50">
                        <h3 className="font-semibold text-lg mb-2">Active Question</h3>
                        <p className="font-medium">{currentQuizState.problem.title}</p>
                        <p className="text-gray-600 mb-3">{currentQuizState.problem.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {currentQuizState.problem.options?.map((option: any, index: number) => (
                            <div key={index} className="flex items-center p-2 border rounded">
                              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                              <span>{option.title}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                          Correct Answer: {String.fromCharCode(65 + (currentQuizState.problem.answer || 0))}
                        </div>
                      </div>
                    )}

                    {currentQuizState.type === 'leaderboard' && currentQuizState.leaderboard && (
                      <div className="border rounded p-4 bg-green-50">
                        <h3 className="font-semibold text-lg mb-3">Current Leaderboard</h3>
                        <div className="space-y-2">
                          {currentQuizState.leaderboard
                            .sort((a: any, b: any) => b.points - a.points)
                            .map((player: any, index: number) => (
                            <div key={player.id} className="flex items-center justify-between p-2 border rounded bg-white">
                              <div className="flex items-center">
                                <Badge variant={index < 3 ? 'default' : 'secondary'} className="mr-2">
                                  #{index + 1}
                                </Badge>
                                <span className="font-medium">{player.name}</span>
                              </div>
                              <span className="font-bold">{player.points} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentQuizState.type === 'not_started' && (
                      <div className="border rounded p-4 bg-gray-50 text-center">
                        <p className="text-gray-600">Quiz hasn't started yet</p>
                        <Button onClick={handleStartQuiz} className="mt-2">
                          Start Quiz
                        </Button>
                      </div>
                    )}

                    {currentQuizState.type === 'ended' && (
                      <div className="border rounded p-4 bg-red-50 text-center">
                        <p className="text-red-600 font-medium">Quiz has ended</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Click "Refresh Quiz State" to load current status
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
