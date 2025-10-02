import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { AIEducationAssistant } from '@/components/ai-education-assistant';
import spaceBackground from '@/assets/space-background.jpg';

const QuizView = () => {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grade = searchParams.get('grade');
  const topic = searchParams.get('topic');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Sample quiz data
  const quizData = {
    math: {
      name: 'Mathematics Quiz',
      questions: [
        {
          question: "What is 15 × 8?",
          options: ["110", "120", "130", "140"],
          correct: 1,
          explanation: "15 × 8 = 120. You can also think of it as (15 × 10) - (15 × 2) = 150 - 30 = 120"
        },
        {
          question: "If a triangle has angles of 60° and 80°, what is the third angle?",
          options: ["30°", "40°", "50°", "60°"],
          correct: 1,
          explanation: "The sum of angles in a triangle is always 180°. So 180° - 60° - 80° = 40°"
        },
        {
          question: "What is the square root of 144?",
          options: ["11", "12", "13", "14"],
          correct: 1,
          explanation: "12 × 12 = 144, so √144 = 12"
        }
      ]
    },
    science: {
      name: 'Science Quiz',
      questions: [
        {
          question: "What is the chemical symbol for gold?",
          options: ["Go", "Gd", "Au", "Ag"],
          correct: 2,
          explanation: "Gold's chemical symbol is Au, derived from the Latin word 'aurum'"
        },
        {
          question: "Which planet is closest to the Sun?",
          options: ["Venus", "Mercury", "Earth", "Mars"],
          correct: 1,
          explanation: "Mercury is the closest planet to the Sun in our solar system"
        }
      ]
    }
  };

  const currentQuiz = quizData[subjectId as keyof typeof quizData];
  const questions = currentQuiz?.questions || [];

  if (!currentQuiz) {
    return <div>Quiz not found</div>;
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div 
        className="min-h-screen bg-gradient-space relative flex items-center justify-center"
        style={{
          backgroundImage: `url(${spaceBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-space-deep/70 backdrop-blur-[1px]" />
        
        <div className="relative z-10 max-w-2xl mx-auto p-6">
          <GlassCard variant="primary" className="text-center">
            <GlassCardHeader>
              <GlassCardTitle className="text-3xl mb-4">Quiz Complete!</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="p-8">
              <div className="text-6xl font-bold text-neon-blue mb-4">{percentage}%</div>
              <p className="text-xl text-foreground mb-2">
                You scored {score} out of {questions.length}
              </p>
              <p className="text-muted-foreground mb-8">
                {percentage >= 80 ? "Excellent work! 🌟" : 
                 percentage >= 60 ? "Good job! Keep practicing! 👍" : 
                 "Keep learning and try again! 💪"}
              </p>
              
              <div className="space-y-4">
                <Button variant="neon" size="lg" onClick={handleRestartQuiz}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="glass" 
                  size="lg"
                  onClick={() => navigate(`/subject/${subjectId}?grade=${grade}`)}
                >
                  Back to Subject
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div 
      className="min-h-screen bg-gradient-space relative"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-space-deep/70 backdrop-blur-[1px]" />
      
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(`/subject/${subjectId}?grade=${grade}`)}
                variant="glass"
                size="icon"
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{currentQuiz.name}</h1>
                <p className="text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-neon-blue">Score: {score}/{questions.length}</div>
              <div className="text-sm text-muted-foreground">
                {Math.round((score / Math.max(currentQuestion, 1)) * 100)}% correct
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-space-medium rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-neon transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <GlassCard variant="primary" className="mb-8">
            <GlassCardHeader>
              <GlassCardTitle className="text-xl">{question.question}</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={
                      showResult
                        ? index === question.correct
                          ? "neon"
                          : index === selectedAnswer && index !== question.correct
                          ? "destructive"
                          : "glass"
                        : selectedAnswer === index
                        ? "secondary"
                        : "glass"
                    }
                    className="w-full p-4 h-auto text-left justify-start"
                    onClick={() => !showResult && handleAnswerSelect(index)}
                    disabled={showResult}
                  >
                    <div className="flex items-center gap-3">
                      {showResult && index === question.correct && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      {showResult && index === selectedAnswer && index !== question.correct && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{String.fromCharCode(65 + index)}.</div>
                        <div>{option}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {showResult && (
                <div className="mt-6 p-4 bg-glass-secondary rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-neon-violet mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Explanation:</h4>
                      <p className="text-muted-foreground">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                {!showResult ? (
                  <Button
                    variant="neon"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    variant="holographic"
                    onClick={handleNextQuestion}
                  >
                    {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                  </Button>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>

      <AIEducationAssistant 
        userType="student" 
        subject={subjectId}
      />
    </div>
  );
};

export default QuizView;