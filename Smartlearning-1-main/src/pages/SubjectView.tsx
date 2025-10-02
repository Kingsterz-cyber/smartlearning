import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Play, Target, Brain, Sparkles, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { AIEducationAssistant } from '@/components/ai-education-assistant';
import { Textarea } from '@/components/ui/textarea';
import { geminiAI } from '@/services/gemini-ai';
import spaceBackground from '@/assets/space-background.jpg';

const SubjectView = () => {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grade = searchParams.get('grade');

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const subjectData = {
    math: {
      name: 'Mathematics',
      topics: ['Algebra', 'Geometry', 'Statistics', 'Trigonometry'],
      description: 'Master mathematical concepts with interactive lessons and practice'
    },
    science: {
      name: 'Science', 
      topics: ['Physics', 'Chemistry', 'Biology', 'Earth Science'],
      description: 'Explore the wonders of science through hands-on learning'
    },
    technology: {
      name: 'Technology',
      topics: ['Programming', 'Digital Literacy', 'AI Basics', 'Web Development'],
      description: 'Learn cutting-edge technology skills for the future'
    },
    general: {
      name: 'General Knowledge',
      topics: ['History', 'Geography', 'Current Events', 'Culture'],
      description: 'Expand your knowledge across diverse topics and subjects'
    }
  };

  const subject = subjectData[subjectId as keyof typeof subjectData];

  if (!subject) {
    return <div>Subject not found</div>;
  }

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const content = `Subject: ${subject.name}. Description: ${subject.description}. Key topics: ${subject.topics.join(', ')}.`;
      const res = await geminiAI.summarizeContent(content, subjectId, grade || undefined);
      if (res.success) {
        setSummaryText(res.content);
        setShowSummary(true);
      } else {
        console.error('Summarize failed:', res.error);
      }
    } catch (e) {
      console.error('Summarize exception:', e);
    } finally {
      setIsSummarizing(false);
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate(`/student-dashboard?grade=${grade}`)}
              variant="glass"
              size="icon"
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{subject.name}</h1>
              <p className="text-muted-foreground">{subject.description}</p>
            </div>
            <Button 
              variant="holographic" 
              onClick={handleSummarize}
              disabled={isSummarizing}
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Summarize Overview
                </>
              )}
            </Button>
          </div>

          {/* Topics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {subject.topics.map((topic, index) => (
              <GlassCard key={index} variant="primary" className="hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <GlassCardHeader className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-neon rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-space-deep" />
                  </div>
                  <GlassCardTitle className="text-xl">{topic}</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="p-6 pt-0">
                  <div className="space-y-3">
                    <Button variant="neon" className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="glass" size="sm">Practice</Button>
                      <Button 
                        variant="glass" 
                        size="sm"
                        onClick={() => navigate(`/quiz/${subjectId}?grade=${grade}&topic=${topic}`)}
                      >
                        Quiz
                      </Button>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>

          {/* AI Summary Panel */}
          {showSummary && (
            <GlassCard variant="primary" className="mb-8">
              <GlassCardHeader>
                <GlassCardTitle>AI Summary</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-3">
                <Textarea 
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  className="min-h-[140px]"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="glass" onClick={() => setShowSummary(false)}>
                    <Save className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => { setSummaryText(''); setShowSummary(false); }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Discard
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard variant="secondary">
              <GlassCardHeader>
                <GlassCardTitle>Learning Path</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-muted-foreground mb-4">Follow your personalized learning path for {subject.name}</p>
                <Button variant="holographic" className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Continue Learning Path
                </Button>
              </GlassCardContent>
            </GlassCard>

            <GlassCard variant="accent">
              <GlassCardHeader>
                <GlassCardTitle>AI Study Assistant</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-muted-foreground mb-4">Get personalized help with {subject.name} concepts</p>
                <Button variant="neon" className="w-full">
                  <Brain className="w-4 h-4 mr-2" />
                  Ask AI Tutor
                </Button>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>

      <AIEducationAssistant 
        userType="student" 
        subject={subjectId} 
      />
    </div>
  );
};

export default SubjectView;