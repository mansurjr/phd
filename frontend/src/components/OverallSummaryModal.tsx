import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useModuleStore } from '@/store/moduleStore';
import { CheckCircle2, ChevronRight, LayoutGrid } from 'lucide-react';

interface OverallSummaryModalProps {
  moduleId: string;
  isOpen: boolean;
}

const EMPTY_RESULTS = {};

export function OverallSummaryModal({ moduleId, isOpen }: OverallSummaryModalProps) {
  const navigate = useNavigate();
  const results = useModuleStore((state) => state.results[moduleId] ?? EMPTY_RESULTS);
  
  const tasks = [1, 2, 3, 4, 5];
  const interactiveResults = Object.values(results).filter(res => res.taskId > 1);
  const totalScore = interactiveResults.reduce((acc, curr) => acc + curr.score, 0);
  const totalMax = interactiveResults.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && window.location.reload()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            Modul tugatildi!
          </DialogTitle>
          <DialogDescription className="text-center text-lg mt-2">
            Siz barcha topshiriqlarni muvaffaqiyatli yakunladingiz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-3">
            {tasks.map((taskNum) => {
              const res = results[taskNum];
              const isTaskOne = taskNum === 1;

              return (
                <div key={taskNum} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                      {taskNum}
                    </span>
                    <span className="font-medium text-slate-700">
                      {isTaskOne ? "Nazariy ma'lumot" : "Topshiriq"}
                    </span>
                  </div>
                  {isTaskOne ? (
                    <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
                      Bajarildi
                    </div>
                  ) : res ? (
                    <div className="text-[11px] font-bold text-slate-900 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm whitespace-nowrap">
                      {res.total} tadan {res.score} ta to'g'ri
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Bajarilmagan</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                <span className="font-medium">Umumiy natija:</span>
              </div>
              <span className="text-2xl font-black">
                {totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-11"
          >
            Modullar ro'yxatiga qaytish
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
