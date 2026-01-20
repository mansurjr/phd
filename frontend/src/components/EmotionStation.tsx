import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Wind, Eye, Brain, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Emotion {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
}

interface Technique {
  id: string;
  name: string;
  icon?: string;
  shortDescription: string;
  steps: string[];
  benefits: string[];
  duration?: string;
}

interface EmotionResponse {
  emotionId: string;
  reasoning: string;
  selectedTechnique: string;
}

interface DecisionStationData {
  title: string;
  description: string;
  scenarios: Array<{
    id: string;
    text: string;
  }>;
  options: Array<{
    value: string;
    label: string;
    points: number;
  }>;
}

interface CreativeStationData {
  title: string;
  description: string;
  imageUrl?: string;
  headerImageUrl?: string;
  items: string[];
  question: string;
  options: Array<{
    letter: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface ReflectionStationData {
  title: string;
  description: string;
  questions: Array<{
    id: string;
    question: string;
    options: Array<{
      letter: string;
      text: string;
    }>;
  }>;
}

interface EmotionStationProps {
  moduleId: string;
  taskId: number;
  emotions: Emotion[];
  techniques: Technique[];
  decisionStation?: DecisionStationData;
  creativeStation?: CreativeStationData;
  reflectionStation?: ReflectionStationData;
  onSubmit: (responses: EmotionResponse[]) => Promise<void>;
  onDecisionSubmit?: (score: number, total: number, selections: Record<string, string>) => Promise<void>;
  onCreativeSubmit?: (isCorrect: boolean) => Promise<void>;
  onReflectionSubmit?: (totalScore: number) => Promise<void>;
  onNextTask?: () => void;
  instruction?: string;
  promptText?: string;
}

export function EmotionStation({
  emotions,
  techniques,
  decisionStation,
  creativeStation,
  reflectionStation,
  onSubmit,
  onDecisionSubmit,
  onCreativeSubmit,
  onReflectionSubmit,
  onNextTask,

  instruction,
  promptText,
}: EmotionStationProps) {
  // Station State
  const [activeStation, setActiveStation] = useState<'emotion' | 'decision' | 'creative' | 'reflection'>('emotion');
  const [station1Completed, setStation1Completed] = useState(false);
  const [station2Completed, setStation2Completed] = useState(false);
  const [station3Completed, setStation3Completed] = useState(false);
  const [station4Completed, setStation4Completed] = useState(false);

  // Creative Station State
  const [selectedCreativeOption, setSelectedCreativeOption] = useState<string | null>(null);

  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  
  // Scoring State
  const [s2FinalScore, setS2FinalScore] = useState(0);
  const [s3FinalCorrect, setS3FinalCorrect] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [totalManagerScore, setTotalManagerScore] = useState(0);

  // Emotion Station State
  const [selectedEmotionId, setSelectedEmotionId] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Decision Station State
  const [decisionSelections, setDecisionSelections] = useState<Record<string, string>>({});

  const selectedEmotion = emotions.find((e) => e.id === selectedEmotionId);

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotionId(emotionId);
    setReasoning('');
    setSelectedTechnique(null);
    setExpandedTechnique(null);
  };

  const handleEmotionSubmit = async () => {
    if (!selectedEmotion || !reasoning.trim() || !selectedTechnique) {
      toast.error('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit([
        {
          emotionId: selectedEmotionId!,
          reasoning: reasoning.trim(),
          selectedTechnique: selectedTechnique,
        },
      ]);
      setStation1Completed(true);
      toast.success("1-stansiya yakunlandi!");
      
      if (decisionStation) {
        setActiveStation('decision');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecisionSubmit = async () => {
    if (!decisionStation) return;
    
    // Validate all scenarios answered
    const allAnswered = decisionStation.scenarios.every(s => decisionSelections[s.id]);
    if (!allAnswered) {
      toast.error("Barcha vaziyatlar uchun yechim tanlang!");
      return;
    }

    // Calculate score
    let score = 0;
    
    // Calculate actual max possible score dynamically
    const maxOptionPoints = Math.max(...decisionStation.options.map(o => o.points));
    const realTotalMax = decisionStation.scenarios.length * maxOptionPoints;

    Object.values(decisionSelections).forEach(val => {
      const option = decisionStation.options.find(o => o.value === val);
      if (option) score += option.points;
    });

    setIsSubmitting(true);
    try {
      if (onDecisionSubmit) {
        await onDecisionSubmit(score, realTotalMax, decisionSelections);
      }
      setS2FinalScore(score);
      setStation2Completed(true);
      toast.success(`Natija: ${score} ball to'pladingiz!`);
      if (creativeStation) {
        setActiveStation('creative');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreativeSubmitInternal = async () => {
    if (!creativeStation || !selectedCreativeOption) return;

    const correct = creativeStation.options.find(o => o.letter === selectedCreativeOption)?.isCorrect || false;
    
    setIsSubmitting(true);
    try {
      if (onCreativeSubmit) {
        await onCreativeSubmit(correct);
      }
      setS3FinalCorrect(correct);
      setStation3Completed(true);
      if (reflectionStation) {
        setActiveStation('reflection');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReflectionSubmitInternal = async () => {
    if (!reflectionStation) return;
    
    const allAnswered = reflectionStation.questions.every(q => reflectionAnswers[q.id]);
    if (!allAnswered) {
      toast.error("Iltimos, barcha savollarga javob bering!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate Final "Self-Manager" Score
      // St1: 3 pts (completion)
      // St2: 3 scenarios, max 15 pts. Normalize to 3 pts.
      const p1 = 3;
      const p2 = Math.max(1, Math.ceil((s2FinalScore / 15) * 3));
      const p3 = s3FinalCorrect ? 3 : 1;
      const p4 = 3; // completion
      
      const total = p1 + p2 + p3 + p4;
      setTotalManagerScore(total);

      if (onReflectionSubmit) {
        await onReflectionSubmit(total);
      }
      setStation4Completed(true);
      setShowSummary(true);
      toast.success("Hamma stansiyalar yakunlandi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Station Navigation / Tabs */}
      {decisionStation && (
        <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-xl">
            <button
              onClick={() => setActiveStation('emotion')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                activeStation === 'emotion' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>1-stansiya: Emotsional Holat</span>
                {station1Completed && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
            </button>
            <div className="text-slate-300">
              <ChevronRight className="h-5 w-5" />
            </div>
            <button
              onClick={() => station1Completed && setActiveStation('decision')}
              disabled={!station1Completed}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                activeStation === 'decision'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : !station1Completed 
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
               <div className="flex items-center justify-center gap-2">
                <span>2-stansiya: Bir Daqiqalik Qaror</span>
                {station2Completed && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
            </button>
            
            {creativeStation && (
              <>
                <div className="text-slate-300">
                  <ChevronRight className="h-5 w-5" />
                </div>
                <button
                  onClick={() => station2Completed && setActiveStation('creative')}
                  disabled={!station2Completed}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                    activeStation === 'creative'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : !station2Completed
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                   <div className="flex items-center justify-center gap-2">
                    <span>3-stansiya: Ijodiy quticha</span>
                    {station3Completed && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                </button>
              </>
            )}

            {reflectionStation && (
              <>
                <div className="text-slate-300">
                  <ChevronRight className="h-5 w-5" />
                </div>
                <button
                  onClick={() => station3Completed && setActiveStation('reflection')}
                  disabled={!station3Completed}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                    activeStation === 'reflection'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : !station3Completed
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                   <div className="flex items-center justify-center gap-2">
                    <span>4-stansiya: Refleksiya</span>
                    {station4Completed && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                </button>
              </>
            )}
        </div>
      )}

      {/* Station 1: Emotion */}
      {activeStation === 'emotion' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Emotsional Boshqarish Stansiyasi</h2>
            {instruction && (
              <div className="bg-white border text-left border-indigo-100 rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 bg-indigo-50 rounded-bl-full opacity-50"></div>
                <div className="relative z-10">
                  <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
                    <span className="p-2 bg-indigo-100 rounded-lg">
                      <Brain className="w-5 h-5 text-indigo-600" />
                    </span>
                    Yo'riqnoma
                  </h3>
                  <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
                    {instruction.split('\n\n').map((paragraph, idx) => (
                      <div key={idx} className="whitespace-pre-line">
                        {paragraph.startsWith('🎯') || paragraph.startsWith('O‘yin nomi:') || paragraph.includes('stansiya:') ? (
                          <strong className="block text-slate-800 mb-1">{paragraph}</strong>
                        ) : (
                          paragraph
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!selectedEmotion ? (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-slate-700">Quyidagi emotsiyalardan hozirgi holatingizga mosini tanlang</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.id}
                    onClick={() => handleEmotionSelect(emotion.id)}
                    className="group p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all text-left flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-square overflow-hidden rounded-xl mb-3 bg-slate-50 flex items-center justify-center">
                        <img
                        src={emotion.imageUrl}
                        alt={emotion.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{emotion.title}</h4>
                    <p className="text-sm text-slate-500 leading-snug">{emotion.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <Card className="mb-6 p-6 border-indigo-100 bg-linear-to-br from-indigo-50/50 to-white">
                <button
                  onClick={() => setSelectedEmotionId(null)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-1"
                >
                  ← Boshqa emotsiya tanlang
                </button>
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="w-full md:w-64 aspect-square shrink-0 bg-white rounded-2xl shadow-md overflow-hidden border border-indigo-100 p-2">
                    <img
                      src={selectedEmotion.imageUrl}
                      alt={selectedEmotion.title}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-black text-slate-900 mb-2">{selectedEmotion.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{selectedEmotion.description}</p>
                    
                    <div className="mt-6">
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                        {promptText || 'Ushbu emotsiyani nima sababdan his qilyapsiz?'}
                        </label>
                        <Textarea
                        value={reasoning}
                        onChange={(e) => setReasoning(e.target.value)}
                        placeholder="Sababini yozing..."
                        className="w-full p-4 border-slate-200 rounded-xl focus:ring-indigo-500 min-h-[100px]"
                        />
                        <p className="text-xs text-slate-400 mt-2 text-right">
                        {reasoning.length} belgi
                        </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="mb-8">
                <label className="block text-lg font-bold text-slate-900 mb-4">
                  Stressni boshqarish texnikasini tanlang:
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {techniques.map((tech) => (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTechnique(tech.id)}
                      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedTechnique === tech.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-slate-100 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100">
                             {tech.id === 'technique1' && <Wind className="h-6 w-6 text-indigo-500" />}
                             {tech.id === 'technique2' && <Eye className="h-6 w-6 text-emerald-500" />}
                             {tech.id === 'technique3' && <Brain className="h-6 w-6 text-violet-500" />}
                             {/* Fallback Icon */}
                             {!['technique1', 'technique2', 'technique3'].includes(tech.id) && <Brain className="h-6 w-6 text-slate-500" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-lg mb-1">{tech.name}</h4>
                          <p className="text-sm text-slate-600 mb-2">{tech.shortDescription}</p>
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                             {tech.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {tech.duration}</span>}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedTechnique(expandedTechnique === tech.id ? null : tech.id);
                          }}
                          className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${expandedTechnique === tech.id ? 'transform rotate-180' : ''}`}
                        >
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        </button>
                      </div>

                      {/* Technique Details (Accordion) */}
                      {(expandedTechnique === tech.id || selectedTechnique === tech.id) && (
                        <div className="mt-4 pt-4 border-t border-slate-200/60 animate-in fade-in duration-300">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">Qadamlar</h5>
                                <ol className="space-y-2">
                                {tech.steps.map((step, idx) => (
                                    <li key={idx} className="text-sm text-slate-600 flex gap-2">
                                        <span className="font-bold text-indigo-500">{idx + 1}.</span> {step}
                                    </li>
                                ))}
                                </ol>
                            </div>
                            <div>
                                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">Foydali tomonlari</h5>
                                <ul className="space-y-2">
                                {tech.benefits.map((benefit, idx) => (
                                    <li key={idx} className="text-sm text-slate-600 flex gap-2">
                                        <span className="text-emerald-500">•</span> {benefit}
                                    </li>
                                ))}
                                </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  onClick={handleEmotionSubmit}
                  disabled={isSubmitting || !reasoning.trim() || !selectedTechnique}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  {isSubmitting ? 'Saqlanmoqda...' : (
                    <span className="flex items-center gap-2">
                         Saqlash va Davom etish <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Station 2: Decision */}
      {activeStation === 'decision' && decisionStation && (
         <div className="animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="mb-8 p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-indigo-500 blur-3xl opacity-20 rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">{decisionStation.title}</h2>
                    <p className="text-slate-300">{decisionStation.description}</p>
                </div>
             </div>

             <div className="space-y-6">
                {decisionStation.scenarios.map((scenario, idx) => (
                    <Card key={scenario.id} className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm">
                        <h4 className="flex items-start gap-4 font-bold text-lg text-slate-900 mb-6">
                             <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-sm font-black text-center">
                                {idx + 1}
                             </span>
                             {scenario.text}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:pl-12">
                            {decisionStation.options.map((option) => {
                                const isSelected = decisionSelections[scenario.id] === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => !station2Completed && setDecisionSelections({ ...decisionSelections, [scenario.id]: option.value })}
                                        disabled={station2Completed}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                            isSelected
                                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20'
                                                : station2Completed
                                                    ? 'border-slate-100 text-slate-400 bg-slate-50' 
                                                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md bg-white'
                                        }`}
                                    >
                                        <span className={`block font-bold mb-1 ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                            {option.label}
                                        </span>
                                        {/* Show points only after completion? Or maybe user knows? The prompt says user knows points logic. */}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>
                ))}
             </div>

             <div className="flex justify-end mt-8">
                 {!station2Completed ? (
                    <Button
                        onClick={handleDecisionSubmit}
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg rounded-xl shadow-xl shadow-indigo-500/20"
                    >
                        {isSubmitting ? 'Hisoblanmoqda...' : 'Natijani yakunlash'}
                    </Button>
                 ) : (
                    <div className="p-4 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Stansiya muvaffaqiyatli yakunlandi
                    </div>
                 )}
             </div>
         </div>
      )}

      {/* Station 3: Creative */}
      {activeStation === 'creative' && creativeStation && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
           <div className="mb-8 p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 bg-pink-500 blur-3xl opacity-20 rounded-full pointer-events-none"></div>
             <div className="relative z-10">
                 <h2 className="text-2xl font-bold mb-2">{creativeStation.title}</h2>
                 <p className="text-slate-300">{creativeStation.description}</p>
             </div>
           </div>

           {/* Header Image Add (New) */}
           {creativeStation.headerImageUrl && (
             <div className="mb-8 flex justify-center">
               <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white p-2">
                  <img 
                    src={creativeStation.headerImageUrl} 
                    alt="Ijodiy quticha sarlavha rasm" 
                    className="w-full max-w-2xl object-contain rounded-xl"
                  />
               </div>
             </div>
           )}

           <div className="space-y-6">
             <div className="font-bold text-lg text-slate-900 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
               {creativeStation.question}
             </div>

            {/* Items Image */}
            {creativeStation.imageUrl && (
              <div className="flex justify-center">
                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white p-2">
                   <img 
                     src={creativeStation.imageUrl} 
                     alt="Ijodiy quticha predmetlari" 
                     className="w-full max-w-md object-contain rounded-xl"
                   />
                </div>
              </div>
            )}

             <div className="grid gap-4">
               {creativeStation.options.map((option) => {
                 // Determine styles based on selection and submission status
                 const isSelected = selectedCreativeOption === option.letter;
                 let itemClass = "border-slate-200 hover:border-indigo-300 bg-white";
                 
                 if (station3Completed) {
                   if (option.isCorrect) {
                     itemClass = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500";
                   } else if (isSelected) {
                     itemClass = "border-red-500 bg-red-50";
                   }
                   // else default
                 } else {
                   if (isSelected) {
                     itemClass = "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500";
                   }
                 }

                 return (
                   <button
                     key={option.letter}
                     onClick={() => !station3Completed && setSelectedCreativeOption(option.letter)}
                     disabled={station3Completed}
                     className={`w-full p-6 text-left rounded-2xl border-2 transition-all ${itemClass} relative group`}
                   >
                     <div className="flex items-start gap-4">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-black text-sm transition-colors ${
                          isSelected || (station3Completed && option.isCorrect) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        } ${station3Completed && option.isCorrect ? 'bg-emerald-600' : ''} ${station3Completed && isSelected && !option.isCorrect ? 'bg-red-500' : ''}`}>
                          {option.letter}
                        </div>
                        <span className={`text-base font-medium leading-relaxed ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                          {option.text}
                        </span>
                     </div>
                     {station3Completed && option.isCorrect && (
                       <div className="absolute top-4 right-4 text-emerald-600">
                         <CheckCircle2 className="h-6 w-6" />
                       </div>
                     )}
                   </button>
                 );
               })}
             </div>
           </div>

           <div className="flex justify-end mt-8">
               {!station3Completed ? (
                  <Button
                      onClick={handleCreativeSubmitInternal}
                      disabled={isSubmitting || !selectedCreativeOption}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg rounded-xl shadow-xl shadow-indigo-500/20"
                  >
                      {isSubmitting ? 'Tekshirilmoqda...' : 'Javobni tekshirish'}
                  </Button>
               ) : (
                  <div className="p-4 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Muvaffaqiyatli yakunlandi
                  </div>
               )}
           </div>
        </div>
      )}


      {activeStation === 'reflection' && reflectionStation && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
           <div className="mb-8 p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 bg-emerald-500 blur-3xl opacity-20 rounded-full pointer-events-none"></div>
             <div className="relative z-10">
                 <h2 className="text-2xl font-bold mb-2">{reflectionStation.title}</h2>
                 <p className="text-slate-300">{reflectionStation.description}</p>
             </div>
           </div>

            <div className="space-y-12">
              {reflectionStation.questions.map((q, qIdx) => (
                <div key={q.id} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-black">
                      {qIdx + 1}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {q.question}
                    </h3>
                  </div>

                  <div className="grid gap-4 ml-14">
                    {q.options.map((option) => {
                      const isSelected = reflectionAnswers[q.id] === option.letter;
                      return (
                        <button
                          key={option.letter}
                          onClick={() => !station4Completed && setReflectionAnswers(prev => ({ ...prev, [q.id]: option.letter }))}
                          disabled={station4Completed}
                          className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' 
                              : station4Completed 
                                ? 'border-slate-100 text-slate-400 bg-slate-50'
                                : 'border-slate-200 hover:border-indigo-300 bg-white'
                          } relative`}
                        >
                          <div className="flex items-start gap-4">
                             <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-black text-sm transition-colors ${
                               isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                             }`}>
                               {option.letter}
                             </div>
                             <span className={`text-base font-medium leading-relaxed ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                               {option.text}
                             </span>
                          </div>
                          {station4Completed && isSelected && (
                              <div className="absolute top-4 right-4 text-emerald-600">
                                <CheckCircle2 className="h-6 w-6" />
                              </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-end mt-12 pt-8 border-t border-slate-100">
                  {!station4Completed ? (
                     <Button
                         onClick={handleReflectionSubmitInternal}
                         disabled={isSubmitting || !reflectionStation.questions.every(q => reflectionAnswers[q.id])}
                         className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg rounded-xl shadow-xl shadow-indigo-500/20"
                     >
                         {isSubmitting ? 'Saqlanmoqda...' : 'Refleksiyani yakunlash'}
                     </Button>
                  ) : (
                     <div className="p-4 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-xl flex items-center gap-2">
                         <CheckCircle2 className="h-5 w-5" />
                         Muvaffaqiyatli yakunlandi
                     </div>
                  )}
              </div>
            </div>
        </div>
      )}

      {/* Final Summary Card */}
      {showSummary && (
        <Card className="p-6 rounded-2xl border-2 border-indigo-100 bg-white shadow-xl animate-in zoom-in duration-500 text-center max-w-lg mx-auto">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Brain className="h-8 w-8" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-1">Self-Manager Natijasi</h2>
            <div className="text-4xl font-black text-indigo-600 mb-4">
              12 tadan {totalManagerScore} ta
            </div>
            
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Sizning darajangiz:</h3>
                {totalManagerScore >= 10 && (
                    <div className="text-emerald-600 font-bold text-xl uppercase tracking-wider">
                        Shaxsiy qobiliyatlari rivojlangan 🚀
                    </div>
                )}
                {totalManagerScore >= 7 && totalManagerScore <= 9 && (
                    <div className="text-amber-600 font-bold text-xl uppercase tracking-wider">
                        Rivojlanayotgan, qo‘llab-quvvatlash kerak 📈
                    </div>
                )}
                {totalManagerScore <= 6 && (
                    <div className="text-rose-600 font-bold text-xl uppercase tracking-wider">
                        Boshlang‘ich daraja, mustaqil mashg‘ulot zarur 🎯
                    </div>
                )}
            </div>

            <p className="text-slate-500 text-sm mb-6">
                Hamma stansiyalarni muvaffaqiyatli yakunladingiz. <br/> 
                Endi keyingi topshiriqqa o'tishingiz mumkin.
            </p>

            <div className="flex flex-col items-center gap-4">
               <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm">
                 Samaradorlik: {Math.round((totalManagerScore / 12) * 100)}%
               </div>

               {onNextTask && (
                 <Button 
                   onClick={onNextTask}
                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
                 >
                   Keyingi topshiriq <ChevronRight className="ml-2 h-5 w-5" />
                 </Button>
               )}
            </div>
        </Card>
      )}
    </div>
  );
}

