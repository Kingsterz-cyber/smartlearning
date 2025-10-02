import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calculator, Atom, Laptop, Brain, Trophy, Target, Flame, BookOpen, Sparkles, Loader2, Copy, Save } from 'lucide-react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIEducationAssistant } from '@/components/ai-education-assistant';
import { geminiAI } from '@/services/gemini-ai';
import { useToast } from '@/hooks/use-toast';
import spaceBackground from '@/assets/space-background.jpg';

const StudentDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grade = searchParams.get('grade');
  
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showAITutor, setShowAITutor] = useState(false);
  const [aiTutorMessages, setAiTutorMessages] = useState([]);
  const [tutorInput, setTutorInput] = useState('');
  const [isLoadingTutor, setIsLoadingTutor] = useState(false);
  const { toast } = useToast();
  
  // Load workspace created during Grade Selection, if available
  const [workspace, setWorkspace] = React.useState<any>(null);
  React.useEffect(() => {
    if (!grade) return;
    try {
      const raw = localStorage.getItem(`studentWorkspace:grade:${grade}`);
      if (raw) setWorkspace(JSON.parse(raw));
    } catch {}
  }, [grade]);

  const SubjectIconMap: Record<string, any> = {
    Math: Calculator,
    Science: Atom,
    English: BookOpen,
    Physics: Atom,
    Chemistry: Atom,
    History: BookOpen,
    Geography: BookOpen,
    Technology: Laptop,
    'General Knowledge': Brain,
    'Social Studies': BookOpen,
    'Language Arts': BookOpen,
  };

  const subjects = React.useMemo(() => {
    if (workspace?.subjects?.length) {
      return (workspace.subjects as string[]).map((name) => {
        const Icon = SubjectIconMap[name] || BookOpen;
        return {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          icon: Icon,
          progress: 0,
          color: 'neon-blue',
          subcategories: [],
          mastery: 'Getting Started',
        };
      });
    }
    return [
      {
        id: 'math',
        name: 'Mathematics',
        icon: Calculator,
        progress: 78,
        color: 'neon-blue',
        subcategories: ['Algebra', 'Geometry', 'Statistics'],
        mastery: 'Advanced'
      },
      {
        id: 'science',
        name: 'Science',
        icon: Atom,
        progress: 65,
        color: 'neon-violet',
        subcategories: ['Physics', 'Chemistry', 'Biology'],
        mastery: 'Intermediate'
      },
      {
        id: 'technology',
        name: 'Technology',
        icon: Laptop,
        progress: 82,
        color: 'neon-cyan',
        subcategories: ['Programming', 'Digital Literacy', 'AI Basics'],
        mastery: 'Advanced'
      },
      {
        id: 'general',
        name: 'General Knowledge',
        icon: Brain,
        progress: 71,
        color: 'neon-pink',
        subcategories: ['History', 'Geography', 'Current Events'],
        mastery: 'Intermediate'
      }
    ];
  }, [workspace]);

  const achievements = [
    { icon: Trophy, label: 'Quiz Master', count: 15 },
    { icon: Target, label: 'Perfect Scores', count: 8 },
    { icon: Flame, label: 'Day Streak', count: 23 },
    { icon: BookOpen, label: 'Chapters Read', count: 47 }
  ];

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/subject/${subjectId}?grade=${grade}`);
  };

  const handleQuizClick = (subjectId: string) => {
    navigate(`/quiz/${subjectId}?grade=${grade}`);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'neon-cyan';
    if (progress >= 70) return 'neon-violet';
    if (progress >= 50) return 'neon-blue';
    return 'neon-pink';
  };

  const handleAITutorQuestion = async () => {
    if (!tutorInput.trim() || isLoadingTutor) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: tutorInput,
      timestamp: new Date()
    };

    setAiTutorMessages(prev => [...prev, userMessage]);
    setTutorInput('');
    setIsLoadingTutor(true);

    try {
      const response = await geminiAI.generateContent({
        prompt: tutorInput,
        userType: 'student',
        feature: 'explain',
        grade: grade
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.success ? response.content : 'Sorry, I had trouble understanding that. Could you rephrase your question?',
        timestamp: new Date()
      };

      setAiTutorMessages(prev => [...prev, aiMessage]);

      if (!response.success) {
        toast({
          title: "Tutor Error",
          description: "The AI tutor had trouble with your question. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI tutor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTutor(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
            <h1 className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent">
              Welcome Back, Alex!
            </h1>
                <p className="text-muted-foreground text-lg">
                  Ready to continue your learning journey in {grade} school?
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-neon-blue">Level 47</div>
                <div className="text-muted-foreground">12,850 XP</div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {achievements.map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <GlassCard key={index} variant="secondary" className="text-center">
                    <GlassCardContent className="p-4">
                      <IconComponent className="w-8 h-8 mx-auto mb-2 text-neon-blue" />
                      <div className="text-2xl font-bold text-foreground">{achievement.count}</div>
                      <div className="text-sm text-muted-foreground">{achievement.label}</div>
                    </GlassCardContent>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Subjects */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Your Subjects</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {subjects.map((subject, index) => {
                  const IconComponent = subject.icon;
                  return (
                    <GlassCard 
                      key={subject.id}
                      className="group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                      variant="primary"
                      onClick={() => handleSubjectClick(subject.id)}
                    >
                      <GlassCardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 bg-gradient-neon rounded-lg flex items-center justify-center shadow-${subject.color}`}>
                              <IconComponent className="w-6 h-6 text-space-deep" />
                            </div>
                            <div>
                              <GlassCardTitle className="text-lg">{subject.name}</GlassCardTitle>
                              <p className="text-sm text-muted-foreground">{subject.mastery}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-neon-blue">{subject.progress}%</div>
                            <div className="text-xs text-muted-foreground">Complete</div>
                          </div>
                        </div>
                      </GlassCardHeader>
                      
                      <GlassCardContent className="pt-0">
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="h-2 bg-space-medium rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-neon rounded-full transition-all duration-1000`}
                              style={{ width: `${subject.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Subcategories */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {subject.subcategories.map((sub, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-glass-secondary text-xs rounded-md text-muted-foreground"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            variant="glass" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubjectClick(subject.id);
                            }}
                          >
                            Learn
                          </Button>
                          <Button 
                            variant="glass" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubjectClick(subject.id);
                            }}
                          >
                            Practice
                          </Button>
                          <Button 
                            variant="glass" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuizClick(subject.id);
                            }}
                          >
                            Quiz
                          </Button>
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Goal */}
              <GlassCard variant="accent" glow>
                <GlassCardHeader>
                  <GlassCardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-neon-violet" />
                    Today's Goal
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Complete 3 Math exercises</span>
                      <span className="text-xs text-neon-blue">2/3</span>
                    </div>
                    <div className="h-2 bg-space-medium rounded-full">
                      <div className="h-full w-2/3 bg-gradient-neon rounded-full" />
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* Streak Counter */}
              <GlassCard variant="primary">
                <GlassCardContent className="text-center p-6">
                  <Flame className="w-12 h-12 mx-auto mb-3 text-neon-pink" />
                  <div className="text-3xl font-bold text-neon-pink mb-1">23</div>
                  <div className="text-sm text-muted-foreground">Day Learning Streak</div>
                  <div className="text-xs text-muted-foreground mt-2">Keep it up! You're on fire! 🔥</div>
                </GlassCardContent>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard variant="secondary">
                <GlassCardHeader>
                  <GlassCardTitle>Quick Actions</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Digital Library
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="w-4 h-4 mr-2" />
                    View Achievements
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Progress Report
                  </Button>
                  <Button 
                    variant="neon" 
                    className="w-full"
                    onClick={() => setShowAITutor(true)}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Ask AI Tutor
                  </Button>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      {/* AI Tutor Modal */}
      {showAITutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-space-deep/80 backdrop-blur-sm" onClick={() => setShowAITutor(false)} />
          <GlassCard variant="primary" className="relative w-full max-w-2xl h-[600px] flex flex-col">
            <GlassCardHeader className="flex-row items-center justify-between">
              <GlassCardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Tutor Assistant
              </GlassCardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAITutor(false)}>
                ×
              </Button>
            </GlassCardHeader>
            
            <GlassCardContent className="flex-1 flex flex-col p-4">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-futuristic space-y-4 mb-4">
                {aiTutorMessages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-neon-blue opacity-50" />
                    <p>Ask me anything about your studies!</p>
                    <p className="text-sm">I can explain concepts, help with homework, and answer questions.</p>
                  </div>
                )}
                
                {aiTutorMessages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-space-deep" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-neon-blue/20 text-foreground' 
                        : 'bg-glass-secondary text-foreground'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      
                      {message.type === 'ai' && (
                        <div className="flex gap-1 mt-2">
                          <Button
                            onClick={() => copyToClipboard(message.content)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoadingTutor && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-space-deep animate-spin" />
                    </div>
                    <div className="bg-glass-secondary rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-neon-violet rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                  placeholder="Ask your question..."
                  className="flex-1 bg-glass-secondary border-glass-border"
                  onKeyPress={(e) => e.key === 'Enter' && handleAITutorQuestion()}
                  disabled={isLoadingTutor}
                />
                <Button
                  onClick={handleAITutorQuestion}
                  variant="neon"
                  size="icon"
                  disabled={isLoadingTutor || !tutorInput.trim()}
                >
                  {isLoadingTutor ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      )}

      <AIEducationAssistant 
        userType="student" 
        grade={grade} 
      />
    </div>
  );
};

export default StudentDashboard;