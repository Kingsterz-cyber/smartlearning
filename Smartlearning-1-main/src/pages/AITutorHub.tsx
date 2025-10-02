import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BookOpen, Play, Pause, Volume2, VolumeX, Lightbulb, Calculator, Atom, Microscope, Globe2, Clock, Download, Upload, Sparkles, Zap, Target } from 'lucide-react';
import { geminiAI } from '@/services/gemini-ai';
import { useToast } from '@/hooks/use-toast';
import { SubjectSimulation } from '@/components/simulations/SubjectSimulation';
import { QuestionGenerator } from '@/components/tutor/QuestionGenerator';

export type GradeLevel = 'primary' | 'middle' | 'high';

interface TutorMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  gradeLevel?: GradeLevel;
  subject?: string;
}

const gradeData = {
  primary: { ages: '6-11', color: 'bg-emerald-500', label: 'Primary' },
  middle: { ages: '11-15', color: 'bg-blue-500', label: 'Middle School' },
  high: { ages: '15-18', color: 'bg-purple-500', label: 'High School' }
};

const subjects = [
  { id: 'math', name: 'Mathematics', icon: Calculator, color: 'text-emerald-400' },
  { id: 'chemistry', name: 'Chemistry', icon: Atom, color: 'text-red-400' },
  { id: 'biology', name: 'Biology', icon: Microscope, color: 'text-green-400' },
  { id: 'physics', name: 'Physics', icon: Zap, color: 'text-blue-400' },
  { id: 'geography', name: 'Geography', icon: Globe2, color: 'text-orange-400' },
  { id: 'history', name: 'History', icon: Clock, color: 'text-yellow-400' }
];

export default function AITutorHub() {
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('middle');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tutor');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: TutorMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date(),
      gradeLevel,
      subject: selectedSubject
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await geminiAI.generateContent({
        prompt: userInput,
        userType: 'student',
        feature: 'tutor',
        context: `Grade: ${gradeLevel}, Subject: ${selectedSubject}`,
        subject: selectedSubject,
        grade: gradeLevel
      });

      const aiMessage: TutorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date(),
        gradeLevel,
        subject: selectedSubject
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your AI API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    const prompts = {
      simplify: "Please explain this in simpler terms for my grade level",
      example: "Can you show me a practical example of this?",
      quiz: "Create a quick quiz question about this topic",
      deeper: "I want to understand this concept more deeply"
    };

    setUserInput(prompts[action as keyof typeof prompts] || action);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-900 via-space-800 to-space-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[url('/space-background.jpg')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial from-neon-blue/10 via-transparent to-transparent animate-pulse" />
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                AI Professor King
              </h1>
              <p className="text-space-200">Smart Learning Tutor Hub</p>
            </div>
          </div>
          
          {/* Grade Level Selector */}
          <div className="flex items-center gap-2">
            <span className="text-space-300 text-sm">Grade Level:</span>
            {Object.entries(gradeData).map(([level, data]) => (
              <Button
                key={level}
                variant={gradeLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => setGradeLevel(level as GradeLevel)}
                className={`${gradeLevel === level ? data.color : 'border-space-600'}`}
              >
                {data.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {data.ages}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Subject Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {subjects.map(subject => (
            <Button
              key={subject.id}
              variant={selectedSubject === subject.id ? "default" : "outline"}
              onClick={() => setSelectedSubject(subject.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <subject.icon className={`h-4 w-4 ${subject.color}`} />
              {subject.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-glass-panel border-space-600">
            <TabsTrigger value="tutor" className="data-[state=active]:bg-neon-blue/20">
              <Brain className="h-4 w-4 mr-2" />
              AI Tutor
            </TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-neon-purple/20">
              <Play className="h-4 w-4 mr-2" />
              Simulations
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-neon-cyan/20">
              <Target className="h-4 w-4 mr-2" />
              Questions
            </TabsTrigger>
          </TabsList>

          {/* AI Tutor Panel */}
          <TabsContent value="tutor" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
              {/* Chat Panel */}
              <div className="lg:col-span-2">
                <GlassCard className="h-full flex flex-col">
                  <div className="p-4 border-b border-space-600">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-neon-blue">
                        Ask Professor King
                      </h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Badge variant="secondary">
                          {gradeData[gradeLevel].label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                      <div className="text-center text-space-400 py-12">
                        <Brain className="h-12 w-12 mx-auto mb-4 text-neon-blue" />
                        <p>Ask me anything about {subjects.find(s => s.id === selectedSubject)?.name}!</p>
                        <p className="text-sm mt-2">I'll explain everything at your {gradeData[gradeLevel].label} level.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map(message => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.type === 'user'
                                  ? 'bg-neon-blue/20 text-white border border-neon-blue/30'
                                  : 'bg-glass-panel border border-space-600'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <span className="text-xs text-space-400 mt-1 block">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-glass-panel border border-space-600 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-blue" />
                                <span className="text-sm text-space-300">Professor King is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="p-4 border-t border-space-600">
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Ask about ${subjects.find(s => s.id === selectedSubject)?.name}...`}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={isLoading || !userInput.trim()}
                        className="bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Quick Actions Panel */}
              <div className="space-y-4">
                <GlassCard className="p-4">
                  <h3 className="text-lg font-semibold text-neon-cyan mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('simplify')}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Explain Simpler
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('example')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Show Example
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('quiz')}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Make a Quiz
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('deeper')}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Go Deeper
                    </Button>
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <h3 className="text-lg font-semibold text-neon-purple mb-4">Learning Progress</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Understanding Level</span>
                        <span>75%</span>
                      </div>
                      <div className="h-2 bg-space-700 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Questions Asked</span>
                        <span>{messages.filter(m => m.type === 'user').length}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </TabsContent>

          {/* Simulation Panel */}
          <TabsContent value="simulation" className="mt-6">
            <SubjectSimulation 
              subject={selectedSubject} 
              gradeLevel={gradeLevel}
              className="h-[70vh]"
            />
          </TabsContent>

          {/* Question Generator Panel */}
          <TabsContent value="questions" className="mt-6">
            <QuestionGenerator 
              subject={selectedSubject} 
              gradeLevel={gradeLevel}
              className="h-[70vh]"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}