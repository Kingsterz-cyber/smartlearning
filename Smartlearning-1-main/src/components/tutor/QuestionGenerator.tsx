import React, { useState } from 'react';
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Plus, Trash2, Edit3, Save, Upload, Download, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { GradeLevel } from '@/pages/AITutorHub';
import { geminiAI } from '@/services/gemini-ai';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  type: 'mcq' | 'true-false' | 'short-answer' | 'essay' | 'open-ended';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  rubric?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuestionGeneratorProps {
  subject: string;
  gradeLevel: GradeLevel;
  className?: string;
}

const questionTypes = {
  mcq: 'Multiple Choice',
  'true-false': 'True/False',
  'short-answer': 'Short Answer',
  essay: 'Essay',
  'open-ended': 'Open Ended'
};

export function QuestionGenerator({ subject, gradeLevel, className }: QuestionGeneratorProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<keyof typeof questionTypes>('mcq');
  const [numQuestions, setNumQuestions] = useState(5);
  const [topic, setTopic] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('generator');
  const { toast } = useToast();

  const generateQuestions = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Convert grade level to difficulty
      const difficulty: 'easy' | 'medium' | 'hard' = gradeLevel === 'primary' ? 'easy' : gradeLevel === 'middle' ? 'medium' : 'hard';
      
      const response = await geminiAI.generateStructuredQuiz(
        subject,
        difficulty,
        numQuestions,
        topic,
        gradeLevel
      );

      if (response.success && response.content) {
        // Parse the JSON response
        const generatedQuestions = JSON.parse(response.content);
        const formattedQuestions: Question[] = generatedQuestions.map((q: any, index: number) => ({
          id: `q-${Date.now()}-${index}`,
          type: selectedType,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          rubric: q.rubric,
          difficulty: q.difficulty || 'medium'
        }));

        setQuestions(prev => [...prev, ...formattedQuestions]);
        setActiveTab('editor');
        
        toast({
          title: "Success",
          description: `Generated ${formattedQuestions.length} questions successfully!`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addManualQuestion = () => {
    const newQuestion: Question = {
      id: `manual-${Date.now()}`,
      type: selectedType,
      question: 'Enter your question here...',
      options: selectedType === 'mcq' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
      correctAnswer: '',
      explanation: '',
      difficulty: 'medium'
    };

    setQuestions(prev => [...prev, newQuestion]);
    setEditingId(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const exportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${subject}-${gradeLevel}-questions.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className={cn("", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-glass-panel border-space-600">
          <TabsTrigger value="generator" className="data-[state=active]:bg-neon-blue/20">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generator
          </TabsTrigger>
          <TabsTrigger value="editor" className="data-[state=active]:bg-neon-purple/20">
            <Edit3 className="h-4 w-4 mr-2" />
            Question Bank ({questions.length})
          </TabsTrigger>
        </TabsList>

        {/* AI Generator Tab */}
        <TabsContent value="generator" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-neon-blue mb-6 flex items-center gap-2">
                <Target className="h-6 w-6" />
                Question Generator
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-space-200 block mb-2">
                    Subject & Topic
                  </label>
                  <Input
                    placeholder={`Enter ${subject} topic (e.g., Algebra, Photosynthesis)`}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-space-200 block mb-2">
                    Question Type
                  </label>
                  <Select value={selectedType} onValueChange={(value: keyof typeof questionTypes) => setSelectedType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(questionTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-space-200 block mb-2">
                    Number of Questions
                  </label>
                  <Select value={numQuestions.toString()} onValueChange={(value) => setNumQuestions(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 3, 5, 10, 15, 20].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} questions
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Grade: {gradeLevel.toUpperCase()}</Badge>
                  <Badge variant="secondary">Subject: {subject}</Badge>
                </div>

                <Button
                  onClick={generateQuestions}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full bg-gradient-to-r from-neon-blue to-neon-purple"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-neon-cyan mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={addManualQuestion}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manual Question
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={questions.length === 0}
                  onClick={exportQuestions}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Questions
                </Button>
                <div className="p-3 bg-space-800 rounded-lg border border-space-600">
                  <div className="flex items-center gap-2 text-sm">
                    <Upload className="h-4 w-4 text-neon-blue" />
                    <span className="text-space-300">Upload curriculum file (coming soon)</span>
                  </div>
                </div>
              </div>

              {questions.length > 0 && (
                <div className="mt-6 p-4 bg-neon-blue/5 rounded-lg border border-neon-blue/20">
                  <h4 className="text-sm font-semibold text-neon-blue mb-2">Generated Summary</h4>
                  <div className="text-sm text-space-300 space-y-1">
                    <div>Total Questions: {questions.length}</div>
                    <div>Types: {Array.from(new Set(questions.map(q => questionTypes[q.type]))).join(', ')}</div>
                    <div>Difficulty: Mixed levels</div>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </TabsContent>

        {/* Question Editor Tab */}
        <TabsContent value="editor" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question List */}
            <div className="lg:col-span-2 space-y-4">
              {questions.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-space-400" />
                  <p className="text-space-400">No questions generated yet.</p>
                  <p className="text-sm text-space-500 mt-1">Use the AI Generator to create questions automatically.</p>
                </GlassCard>
              ) : (
                questions.map((question, index) => (
                  <GlassCard key={question.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Q{index + 1}</Badge>
                        <Badge variant="outline">{questionTypes[question.type]}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(editingId === question.id ? null : question.id)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>

                    {editingId === question.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                          placeholder="Enter question..."
                          rows={3}
                        />
                        
                        {question.type === 'mcq' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Options:</label>
                            {question.options?.map((option, optIndex) => (
                              <Input
                                key={optIndex}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])];
                                  newOptions[optIndex] = e.target.value;
                                  updateQuestion(question.id, { options: newOptions });
                                }}
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              />
                            ))}
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium">Correct Answer:</label>
                          <Input
                            value={question.correctAnswer}
                            onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                            placeholder="Enter correct answer..."
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Explanation (optional):</label>
                          <Textarea
                            value={question.explanation || ''}
                            onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                            placeholder="Explain why this is the correct answer..."
                            rows={2}
                          />
                        </div>

                        <Button
                          onClick={() => setEditingId(null)}
                          size="sm"
                          className="bg-gradient-to-r from-neon-blue to-neon-purple"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-space-200 mb-3">{question.question}</p>
                        
                        {question.type === 'mcq' && (
                          <div className="space-y-1 mb-3">
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2 text-sm">
                                {option === question.correctAnswer ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-space-500" />
                                )}
                                <span className={option === question.correctAnswer ? 'text-green-400' : 'text-space-400'}>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type !== 'mcq' && (
                          <div className="mb-3 p-2 bg-green-500/10 rounded border border-green-500/30">
                            <span className="text-sm text-green-400 font-medium">Answer: </span>
                            <span className="text-sm text-space-200">{question.correctAnswer}</span>
                          </div>
                        )}

                        {question.explanation && (
                          <div className="p-2 bg-neon-blue/10 rounded border border-neon-blue/30">
                            <span className="text-sm text-neon-blue font-medium">Explanation: </span>
                            <span className="text-sm text-space-200">{question.explanation}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </GlassCard>
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <GlassCard className="p-4">
                <h3 className="text-lg font-semibold text-neon-cyan mb-4">Question Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{questions.length}</span>
                  </div>
                  {Object.entries(questionTypes).map(([type, label]) => {
                    const count = questions.filter(q => q.type === type).length;
                    return count > 0 ? (
                      <div key={type} className="flex justify-between">
                        <span>{label}:</span>
                        <span>{count}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-lg font-semibold text-neon-purple mb-4">Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('generator')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate More
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={questions.length === 0}
                    onClick={exportQuestions}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Quiz
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={questions.length === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}