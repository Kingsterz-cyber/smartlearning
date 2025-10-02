import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Sparkles, Brain, BookOpen, Zap, Send, Copy, Save, Share, Loader2, Bot } from 'lucide-react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from './ui/glass-card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { geminiAI, type GeminiResponse } from '@/services/gemini-ai';
import { useToast } from '@/hooks/use-toast';
import aiAvatar from '@/assets/ai-avatar.jpg';

interface AIEducationAssistantProps {
  className?: string;
  userType: 'student' | 'teacher';
  subject?: string;
  grade?: string;
  defaultOpen?: boolean;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  feature?: string;
}

export function AIEducationAssistant({ 
  className, 
  userType, 
  subject, 
  grade, 
  defaultOpen = false 
}: AIEducationAssistantProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const studentFeatures = [
    { id: 'general', name: 'Ask Anything', icon: MessageCircle, description: 'General questions' },
    { id: 'summarize', name: 'Summarize', icon: BookOpen, description: 'Chapter summaries' },
    { id: 'explain', name: 'Explain', icon: Brain, description: 'Step-by-step explanations' },
    { id: 'practice', name: 'Practice', icon: Zap, description: 'Practice questions' },
    { id: 'translate', name: 'Translate', icon: Sparkles, description: 'Language translation' },
  ];

  const teacherFeatures = [
    { id: 'general', name: 'Ask Anything', icon: MessageCircle, description: 'General questions' },
    { id: 'quiz', name: 'Quiz Generator', icon: Brain, description: 'Create quizzes' },
    { id: 'lesson', name: 'Lesson Builder', icon: BookOpen, description: 'Build lessons' },
    { id: 'insights', name: 'Insights', icon: Sparkles, description: 'Student insights' },
    { id: 'summarize', name: 'Summarize', icon: Zap, description: 'Content summaries' },
  ];

  const features = userType === 'student' ? studentFeatures : teacherFeatures;

  useEffect(() => {
    if (messages.length === 0) {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'ai',
        content: userType === 'student' 
          ? `Hi! I'm ARIA, your AI learning companion. I can help you with explanations, summaries, practice questions, and more. What would you like to learn about today?`
          : `Hello! I'm ARIA, your AI teaching assistant. I can help you create quizzes, build lesson plans, analyze student performance, and generate educational content. How can I assist you today?`,
        timestamp: new Date(),
        feature: 'general'
      };
      setMessages([welcomeMessage]);
    }
  }, [userType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      feature: selectedFeature
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response: GeminiResponse = await geminiAI.generateContent({
        prompt: inputMessage,
        userType,
        feature: selectedFeature as any,
        subject,
        grade
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.success ? response.content : `I apologize, but I encountered an error: ${response.error}. Please try again.`,
        timestamp: new Date(),
        feature: selectedFeature
      };

      setMessages(prev => [...prev, aiMessage]);

      if (!response.success) {
        toast({
          title: "AI Error",
          description: "There was an issue processing your request. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
        feature: selectedFeature
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Unable to connect to AI service. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string, prompt: string) => {
    setSelectedFeature(action);
    setInputMessage(prompt);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure state updates
    handleSendMessage();
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          variant="neon"
          size="icon"
          className="w-16 h-16 rounded-full shadow-holographic hover:shadow-neon-blue transition-all duration-300"
        >
          <Bot className="w-8 h-8" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <GlassCard 
        className="w-[420px] h-[600px] animate-scale-in" 
        variant="primary" 
        glow
      >
        <GlassCardHeader className="flex-row items-center justify-between p-4 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-neon-blue shadow-neon-blue">
              <img 
                src={aiAvatar} 
                alt="AI Assistant" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <GlassCardTitle className="text-lg">ARIA AI</GlassCardTitle>
              <p className="text-sm text-muted-foreground">
                {userType === 'student' ? 'Learning Companion' : 'Teaching Assistant'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="w-8 h-8 hover:bg-glass-secondary"
          >
            <X className="w-4 h-4" />
          </Button>
        </GlassCardHeader>

        <GlassCardContent className="flex-1 flex flex-col p-0">
          {/* Feature Selection */}
          <div className="p-4 border-b border-glass-border">
            <p className="text-sm text-muted-foreground mb-2">AI Mode:</p>
            <div className="flex gap-1 overflow-x-auto">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Button
                    key={feature.id}
                    onClick={() => setSelectedFeature(feature.id)}
                    variant={selectedFeature === feature.id ? "neon" : "glass"}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <IconComponent className="w-4 h-4 mr-1" />
                    {feature.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                {message.type === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-space-deep" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[280px] rounded-lg p-3 text-sm",
                  message.type === 'user' 
                    ? "bg-neon-blue/20 text-foreground ml-auto" 
                    : "bg-glass-secondary text-foreground"
                )}>
                  {message.feature && message.feature !== 'general' && (
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {features.find(f => f.id === message.feature)?.name}
                    </Badge>
                  )}
                  
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
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
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-space-deep animate-spin" />
                </div>
                <div className="bg-glass-secondary text-foreground rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-neon-violet rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-glass-border">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {userType === 'student' ? (
                <>
                  <Button 
                    variant="glass" 
                    size="sm"
                    onClick={() => handleQuickAction('explain', 'Explain this topic step by step')}
                    disabled={isLoading}
                  >
                    Explain Topic
                  </Button>
                  <Button 
                    variant="glass" 
                    size="sm"
                    onClick={() => handleQuickAction('practice', 'Generate practice questions')}
                    disabled={isLoading}
                  >
                    Practice Quiz
                  </Button>
                  <Button 
                    variant="glass" 
                    size="sm"
                    onClick={() => handleQuickAction('summarize', 'Summarize this chapter')}
                    disabled={isLoading}
                  >
                    Summarize
                  </Button>
                  <Button 
                    variant="glass" 
                    size="sm"
                    onClick={() => handleQuickAction('general', 'Help me create a study plan')}
                    disabled={isLoading}
                  >
                    Study Plan
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="glass" 
                    size="sm"
                    onClick={() => handleQuickAction('quiz', 'Generate a quiz for this topic')}
                    disabled={isLoading}
                  >
                    Make Quiz
                  </Button>
                  <Button 
                    variant="glass" 
                    size="sm"
                    onClick={() => handleQuickAction('lesson', 'Create a lesson plan')}
                    disabled={isLoading}
                  >
                    Build Lesson
                  </Button>
                  <Button 
                    variant="glass" 
                    size="sm"
                    onClick={() => handleQuickAction('insights', 'Analyze student performance')}
                    disabled={isLoading}
                  >
                    Get Insights
                  </Button>
                  <Button 
                    variant="glass" 
                    size="sm"
                    onClick={() => handleQuickAction('summarize', 'Summarize curriculum updates')}
                    disabled={isLoading}
                  >
                    Summarize
                  </Button>
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-glass-secondary border-glass-border"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                variant="neon"
                size="icon"
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}