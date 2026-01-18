import { memo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTask } from '@/lib/module1Data';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { useModuleStore } from '@/store/moduleStore';
import { useUserStore } from '@/store/userStore';
import { OverallSummaryModal } from '@/components/OverallSummaryModal';

const ModuleTest = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const setTaskResult = useModuleStore((state) => state.setTaskResult);
  const { userName, userId } = useUserStore();
  
  const moduleIdNum = parseInt(moduleId || '1', 10);
  const testTask = getTask(moduleIdNum, 5); // Test is always task 5
  
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  if (!testTask || testTask.type !== 'test' || !testTask.test) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-slate-600">Test topilmadi</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Bosh sahifaga qaytish
        </Button>
      </div>
    );
  }

  const handleAnswerSelect = (questionId: number, answer: string) => {
    if (!submitted) {
      setSelectedAnswers({ ...selectedAnswers, [questionId]: answer });
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const { correct, total } = getScore();
    await setTaskResult(moduleId || '1', 5, correct, total, userName || undefined, userId || undefined);
  };

  const getScore = () => {
    let correct = 0;
    testTask.test!.forEach((q, idx) => {
      const correctAnswer = q.options.find(opt => opt.isCorrect)?.letter;
      if (selectedAnswers[idx + 1] === correctAnswer) {
        correct++;
      }
    });
    return { correct, total: testTask.test!.length };
  };

  const score = submitted ? getScore() : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {testTask.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showResult && testTask.test.map((question, idx) => {
            const questionId = idx + 1;
            
            return (
              <div key={questionId} className="space-y-3 p-4 border rounded-lg">
                <h3 className="font-semibold text-slate-900">
                  {questionId}. {question.question}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {question.options.map((option) => {
                    const isSelected = selectedAnswers[questionId] === option.letter;
                    const isCorrect = option.isCorrect;

                    return (
                      <button
                        key={option.letter}
                        onClick={() => handleAnswerSelect(questionId, option.letter)}
                        disabled={submitted}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          isSelected && !submitted
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                        } ${
                          submitted && isCorrect
                            ? 'border-green-500 bg-green-50'
                            : ''
                        } ${
                          submitted && isSelected && !isCorrect
                            ? 'border-red-500 bg-red-50'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {submitted ? (
                            isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            ) : isSelected ? (
                              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                            )
                          ) : (
                            <Circle className={`h-4 w-4 shrink-0 ${isSelected ? 'text-indigo-500 fill-indigo-500' : 'text-slate-300'}`} />
                          )}
                          <span className="font-bold text-slate-700 min-w-5">{option.letter})</span>
                          <span className="text-sm text-slate-600">{option.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {showResult && score && (
            <div className="space-y-6">
              {/* Summary Grid for Task 5 Keys */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {testTask.test.map((q, idx) => {
                  const selected = selectedAnswers[idx + 1];
                  const correctOption = q.options.find(o => o.isCorrect);
                  const correct = correctOption?.letter;
                  const isCorrect = selected === correct;
                  
                  return (
                    <div key={idx} className={`text-sm p-2 rounded border ${isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} flex items-center justify-between`}>
                      <span className="font-bold">{idx + 1}.</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{selected || '-'}</span>
                        {isCorrect ? (
                           <CheckCircle2 className="h-4 w-4" />
                        ) : (
                           <div className="flex items-center gap-1">
                             <XCircle className="h-3.5 w-3.5 text-red-500" />
                             <span className="text-slate-500 text-xs">→</span>
                             <span className="text-green-600 font-bold">{correct}</span>
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 bg-linear-to-r from-indigo-50 to-violet-50 rounded-lg border-2 border-indigo-200">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Test natijasi
                </h3>
                <p className="text-lg text-slate-700">
                  Natija: <span className="font-bold text-indigo-600">{score.total} tadan {score.correct} ta</span> to'g'ri
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  Foiz: {Math.round((score.correct / score.total) * 100)}%
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end pt-6 border-t">
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length !== testTask.test!.length}
                className="bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 px-8"
              >
                Natijani tekshirish
              </Button>
            ) : !showResult ? (
              <Button
                onClick={() => {
                  setShowResult(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-linear-to-r from-indigo-500 to-violet-500 px-8"
              >
                Natijani ko'rish
              </Button>
            ) : (
              <Button
                onClick={() => setShowSummary(true)}
                className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-8"
              >
                Modulni yakunlash
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <OverallSummaryModal 
        moduleId={moduleId || '1'} 
        isOpen={showSummary} 
      />
    </div>
  );
};

export default memo(ModuleTest);
