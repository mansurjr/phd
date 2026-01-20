import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/userStore';
import { useModuleStore } from '@/store/moduleStore';
import { UserCheck, UserPlus, Shield } from 'lucide-react';
import { module1Data } from '@/lib/module1Data';
import { module2Data } from '@/lib/module2Data';
import { module3Data } from '@/lib/module3Data';
import { module4Data } from '@/lib/module4Data';
import { module5Data } from '@/lib/module5Data';

interface ExistingUser {
  id: string;
  name: string;
  results: any[];
}

export function NameModal() {
  const navigate = useNavigate();
  const userName = useUserStore((s) => s.userName);
  const setUserName = useUserStore((s) => s.setUserName);
  const setUserId = useUserStore((s) => s.setUserId);
  const openNameModal = useUserStore((s) => s.openNameModal);
  const setOpenNameModal = useUserStore((s) => s.setOpenNameModal);
  const setTaskResult = useModuleStore(state => state.setTaskResult);
  const [open, setOpen] = useState(openNameModal);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<ExistingUser | null>(null);
  const [showChoice, setShowChoice] = useState(false);

  useEffect(() => {
    const isAdmin = !!localStorage.getItem('adminToken');
    const isAdminPage = window.location.pathname === '/admin';
    if (!userName && !isAdmin && !isAdminPage && !openNameModal) {
      setOpenNameModal(true);
    }
  }, [userName, openNameModal]);

  // sync local open state with store flag
  useEffect(() => {
    setOpen(openNameModal);
  }, [openNameModal]);

  const checkExistingUser = async (nameToCheck: string) => {
    try {
      const res = await fetch(`https://api.phdp.uz/progress/check/${encodeURIComponent(nameToCheck)}`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error checking user:', error);
      return null;
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isLoading) {
      setIsLoading(true);
      const existing = await checkExistingUser(name.trim());
      setIsLoading(false);

      if (existing && existing.id) {
        setExistingUser(existing);
        setShowChoice(true);
        } else {
        await registerNewUser(name.trim());
      }
    }
  };

  const registerNewUser = async (userName: string) => {
    setIsLoading(true);
    localStorage.removeItem('adminToken'); // Clear admin session if exists
    try {
      const responseData = await setTaskResult('1', 1, 1, 1, userName, undefined);
      if (responseData && responseData.user) {
        setUserName(responseData.user.name);
        setUserId(responseData.user.id);
        setOpenNameModal(false);
      } else {
        setUserName(userName);
        setOpenNameModal(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setUserName(userName);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueExisting = () => {
    (async () => {
      if (!existingUser) return;

      // set user in store
      setUserName(existingUser.name);
      setUserId(existingUser.id);
      localStorage.removeItem('adminToken'); // Clear admin session

      // fetch freshest progress
      const fresh = await checkExistingUser(existingUser.name);
      const results = fresh?.results || existingUser.results || [];

      // modules metadata
      const modules = [
        { id: '1', tasks: module1Data.length },
        { id: '2', tasks: module2Data.length },
        { id: '3', tasks: module3Data.length },
        { id: '4', tasks: module4Data.length },
        { id: '5', tasks: module5Data.length },
      ];

      // build completed map: moduleId -> Set(taskId)
      const completed: Record<string, Set<number>> = {};
      for (const r of results) {
        const mid = String(r.moduleId);
        completed[mid] = completed[mid] || new Set<number>();
        completed[mid].add(Number(r.taskId));
      }

      // find first incomplete task across modules
      let found = false;
      for (const mod of modules) {
        const doneSet = completed[mod.id] || new Set<number>();
        if (doneSet.size < mod.tasks) {
          // find first missing task number
          let nextTask = 1;
          for (let t = 1; t <= mod.tasks; t++) {
            if (!doneSet.has(t)) {
              nextTask = t;
              break;
            }
          }
          setOpenNameModal(false);
          navigate(`/module/${mod.id}/task/${nextTask}`);
          found = true;
          break;
        }
      }

      if (!found) {
        // all modules complete -> restart (reset on backend)
        try {
          await fetch(`https://api.phdp.uz/progress/reset/${existingUser.id}`, { method: 'POST' });
        } catch (e) {
          console.error('Failed to reset progress on server', e);
        }
        // clear local module results
        // allow NameModal to close and navigate to first task
        setOpenNameModal(false);
        navigate(`/module/1/task/1`);
      }
    })();
  };

  const handleStartFresh = async () => {
    if (existingUser) {
      setIsLoading(true);
      try {
        // Reset progress
        await fetch(`https://api.phdp.uz/progress/reset/${existingUser.id}`, {
          method: 'POST',
        });
        
        setUserName(existingUser.name);
        setUserId(existingUser.id);
        setOpenNameModal(false);
      } catch (error) {
        console.error('Error resetting progress:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackToName = () => {
    setShowChoice(false);
    setExistingUser(null);
    setName('');
  };

  const handleAdminLogin = () => {
    setOpenNameModal(false);
    navigate('/admin');
  };

  return (
    <Dialog open={open} onOpenChange={setOpenNameModal}>
      <DialogContent className="sm:max-w-[425px]" showCloseButton={false} disableInteractionClose onOpenAutoFocus={(e) => e.preventDefault()}>
        {!showChoice ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Xush kelibsiz!</DialogTitle>
              <DialogDescription className="text-base">
                Davom etish uchun ismingizni kiriting
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  To'liq ism
                </label>
                <Input
                  id="name"
                  placeholder="Ism Familiya"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="h-11"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={!name.trim() || isLoading}>
                {isLoading ? 'Tekshirilmoqda...' : 'Davom etish'}
              </Button>
            </form>

            {/* Admin Login Link */}
            <div className="pt-4 border-t">
              <button
                onClick={handleAdminLogin}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Shield className="h-4 w-4" />
                Administrator kirish
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Foydalanuvchi topildi</DialogTitle>
              <DialogDescription className="text-base">
                "{existingUser?.name}" nomi bilan avval ro'yxatdan o'tgansiz. Qanday davom etmoqchisiz?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                onClick={handleContinueExisting}
                className="w-full h-auto py-4 flex items-start gap-3 bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                <UserCheck className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="text-left">
                  <div className="font-bold">Avvalgi natijalarimni davom ettirish</div>
                  <div className="text-xs opacity-90 font-normal">
                    {existingUser?.results?.length || 0} ta natija saqlangan
                  </div>
                </div>
              </Button>
              
              <Button
                onClick={handleStartFresh}
                variant="outline"
                className="w-full h-auto py-4 flex items-start gap-3 border-2"
                disabled={isLoading}
              >
                <UserPlus className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="text-left">
                  <div className="font-bold">Yangi talaba sifatida boshlash</div>
                  <div className="text-xs text-slate-500 font-normal">
                    Barcha avvalgi natijalar o'chiriladi
                  </div>
                </div>
              </Button>

              <Button
                onClick={handleBackToName}
                variant="ghost"
                className="w-full"
                disabled={isLoading}
              >
                Orqaga
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
