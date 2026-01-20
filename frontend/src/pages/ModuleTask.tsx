import { memo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTask, getTasksByModule } from '@/lib/module1Data';
import { EmotionStation } from '@/components/EmotionStation';
import { GlobalStation } from '@/components/GlobalStation';
import { extractYouTubeId } from '@/lib/utils';
import { 
  ChevronRight, ChevronLeft, Play, CheckCircle2, Circle, GripVertical, 
  ArrowRight, ArrowDown, XCircle, Lightbulb, Globe, Star, Eye, Leaf, 
  Shield, Smartphone, Users as UsersIcon, Zap, Briefcase, GraduationCap,
  MessageCircle, Target, Award, Info, Palette, Brain, Scale, Frown
} from 'lucide-react';
import { toast } from 'sonner';
import { useModuleStore } from '@/store/moduleStore';
import { useUserStore } from '@/store/userStore';

const normalizeString = (s: string) => s.toLowerCase().replace(/[‘’`‘]/g, "'").trim();

const EMOJI_ICON_MAP: Record<string, { icon: any, color: string, bg: string, border: string }> = {
  '🌍': { icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  '🟦': { icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  '🟩': { icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  '🟨': { icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  '🟧': { icon: Smartphone, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  '🟥': { icon: UsersIcon, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  '🟪': { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  '🟫': { icon: Briefcase, color: 'text-amber-900', bg: 'bg-amber-50', border: 'border-amber-200' },
  '⭐': { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  '✔': { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  '✅': { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  '🎯': { icon: Target, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  '🚀': { icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  '💡': { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  '💬': { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  '🎓': { icon: GraduationCap, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
  '🏆': { icon: Award, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'ℹ️': { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  '🎨': { icon: Palette, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-100' },
  '🤔': { icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  '⚖️': { icon: Scale, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  '😟': { icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
};

const renderLineWithIcons = (line: string) => {
  const trimmedLine = line.trim();
  let foundEmoji: string | null = null;
  
  for (const emoji of Object.keys(EMOJI_ICON_MAP)) {
    if (trimmedLine.startsWith(emoji)) {
      foundEmoji = emoji;
      break;
    }
  }

  if (foundEmoji) {
    const { icon: Icon, color, bg, border } = EMOJI_ICON_MAP[foundEmoji];
    const text = trimmedLine.replace(foundEmoji, '').trim();
    
    // Check if it's a small list item (like in 'Xulosa')
    const isSmall = foundEmoji === '✔' || foundEmoji === '✅' || text.length < 50;
    
    if (isSmall && foundEmoji !== '🌍' && !/^[0-9]\./.test(text)) {
      return (
        <div className="flex items-center gap-3 py-2 px-1 animate-in slide-in-from-left duration-300">
          <div className={`h-8 w-8 shrink-0 rounded-lg ${bg} flex items-center justify-center ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-slate-700 font-medium">{text}</span>
        </div>
      );
    }

    return (
      <div className={`flex items-start gap-4 p-6 rounded-3xl ${bg} border ${border} shadow-sm mb-6 transition-all hover:shadow-md hover:scale-[1.01] animate-in zoom-in-95 duration-500`}>
        <div className={`h-14 w-14 shrink-0 rounded-2xl bg-white flex items-center justify-center ${color} shadow-sm`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="space-y-1 pt-1">
          {text.includes('\n') ? (
            text.split('\n').map((t, i) => (
              <p key={i} className={`${i === 0 ? 'text-lg font-black text-slate-900' : 'text-slate-600 leading-relaxed'}`}>
                {t.trim()}
              </p>
            ))
          ) : (
            <p className="text-lg font-bold text-slate-900 leading-relaxed">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

const ModuleTask = () => {
  const { moduleId, taskNumber } = useParams<{ moduleId: string; taskNumber: string }>();
  const navigate = useNavigate();
  const setTaskResult = useModuleStore((state) => state.setTaskResult);
  const { userName, userId } = useUserStore();
  
  const moduleIdNum = parseInt(moduleId || '1', 10);
  const taskNum = parseInt(taskNumber || '1', 10);
  
  const tasks = getTasksByModule(moduleIdNum);
  const currentTask = getTask(moduleIdNum, taskNum);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const [showAnswer, setShowAnswer] = useState(false);
  
  // Emotion Station state
  const [emotionSubmitted, setEmotionSubmitted] = useState(false);
  const [decisionSubmitted, setDecisionSubmitted] = useState(false);
  const [creativeSubmitted, setCreativeSubmitted] = useState(false);
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  const [completedEmotionScore, setCompletedEmotionScore] = useState<{correct: number, total: number} | null>(null);
  
  // Game state
  const [gameSelections, setGameSelections] = useState<{ [key: number]: string }>({});
  const [gameSubmitted, setGameSubmitted] = useState(false);
  // Stations (for game.stations)
  const [stationsChecked, setStationsChecked] = useState<Record<string, boolean>>({});
  
  // Diagram state
  const [diagramItems, setDiagramItems] = useState<string[]>([]);
  const [diagramCategories, setDiagramCategories] = useState<{ [key: string]: string[] }>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [diagramSubmitted, setDiagramSubmitted] = useState(false);
  const [showCorrectDiagram, setShowCorrectDiagram] = useState(false);

  // Mobile / UX helpers
  const [isTouch] = useState<boolean>(() => (typeof window !== 'undefined') && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));
  const [selectedMobileItem, setSelectedMobileItem] = useState<string | null>(null);
  const [resultBanner, setResultBanner] = useState<string | null>(null);
  const cardContentRef = useRef<HTMLDivElement | null>(null);
  
  // Initialize diagram state
  useEffect(() => {
    // Detect touch devices for mobile-friendly interactions (initialized via useState to avoid cascading renders)

    if (currentTask?.type === 'diagram' && currentTask.diagram) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDiagramItems([...currentTask.diagram.items]);
      const initialCats: { [key: string]: string[] } = {};
      currentTask.diagram.categories.forEach(cat => {
        initialCats[cat.id] = [];
      });
      setDiagramCategories(initialCats);
      setDiagramSubmitted(false);
      setShowCorrectDiagram(false);
    }
    if (currentTask?.type === 'game') {
      setGameSelections({});
      setGameSubmitted(false);
      // init stations checks if stations exist
      if (currentTask.game?.stations) {
        const init: Record<string, boolean> = {};
        currentTask.game.stations.forEach(s => { init[s.id] = false; });
        setStationsChecked(init);
      }
    }

    // reset all submission states when switching tasks
    setSelectedMobileItem(null);
    setResultBanner(null);
    setEmotionSubmitted(false);
    setDecisionSubmitted(false);
    setCreativeSubmitted(false);
    setReflectionSubmitted(false);
  }, [currentTask]);

  const handleNext = async () => {
    if (currentTask?.type === 'content') {
      await setTaskResult(moduleId || '1', taskNum, 1, 1, userName || undefined, userId || undefined);
    }
    if (taskNum < tasks.length) {
      navigate(`/module/${moduleId}/task/${taskNum + 1}`);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setGameSelections({});
      setDiagramSubmitted(false);
      setEmotionSubmitted(false);
      setDecisionSubmitted(false);
      setCreativeSubmitted(false);
      setReflectionSubmitted(false);
    } else {
      navigate(`/module/${moduleId}/test`);
    }
  };

  const handlePrevious = () => {
    if (taskNum > 1) {
      navigate(`/module/${moduleId}/task/${taskNum - 1}`);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setDiagramSubmitted(false);
      setEmotionSubmitted(false);
      setDecisionSubmitted(false);
      setCreativeSubmitted(false);
      setReflectionSubmitted(false);
    }
  };
  

  if (!currentTask) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-slate-600">Topshiriq topilmadi</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Bosh sahifaga qaytish
        </Button>
      </div>
    );
  }

  const isLastTask = taskNum === tasks.length;
  const videoIds = currentTask.videos?.map(extractYouTubeId).filter((id): id is string => id !== null) || [];

  const handleAnswerSelect = (letter: string) => {
    if (!showAnswer) {
      setSelectedAnswer(letter);
    }
  };

  const handleCheckAnswer = async () => {
    setShowAnswer(true);
    const selected = currentTask?.caseStudy?.options.find(o => o.letter === selectedAnswer);

    if (selected) {
      const isCorrect = selected.isCorrect;
      await setTaskResult(moduleId || '1', taskNum, isCorrect ? 1 : 0, 1, userName || undefined, userId || undefined);
      
      // Special behavior for module 2, task 2: show the caseStudy explanation below
      // and do not show the top result banner
      if (moduleIdNum === 2 && taskNum === 2) {
        cardContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (isCorrect) {
        setResultBanner(`✅ To'g'ri javob: ${selected.title}`);
      } else {
        const correct = currentTask?.caseStudy?.options.find(o => o.isCorrect);
        setResultBanner(`❌ To'g'ri javob: ${correct?.letter}) ${correct?.title}`);
      }
      cardContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGameSubmit = async () => {
    let correct = 0;
    let total = 0;
    const missing: number[] = [];

    if (currentTask?.game?.pairs) {
      total = currentTask.game.pairs.length;
      for (let i = 0; i < total; i++) {
        if (!gameSelections[i]) missing.push(i + 1);
      }
      
      if (missing.length > 0) {
        toast.error(`${missing.join(', ')}-savollarga javob bermadingiz!`, {
          description: "Iltimos, barcha savollarni belgilang."
        });
        return;
      }

      correct = Object.keys(gameSelections).filter(idx =>
        gameSelections[parseInt(idx)] === currentTask!.game!.pairs![parseInt(idx)].definition
      ).length;
    } else if (currentTask?.game?.questions) {
      total = currentTask.game.questions.length;
      for (let i = 0; i < total; i++) {
        if (!gameSelections[i]) missing.push(i + 1);
      }

      if (missing.length > 0) {
        toast.error(`${missing.join(', ')}-savollarga javob bermadingiz!`, {
          description: "Iltimos, barcha savollarni belgilang."
        });
        return;
      }

      correct = Object.keys(gameSelections).filter(idx => {
        const questionIdx = parseInt(idx);
        const selectedValue = gameSelections[questionIdx];
        const isCommonTrayStyle = false;
        
        if (isCommonTrayStyle) {
          const correctOption = currentTask!.game!.questions![questionIdx].options.find(o => o.isCorrect);
          // Compare selectedValue (full text or letter) with correct option text or letter
          return selectedValue === correctOption?.text || selectedValue === correctOption?.letter;
        }

        const correctOption = currentTask!.game!.questions![questionIdx].options.find(o => o.isCorrect);
        return correctOption?.letter === selectedValue;
      }).length;
    }

    setGameSubmitted(true);
    await setTaskResult(moduleId || '1', taskNum, correct, total, userName || undefined, userId || undefined);
    setResultBanner(`${total} tadan ${correct} ta to'g'ri javob`);
    if (correct === total) {
      toast.success(`${total} tadan ${correct} ta to'g'ri! Ajoyib natija.`);
    } else {
      toast.warning(`${total} tadan ${correct} ta to'g'ri javob`);
    }
    cardContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStationsSubmit = async () => {
    if (!currentTask?.game?.stations) return;
    const stations = currentTask.game.stations;
    const checkedCount = Object.values(stationsChecked).filter(Boolean).length;
    const total = stations.length * 3; // max 3 per station
    const correct = checkedCount * 3;

    setGameSubmitted(true);
    await setTaskResult(moduleId || '1', taskNum, correct, total, userName || undefined, userId || undefined);
    setResultBanner(`Bali: ${total} tadan ${correct} ta (har stansiya ${checkedCount}/${stations.length} bajarildi)`);
    if (correct === total) toast.success('Barcha stansiyalar muvaffaqiyatli bajarildi');
    else toast(`Natija: ${total} tadan ${correct} ta`);
    cardContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDiagramSubmit = async () => {
    const total = currentTask?.diagram?.items.length || 0;
    const correct = currentTask!.diagram!.categories.reduce((acc, cat) => {
      const items = diagramCategories[cat.id] || [];
      const correctCount = items.filter(item => 
        cat.correctItems.some(ci => normalizeString(ci) === normalizeString(item))
      ).length;
      return acc + correctCount;
    }, 0);
    setDiagramSubmitted(true);
    await setTaskResult(moduleId || '1', taskNum, correct, total, userName || undefined, userId || undefined);
    setResultBanner(`${total} tadan ${correct} ta to'g'ri joylashtirildi`);
    cardContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEmotionSubmit = async (responses: any[]) => {
    if (!currentTask?.emotionStation) return;
    
    const total = currentTask.emotionStation.emotions.length;
    const correct = responses.filter(r => r.reasoning.trim().length > 0 && r.selectedTechnique).length;
    
    setEmotionSubmitted(true);
    setCompletedEmotionScore({ correct, total });

    // Result is initially just the emotion score (before decision station)
    await setTaskResult(moduleId || '1', taskNum, correct, total, userName || undefined, userId || undefined);
    
    // Save emotion responses to backend
    try {
      await fetch('https://api.phdp.uz/progress/emotion-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || '',
          moduleId: moduleId || '',
          taskId: taskNum,
          emotionResponses: responses,
        }),
      });
      setResultBanner(`${total} ta emotsiya uchun javob saqlandi`);
      toast.success('Javoblaringiz saqlandi!');
    } catch (error) {
      console.error('Emotion save error:', error);
      toast.error('Javoblarni saqlab bo\'lmadi');
    }
    cardContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDecisionSubmit = async (score: number, total: number, decisionSelections: Record<string, string>) => {
    setDecisionSubmitted(true);
    // Save decision responses to backend FIRST
    try {
      if (currentTask?.type === 'emotion-station' && currentTask.decisionStation) {
         // Create the responses array from state
         const decisionRespArray = Object.entries(decisionSelections).map(([scenarioId, selectedValue]) => ({
             scenarioId,
             selectedOption: selectedValue
         }));

         await fetch('https://api.phdp.uz/progress/decision-save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId || '',
              moduleId: moduleId || '',
              taskId: taskNum,
              decisionResponses: decisionRespArray,
            }),
         });
      }
    } catch (e) {
      console.error("Failed to save decision responses", e);
    }

    // Then update the score (result)
    // We only count Emotion Station score for the result diagram, per user request.
    let finalCorrect = score;
    let finalTotal = total;

    if (completedEmotionScore) {
       finalCorrect = completedEmotionScore.correct;
       finalTotal = completedEmotionScore.total;
    } else {
       finalCorrect = 0;
       finalTotal = 0;
    }
    await setTaskResult(moduleId || '1', taskNum, finalCorrect, finalTotal, userName || undefined, userId || undefined);
    setResultBanner(`Natijalar saqlandi`);
    toast.success('Barcha stansiyalar natijalari saqlandi!');
    cardContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCreativeSubmit = async (correct: boolean) => {
    setCreativeSubmitted(true);
    await setTaskResult(moduleId || '1', taskNum, correct ? 1 : 0, 1, userName || undefined, userId || undefined);
    if (correct) {
      toast.success("To'g'ri javob!");
    } else {
      toast.error("Noto'g'ri javob");
    }
  };

  const handleReflectionSubmit = async (totalScore: number) => {
    setReflectionSubmitted(true);
    // Final result for Task 3 is the Self-Manager score
    await setTaskResult(moduleId || '1', taskNum, totalScore, 12, userName || undefined, userId || undefined);
    setResultBanner(`Self-Manager natijasi: 12 tadan ${totalScore} ta ball saqlandi`);
    toast.success("Barcha stansiyalar yakunlandi va natijangiz saqlandi!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-slate-600 mb-6">
        <span>Topshiriq {taskNum} / {tasks.length}</span>
        <div className="flex gap-1">
          {tasks.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full ${
                idx + 1 <= taskNum ? 'bg-indigo-500' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {taskNum}-topshiriq. {currentTask.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div ref={cardContentRef} className="space-y-6">
            {resultBanner && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                {resultBanner}
              </div>
            )}

          {/* Content Type */}
          {currentTask.type === 'content' && currentTask.content && (
            <div className="space-y-4 prose prose-slate max-w-none">
              {currentTask.content.map((line, idx, arr) => {
                const isBullet = line.trim().startsWith('•');
                const isSubBullet = line.trim().startsWith('◦');
                const isNumbered = /^\d+[\.\)]/.test(line.trim());
                const isHeader = line.trim().endsWith(':') || line.trim().endsWith('?');
                const prevIsHeader = arr[idx - 1]?.trim().endsWith(':') || arr[idx - 1]?.trim().endsWith('?');
                const followedByBullet = arr[idx + 1]?.trim().startsWith('•') || arr[idx + 1]?.trim().startsWith('◦');
                
                const isCentered = line.trim().startsWith('[CENTER]');

                if (isCentered) {
                  return (
                    <p key={idx} className="text-center text-xl md:text-2xl font-black text-indigo-900 bg-gradient-to-r from-indigo-50/50 via-indigo-50 to-indigo-50/50 py-6 px-8 rounded-3xl border-2 border-indigo-100 mb-8 mt-4 shadow-sm animate-in fade-in zoom-in-95 duration-700 break-words">
                      {line.trim().slice(8).trim()}
                    </p>
                  );
                }

                const iconLine = renderLineWithIcons(line);

                if (iconLine) return <div key={idx}>{iconLine}</div>;

                if (isBullet) {
                  return (
                    <div key={idx} className="flex items-start gap-3 pl-4">
                      <ArrowRight className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                      <p className="text-slate-700 font-bold leading-relaxed m-0">
                        {line.replace(/•/g, '').trim()}
                      </p>
                    </div>
                  );
                }

                if (isSubBullet) {
                  return (
                    <div key={idx} className="flex items-start gap-2 pl-12">
                      <ChevronRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                      <p className="text-slate-600 leading-relaxed m-0 text-sm">
                        {line.replace(/◦/g, '').trim()}
                      </p>
                    </div>
                  );
                }

                if (isHeader || isNumbered || (followedByBullet && !prevIsHeader)) {
                  return (
                    <p key={idx} className="font-black text-slate-900 leading-relaxed text-xl mt-8 mb-4 border-l-4 border-indigo-500 pl-4 bg-slate-50 py-2 rounded-r-lg shadow-sm flex items-center gap-2">
                       {isNumbered && <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />}
                       {line}
                    </p>
                  );
                }

                return (
                  <p key={idx} className={`text-slate-700 leading-relaxed whitespace-pre-line px-1 ${prevIsHeader ? 'font-medium text-slate-500 italic mb-2' : ''}`}>
                    {line}
                  </p>
                );
              })}
            </div>
          )}

              {/* Game Type - Multiple Choice Matching or Questions */}
              {currentTask.type === 'game' && currentTask.game && (() => {
                const isCommonTrayStyle = false; // Module 4 Task 4 now behaves like Module 2 Task 3
                const allOptions = isCommonTrayStyle 
                  ? Array.from(new Set(currentTask.game.questions?.flatMap(q => q.options.map(o => o.text)) || []))
                  : [];

                return (
                  <div className="space-y-6">
                    <div className="text-slate-700 font-medium whitespace-pre-line bg-indigo-50/50 p-8 rounded-[2rem] border-2 border-indigo-100/50 shadow-sm leading-relaxed text-lg italic relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Info className="h-20 w-20 text-indigo-600" />
                      </div>
                      {currentTask.game.instruction.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className="font-black text-indigo-900 not-italic">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </div>
                    {/* Stations flow (module 3 Self-Manager) */}
                    {currentTask.game.stations && (
                      <div className="space-y-6">
                        {currentTask.game.stations.map((s, idx) => (
                          <div key={s.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-bold text-slate-900">{idx + 1}. {s.title}</div>
                                {s.developing && <div className="text-xs text-slate-500">Rivojlantiradi: {s.developing.join(', ')}</div>}
                              </div>
                              <div>
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={!!stationsChecked[s.id]}
                                    disabled={gameSubmitted}
                                    onChange={(e) => setStationsChecked({ ...stationsChecked, [s.id]: e.target.checked })}
                                  />
                                  <span className="text-sm text-slate-600">Bajarildi</span>
                                </label>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-slate-700 space-y-2">
                              {s.description?.map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                              {s.techniques && s.techniques.map((t, ti) => (
                                <div key={ti} className="mt-2">
                                  <div className="font-semibold">{t.name}</div>
                                  <ul className="list-disc pl-6 text-sm text-slate-600">
                                    {t.steps.map((st, sti) => <li key={sti}>{st}</li>)}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Pairs Matching Game (Module 1 style) */}
                    {currentTask.game.pairs && (
                      <div className="space-y-4">
                        {currentTask.game.pairs.map((pair, idx) => {
                          const allDefinitions = currentTask.game!.pairs!.map(p => p.definition);
                          const selectedDef = gameSelections[idx];
                          
                          return (
                            <div key={idx} className="p-4 border rounded-lg space-y-3">
                              <div className="font-semibold text-slate-900">
                                {idx + 1}. {pair.term}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {allDefinitions.map((def, defIdx) => {
                                  const isSelected = selectedDef === def;
                                  return (
                                    <button
                                      key={defIdx}
                                      onClick={() => {
                                        if (!gameSubmitted) {
                                          setGameSelections({ ...gameSelections, [idx]: def });
                                        }
                                      }}
                                      disabled={gameSubmitted}
                                      className={`p-3 text-left rounded-lg border-2 transition-all ${
                                        isSelected && !gameSubmitted
                                          ? 'border-indigo-500 bg-indigo-50'
                                          : 'border-slate-200 hover:border-slate-300'
                                      } ${
                                        gameSubmitted && def === pair.definition
                                          ? 'border-green-500 bg-green-50'
                                          : ''
                                      } ${
                                        gameSubmitted && isSelected && def !== pair.definition
                                          ? 'border-red-500 bg-red-50'
                                          : ''
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        {gameSubmitted ? (
                                          def === pair.definition ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                          ) : isSelected ? (
                                            <Circle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                          ) : (
                                            <Circle className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
                                          )
                                        ) : (
                                          <Circle className={`h-5 w-5 shrink-0 mt-0.5 ${isSelected ? 'text-indigo-500 fill-indigo-500' : 'text-slate-300'}`} />
                                        )}
                                        <span className="text-sm text-slate-700">{def}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Questions MCQ Game (Module 2 style) */}
                    {currentTask.game.questions && (
                      <div className="space-y-16">
                        {currentTask.game.questions.map((q, qidx) => {
                          const selectedOptionValue = gameSelections[qidx];
                          const selectedOption = q.options.find(o => o.letter === selectedOptionValue);
                          const isDragDropStyle = (moduleIdNum === 1 && parseInt(taskNumber || '0') === 3) || (moduleIdNum === 2 && parseInt(taskNumber || '0') === 3) || (moduleIdNum === 3 && parseInt(taskNumber || '0') === 4) || (moduleIdNum === 4 && parseInt(taskNumber || '0') === 4) || (moduleIdNum === 5 && parseInt(taskNumber || '0') === 4);

                          if (isDragDropStyle) {
                            const questionParts = q.question.split(/…|\.\.\./);
                            const correctOption = q.options.find(o => o.isCorrect);
                            const isCorrect = isCommonTrayStyle 
                              ? (selectedOptionValue === correctOption?.text || selectedOptionValue === correctOption?.letter)
                              : selectedOption?.isCorrect;

                            return (
                              <div key={qidx} className="p-5 md:p-8 rounded-2xl md:rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-indigo-500/5 group">
                                <div className="flex flex-col md:flex-row items-start gap-4 mb-3">
                                  <span className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-sm md:text-lg shadow-md">
                                    {qidx + 1}
                                  </span>
                                  <div className="pt-0.5 text-lg md:text-xl font-bold text-slate-900 leading-relaxed md:leading-[1.6]">
                                    {questionParts[0]}
                                    <div 
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        if (!gameSubmitted) e.currentTarget.classList.add('bg-indigo-100', 'border-indigo-400', 'scale-105');
                                      }}
                                      onDragLeave={(e) => {
                                        e.currentTarget.classList.remove('bg-indigo-100', 'border-indigo-400', 'scale-105');
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('bg-indigo-100', 'border-indigo-400', 'scale-105');
                                        const data = e.dataTransfer.getData("optionLetter");
                                        const text = e.dataTransfer.getData("optionText");
                                        
                                        if (!gameSubmitted) {
                                          if (isCommonTrayStyle && text) {
                                            const option = q.options.find(o => o.text === text);
                                            if (option) {
                                              setGameSelections({ ...gameSelections, [qidx]: option.letter });
                                            } else {
                                              setGameSelections({ ...gameSelections, [qidx]: text }); 
                                            }
                                          } else if (data) {
                                            setGameSelections({ ...gameSelections, [qidx]: data });
                                          }
                                        }
                                      }}
                                      className={`inline-flex items-center justify-center min-w-[140px] md:min-w-[180px] mx-1 md:mx-2 px-3 py-1 rounded-xl border-2 border-dashed transition-all duration-300 ${
                                        selectedOptionValue 
                                          ? gameSubmitted
                                            ? isCorrect
                                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                              : 'bg-red-50 border-red-500 text-red-700'
                                            : 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-inner'
                                          : 'bg-slate-50 border-slate-200 text-slate-300'
                                      }`}
                                    >
                                      {selectedOptionValue 
                                        ? (isCommonTrayStyle ? (selectedOption?.text || selectedOptionValue) : (selectedOption?.text.replace(/^[a-d]\)\s*/i, '') || ''))
                                        : '_________'}
                                    </div>
                                    {questionParts[1]}
                                  </div>
                                </div>

                                {!isCommonTrayStyle && (
                                  <div className="md:ml-12 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((option) => {
                                      const isSelected = selectedOptionValue === option.letter;
                                      return (
                                        <div
                                          key={option.letter}
                                          draggable={!gameSubmitted}
                                          onDragStart={(e) => {
                                            if (!gameSubmitted) {
                                              e.dataTransfer.setData("optionLetter", option.letter);
                                              e.currentTarget.classList.add('opacity-50');
                                            }
                                          }}
                                          onDragEnd={(e) => {
                                            e.currentTarget.classList.remove('opacity-50');
                                          }}
                                          onClick={() => {
                                            if (!gameSubmitted) {
                                               setGameSelections({ ...gameSelections, [qidx]: option.letter });
                                            }
                                          }}
                                          className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 font-bold cursor-grab transition-all duration-300 select-none ${
                                            isSelected
                                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-95 opacity-50'
                                              : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300 hover:shadow-md'
                                          } ${gameSubmitted ? 'cursor-default pointer-events-none opacity-40' : 'active:cursor-grabbing'}`}
                                        >
                                          <div className="flex items-center gap-2 md:gap-3">
                                            <span className="leading-tight text-sm md:text-base">{option.text.replace(/^[a-d]\)\s*/i, '')}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {gameSubmitted && (
                                   <div className="mt-6 md:mt-8 md:ml-12 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                                      {isCorrect ? (
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                          <CheckCircle2 className="h-4 w-4" />
                                          To'g'ri tanlov!
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                                          <XCircle className="h-4 w-4" />
                                          To'g'ri javob: <span className="text-emerald-600">{correctOption?.text}</span>
                                        </div>
                                      )}
                                   </div>
                                )}
                              </div>
                            );
                          }

                          // Original MCQ Style (for other tasks)
                          return (
                            <div key={qidx} className="space-y-4">
                               <div className="flex items-start font-semibold text-slate-900 text-lg">
                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold mr-3 shrink-0">
                                  {qidx + 1}
                                </span>
                                <span className="pt-1">
                                  {q.question.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      return <strong key={i} className="font-black text-indigo-600">{part.slice(2, -2)}</strong>;
                                    }
                                    return part;
                                  })}
                                </span>
                              </div>
                              <div className="grid gap-3 pl-0 md:pl-11">
                                {q.options.map((option) => {
                                   const isSelected = selectedOptionValue === option.letter;
                                   let borderClass = 'border-slate-200 hover:border-slate-300';
                                   let bgClass = '';
                                   
                                   if (!gameSubmitted) {
                                     if (isSelected) {
                                       borderClass = 'border-indigo-500';
                                       bgClass = 'bg-indigo-50';
                                     }
                                   } else {
                                     if (option.isCorrect) {
                                       borderClass = 'border-green-500';
                                       bgClass = 'bg-green-50';
                                     } else if (isSelected && !option.isCorrect) {
                                       borderClass = 'border-red-500';
                                       bgClass = 'bg-red-50';
                                     }
                                   }

                                   return (
                                     <button
                                       key={option.letter}
                                       onClick={() => {
                                         if (!gameSubmitted) {
                                           setGameSelections({ ...gameSelections, [qidx]: option.letter });
                                         }
                                       }}
                                       disabled={gameSubmitted}
                                       className={`w-full text-left p-4 rounded-lg border-2 transition-all ${borderClass} ${bgClass}`}
                                     >
                                       <div className="flex items-center md:items-start gap-3">
                                         {gameSubmitted ? (
                                           option.isCorrect ? (
                                             <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 md:mt-0.5" />
                                           ) : isSelected ? (
                                             <XCircle className="h-5 w-5 text-red-500 shrink-0 md:mt-0.5" />
                                           ) : (
                                             <Circle className="h-5 w-5 text-slate-300 shrink-0 md:mt-0.5" />
                                           )
                                         ) : (
                                           <Circle className={`h-5 w-5 shrink-0 md:mt-0.5 ${isSelected ? 'text-indigo-500 fill-indigo-500' : 'text-slate-300'}`} />
                                         )}
                                         <div className="flex-1">
                                            <span className="font-bold text-slate-800 mr-2">{option.letter})</span>
                                            <span className="text-slate-700 leading-relaxed">{option.text}</span>
                                         </div>
                                       </div>
                                     </button>
                                   );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Common Tray for Drag-and-Drop (e.g. Module 4 Task 4) */}
                    {isCommonTrayStyle && !gameSubmitted && allOptions.length > 0 && (
                      <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                            <GripVertical className="text-indigo-400 h-6 w-6" />
                            Joylashtiriladigan tushunchalar
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {allOptions.map((text, tidx) => {
                            const isUsed = Object.values(gameSelections).includes(text);
                            return (
                              <div
                                key={tidx}
                                draggable={!gameSubmitted && !isUsed}
                                onDragStart={(e) => {
                                  if (!gameSubmitted && !isUsed) {
                                    e.dataTransfer.setData("optionText", text);
                                    e.currentTarget.classList.add('opacity-50');
                                  }
                                }}
                                onDragEnd={(e) => {
                                  e.currentTarget.classList.remove('opacity-50');
                                }}
                                onClick={() => {
                                  if (isTouch && !gameSubmitted && !isUsed) {
                                    setSelectedMobileItem(selectedMobileItem === text ? null : text);
                                  }
                                }}
                                className={`group cursor-pointer flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all duration-300 ring-1 ${
                                  isUsed 
                                    ? 'bg-white/5 opacity-20 pointer-events-none grayscale ring-white/5'
                                    : selectedMobileItem === text 
                                      ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/40 ring-indigo-400 scale-105' 
                                      : 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 ring-white/10'
                                }`}
                              >
                                <div className={`h-2 w-2 rounded-full transition-transform ${isUsed ? 'bg-slate-500' : 'bg-indigo-400 group-hover:scale-150'}`} />
                                <span className="text-sm leading-tight">{text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    {!gameSubmitted && (
                      currentTask.game.stations ? (
                        <div className="mt-8">
                          <Button onClick={handleStationsSubmit} className="bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 w-full md:w-auto md:px-8">
                            Natijalarni tekshirish
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-8">
                          {((currentTask.game.pairs && Object.keys(gameSelections).length === currentTask.game.pairs.length) || 
                            (currentTask.game.questions && Object.keys(gameSelections).length === currentTask.game.questions.length)) && (
                            <Button
                              onClick={handleGameSubmit}
                              className="bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 w-full md:w-auto md:px-8"
                            >
                              Javoblarni tekshirish
                            </Button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                );
              })()}

          {/* Diagram / Mind Map */}
          {currentTask.type === 'diagram' && currentTask.diagram && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-slate-700 font-bold text-lg leading-relaxed flex-1">{currentTask.diagram.instruction}</p>
                
                {diagramSubmitted && (
                  <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start">
                    <button
                      onClick={() => setShowCorrectDiagram(false)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!showCorrectDiagram ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Mening natijam
                    </button>
                    <button
                      onClick={() => setShowCorrectDiagram(true)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showCorrectDiagram ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Lightbulb className={`h-3.5 w-3.5 ${showCorrectDiagram ? 'text-amber-300' : ''}`} />
                      To'g'ri javoblar
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentTask.diagram.categories.map((category) => {
                  const userItems = diagramCategories[category.id] || [];
                  const displayedItems = showCorrectDiagram ? category.correctItems : userItems;
                  const isCorrectlyFilled = !showCorrectDiagram && diagramSubmitted && userItems.length === category.correctItems.length && 
                                           userItems.every(it => category.correctItems.some(ci => normalizeString(ci) === normalizeString(it)));

                  return (
                    <div
                      key={category.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!diagramSubmitted) e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-50/50');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/50');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/50');
                        if (draggedItem && !diagramSubmitted) {
                          const newCategories = { ...diagramCategories };
                          Object.keys(newCategories).forEach(key => {
                            newCategories[key] = newCategories[key].filter(item => item !== draggedItem);
                          });
                          if (!newCategories[category.id]) newCategories[category.id] = [];
                          newCategories[category.id].push(draggedItem);
                          setDiagramCategories(newCategories);
                          setDiagramItems(diagramItems.filter(item => item !== draggedItem));
                          setDraggedItem(null);
                        }
                      }}
                      className={`min-h-56 p-6 rounded-3xl border-2 transition-all duration-500 relative ${
                        showCorrectDiagram
                          ? 'border-indigo-200 bg-indigo-50/20 shadow-lg shadow-indigo-500/5'
                          : diagramSubmitted 
                            ? isCorrectlyFilled ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50'
                            : 'border-slate-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <h3 className={`font-black tracking-tight ${showCorrectDiagram ? 'text-indigo-700' : (diagramSubmitted && isCorrectlyFilled ? 'text-emerald-700' : 'text-slate-900')}`}>
                            {category.name}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{category.description}</p>
                        </div>
                        {!showCorrectDiagram && diagramSubmitted && isCorrectlyFilled && (
                           <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {displayedItems.map((item, idx) => (
                          <div
                            key={idx}
                            draggable={!diagramSubmitted}
                            onDragStart={() => setDraggedItem(item)}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isTouch && !diagramSubmitted) {
                                const newCategories = { ...diagramCategories };
                                newCategories[category.id] = newCategories[category.id].filter(it => it !== item);
                                setDiagramCategories(newCategories);
                                setDiagramItems([item, ...diagramItems]);
                              }
                            }}
                            className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shadow-sm border transition-all duration-300 ${
                              showCorrectDiagram
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                                : diagramSubmitted
                                  ? category.correctItems.some(ci => normalizeString(ci) === normalizeString(item))
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                    : 'bg-red-50 border-red-100 text-red-700'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                            } ${isTouch ? 'cursor-pointer' : 'cursor-move'}`}
                          >
                            <span className="flex-1 leading-tight">{item}</span>
                            {!showCorrectDiagram && diagramSubmitted && (
                              category.correctItems.some(ci => normalizeString(ci) === normalizeString(item)) ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                              )
                            )}
                          </div>
                        ))}
                        {!diagramSubmitted && displayedItems.length === 0 && (
                          <div className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
                             <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                                <ArrowDown className="h-4 w-4 text-slate-300" />
                             </div>
                             <p className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter">
                               Tushunchani tashlang
                             </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Enhanced Available Items Tray */}
              {!diagramSubmitted && diagramItems.length > 0 && (
                <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                      <GripVertical className="text-indigo-400 h-6 w-6" />
                      Joylashtiriladigan tushunchalar
                    </h3>
                    <div className="px-3 py-1 rounded-full bg-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest">
                      {diagramItems.length} qoldi
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {diagramItems.map((item, idx) => (
                      <div
                        key={idx}
                        draggable={!diagramSubmitted}
                        onDragStart={() => setDraggedItem(item)}
                        onClick={() => {
                          if (isTouch && !diagramSubmitted) {
                            setSelectedMobileItem(selectedMobileItem === item ? null : item);
                          }
                        }}
                        className={`group cursor-pointer flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all duration-300 ring-1 ${
                          selectedMobileItem === item 
                            ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/40 ring-indigo-400 scale-110' 
                            : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white ring-white/10'
                        }`}
                      >
                         <div className="h-2 w-2 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform" />
                         <span className="text-sm leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diagramSubmitted && (
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={() => {
                      if (taskNum < tasks.length) {
                        navigate(`/module/${moduleIdNum}/task/${taskNum + 1}`);
                      } else {
                        navigate(`/module/${moduleIdNum}/test`);
                      }
                    }}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-12 text-lg font-black rounded-2xl shadow-xl shadow-indigo-500/20 transform hover:-translate-y-1 active:scale-95 transition-all w-full md:w-auto flex items-center gap-3"
                  >
                    Keyingi bosqich
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </div>
              )}

              {!diagramSubmitted && diagramItems.length === 0 && (
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={handleDiagramSubmit}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-12 text-lg font-black rounded-2xl shadow-xl shadow-indigo-500/20 transform hover:-translate-y-1 active:scale-95 transition-all w-full md:w-auto"
                  >
                    Natijalarni tekshirish
                  </Button>
                </div>
              )}
            </div>
          )}



          {/* Global Station */}
          {currentTask.globalStation && (
            <GlobalStation
              data={currentTask.globalStation}
              onSubmit={async (score, total) => {
                await setTaskResult(moduleId || '1', taskNum, score, total, userName || undefined, userId || undefined);
                setResultBanner(`Global fuqarolik natijangiz: ${score}/${total} saqlandi`);
                setEmotionSubmitted(true); // Treat as completed for nav logic
                toast.success("Barcha stansiyalar yakunlandi!");
              }}
            />
          )}

          {/* Emotion Station */}
          {currentTask.type === 'emotion-station' && currentTask.emotionStation && (
            <EmotionStation
              moduleId={moduleId || '1'}
              taskId={taskNum}
              emotions={currentTask.emotionStation.emotions}
              techniques={currentTask.emotionStation.techniques}
              instruction={currentTask.emotionStation.instruction}
              promptText={currentTask.emotionStation.promptText}

              onSubmit={handleEmotionSubmit}
              decisionStation={currentTask.decisionStation}
              onDecisionSubmit={(score, total, selections) => handleDecisionSubmit(score, total, selections)}
              creativeStation={currentTask.creativeStation}
              onCreativeSubmit={handleCreativeSubmit}
              reflectionStation={currentTask.reflectionStation}
              onReflectionSubmit={handleReflectionSubmit}
              onNextTask={handleNext}
            />
          )}

          {/* Case Study */}
          {currentTask.type === 'case-study' && currentTask.caseStudy && (() => {
            const cs = currentTask.caseStudy;
            const scenarioLines = cs.scenario.split('\n');
            const firstLine = scenarioLines[0].trim();
            const hasMainTitle = firstLine.startsWith('“') && firstLine.endsWith('”');
            const scenarioToRender = hasMainTitle ? scenarioLines.slice(1) : scenarioLines;

            return (
              <div className="space-y-6">
                {hasMainTitle && (
                  <p className="text-center text-xl md:text-2xl font-black text-indigo-900 bg-gradient-to-r from-indigo-50/50 via-indigo-50 to-indigo-50/50 py-6 px-8 rounded-3xl border-2 border-indigo-100 mb-2 shadow-sm">
                    {firstLine}
                  </p>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Vaziyat:</h3>
                  <div className="space-y-4">
                    {scenarioToRender.map((line, idx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={idx} className="h-2" />;
                      
                      const isNumberedTitle = /^\d+\.\s/.test(trimmed) || trimmed.endsWith(':');

                      if (isNumberedTitle) {
                        return (
                          <p key={idx} className="font-bold text-slate-900 bg-indigo-50/50 p-3 rounded-xl border-l-4 border-indigo-500 mt-6 first:mt-0">
                            {trimmed}
                          </p>
                        );
                      }
                      return (
                        <p key={idx} className="text-slate-700 leading-relaxed px-1">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              
                <div className="space-y-4 bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/50">
                  <h3 className="text-xl font-black text-indigo-600">Savol:</h3>
                  <p className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
                    {cs.question}
                  </p>
                </div>

                <div className="space-y-3">
                  {cs.options.map((option) => {
                    const isSelected = selectedAnswer === option.letter;
                    const isCorrect = option.isCorrect;

                    return (
                      <button
                        key={option.letter}
                        onClick={() => handleAnswerSelect(option.letter)}
                        disabled={showAnswer}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected && !showAnswer
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                        } ${
                          showAnswer && isCorrect
                            ? 'border-green-500 bg-green-50'
                            : ''
                        } ${
                          showAnswer && isSelected && !isCorrect
                            ? 'border-red-500 bg-red-50'
                            : ''
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            {showAnswer ? (
                              isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                              ) : isSelected ? (
                                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                              )
                            ) : (
                              <Circle className={`h-5 w-5 shrink-0 ${isSelected ? 'text-indigo-500 fill-indigo-500' : 'text-slate-300'}`} />
                            )}
                            <span className="font-semibold text-slate-900">{option.letter}) {option.title}</span>
                          </div>
                          <div className="ml-8 space-y-1">
                            {option.description.map((desc, idx) => {
                              const isSubTitle = desc.trim().endsWith(':');
                              return (
                                <p key={idx} className={`text-sm whitespace-pre-line ${isSubTitle ? 'font-bold text-slate-900 mt-2 first:mt-0' : 'text-slate-600'}`}>
                                  {desc}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!showAnswer && selectedAnswer && (
                  <Button
                    onClick={handleCheckAnswer}
                    className="bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                  >
                    Javobni tekshirish
                  </Button>
                )}

                {showAnswer && cs.explanation && (
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-2">
                    {cs.explanation.map((line, idx) => (
                      <p key={idx} className="text-sm font-medium text-indigo-900 whitespace-pre-line">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* YouTube videos */}
          {videoIds.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Play className="h-5 w-5 text-indigo-500" />
                Video materiallar
              </h3>
              <div className="grid gap-4">
                {videoIds.map((videoId, idx) => (
                  <div key={idx} className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={`Video ${idx + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            {taskNum > 1 ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Oldingi
              </Button>
            ) : (
              <div />
            )}

            {isLastTask ? (
              <Button
                onClick={() => navigate(`/module/${moduleId}/test`)}
                disabled={
                  (currentTask.type === 'case-study' && !showAnswer) ||
                  (currentTask.type === 'emotion-station' && (!emotionSubmitted || (currentTask.decisionStation && !decisionSubmitted) || (currentTask.creativeStation && !creativeSubmitted) || (currentTask.reflectionStation && !reflectionSubmitted))) ||
                  (currentTask.globalStation && !emotionSubmitted) ||
                  (currentTask.type === 'game' && !gameSubmitted) ||
                  (currentTask.type === 'diagram' && !diagramSubmitted)
                }
                className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
              >
                Testni boshlash
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  (currentTask.type === 'case-study' && !showAnswer) ||
                  (currentTask.type === 'emotion-station' && (!emotionSubmitted || (currentTask.decisionStation && !decisionSubmitted) || (currentTask.creativeStation && !creativeSubmitted) || (currentTask.reflectionStation && !reflectionSubmitted))) ||
                  (currentTask.globalStation && !emotionSubmitted) ||
                  (currentTask.type === 'game' && !gameSubmitted) ||
                  (currentTask.type === 'diagram' && !diagramSubmitted)
                }
                className="flex items-center gap-2"
              >
                Keyingi
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(ModuleTask);
