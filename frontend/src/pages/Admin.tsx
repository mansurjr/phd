import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Users, LogOut, BarChart3, Search, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface Result {
  moduleId: string;
  taskId: number;
  score: number;
  total: number;
}

interface EmotionResponse {
  id: number;
  userId: string;
  moduleId: string;
  taskId: number;
  emotionId: string;
  reasoning: string;
  selectedTechnique: string;
  createdAt: string;
}

interface DecisionResponse {
  id: number;
  userId: string;
  moduleId: string;
  taskId: number;
  scenarioId: string;
  selectedOption: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  createdAt: string;
  results: Result[];
  emotionResponses?: EmotionResponse[];
  decisionResponses?: DecisionResponse[];
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [searchQuery, setSearchQuery] = useState('');
  
  // Delete state
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchUsers();
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn) fetchUsers(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pass: password }),
      });
      const data = await res.json();
      if (data.access_token) {
        setToken(data.access_token);
        localStorage.setItem('adminToken', data.access_token);
        setIsLoggedIn(true);
        toast.success('Muvaffaqiyatli login!');
      } else {
        toast.error('Login yoki parol xato');
      }
    } catch (error) {
      toast.error('Server bilan bog\'lanishda xato');
    }
  };

  const fetchUsers = async (search?: string) => {
    try {
      const url = search 
        ? `http://localhost:3001/progress/all?search=${encodeURIComponent(search)}`
        : 'http://localhost:3001/progress/all';
        
      const res = await fetch(url, {
        headers: {
          // 'Authorization': `Bearer ${token}` // Add when guarded
        }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Ma\'lumotlarni yuklashda xato');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsLoggedIn(false);
    setUsers([]);
    navigate('/');
  };

  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleUser = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setDeleteUserId(userId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      const res = await fetch(`http://localhost:3001/progress/user/${deleteUserId}`, {
        method: 'DELETE',
        headers: {
          // 'Authorization': `Bearer ${token}` // Add when guarded
        }
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== deleteUserId));
        toast.success('Foydalanuvchi o\'chirildi');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('O\'chirishda xatolik yuz berdi');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Foydalanuvchi nomi</label>
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="admin"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parol</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700">
                Kirish
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            Admin Boshqaruvi
          </h1>
          <p className="text-slate-500 mt-1">Barcha foydalanuvchilar natijalari va o'zlashtirish ko'rsatkichlari</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Foydalanuvchini qidirish..."
              className="pl-10 w-64 h-10 border-slate-200"
            />
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 h-10">
            <LogOut className="h-4 w-4" />
            Chiqish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => {
          const isExpanded = expandedUsers.has(user.id);
          const interactiveResults = user.results.filter(r => r.taskId > 1);
          const totalScore = interactiveResults.reduce((acc, r) => acc + r.score, 0);
          const totalMax = interactiveResults.reduce((acc, r) => acc + r.total, 0);
          const percent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
          
          // Calculate overall completion percentage
          const completionPercent = Math.round((user.results.length / 25) * 100);

          return (
            <Card key={user.id} className="overflow-hidden border-slate-200 shadow-sm transition-all duration-200">
              <div 
                className="bg-white hover:bg-slate-50 cursor-pointer p-4 transition-colors flex items-center justify-between group"
                onClick={() => toggleUser(user.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                    <p className="text-xs text-slate-500">
                      Ro'yxatdan o'tdi: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Overall Completion Percentage */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Tugallangan</p>
                      <p className="text-lg font-black text-emerald-600 leading-none">{completionPercent}%</p>
                    </div>
                    <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 transition-all duration-500" 
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Score Percentage */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Natija</p>
                      <p className="text-lg font-black text-indigo-600 leading-none">{percent}%</p>
                    </div>
                    <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={(e) => handleDeleteClick(e, user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <CardContent className="p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-6">
                    {/* Emotion Responses Section */}
                    {user.emotionResponses && user.emotionResponses.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900 mb-3">Xavotir Stantsiyasi Javoblari</h4>
                        <div className="space-y-3">
                          {user.emotionResponses.map((emotion) => (
                            <div key={emotion.id} className="border-l-4 border-blue-400 pl-3 py-2 bg-slate-50 p-2 rounded">
                              <p className="text-[12px] font-semibold text-slate-700">
                                Modul {emotion.moduleId} - Topshiriq {emotion.taskId} - Emotsiya: {emotion.emotionId}
                              </p>
                              <p className="text-[12px] text-slate-600 mt-1 italic">Fikr: "{emotion.reasoning}"</p>
                              <p className="text-[11px] text-slate-500 mt-1">Texnika: {emotion.selectedTechnique}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Decision Responses Section */}
                    {user.decisionResponses && user.decisionResponses.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900 mb-3">Qaror Qabul Qilish Javoblari (Modul 3)</h4>
                        <div className="space-y-3">
                          {user.decisionResponses.map((decision) => (
                            <div key={decision.id} className="border-l-4 border-indigo-400 pl-3 py-2 bg-slate-50 p-2 rounded">
                              <p className="text-[12px] font-semibold text-slate-700">
                                3-Modul, 2-Stansiya (Topshiriq {decision.taskId})
                              </p>
                              <p className="text-[12px] text-slate-600 mt-1">
                                <span className="font-bold">Vaziyat:</span> {
                                  decision.scenarioId === 's1' ? "Guruhdoshingiz loyihani kechiktirdi" :
                                  decision.scenarioId === 's2' ? "Prezentatsiya oldidan hayajon" :
                                  decision.scenarioId === 's3' ? "Amaliyotda material yetishmayapti" :
                                  decision.scenarioId
                                }
                              </p>
                              <p className="text-[12px] text-slate-600 mt-1">
                                <span className="font-bold">Tanlov:</span> {
                                  decision.selectedOption === 'self' ? "O‘zim hal qilaman (5 ball)" : 
                                  decision.selectedOption === 'group' ? "Guruh bilan maslahatlashaman (2 ball)" : 
                                  "Muqobil yechim (3 ball)"
                                }
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5].map(moduleId => {
                        const moduleResults = user.results.filter(r => r.moduleId === String(moduleId));
                        const modInteractive = moduleResults.filter(r => r.taskId > 1);
                        const modScore = modInteractive.reduce((acc, r) => acc + r.score, 0);
                        const modMax = modInteractive.reduce((acc, r) => acc + r.total, 0);
                        const modPercent = modMax > 0 ? Math.round((modScore / modMax) * 100) : 0;
                        const isCompleted = moduleResults.length > 0;

                        return (
                          <div key={moduleId} className={`p-4 rounded-xl border ${isCompleted ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-dashed border-slate-300 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-slate-700">Modul {moduleId}</span>
                                {isCompleted && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modPercent >= 70 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                    {modPercent}%
                                  </span>
                                )}
                            </div>
                            <div className="space-y-2">
                              {[1, 2, 3, 4, 5].map(taskNum => {
                                const taskRes = moduleResults.find(r => r.taskId === taskNum);
                                return (
                                  <div key={taskNum} className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500">{taskNum}-topshiriq</span>
                                    {taskRes ? (
                                      <span className="font-bold text-slate-900">
                                        {taskNum === 1 ? '✅ Bajarildi' : `${taskRes.score} / ${taskRes.total}`}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300 italic">Bajarilmagan</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {users.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
             <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-500 font-medium text-lg">Hozircha natijalar mavjud emas</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Foydalanuvchini o'chirish"
        message="Haqiqatan ham bu foydalanuvchini o'chirmoqchimisiz? Barcha natijalar va ma'lumotlar tiklab bo'lmas darajada o'chiriladi."
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
}
