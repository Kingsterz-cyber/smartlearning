import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, BookOpen, Activity, CheckSquare, Calendar, Plus, Save, Download, Share, Edit3, Loader2, Sparkles } from 'lucide-react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AIEducationAssistant } from '@/components/ai-education-assistant';
import { geminiAI } from '@/services/gemini-ai';
import { useToast } from '@/hooks/use-toast';
import spaceBackground from '@/assets/space-background.jpg';

const LessonPlanner = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grade = searchParams.get('grade') || 'middle';
  
  const [lessonPlan, setLessonPlan] = useState({
    title: '',
    subject: '',
    grade: grade,
    duration: 45,
    framework: 'common-core'
  });

  const [lessonBlocks, setLessonBlocks] = useState([
    {
      id: 1,
      type: 'objective',
      title: 'Learning Objectives',
      content: 'Students will be able to solve linear equations with one variable.',
      duration: 5,
      order: 1,
      isEditing: false
    },
    {
      id: 2,
      type: 'introduction',
      title: 'Introduction & Hook',
      content: 'Begin with a real-world problem: "If you save $5 per week, how many weeks to save $50?"',
      duration: 10,
      order: 2,
      isEditing: false
    },
    {
      id: 3,
      type: 'activity',
      title: 'Main Activity',
      content: 'Interactive demonstration of solving 2x + 5 = 13 step by step.',
      duration: 20,
      order: 3,
      isEditing: false
    },
    {
      id: 4,
      type: 'assessment',
      title: 'Assessment',
      content: 'Exit ticket: Solve 3x - 7 = 14',
      duration: 10,
      order: 4,
      isEditing: false
    }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const { toast } = useToast();

  const subjects = ['Mathematics', 'Science', 'Technology', 'General Knowledge'];
  const frameworks = [
    { value: 'common-core', label: 'Common Core' },
    { value: 'ngss', label: 'NGSS Science' },
    { value: 'iste', label: 'ISTE Technology' },
    { value: 'custom', label: 'Custom Framework' }
  ];

  const blockTypes = [
    { type: 'objective', icon: Target, color: 'neon-blue' },
    { type: 'introduction', icon: BookOpen, color: 'neon-violet' },
    { type: 'activity', icon: Activity, color: 'neon-cyan' },
    { type: 'assessment', icon: CheckSquare, color: 'neon-pink' }
  ];

  const generateLessonOutline = async () => {
    if (!lessonPlan.subject || !lessonPlan.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in lesson title and subject first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await geminiAI.generateContent({
        prompt: `Create a comprehensive lesson outline for "${lessonPlan.title}" in ${lessonPlan.subject} for grade ${lessonPlan.grade}. Duration: ${lessonPlan.duration} minutes. Include detailed objectives, engaging introduction, main activities, and assessment methods.`,
        userType: 'teacher',
        feature: 'lesson',
        subject: lessonPlan.subject,
        grade: lessonPlan.grade
      });

      if (response.success) {
        // Parse AI response and create lesson blocks
        const aiBlocks = [
          {
            id: Date.now(),
            type: 'objective',
            title: 'AI-Generated Objectives',
            content: response.content.split('\n').slice(0, 3).join('\n'),
            duration: 5,
            order: lessonBlocks.length + 1,
            isEditing: false
          },
          {
            id: Date.now() + 1,
            type: 'activity',
            title: 'AI-Generated Activity',
            content: response.content.split('\n').slice(3, 6).join('\n'),
            duration: 20,
            order: lessonBlocks.length + 2,
            isEditing: false
          }
        ];
        setLessonBlocks([...lessonBlocks, ...aiBlocks]);
        
        toast({
          title: "Lesson Outline Generated",
          description: "AI has created new lesson blocks for your review.",
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate lesson outline. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleBlockEdit = (blockId: number) => {
    setLessonBlocks(blocks => blocks.map(block => 
      block.id === blockId 
        ? { ...block, isEditing: !block.isEditing }
        : { ...block, isEditing: false }
    ));
  };

  const updateBlockContent = (blockId: number, field: string, value: string) => {
    setLessonBlocks(blocks => blocks.map(block => 
      block.id === blockId ? { ...block, [field]: value } : block
    ));
  };

  const generateAISuggestions = async () => {
    if (!lessonPlan.subject) return;

    try {
      const response = await geminiAI.generateContent({
        prompt: `Suggest multimedia resources, differentiation strategies, and extension activities for ${lessonPlan.subject} lesson "${lessonPlan.title}" for grade ${lessonPlan.grade}.`,
        userType: 'teacher',
        feature: 'insights',
        subject: lessonPlan.subject,
        grade: lessonPlan.grade
      });

      if (response.success) {
        const suggestions = [
          {
            type: 'multimedia',
            title: 'Multimedia Resources',
            description: response.content.split('\n')[0] || 'Add interactive visualizations and animations',
            action: 'Add Resources',
            color: 'neon-blue'
          },
          {
            type: 'differentiation',
            title: 'Differentiation',
            description: response.content.split('\n')[1] || 'Create adaptations for different learning levels',
            action: 'Add Variations',
            color: 'neon-violet'
          },
          {
            type: 'extension',
            title: 'Extension Activities',
            description: response.content.split('\n')[2] || 'Suggest real-world applications and projects',
            action: 'Add Extensions',
            color: 'neon-cyan'
          }
        ];
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  };

  const getBlockIcon = (type: string) => {
    const blockType = blockTypes.find(bt => bt.type === type);
    return blockType ? blockType.icon : Activity;
  };

  const getBlockColor = (type: string) => {
    const blockType = blockTypes.find(bt => bt.type === type);
    return blockType ? blockType.color : 'neon-blue';
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
          <div className="flex items-center justify-between mb-8">
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
                <h1 className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                  AI Lesson Planner
                </h1>
                <p className="text-muted-foreground text-lg">
                  Create comprehensive lesson plans with AI assistance
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="glass">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="glass">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Panel - Configuration */}
            <GlassCard variant="primary">
              <GlassCardHeader>
                <GlassCardTitle className="text-lg">Lesson Configuration</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Lesson Title</label>
                  <Input
                    value={lessonPlan.title}
                    onChange={(e) => setLessonPlan({...lessonPlan, title: e.target.value})}
                    placeholder="Enter lesson title"
                    className="bg-glass-secondary border-glass-border"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                  <Select value={lessonPlan.subject} onValueChange={(value) => setLessonPlan({...lessonPlan, subject: value})}>
                    <SelectTrigger className="bg-glass-secondary border-glass-border">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject.toLowerCase()}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Grade Level</label>
                  <Input
                    value={lessonPlan.grade}
                    onChange={(e) => setLessonPlan({...lessonPlan, grade: e.target.value})}
                    className="bg-glass-secondary border-glass-border capitalize"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={lessonPlan.duration}
                    onChange={(e) => setLessonPlan({...lessonPlan, duration: parseInt(e.target.value)})}
                    className="bg-glass-secondary border-glass-border"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Framework</label>
                  <Select value={lessonPlan.framework} onValueChange={(value) => setLessonPlan({...lessonPlan, framework: value})}>
                    <SelectTrigger className="bg-glass-secondary border-glass-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map(framework => (
                        <SelectItem key={framework.value} value={framework.value}>{framework.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="holographic" 
                  className="w-full"
                  onClick={generateLessonOutline}
                  disabled={!lessonPlan.subject || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Outline
                    </>
                  )}
                </Button>

                <Button 
                  variant="glass" 
                  className="w-full"
                  onClick={generateAISuggestions}
                  disabled={!lessonPlan.subject}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Suggestions
                </Button>

                <div className="pt-4 border-t border-glass-border space-y-2">
                  <div className="text-sm font-medium text-foreground">Lesson Blocks</div>
                  {blockTypes.map(block => {
                    const IconComponent = block.icon;
                    const count = lessonBlocks.filter(lb => lb.type === block.type).length;
                    return (
                      <div key={block.type} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-4 h-4 text-${block.color}`} />
                          <span className="capitalize">{block.type}</span>
                        </div>
                        <span className={`text-${block.color} font-medium`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Center Panel - Timeline */}
            <GlassCard variant="secondary" className="lg:col-span-2">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Lesson Timeline
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  {lessonBlocks
                    .sort((a, b) => a.order - b.order)
                    .map((block, index) => {
                      const IconComponent = getBlockIcon(block.type);
                      const colorClass = getBlockColor(block.type);
                      
                      return (
                        <div key={block.id} className="group relative">
                          {/* Timeline line */}
                          {index < lessonBlocks.length - 1 && (
                            <div className="absolute left-6 top-12 w-px h-16 bg-glass-border"></div>
                          )}
                          
                          <div className="flex gap-4 p-4 bg-glass-primary rounded-lg border border-glass-border hover:border-opacity-50 transition-all">
                            <div className={`w-12 h-12 rounded-lg bg-${colorClass}/20 border border-${colorClass}/30 flex items-center justify-center flex-shrink-0`}>
                              <IconComponent className={`w-5 h-5 text-${colorClass}`} />
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                {block.isEditing ? (
                                  <Input
                                    value={block.title}
                                    onChange={(e) => updateBlockContent(block.id, 'title', e.target.value)}
                                    className="text-lg font-semibold bg-glass-secondary border-glass-border"
                                    onBlur={() => toggleBlockEdit(block.id)}
                                    onKeyPress={(e) => e.key === 'Enter' && toggleBlockEdit(block.id)}
                                    autoFocus
                                  />
                                ) : (
                                  <div 
                                    className="text-lg font-semibold cursor-pointer hover:text-neon-blue transition-colors"
                                    onClick={() => toggleBlockEdit(block.id)}
                                  >
                                    {block.title}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{block.duration} min</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => toggleBlockEdit(block.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              {block.isEditing ? (
                                <Textarea
                                  value={block.content}
                                  onChange={(e) => updateBlockContent(block.id, 'content', e.target.value)}
                                  className="bg-glass-secondary border-glass-border resize-none"
                                  rows={3}
                                  onBlur={() => toggleBlockEdit(block.id)}
                                  autoFocus
                                />
                              ) : (
                                <div 
                                  className="p-3 bg-glass-secondary rounded border border-glass-border cursor-pointer hover:border-neon-blue/30 transition-colors"
                                  onClick={() => toggleBlockEdit(block.id)}
                                >
                                  {block.content}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="capitalize">{block.type}</span>
                                <span>•</span>
                                <span>Order: {block.order}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  
                  <div className="flex justify-center pt-4">
                    <Button variant="neon" size="lg">
                      <Save className="w-4 h-4 mr-2" />
                      Save Lesson Plan
                    </Button>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <GlassCard variant="accent" className="mt-6">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI-Generated Suggestions
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="max-h-64 overflow-y-auto scrollbar-futuristic">
                <div className="grid md:grid-cols-3 gap-4">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className={`p-4 bg-${suggestion.color}/10 border border-${suggestion.color}/20 rounded-lg`}>
                      <div className={`text-sm font-medium text-${suggestion.color} mb-2`}>{suggestion.title}</div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {suggestion.description}
                      </div>
                      <Button variant="ghost" size="sm" className={`text-${suggestion.color}`}>
                        {suggestion.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          )}
        </div>
      </div>

      <AIEducationAssistant 
        userType="teacher" 
        grade={grade} 
      />
    </div>
  );
};

export default LessonPlanner;