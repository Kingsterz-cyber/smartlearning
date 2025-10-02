import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen, AlertCircle, CheckCircle, Clock, Plus, Eye, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AIEducationAssistant } from '@/components/ai-education-assistant';
import { geminiAI } from '@/services/gemini-ai';
import { useToast } from '@/hooks/use-toast';
import spaceBackground from '@/assets/space-background.jpg';

const CurriculumUpdater = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grade = searchParams.get('grade') || 'middle';
  
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  const [selectedFramework, setSelectedFramework] = useState('common-core');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const { toast } = useToast();

  const curriculumUnits = [
    { id: 1, title: 'Linear Equations', status: 'completed', progress: 100, lessons: 8, lastUpdate: '2024-01-15' },
    { id: 2, title: 'Quadratic Functions', status: 'in-progress', progress: 75, lessons: 6, lastUpdate: '2024-01-10' },
    { id: 3, title: 'Statistics & Probability', status: 'pending', progress: 0, lessons: 0, lastUpdate: null },
    { id: 4, title: 'Geometry Basics', status: 'completed', progress: 100, lessons: 10, lastUpdate: '2024-01-08' }
  ];

  const pendingUpdates = [
    {
      id: 1,
      type: 'new-standard',
      title: 'Data Analysis Standards Update',
      description: 'New emphasis on real-world data interpretation and statistical reasoning',
      subject: 'Mathematics',
      impact: 'medium',
      estimatedTime: '2 weeks',
      status: 'pending'
    },
    {
      id: 2,
      type: 'content-revision',
      title: 'Environmental Science Integration',
      description: 'Integrate climate change topics into existing science curriculum',
      subject: 'Science',
      impact: 'high',
      estimatedTime: '3 weeks',
      status: 'pending'
    },
    {
      id: 3,
      type: 'technology-update',
      title: 'AI Literacy Module',
      description: 'Add artificial intelligence basics and ethical considerations',
      subject: 'Technology',
      impact: 'high',
      estimatedTime: '4 weeks',
      status: 'pending'
    }
  ];

  const recentChanges = [
    {
      id: 1,
      title: 'Algebra Prerequisites Updated',
      description: 'Added foundational number theory concepts before linear equations',
      date: '2024-01-12',
      status: 'applied',
      impact: 'Generated 3 new lesson plans, updated 2 quizzes'
    },
    {
      id: 2,
      title: 'Science Lab Safety Standards',
      description: 'Enhanced safety protocols for chemistry experiments',
      date: '2024-01-10',
      status: 'applied',
      impact: 'Updated 5 lesson plans, created new safety checklist'
    }
  ];

  const scanForUpdates = async () => {
    setIsScanning(true);
    try {
      const response = await geminiAI.generateContent({
        prompt: `Scan for curriculum updates and changes in ${selectedSubject} standards for ${selectedFramework} framework at grade ${grade}. Identify new standards, content revisions, and technology integrations that need to be addressed.`,
        userType: 'teacher',
        feature: 'insights',
        subject: selectedSubject,
        grade: grade
      });

      if (response.success) {
        const updates = [
          {
            id: Date.now(),
            type: 'ai-suggestion',
            title: 'AI-Identified Update',
            description: response.content.split('\n')[0] || 'New curriculum alignment suggestions based on latest standards',
            subject: selectedSubject,
            impact: 'medium',
            estimatedTime: '2 weeks',
            status: 'pending'
          }
        ];
        setScanResults(updates);
        
        toast({
          title: "Scan Complete",
          description: `Found ${updates.length} potential curriculum updates.`,
        });
      }
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to scan for updates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateAction = (updateId: number, action: 'accept' | 'modify' | 'reject') => {
    toast({
      title: `Update ${action}ed`,
      description: `Curriculum update has been ${action}ed successfully.`,
    });
    
    if (action === 'accept') {
      // Move to recent changes
      setScanResults(results => results.filter(r => r.id !== updateId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'neon-cyan';
      case 'in-progress': return 'neon-violet';
      case 'pending': return 'neon-blue';
      default: return 'muted';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'neon-pink';
      case 'medium': return 'neon-violet';
      case 'low': return 'neon-blue';
      default: return 'muted';
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
                  Curriculum Update Manager
                </h1>
                <p className="text-muted-foreground text-lg">
                  AI-powered curriculum alignment and updates
                </p>
              </div>
            </div>
            <Button 
              variant="holographic"
              onClick={scanForUpdates}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Scan for Updates
                </>
              )}
            </Button>
          </div>

          {/* Configuration */}
          <GlassCard variant="primary" className="mb-8">
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Configuration:</span>
                </div>
                
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48 bg-glass-secondary border-glass-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="general">General Knowledge</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger className="w-48 bg-glass-secondary border-glass-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common-core">Common Core</SelectItem>
                    <SelectItem value="ngss">NGSS Science</SelectItem>
                    <SelectItem value="iste">ISTE Technology</SelectItem>
                    <SelectItem value="custom">Custom Framework</SelectItem>
                  </SelectContent>
                </Select>

                <Badge variant="outline" className="bg-neon-blue/20 text-neon-blue border-neon-blue/30">
                  Grade {grade}
                </Badge>
              </div>
            </GlassCardContent>
          </GlassCard>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Current Curriculum */}
            <GlassCard variant="secondary">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Current Curriculum
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  {curriculumUnits.map((unit) => (
                    <div key={unit.id} className="p-4 bg-glass-primary rounded-lg border border-glass-border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{unit.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`bg-${getStatusColor(unit.status)}/20 text-${getStatusColor(unit.status)} border-${getStatusColor(unit.status)}/30`}
                        >
                          {unit.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{unit.lessons} lessons</span>
                          <span>{unit.progress}% complete</span>
                        </div>
                        
                        <div className="w-full bg-glass-secondary rounded-full h-2">
                          <div 
                            className={`bg-${getStatusColor(unit.status)} h-2 rounded-full transition-all`}
                            style={{ width: `${unit.progress}%` }}
                          ></div>
                        </div>
                        
                        {unit.lastUpdate && (
                          <div className="text-xs text-muted-foreground">
                            Last updated: {unit.lastUpdate}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Center Column - Pending Updates */}
            <GlassCard variant="accent" className="lg:col-span-2">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Pending Updates
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="max-h-96 overflow-y-auto scrollbar-futuristic">
                <div className="space-y-4">
                  {[...pendingUpdates, ...scanResults].map((update) => (
                    <div key={update.id} className="p-4 bg-glass-primary rounded-lg border border-glass-border">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground">{update.title}</h4>
                            <Badge 
                              variant="outline"
                              className={`bg-${getImpactColor(update.impact)}/20 text-${getImpactColor(update.impact)} border-${getImpactColor(update.impact)}/30`}
                            >
                              {update.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {update.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Subject: {update.subject}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {update.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-3 border-t border-glass-border">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-neon-cyan"
                          onClick={() => handleUpdateAction(update.id, 'accept')}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-neon-violet"
                          onClick={() => handleUpdateAction(update.id, 'modify')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Modify
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-neon-pink"
                          onClick={() => handleUpdateAction(update.id, 'reject')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingUpdates.length === 0 && scanResults.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-neon-cyan" />
                      <p>All curriculum updates are current!</p>
                      <p className="text-sm">Your curriculum is aligned with the latest standards.</p>
                    </div>
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Recent Changes */}
          <GlassCard variant="primary" className="mt-6">
            <GlassCardHeader>
              <GlassCardTitle>Recent Changes Applied</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                {recentChanges.map((change) => (
                  <div key={change.id} className="flex items-start gap-4 p-4 bg-glass-secondary rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-neon-cyan" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-foreground">{change.title}</h4>
                        <span className="text-xs text-muted-foreground">{change.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{change.description}</p>
                      <div className="text-xs text-neon-cyan bg-neon-cyan/10 rounded px-2 py-1 inline-block">
                        Impact: {change.impact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>

      <AIEducationAssistant 
        userType="teacher" 
        grade={grade} 
      />
    </div>
  );
};

export default CurriculumUpdater;