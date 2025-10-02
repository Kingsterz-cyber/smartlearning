import React, { useState } from 'react';
import { Bot, Minimize2, Maximize2, MessageSquare, Brain, BookOpen, Sparkles, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { AIEducationAssistant } from './ai-education-assistant';

interface AIDockProps {
  className?: string;
  userType: 'student' | 'teacher';
  subject?: string;
  grade?: string;
}

export function AIDock({ className, userType, subject, grade }: AIDockProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const quickActions = userType === 'student' ? [
    { id: 'summarize', name: 'Summarize', icon: BookOpen, color: 'neon-blue' },
    { id: 'explain', name: 'Explain', icon: Brain, color: 'neon-violet' },
    { id: 'practice', name: 'Practice', icon: Zap, color: 'neon-cyan' },
    { id: 'translate', name: 'Translate', icon: Sparkles, color: 'neon-pink' },
  ] : [
    { id: 'quiz', name: 'Quiz', icon: Brain, color: 'neon-blue' },
    { id: 'lesson', name: 'Lesson', icon: BookOpen, color: 'neon-violet' },
    { id: 'insights', name: 'Insights', icon: Sparkles, color: 'neon-cyan' },
    { id: 'summarize', name: 'Summarize', icon: Zap, color: 'neon-pink' },
  ];

  if (!isMinimized) {
    return (
      <AIEducationAssistant
        className={className}
        userType={userType}
        subject={subject}
        grade={grade}
        defaultOpen={true}
      />
    );
  }

  return (
    <div className={cn("fixed right-6 top-1/2 -translate-y-1/2 z-40", className)}>
      {/* Quick Action Chips */}
      {showQuickActions && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2 space-y-2 animate-scale-in">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                variant="glass"
                size="sm"
                className={cn(
                  "shadow-lg backdrop-blur-md border-glass-border",
                  `hover:shadow-${action.color} hover:border-${action.color}/30`
                )}
                onClick={() => {
                  setIsMinimized(false);
                  setShowQuickActions(false);
                }}
              >
                <IconComponent className={cn("w-4 h-4 mr-2", `text-${action.color}`)} />
                {action.name}
              </Button>
            );
          })}
        </div>
      )}

      {/* Main Dock Button */}
      <div className="flex flex-col items-center space-y-2">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="neon"
          size="icon"
          className="w-14 h-14 rounded-full shadow-holographic hover:shadow-neon-blue transition-all duration-300"
        >
          <Bot className="w-7 h-7" />
        </Button>
        
        {/* Quick Actions Toggle */}
        <Button
          onClick={() => setShowQuickActions(!showQuickActions)}
          variant="glass"
          size="icon"
          className="w-10 h-10 rounded-full shadow-glass hover:shadow-neon-violet transition-all duration-300"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}