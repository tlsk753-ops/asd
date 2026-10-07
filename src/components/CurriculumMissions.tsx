import React, { useState } from 'react';
import { TriangleMetrics, TriangleState } from '../types/geometry';
import { INTERACTIVE_MISSIONS, CONCEPT_QUIZZES, InteractiveMission, QuizQuestion } from '../data/missions';
import { CheckCircle, AlertCircle, Trophy, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface CurriculumMissionsProps {
  metrics: TriangleMetrics;
  onApplyPreset: (points: TriangleState) => void;
}

export const CurriculumMissions: React.FC<CurriculumMissionsProps> = ({
  metrics,
  onApplyPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'quiz'>('missions');
  const [selectedMissionId, setSelectedMissionId] = useState<string>(INTERACTIVE_MISSIONS[0].id);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  const currentMission =
    INTERACTIVE_MISSIONS.find((m) => m.id === selectedMissionId) || INTERACTIVE_MISSIONS[0];
  const isMissionCompleted = currentMission.check(metrics);

  const handleSelectAnswer = (questionId: number, index: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  const score = CONCEPT_QUIZZES.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            중2 수학 실전 탐구 &amp; 개념 퀴즈
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            도형을 직접 변형하며 수학적 성질을 증명하고, 중2 기출 핵심 문제를 풀어보세요.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('missions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'missions'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            인터랙티브 도형 미션
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'quiz'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            중2 개념 확인 퀴즈 (5문항)
          </button>
        </div>
      </div>

      {activeTab === 'missions' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Mission List Column */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">
              탐구 미션 목록
            </span>
            {INTERACTIVE_MISSIONS.map((m, idx) => {
              const isCleared = m.check(metrics);
              const isSelected = m.id === selectedMissionId;

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMissionId(m.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{m.title}</span>
                    {isCleared ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                        달성!
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {m.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {m.objective}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Mission Details & Verification Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-blue-600">선택된 미션</span>
                  <h3 className="text-base font-bold text-slate-900">
                    {currentMission.title}
                  </h3>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    isMissionCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isMissionCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>목표 달성 완료!</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>도전 진행 중</span>
                    </>
                  )}
                </div>
              </div>

              {/* Mission Objective & Current Status */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">미션 목표:</span>
                  <p className="text-slate-700 mt-0.5 text-sm">{currentMission.objective}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-semibold text-slate-700 flex items-center justify-between">
                    <span>실시간 측정 상태:</span>
                    <span className="font-mono text-blue-600 font-bold">
                      {currentMission.progressText(metrics)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    💡 힌트: {currentMission.hint}
                  </div>
                </div>
              </div>

              {/* Success Card with Pedagogical Takeaway */}
              {isMissionCompleted && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col gap-1.5 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900 text-sm">
                    <Trophy className="w-4 h-4 text-emerald-600" />
                    축하합니다! 핵심 성질을 직접 증명했습니다!
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    {currentMission.conceptTakeaway}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Middle School Quiz View */
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-600">중2 수학 교과서 기준</span>
              <h3 className="text-base font-bold text-slate-900">
                삼각형의 외심과 내심 핵심 5문항 퀴즈
              </h3>
            </div>
            {submittedQuiz && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">
                  최종 점수:{' '}
                  <span className="text-blue-600 font-mono text-base">{score}</span> / 5점
                </span>
                <button
                  onClick={handleResetQuiz}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  다시 풀기
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {CONCEPT_QUIZZES.map((q, qIndex) => {
              const selectedOpt = selectedAnswers[q.id];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      Q{qIndex + 1}. {q.question}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {q.curriculumRef}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100';

                      if (selectedOpt === optIdx) {
                        btnStyle = 'bg-blue-600 text-white border-blue-600 shadow-sm';
                      }

                      if (submittedQuiz) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                        } else if (selectedOpt === optIdx && !isCorrect) {
                          btnStyle = 'bg-rose-500 text-white border-rose-500';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={submittedQuiz}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${btnStyle}`}
                        >
                          <span className="font-mono mr-1.5">{optIdx + 1}.</span> {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {submittedQuiz && (
                    <div
                      className={`p-3 rounded-lg text-xs leading-relaxed ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                      }`}
                    >
                      <div className="font-bold mb-0.5">
                        {isCorrect ? '✓ 정답입니다!' : '✕ 오답입니다!'}
                      </div>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!submittedQuiz && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSubmittedQuiz(true)}
                disabled={Object.keys(selectedAnswers).length < CONCEPT_QUIZZES.length}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                정답 채점하고 해설 확인하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
