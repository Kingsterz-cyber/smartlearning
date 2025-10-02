import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Brain, Settings, Plus, Trash2, Edit3, Save, Loader2, Sparkles, GripVertical, Copy, Download, Send, Wand2, AlignLeft, TrendingUp, BookOpen, RotateCcw } from 'lucide-react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { geminiAI } from '@/services/gemini-ai';
import { useToast } from '@/hooks/use-toast';
import spaceBackground from '@/assets/space-background.jpg';

const QuizGenerator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grade = searchParams.get('grade') || 'middle';
  
  // Creation Mode States
  const [creationMode, setCreationMode] = useState<'select' | 'manual' | 'ai'>('select');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    gradeLevel: grade,
    subject: '',
    topic: '',
    questionTypes: ['mcq'],
    questionCount: 10,
    difficulty: 'medium',
    uploadedFile: null as File | null
  });

  // Quiz States
  const [questions, setQuestions] = useState<any[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSmartActionLoading, setIsSmartActionLoading] = useState<null | 'simplify' | 'harder' | 'examples' | 'align'>(null);
  const [teacherMode, setTeacherMode] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Configuration Options
  const gradeOptions = [
    { value: 'primary', label: 'Primary (Ages 6-11)', description: 'Simple vocabulary, basic concepts' },
    { value: 'middle', label: 'Middle School (Ages 11-15)', description: 'Clear explanations, relatable examples' },
    { value: 'high', label: 'High School (Ages 15-18)', description: 'Academic tone, exam preparation' }
  ];

  const subjects = [
    { value: 'mathematics', label: 'Mathematics', topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'] },
    { value: 'science', label: 'Science', topics: ['Physics', 'Chemistry', 'Biology', 'Earth Science'] },
    { value: 'english', label: 'English', topics: ['Literature', 'Grammar', 'Writing', 'Reading Comprehension'] },
    { value: 'history', label: 'History', topics: ['World History', 'American History', 'Ancient Civilizations'] }
  ];

  const questionTypes = [
    { value: 'mcq', label: 'Multiple Choice', description: 'Questions with 4 options (A-D)' },
    { value: 'tf', label: 'True/False', description: 'Binary choice questions' },
    { value: 'short', label: 'Short Answer', description: '1-2 sentence responses' },
    { value: 'essay', label: 'Essay', description: 'Extended written responses' },
    { value: 'open', label: 'Open-Ended', description: 'Creative problem-solving questions' }
  ];

  // Generate Questions with Wizard Data
  const generateQuestions = async () => {
    setIsGenerating(true);
    setShowWizard(false);
    
    try {
      const sourcePrompt = wizardData.uploadedFile 
        ? `uploaded document: ${wizardData.uploadedFile.name}` 
        : wizardData.topic;

      const questionTypesList = wizardData.questionTypes.join(', ');
      
      const response = await geminiAI.generateStructuredQuiz(
        wizardData.subject,
        wizardData.difficulty as 'easy' | 'medium' | 'hard',
        wizardData.questionCount,
        sourcePrompt,
        wizardData.gradeLevel,
        questionTypesList
      );

      if (response.success) {
        try {
          const parsed = JSON.parse(response.content);
          if (parsed.quiz && Array.isArray(parsed.quiz)) {
            const newQuestions = parsed.quiz.map((q: any, index: number) => ({
              id: Date.now() + index,
              type: q.type === 'multiple-choice' ? 'mcq' : 
                    q.type === 'true-false' ? 'tf' :
                    q.type === 'short-answer' ? 'short' :
                    q.type === 'essay' ? 'essay' :
                    q.type === 'open-ended' ? 'open' : 'mcq',
              question: q.question || `Generated Question ${index + 1}`,
              options: q.type === 'multiple-choice' ? q.options : 
                      q.type === 'true-false' ? ['True', 'False'] : [],
              correctAnswer: q.type === 'multiple-choice' ? 
                q.options?.indexOf(q.correctAnswer) || 0 : 
                q.type === 'true-false' ? (q.correctAnswer === 'True' ? 0 : 1) : 0,
              suggestedAnswer: q.suggestedAnswer || '',
              rubric: q.rubric || '',
              difficulty: wizardData.difficulty,
              isEditing: false
            }));
            
            setQuestions(newQuestions);
            setQuizTitle(`${wizardData.subject} Quiz - ${wizardData.topic || 'Custom'}`);
            
            toast({
              title: "AI Quiz Generated",
              description: `${newQuestions.length} questions created successfully.`,
            });
          }
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          toast({
            title: "Generation Error",
            description: "Failed to parse AI response. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startWizard = () => {
    setCreationMode('select');
    setShowWizard(true);
    setWizardStep(1);
  };

  const selectManualCreation = () => {
    setCreationMode('manual');
    setShowWizard(false);
    // Add a blank question for manual creation
    const newQuestion = {
      id: Date.now(),
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      suggestedAnswer: '',
      rubric: '',
      difficulty: 'medium',
      isEditing: true
    };
    setQuestions([newQuestion]);
    setQuizTitle('New Quiz');
  };

  const selectAICreation = () => {
    setCreationMode('ai');
    setWizardStep(1);
  };

  const addManualQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      suggestedAnswer: '',
      rubric: '',
      difficulty: 'medium',
      isEditing: true
    };
    setQuestions([...questions, newQuestion]);
  };

  const nextWizardStep = () => {
    if (wizardStep < 3) setWizardStep(wizardStep + 1);
  };

  const prevWizardStep = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setWizardData({ ...wizardData, uploadedFile: file });
      toast({
        title: "File Uploaded",
        description: `${file.name} ready for AI processing.`,
      });
    }
  };

  const handleSmartAction = async (action: 'simplify' | 'harder' | 'examples' | 'align') => {
    if (questions.length === 0) return;
    setIsSmartActionLoading(action);

    const instructionMap: Record<typeof action, string> = {
      simplify: 'Simplify the language of each question and option to be clearer and age-appropriate while keeping meanings intact.',
      harder: 'Increase difficulty slightly by adding rigor, distractors, or multi-step reasoning while keeping the same topics.',
      examples: 'Add a brief, concrete example or hint to each question to aid understanding. Do not reveal the correct answer.',
      align: 'Align questions to curriculum standards. Add a short standard tag (e.g., CCSS.MATH.6.EE.5) per question when applicable.'
    } as const;

    try {
      const quizPayload = questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        suggestedAnswer: q.suggestedAnswer,
        rubric: q.rubric,
        difficulty: q.difficulty
      }));

      const prompt = `You are assisting a teacher editing a quiz. Follow the instruction, then return ONLY JSON with the same array shape, preserving ids and types.
Instruction: ${instructionMap[action]}
Context: subject=${wizardData.subject || 'general'}, topic=${wizardData.topic || 'general'}, grade=${wizardData.gradeLevel}
Input JSON (array): ${JSON.stringify(quizPayload) }

Return schema strictly as:
[
  {"id": number, "type": "mcq"|"tf"|"short"|"essay"|"open", "question": string, "options": string[] | [], "correctAnswer": number, "suggestedAnswer": string, "rubric": string, "difficulty": string, "standardTag"?: string, "hint"?: string}
]`;

      const response = await geminiAI.generateContent({
        prompt,
        userType: 'teacher',
        feature: 'quiz',
        subject: wizardData.subject,
        grade: wizardData.gradeLevel,
        responseMimeType: 'application/json'
      });

      if (response.success) {
        try {
          const updated = JSON.parse(response.content);
          if (Array.isArray(updated)) {
            // Merge updates by id while preserving local editing flags
            const merged = questions.map(q => {
              const u = updated.find((it: any) => it.id === q.id);
              if (!u) return q;
              return {
                ...q,
                question: u.question ?? q.question,
                options: Array.isArray(u.options) ? u.options : q.options,
                correctAnswer: typeof u.correctAnswer === 'number' ? u.correctAnswer : q.correctAnswer,
                suggestedAnswer: u.suggestedAnswer ?? q.suggestedAnswer,
                rubric: u.rubric ?? q.rubric,
                difficulty: u.difficulty ?? q.difficulty
              };
            });
            setQuestions(merged);
            toast({
              title: 'AI edit applied',
              description: 'Questions updated. You can continue editing before saving.',
            });
          } else {
            throw new Error('AI returned non-array JSON');
          }
        } catch (e) {
          console.error('Smart action JSON parse error', e);
          toast({
            title: 'AI response not structured',
            description: 'Could not parse AI edits. Try again or use the wizard.',
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'AI request failed',
          description: response.error || 'Please try again later.',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to apply smart action.',
        variant: 'destructive'
      });
    } finally {
      setIsSmartActionLoading(null);
    }
  };

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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="glass" 
                size="sm"
                onClick={() => navigate(`/teacher-dashboard?grade=${grade}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                  Premium AI Quiz Generator
                </h1>
                <p className="text-muted-foreground">
                  Create adaptive quizzes with AI-powered precision
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-sm mr-2 px-3 py-1 rounded-full bg-glass-primary border">
                {`📘 Quiz: ${wizardData.subject || 'Subject'} – ${gradeOptions.find(g=>g.value===wizardData.gradeLevel)?.label.split(' (')[0] || 'Grade'} – ${(wizardData.difficulty||'medium')[0].toUpperCase()+ (wizardData.difficulty||'medium').slice(1)}`}
              </div>
              <Button
                variant={teacherMode ? 'holographic' : 'glass'}
                onClick={() => setTeacherMode(true)}
                size="sm"
              >
                Teacher
              </Button>
              <Button
                variant={!teacherMode ? 'holographic' : 'glass'}
                onClick={() => setTeacherMode(false)}
                size="sm"
              >
                Student
              </Button>
              <Button variant="holographic" onClick={startWizard}>
                <Plus className="w-4 h-4 mr-2" />
                New Quiz
              </Button>
            </div>
          </div>

          {/* Three-Panel Interface */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left Panel - Question Bank & Controls */}
            <GlassCard variant="primary" className="lg:col-span-1">
              <GlassCardHeader>
                <GlassCardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Question Bank
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Start by generating AI questions using the wizard
                    </p>
                    <Button variant="holographic" onClick={startWizard} className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Launch Wizard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-neon-blue">
                      Generated Questions: {questions.length}
                    </div>
                    <Button variant="holographic" className="w-full" onClick={startWizard}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate More
                    </Button>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>

            {/* Center Panel - Live Quiz Editor */}
            <GlassCard variant="secondary" className="lg:col-span-2">
              <GlassCardHeader>
                <GlassCardTitle className="text-lg">Live Quiz Editor</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-6">
                      Use the wizard to generate AI questions
                    </p>
                    <Button variant="holographic" onClick={startWizard}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Questions
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Input
                        placeholder="Enter Quiz Title"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="text-xl font-semibold flex-1 mr-4"
                      />
                      {creationMode === 'manual' && (
                        <Button variant="holographic" onClick={addManualQuestion}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Question
                        </Button>
                      )}
                    </div>

                    {/* Quiz Meta Bar (visible at top of editor too) */}
                    <div className="text-sm px-3 py-2 rounded-md bg-glass-primary border text-muted-foreground">
                      {`📘 Quiz: ${wizardData.subject || 'Subject'} – ${gradeOptions.find(g=>g.value===wizardData.gradeLevel)?.label.split(' (')[0] || 'Grade'} – ${(wizardData.difficulty||'medium')[0].toUpperCase()+ (wizardData.difficulty||'medium').slice(1)}`}
                    </div>
                    
                    {questions.map((question, index) => (
                      <div key={question.id} className="p-4 bg-glass-primary rounded-lg border">
                        <div className="flex justify-between mb-3">
                          <span className="text-sm font-medium text-neon-blue">
                            {`Q${index + 1}.`} {questionTypes.find(t => t.value === question.type)?.label}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={() => {
                                const updated = questions.map((q, i) => 
                                  i === index ? { ...q, isEditing: !q.isEditing } : q
                                );
                                setQuestions(updated);
                              }}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={() => {
                                setQuestions(questions.filter((_, i) => i !== index));
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {question.isEditing ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Enter your question..."
                              value={question.question}
                              onChange={(e) => {
                                const updated = questions.map((q, i) => 
                                  i === index ? { ...q, question: e.target.value } : q
                                );
                                setQuestions(updated);
                              }}
                              className="min-h-[100px]"
                            />
                            
                            {question.type === 'mcq' && (
                              <div className="space-y-2">
                                <Label>Answer Options</Label>
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <span className="text-sm font-medium w-6">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    <Input
                                      placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                      value={option}
                                      onChange={(e) => {
                                        const updated = questions.map((q, i) => {
                                          if (i === index) {
                                            const newOptions = [...q.options];
                                            newOptions[optIndex] = e.target.value;
                                            return { ...q, options: newOptions };
                                          }
                                          return q;
                                        });
                                        setQuestions(updated);
                                      }}
                                    />
                                    <Checkbox
                                      checked={question.correctAnswer === optIndex}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          const updated = questions.map((q, i) => 
                                            i === index ? { ...q, correctAnswer: optIndex } : q
                                          );
                                          setQuestions(updated);
                                        }
                                      }}
                                    />
                                  </div>
                                ))}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="glass"
                                    size="sm"
                                    onClick={() => {
                                      const updated = questions.map((q,i)=> i===index ? { ...q, options: [...q.options, ''] } : q);
                                      setQuestions(updated);
                                    }}
                                  >
                                    ➕ Add Option
                                  </Button>
                                  <Button
                                    variant="glass"
                                    size="sm"
                                    onClick={() => {
                                      const updated = questions.map((q,i)=> {
                                        if (i!==index) return q;
                                        const opts = [...q.options];
                                        if (opts.length > 1) {
                                          opts.pop();
                                          const nextCorrect = Math.min(q.correctAnswer, opts.length-1);
                                          return { ...q, options: opts, correctAnswer: Math.max(0,nextCorrect) };
                                        }
                                        return q;
                                      });
                                      setQuestions(updated);
                                    }}
                                  >
                                    🗑️ Delete Option
                                  </Button>
                                  <Button
                                    variant="glass"
                                    size="sm"
                                    onClick={() => {
                                      const updated = questions.map((q,i)=> i===index ? { ...q, correctAnswer: (q.correctAnswer + 1) % Math.max(1, q.options.length) } : q);
                                      setQuestions(updated);
                                    }}
                                  >
                                    🔄 Change Correct Answer
                                  </Button>
                                </div>
                              </div>
                            )}

                            {(question.type === 'short' || question.type === 'essay' || question.type === 'open') && (
                              <div className="space-y-3">
                                <div>
                                  <Label>Suggested Answer</Label>
                                  <Textarea
                                    placeholder="Enter suggested answer..."
                                    value={question.suggestedAnswer}
                                    onChange={(e) => {
                                      const updated = questions.map((q, i) => 
                                        i === index ? { ...q, suggestedAnswer: e.target.value } : q
                                      );
                                      setQuestions(updated);
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label>Grading Rubric</Label>
                                  <Textarea
                                    placeholder="Enter grading criteria..."
                                    value={question.rubric}
                                    onChange={(e) => {
                                      const updated = questions.map((q, i) => 
                                        i === index ? { ...q, rubric: e.target.value } : q
                                      );
                                      setQuestions(updated);
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            <Button
                              variant="holographic"
                              size="sm"
                              onClick={() => {
                                const updated = questions.map((q, i) => 
                                  i === index ? { ...q, isEditing: false } : q
                                );
                                setQuestions(updated);
                              }}
                            >
                              <Save className="w-3 h-3 mr-2" />
                              Save Question
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-sm font-medium">{question.question || 'Untitled question'}</div>

                            {/* MCQ View */}
                            {question.type === 'mcq' && (
                              <div className="space-y-2">
                                {question.options.map((opt: string, optIdx: number) => (
                                  <label key={optIdx} className="flex items-start gap-2 text-sm">
                                    <input
                                      type="radio"
                                      name={`q-${question.id}`}
                                      className="mt-1"
                                      disabled={teacherMode}
                                    />
                                    <span>
                                      {opt || `Option ${String.fromCharCode(65 + optIdx)}`}
                                      {teacherMode && optIdx === question.correctAnswer ? ' ✅' : ''}
                                    </span>
                                  </label>
                                ))}
                                {teacherMode && question.suggestedAnswer && (
                                  <div className="text-xs text-muted-foreground pt-1">
                                    Explanation: {question.suggestedAnswer}
                                  </div>
                                )}

                                {teacherMode && (
                                  <div className="text-xs text-muted-foreground pt-2">
                                    Controls: ✏️ Edit Question | ➕ Add Option | 🗑️ Delete Option | 🔄 Change Correct Answer
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Short Answer View */}
                            {question.type === 'short' && (
                              <div className="space-y-2">
                                <Input placeholder="📝 Student Answer Box" disabled={false} />
                                {teacherMode && question.rubric && (
                                  <div className="text-xs text-muted-foreground">Rubric: {question.rubric}</div>
                                )}
                                {teacherMode && (
                                  <div className="text-xs text-muted-foreground pt-2">Controls: ✏️ Edit Question | 📝 Edit Rubric</div>
                                )}
                              </div>
                            )}

                            {/* Essay View */}
                            {question.type === 'essay' && (
                              <div className="space-y-2">
                                <Textarea className="min-h-[160px]" placeholder="📝 Student Long Answer" />
                                {teacherMode && question.rubric && (
                                  <div className="text-xs text-muted-foreground">AI Suggested Rubric: {question.rubric}</div>
                                )}
                                {teacherMode && (
                                  <div className="text-xs text-muted-foreground pt-2">Controls: ✏️ Edit Prompt | 📝 Edit Rubric</div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {questions.length > 0 && (
                      <div className="flex justify-between pt-4">
                        <div className="text-sm text-muted-foreground">
                          {questions.length} question{questions.length !== 1 ? 's' : ''} created
                        </div>
                        <div className="flex gap-2">
                          <Button variant="glass" size="sm">
                            <Download className="w-3 h-3 mr-2" />
                            Export PDF
                          </Button>
                          <Button variant="holographic" size="sm">
                            <Send className="w-3 h-3 mr-2" />
                            Publish Quiz
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>

            {/* Right Panel - AI Dock */}
            <GlassCard variant="accent" className="lg:col-span-1">
              <GlassCardHeader>
                <GlassCardTitle className="text-lg">Professor King's AI Assistant</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  <Button variant="holographic" className="w-full" onClick={startWizard}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Quiz
                  </Button>
                  
                  {questions.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-neon-purple">
                        Smart Actions
                      </div>
                      <Button 
                        variant="glass" 
                        className="w-full text-sm"
                        onClick={() => handleSmartAction('simplify')}
                        disabled={isSmartActionLoading !== null}
                      >
                        {isSmartActionLoading === 'simplify' ? (
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3 mr-2" />
                        )}
                        Simplify Language
                      </Button>
                      <Button 
                        variant="glass" 
                        className="w-full text-sm"
                        onClick={() => handleSmartAction('harder')}
                        disabled={isSmartActionLoading !== null}
                      >
                        {isSmartActionLoading === 'harder' ? (
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        ) : (
                          <TrendingUp className="w-3 h-3 mr-2" />
                        )}
                        Make Harder
                      </Button>
                      <Button 
                        variant="glass" 
                        className="w-full text-sm"
                        onClick={() => handleSmartAction('examples')}
                        disabled={isSmartActionLoading !== null}
                      >
                        {isSmartActionLoading === 'examples' ? (
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        ) : (
                          <AlignLeft className="w-3 h-3 mr-2" />
                        )}
                        Add Examples
                      </Button>
                      <Button 
                        variant="glass" 
                        className="w-full text-sm"
                        onClick={() => handleSmartAction('align')}
                        disabled={isSmartActionLoading !== null}
                      >
                        {isSmartActionLoading === 'align' ? (
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3 mr-2" />
                        )}
                        Align to Curriculum
                      </Button>
                    </div>
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>

        {/* Creation Mode Selection Modal */}
        <Dialog open={showWizard && creationMode === 'select'} onOpenChange={setShowWizard}>
          <DialogContent className="max-w-2xl bg-glass-primary border-glass-border">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-neon bg-clip-text text-transparent">
                Choose Quiz Creation Method
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manual Creation Option */}
                <GlassCard 
                  variant="primary" 
                  className="cursor-pointer hover:scale-105 transition-all duration-300"
                  onClick={selectManualCreation}
                >
                  <GlassCardContent className="p-6 text-center">
                    <Edit3 className="w-12 h-12 mx-auto mb-4 text-neon-blue" />
                    <h3 className="text-lg font-semibold mb-2">Manual Creation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Write questions and answers yourself with full control
                    </p>
                    <Button variant="glass" className="w-full">
                      Create Manually
                    </Button>
                  </GlassCardContent>
                </GlassCard>

                {/* AI Creation Option */}
                <GlassCard 
                  variant="secondary" 
                  className="cursor-pointer hover:scale-105 transition-all duration-300"
                  onClick={selectAICreation}
                >
                  <GlassCardContent className="p-6 text-center">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-neon-purple" />
                    <h3 className="text-lg font-semibold mb-2">AI Creation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Let Professor King generate questions based on your settings
                    </p>
                    <Button variant="holographic" className="w-full">
                      Use AI Generator
                    </Button>
                  </GlassCardContent>
                </GlassCard>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Wizard Steps */}
        <Dialog open={showWizard && creationMode === 'ai'} onOpenChange={setShowWizard}>
          <DialogContent className="max-w-2xl bg-glass-primary border-glass-border">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-neon bg-clip-text text-transparent">
                Professor King's Quiz Generator
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neon-blue">Step 1: Select Subject & Topic</h3>
                  
                  <div className="space-y-3">
                    <Label>Subject</Label>
                    <Select
                      value={wizardData.subject}
                      onValueChange={(value) => setWizardData({ ...wizardData, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Topic</Label>
                    <Input
                      placeholder="Enter specific topic (e.g., Fractions, Photosynthesis)"
                      value={wizardData.topic}
                      onChange={(e) => setWizardData({ ...wizardData, topic: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neon-blue">Step 2: Question Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label>Grade Level</Label>
                      <Select
                        value={wizardData.gradeLevel}
                        onValueChange={(value) => setWizardData({ ...wizardData, gradeLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Difficulty</Label>
                      <Select
                        value={wizardData.difficulty}
                        onValueChange={(value) => setWizardData({ ...wizardData, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Number of Questions</Label>
                      <Select
                        value={wizardData.questionCount.toString()}
                        onValueChange={(value) => setWizardData({ ...wizardData, questionCount: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="15">15 Questions</SelectItem>
                          <SelectItem value="20">20 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Question Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {questionTypes.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={type.value}
                            checked={wizardData.questionTypes.includes(type.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setWizardData({
                                  ...wizardData,
                                  questionTypes: [...wizardData.questionTypes, type.value]
                                });
                              } else {
                                setWizardData({
                                  ...wizardData,
                                  questionTypes: wizardData.questionTypes.filter(t => t !== type.value)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={type.value} className="text-sm">
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neon-blue">Step 3: Optional Reference Material</h3>
                  
                  <div className="border-2 border-dashed border-glass-border rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a book, PDF, or lesson notes (Optional)
                      </p>
                      <Button
                        variant="glass"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      {wizardData.uploadedFile && (
                        <p className="text-sm text-neon-blue mt-2">
                          Uploaded: {wizardData.uploadedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  variant="glass"
                  onClick={prevWizardStep}
                  disabled={wizardStep === 1}
                >
                  Previous
                </Button>
                {wizardStep < 3 ? (
                  <Button variant="holographic" onClick={nextWizardStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="holographic"
                    onClick={generateQuestions}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Quiz
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default QuizGenerator;