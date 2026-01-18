import { useState, useRef, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Globe, Leaf, Users as UsersIcon, Link, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface Option {
  id: string;
  title: string;
  description: string[];
  isCorrect?: boolean;
}

interface MatchingItem {
  id: string;
  text: string;
  matchId: string;
}

interface MatchingTarget {
  id: string;
  text: string;
}

interface Station {
  id: string;
  type: 'selection' | 'matching';
  title: string;
  description: string;
  options?: Option[];
  matchingItems?: MatchingItem[];
  matchingTargets?: MatchingTarget[];
}

interface GlobalStationData {
  title: string;
  description: string;
  stations: Station[];
}

interface GlobalStationProps {
  data: GlobalStationData;
  onSubmit: (score: number, total: number) => Promise<void>;
}

export function GlobalStation({ data, onSubmit }: GlobalStationProps) {
  const [activeStationIndex, setActiveStationIndex] = useState(0);
  const [completedStations, setCompletedStations] = useState<Set<string>>(new Set());
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [matchingSelections, setMatchingSelections] = useState<Record<string, string>>({});

  // Line Matching & Drawing State
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempLine, setTempLine] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
  
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const targetRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{fromId: string, toId: string, coords: {x1: number, y1: number, x2: number, y2: number}}[]>([]);

  const currentStation = data.stations[activeStationIndex];

  const handleSelection = (optionId: string) => {
    if (completedStations.has(currentStation.id)) return;
    setSelections({ ...selections, [currentStation.id]: optionId });
  };

  const handleMatch = (itemId: string, targetId: string) => {
    if (completedStations.has(currentStation.id)) return;
    
    setMatchingSelections(prev => {
      const next = { ...prev };
      // 1. Remove existing match for this item (if any)
      // 2. Remove existing match for this target (enforce 1-to-1)
      Object.keys(next).forEach(key => {
        if (next[key] === targetId) delete next[key];
      });
      next[itemId] = targetId;
      return next;
    });
    
    setSelectedItemId(null);
    setTempLine(null);
    setIsDrawing(false);
  };

  // Drawing Logic (Pointer based for both Mouse & Touch)
  const startDrawing = (e: React.PointerEvent, itemId: string) => {
    if (completedStations.has(currentStation.id)) return;
    const fromEl = itemRefs.current[itemId];
    if (!fromEl || !containerRef.current) return;

    // Prevent default touch behavior (scrolling)
    if (e.pointerType === 'touch') {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const fromRect = fromEl.getBoundingClientRect();
    
    setSelectedItemId(itemId);
    setIsDrawing(true);
    setTempLine({
      x1: fromRect.right - containerRect.left,
      y1: fromRect.top + fromRect.height / 2 - containerRect.top,
      x2: e.clientX - containerRect.left,
      y2: e.clientY - containerRect.top
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !tempLine || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    setTempLine({
      ...tempLine,
      x2: e.clientX - containerRect.left,
      y2: e.clientY - containerRect.top
    });
  };

  const cancelDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setTempLine(null);
    setSelectedItemId(null);
  };

  const updateLines = () => {
    if (!containerRef.current || currentStation.type !== 'matching') return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: any[] = [];

    Object.entries(matchingSelections).forEach(([itemId, targetId]) => {
      const fromEl = itemRefs.current[itemId];
      const toEl = targetRefs.current[targetId];

      if (fromEl && toEl) {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        newLines.push({
          fromId: itemId,
          toId: targetId,
          coords: {
            x1: fromRect.right - containerRect.left,
            y1: fromRect.top + fromRect.height / 2 - containerRect.top,
            x2: toRect.left - containerRect.left,
            y2: toRect.top + toRect.height / 2 - containerRect.top,
          }
        });
      }
    });

    setLines(newLines);
  };

  useLayoutEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [matchingSelections, activeStationIndex]);

  const completeStation = () => {
    if (currentStation.type === 'selection' && !selections[currentStation.id]) {
      toast.error("Iltimos, variantni tanlang");
      return;
    }
    if (currentStation.type === 'matching') {
        const allMatched = currentStation.matchingItems?.every(item => matchingSelections[item.id]);
        if (!allMatched) {
            toast.error("Barcha jumlalarni moslang");
            return;
        }
    }

    const newCompleted = new Set(completedStations);
    newCompleted.add(currentStation.id);
    setCompletedStations(newCompleted);

    if (activeStationIndex < data.stations.length - 1) {
      setActiveStationIndex(activeStationIndex + 1);
    } else {
      calculateAndSubmit();
    }
  };

  const calculateAndSubmit = async () => {
    let score = 0;
    let total = 0;

    data.stations.forEach(station => {
      if (station.type === 'selection') {
        total += 1;
        const selectedId = selections[station.id];
        const option = station.options?.find(o => o.id === selectedId);
        if (option?.isCorrect) score += 1;
      } else if (station.type === 'matching') {
        station.matchingItems?.forEach(item => {
          total += 1;
          if (matchingSelections[item.id] === item.matchId) score += 1;
        });
      }
    });

    const roundedScore = Math.round(score);
    const roundedTotal = Math.round(total);
    
    try {
      toast.success(`${roundedTotal} tadan ${roundedScore} ta to'g'ri! Yakunlanmoqda...`);
      await onSubmit(roundedScore, roundedTotal);
    } catch (e) {
      console.error(e);
      toast.error("Natijani saqlashda xatolik");
    }
  };

  const getStationIcon = (id: string) => {
    switch (id) {
      case 'st1': return <Leaf className="h-5 w-5" />;
      case 'st2': return <UsersIcon className="h-5 w-5" />;
      case 'st3': return <Globe className="h-5 w-5" />;
      case 'st4': return <Link className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="p-6 md:p-8 bg-slate-900 rounded-3xl md:rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-20 bg-indigo-500 blur-[100px] opacity-20 rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] md:text-xs font-bold uppercase tracking-widest text-indigo-300">
              {getStationIcon(currentStation.id)}
              {currentStation.title}
            </div>
            <h2 className="text-xl md:text-3xl font-black">{data.title}</h2>
          </div>
          <div className="flex gap-2">
            {data.stations.map((s, idx) => (
              <div 
                key={s.id}
                className={`h-1.5 md:h-2 w-8 md:w-12 rounded-full transition-all duration-500 ${
                  idx === activeStationIndex ? 'bg-indigo-400 w-12 md:w-16' : 
                  completedStations.has(s.id) ? 'bg-emerald-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Station Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-3 bg-slate-100 p-1.5 md:p-2 rounded-xl md:rounded-2xl overflow-x-auto">
        {data.stations.map((s, idx) => {
          const isDone = completedStations.has(s.id);
          const isCurrent = idx === activeStationIndex;
          return (
            <button
              key={s.id}
              onClick={() => (isDone || isCurrent) ? setActiveStationIndex(idx) : null}
              disabled={!isDone && !isCurrent && !completedStations.has(data.stations[idx-1]?.id)}
              className={`flex-1 min-w-[120px] md:min-w-[140px] p-3 md:p-4 rounded-lg md:rounded-xl font-black text-[10px] md:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                isCurrent ? 'bg-white text-indigo-600 shadow-md' :
                isDone ? 'text-emerald-600 hover:bg-white/50' : 'text-slate-400 opacity-50 cursor-not-allowed'
              }`}
            >
              {getStationIcon(s.id)}
              <span>{s.title.split(':')[1] || s.title}</span>
              {isDone && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <Card className="p-4 md:p-8 border-slate-200 rounded-3xl md:rounded-[2rem] shadow-xl bg-white/50 backdrop-blur-sm">
        <div className="mb-6 md:mb-8 text-center max-w-2xl mx-auto">
          <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-2 md:mb-4">{currentStation.description}</h3>
        </div>

        {currentStation.type === 'selection' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {currentStation.options?.map((option) => {
              const isSelected = selections[currentStation.id] === option.id;
              const isCompleted = completedStations.has(currentStation.id);
              const isCorrect = option.isCorrect;
              
              let borderClass = 'border-slate-100';
              let bgClass = 'bg-white hover:shadow-lg';
              let badge = null;

              if (isCompleted) {
                if (isCorrect) {
                  borderClass = 'border-emerald-500 ring-4 ring-emerald-500/10';
                  bgClass = 'bg-emerald-50';
                  badge = <span className="text-[8px] md:text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full ml-auto">To'g'ri</span>;
                } else if (isSelected && !isCorrect) {
                  borderClass = 'border-red-500 ring-4 ring-red-500/10';
                  bgClass = 'bg-red-50';
                  badge = <span className="text-[8px] md:text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded-full ml-auto">Xato</span>;
                } else {
                  bgClass = 'bg-white opacity-40';
                }
              } else if (isSelected) {
                borderClass = 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/10';
                bgClass = '';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelection(option.id)}
                  disabled={isCompleted}
                  className={`p-4 md:p-6 text-left rounded-xl md:rounded-2xl border-2 transition-all group relative ${borderClass} ${bgClass}`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className={`h-8 w-8 md:h-10 md:w-10 shrink-0 rounded-lg md:rounded-xl flex items-center justify-center text-sm md:text-base font-black transition-colors ${
                      isSelected ? (isCompleted && !isCorrect ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white') : 
                      isCompleted && isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {option.id.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black text-slate-900 text-sm md:text-base truncate pr-2">{option.title}</h4>
                        {badge}
                      </div>
                      <div className="space-y-1">
                        {option.description.map((line, i) => (
                          <p key={i} className="text-xs md:text-sm text-slate-500 leading-relaxed truncate md:whitespace-normal">• {line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {currentStation.type === 'matching' && (
          <div 
            className="relative select-none touch-none" 
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={cancelDrawing}
            onPointerLeave={cancelDrawing}
          >
            {/* SVG Overlay for Lines */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              style={{ minHeight: '800px' }}
            >
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineCorrect" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineError" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Permanent Lines */}
              {lines.map((line) => {
                const item = currentStation.matchingItems?.find(it => it.id === line.fromId);
                const isCorrect = item?.matchId === line.toId;
                const isCompleted = completedStations.has(currentStation.id);
                
                let gradientId = "lineGrad";
                if (isCompleted) {
                  gradientId = isCorrect ? "lineCorrect" : "lineError";
                }

                return (
                  <path
                    key={`${line.fromId}-${line.toId}`}
                    d={`M ${line.coords.x1} ${line.coords.y1} C ${(line.coords.x1 + line.coords.x2) / 2} ${line.coords.y1}, ${(line.coords.x1 + line.coords.x2) / 2} ${line.coords.y2}, ${line.coords.x2} ${line.coords.y2}`}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={isCompleted ? "4" : "3"}
                    fill="none"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    className="animate-draw-line"
                  />
                );
              })}

              {/* Temporary Drawing Line */}
              {tempLine && (
                <path
                  d={`M ${tempLine.x1} ${tempLine.y1} C ${(tempLine.x1 + tempLine.x2) / 2} ${tempLine.y1}, ${(tempLine.x1 + tempLine.x2) / 2} ${tempLine.y2}, ${tempLine.x2} ${tempLine.y2}`}
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                />
              )}
            </svg>

            <div className="grid grid-cols-2 gap-x-4 md:gap-x-32 gap-y-4 md:gap-y-8 relative z-10">
              {/* Left Column: Local Problems */}
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-6 px-1 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-indigo-500" />
                  <span className="hidden sm:inline">A. Mahalliy muammolar</span>
                  <span className="sm:hidden">Muammolar</span>
                </h4>
                {currentStation.matchingItems?.map((item) => {
                  const targetId = matchingSelections[item.id];
                  const isMatched = !!targetId;
                  const isSelected = selectedItemId === item.id;
                  const isCompleted = completedStations.has(currentStation.id);
                  const isCorrectMatch = isMatched && item.matchId === targetId;
                  
                  // Get correct target letter
                  const correctTarget = currentStation.matchingTargets?.find(t => t.id === item.matchId);
                  const correctLetter = correctTarget ? String.fromCharCode(64 + parseInt(correctTarget.id.replace('t', ''))) : '';

                  return (
                    <div key={item.id} className="space-y-1">
                      <div 
                        ref={el => { itemRefs.current[item.id] = el; }}
                        onPointerDown={(e) => startDrawing(e, item.id)}
                        className={`group relative p-2 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all flex items-center justify-between gap-2 md:gap-4 ${isCompleted ? 'cursor-default' : 'cursor-crosshair'} ${
                          isSelected ? 'border-indigo-500 bg-indigo-50/50 shadow-md scale-[1.02]' :
                          isCompleted ? (isCorrectMatch ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30') :
                          isMatched ? 'border-emerald-50 bg-emerald-50/10' : 
                          'border-slate-100 bg-white hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          <span className="flex h-5 w-5 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-md md:rounded-lg bg-slate-100 text-slate-500 text-[10px] md:text-xs font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {item.id.replace('m', '')}
                          </span>
                          <span className="font-bold text-slate-700 text-[11px] md:text-sm leading-tight line-clamp-2 md:line-clamp-none">{item.text}</span>
                        </div>
                        <div className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 rounded-full border md:border-2 transition-all ${
                          isCompleted ? (isCorrectMatch ? 'bg-emerald-500 border-emerald-200 scale-110' : 'bg-red-500 border-red-200') :
                          isMatched ? 'bg-emerald-500 border-emerald-200' : 'bg-white border-slate-200 group-hover:border-indigo-400'
                        }`} />
                      </div>
                      
                      {isCompleted && !isCorrectMatch && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 animate-in fade-in slide-in-from-top-1 duration-500">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="text-[10px] font-black uppercase">To'g'ri javob: {correctLetter}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Global Impacts */}
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-6 px-1 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500" />
                  <span className="hidden sm:inline">B. Global ta’sirlar</span>
                  <span className="sm:hidden">Ta'sirlar</span>
                </h4>
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  {currentStation.matchingTargets?.map((target) => {
                    const matchedItem = Object.entries(matchingSelections).find(([_, tid]) => tid === target.id);
                    const isTargetMatched = !!matchedItem;
                    const isCompleted = completedStations.has(currentStation.id);
                    
                    const itemOfTarget = matchedItem ? currentStation.matchingItems?.find(it => it.id === matchedItem[0]) : null;
                    const isCorrectLink = itemOfTarget && itemOfTarget.matchId === target.id;

                    return (
                      <div 
                        key={target.id}
                        ref={el => { targetRefs.current[target.id] = el; }}
                        onPointerUp={() => !isCompleted && isDrawing && selectedItemId && handleMatch(selectedItemId, target.id)}
                        className={`p-2 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all flex items-center gap-2 md:gap-4 group ${isCompleted ? 'cursor-default' : 'cursor-pointer'} ${
                          isDrawing ? 'hover:border-indigo-500 hover:bg-indigo-50/50' : ''
                        } ${
                          isCompleted ? (isCorrectLink ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-50/20 bg-red-50/10') :
                          isTargetMatched ? 'border-emerald-50 bg-emerald-50/10' : 'border-slate-50 bg-slate-50/30 hover:bg-white hover:border-indigo-200'
                        }`}
                      >
                        <div className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 rounded-full border md:border-2 transition-all ${
                          isCompleted ? (isCorrectLink ? 'bg-emerald-500 border-emerald-200 scale-110' : 'bg-red-500 border-red-200') :
                          isTargetMatched ? 'bg-emerald-500 border-emerald-200' : 'bg-white border-slate-200 group-hover:border-indigo-400'
                        }`} />
                        <div className={`h-6 w-6 md:h-10 md:w-10 shrink-0 rounded-md md:rounded-xl bg-white border flex items-center justify-center text-[10px] md:text-sm font-black shadow-sm transition-colors ${
                          isCompleted && isCorrectLink ? 'border-emerald-300 text-emerald-600' : 
                          isCompleted && !isCorrectLink && isTargetMatched ? 'border-red-300 text-red-600' :
                          'border-slate-200 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                        }`}>
                          {String.fromCharCode(64 + parseInt(target.id.replace('t', '')))}
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-slate-600 leading-tight line-clamp-2 md:line-clamp-none">{target.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes draw-line {
                to { stroke-dashoffset: 0; }
              }
              .animate-draw-line {
                animation: draw-line 0.6s ease-out forwards;
              }
            `}} />
          </div>
        )}

        <div className="mt-8 md:mt-12 flex justify-center">
          {!completedStations.has(currentStation.id) ? (
            <Button
              onClick={completeStation}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 md:px-12 h-12 md:h-14 rounded-xl shadow-xl shadow-indigo-500/20 text-base md:text-lg font-black group w-full md:w-auto"
            >
              Tasdiqlash
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          ) : activeStationIndex < data.stations.length - 1 ? (
            <Button
              onClick={() => setActiveStationIndex(activeStationIndex + 1)}
              variant="outline"
              size="lg"
              className="px-8 md:px-12 h-12 md:h-14 rounded-xl text-base md:text-lg font-black w-full md:w-auto"
            >
              Keyingi Stansiya
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
