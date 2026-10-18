import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Award, RefreshCw, Compass, CandlestickChart, ArrowRight, BookOpen } from 'lucide-react';
import { MODULES_DATA } from '../data/modulesData';
import { useApp } from '../context/AppContext';

export const QuizPage: React.FC<{
  conceptId: string;
  onBackToModule: () => void;
  onGoToRoadmap: () => void;
  onGoToSimulator: () => void;
}> = ({ conceptId, onBackToModule, onGoToRoadmap, onGoToSimulator }) => {
  const { completeModuleQuiz } = useApp();

  const module = MODULES_DATA.find(m => m.id === conceptId) || MODULES_DATA[0];
  const questions = module.quiz;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);

    const nextAnswers = [...userAnswers];
    nextAnswers[currentIndex] = selectedOption;
    setUserAnswers(nextAnswers);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Calculate final score
      let correctCount = 0;
      userAnswers.forEach((ans, idx) => {
        if (ans === questions[idx].correctAnswer) {
          correctCount++;
        }
      });
      // Include current question if confirmed
      if (selectedOption === currentQuestion.correctAnswer) {
        correctCount++;
      }

      const scorePercent = Math.round((correctCount / questions.length) * 100);
      completeModuleQuiz(module.id, scorePercent);
      setIsCompleted(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers(new Array(questions.length).fill(null));
    setIsCompleted(false);
  };

  // QUIZ SCORE SUMMARY SCREEN
  if (isCompleted) {
    let correctCount = 0;
    userAnswers.forEach((ans, idx) => {
      if (ans === questions[idx].correctAnswer) {
        correctCount++;
      }
    });
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const isPassed = scorePercent >= 70;
    const earnedXP = isPassed ? module.xpReward + (scorePercent === 100 ? 50 : 0) : 0;

    return (
      <div className="w-full space-y-8 py-8 px-4 text-center">
        <div className="bg-brand-card border-none rounded-lg p-8 shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-brand-dark border border-brand-dark">
            {isPassed ? (
              <Award className="w-10 h-10 text-brand-orange animate-bounce" />
            ) : (
              <RefreshCw className="w-10 h-10 text-brand-muted" />
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">Quiz Completed</span>
            <h2 className="text-3xl font-bold text-brand-light">
              {isPassed ? 'Congratulations! Concept Mastered 🎉' : 'Keep Going! Practice Makes Perfect'}
            </h2>
            <p className="text-sm text-brand-muted">
              You scored <strong className="text-brand-light">{scorePercent}%</strong> ({correctCount} of {questions.length} questions correct).
            </p>
          </div>

          {isPassed && (
            <div className="p-4 bg-brand-dark border-none rounded-lg flex items-center justify-around text-xs font-bold text-brand-light">
              <span>+ {earnedXP} XP Earned</span>
              <span>•</span>
              <span>Concept Status: MASTERED</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-brand-dark mt-6">
            <button
              onClick={handleRetry}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand-dark hover:bg-brand-dark/80 text-brand-light text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
            <button
              onClick={onGoToRoadmap}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-brand-black text-xs font-bold shadow-lg shadow-brand-orange/30 transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Back to Roadmap</span>
            </button>
            <button
              onClick={onGoToSimulator}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand-dark hover:bg-brand-dark/80 text-brand-light text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CandlestickChart className="w-4 h-4" />
              <span>Practice in Simulator</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE QUESTION SCREEN
  const isCorrect = selectedOption === currentQuestion.correctAnswer;

  return (
    <div className="w-full space-y-6 pb-2">
      {/* Quiz Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToModule}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-card border-none text-brand-muted text-xs font-semibold hover:text-brand-light transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-brand-muted">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/30 text-[11px] font-extrabold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> +{module.xpReward} XP
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-brand-card rounded-full overflow-hidden border border-brand-card">
        <div style={{ width: `${progressPercent}%` }} className="h-full bg-brand-orange transition-all duration-300" />
      </div>

      {/* Question Card */}
      <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 space-y-6 shadow-2xl">
        <h3 className="text-lg sm:text-lg font-semibold text-brand-light leading-snug">
          {currentQuestion.question}
        </h3>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, oIdx) => {
            let optionStyle = 'bg-brand-dark border-brand-dark text-brand-light hover:bg-brand-dark/80 hover:border-brand-muted';

            if (isAnswerSubmitted) {
              if (oIdx === currentQuestion.correctAnswer) {
                optionStyle = 'bg-brand-dark border-brand-light text-brand-light font-bold';
              } else if (oIdx === selectedOption) {
                optionStyle = 'bg-brand-dark border-brand-dark text-brand-muted opacity-50';
              } else {
                optionStyle = 'bg-brand-dark border-brand-dark text-brand-muted opacity-50';
              }
            } else if (selectedOption === oIdx) {
              optionStyle = 'bg-brand-dark border-brand-orange text-brand-light font-bold ring-2 ring-brand-orange/40';
            }

            return (
              <button
                key={oIdx}
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(oIdx)}
                className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${optionStyle}`}
              >
                <span>{option}</span>
                {isAnswerSubmitted && oIdx === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-brand-light shrink-0" />
                )}
                {isAnswerSubmitted && oIdx === selectedOption && oIdx !== currentQuestion.correctAnswer && (
                  <XCircle className="w-5 h-5 text-brand-muted shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Answer Explanation Snippet */}
        {isAnswerSubmitted && (
          <div className={`p-4 rounded-2xl border-none text-xs leading-relaxed space-y-2 animate-fade-in ${
            isCorrect ? 'bg-brand-dark text-brand-light' : 'bg-brand-dark text-brand-muted'
          }`}>
            <strong className="font-bold font-mono flex items-center gap-1.5">
              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {isCorrect ? 'Correct Answer!' : 'Incorrect — Here is why:'}
            </strong>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Question Footer Controls */}
        <div className="pt-4 border-t border-brand-dark flex items-center justify-between">
          <button
            onClick={onBackToModule}
            className="text-xs text-brand-muted hover:text-brand-light flex items-center gap-1 font-medium"
          >
            <BookOpen className="w-4 h-4 text-brand-muted" /> Re-read Study Lesson
          </button>

          {!isAnswerSubmitted ? (
            <button
              disabled={selectedOption === null}
              onClick={handleConfirmAnswer}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedOption !== null
                  ? 'bg-brand-orange hover:bg-brand-orange/90 text-brand-black shadow-lg shadow-brand-orange/30'
                  : 'bg-brand-dark text-brand-muted cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-brand-orange text-brand-black font-bold text-xs shadow-lg shadow-brand-orange/30 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Quiz Summary'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
