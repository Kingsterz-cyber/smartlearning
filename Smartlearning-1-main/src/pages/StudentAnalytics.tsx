import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, AlertTriangle, Award, Filter, Search, Eye, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AIEducationAssistant } from '@/components/ai-education-assistant';
import { geminiAI } from '@/services/gemini-ai';
import { useToast } from '@/hooks/use-toast';
import spaceBackground from '@/assets/space-background.jpg';

const StudentAnalytics = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grade = searchParams.get('grade') || 'middle';
  
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const { toast } = useToast();

  const students = [
    { id: 1, name: 'Emma Johnson', class: '8A', subjects: { math: 92, science: 88, tech: 95, general: 87 }, trend: 'up', risk: 'low' },
    { id: 2, name: 'Liam Chen', class: '8A', subjects: { math: 78, science: 82, tech: 89, general: 85 }, trend: 'stable', risk: 'medium' },
    { id: 3, name: 'Sophia Rodriguez', class: '8B', subjects: { math: 65, science: 70, tech: 72, general: 68 }, trend: 'down', risk: 'high' },
    { id: 4, name: 'Marcus Thompson', class: '8B', subjects: { math: 94, science: 91, tech: 88, general: 93 }, trend: 'up', risk: 'low' },
    { id: 5, name: 'Aisha Patel', class: '8A', subjects: { math: 85, science: 87, tech: 84, general: 86 }, trend: 'up', risk: 'low' }
  ];

  const weakAreas = [
    { topic: 'Fractions', percentage: 23, subject: 'Mathematics', students: 29 },
    { topic: 'Cell Division', percentage: 18, subject: 'Science', students: 22 },
    { topic: 'Variables', percentage: 15, subject: 'Technology', students: 19 },
    { topic: 'Reading Comprehension', percentage: 12, subject: 'General Knowledge', students: 15 }
  ];

  const insights = [
    {
      type: 'recommendation',
      title: 'Focus on Fractions',
      description: '23% of students show weakness in fractions. Consider additional practice sessions.',
      action: 'Create Practice Set',
      color: 'neon-blue'
    },
    {
      type: 'success',
      title: 'Visual Learning Success',
      description: 'Visual methods increased Science understanding by 34% in your classes.',
      action: 'Apply to Math',
      color: 'neon-violet'
    },
    {
      type: 'alert',
      title: 'At-Risk Students',
      description: '3 students showing declining performance. Early intervention recommended.',
      action: 'View Students',
      color: 'neon-pink'
    }
  ];

  const getStudentsByRisk = (riskLevel: string) => {
    return students.filter(student => student.risk === riskLevel);
  };

  const getAverageScore = (subject: string) => {
    const scores = students.map(student => student.subjects[subject as keyof typeof student.subjects]);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const generateAIRecommendations = async () => {
    setIsGeneratingInsights(true);
    try {
      const performanceData = `
        Class Performance Summary:
        - Total Students: ${students.length}
        - At-Risk Students: ${getStudentsByRisk('high').length}
        - Weak Areas: Fractions (23%), Cell Division (18%), Variables (15%)
        - Average Scores: Math ${getAverageScore('math')}%, Science ${getAverageScore('science')}%
      `;

      const response = await geminiAI.generateContent({
        prompt: `Based on this student performance data: ${performanceData}, provide specific teaching recommendations, intervention strategies, and personalized study plans for improving student outcomes.`,
        userType: 'teacher',
        feature: 'insights',
        grade: grade
      });

      if (response.success) {
        const recommendations = [
          {
            type: 'intervention',
            title: 'Immediate Action Needed',
            description: response.content.split('\n')[0] || 'Focus on students showing declining performance trends',
            action: 'Create Intervention Plan',
            color: 'neon-pink',
            priority: 'high'
          },
          {
            type: 'strategy',
            title: 'Teaching Strategy',
            description: response.content.split('\n')[1] || 'Implement visual learning methods for better comprehension',
            action: 'Apply Strategy',
            color: 'neon-violet',
            priority: 'medium'
          },
          {
            type: 'enhancement',
            title: 'Performance Enhancement',
            description: response.content.split('\n')[2] || 'Create additional practice materials for weak topics',
            action: 'Generate Materials',
            color: 'neon-cyan',
            priority: 'low'
          }
        ];
        setAiRecommendations(recommendations);
        
        toast({
          title: "AI Insights Generated",
          description: "New recommendations based on student performance data.",
        });
      }
    } catch (error) {
      toast({
        title: "Insight Generation Failed",
        description: "Unable to generate AI recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  useEffect(() => {
    generateAIRecommendations();
  }, []);

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
                  Student Analytics
                </h1>
                <p className="text-muted-foreground text-lg">
                  AI-powered insights and performance tracking
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <GlassCard variant="primary" className="mb-8">
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-40 bg-glass-secondary border-glass-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="8a">Class 8A</SelectItem>
                    <SelectItem value="8b">Class 8B</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-40 bg-glass-secondary border-glass-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="general">General Knowledge</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search students..." 
                      className="pl-10 bg-glass-secondary border-glass-border"
                    />
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <GlassCard variant="primary" glow>
              <GlassCardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-neon-blue" />
                <div className="text-2xl font-bold text-foreground">{students.length}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard variant="primary" glow>
              <GlassCardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-neon-violet" />
                <div className="text-2xl font-bold text-foreground">86%</div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard variant="primary" glow>
              <GlassCardContent className="p-6 text-center">
                <Award className="w-8 h-8 mx-auto mb-3 text-neon-cyan" />
                <div className="text-2xl font-bold text-foreground">{getStudentsByRisk('low').length}</div>
                <div className="text-sm text-muted-foreground">High Performers</div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard variant="primary" glow>
              <GlassCardContent className="p-6 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-neon-pink" />
                <div className="text-2xl font-bold text-foreground">{getStudentsByRisk('high').length}</div>
                <div className="text-sm text-muted-foreground">At-Risk Students</div>
              </GlassCardContent>
            </GlassCard>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Student List */}
            <GlassCard variant="secondary" className="lg:col-span-2">
              <GlassCardHeader>
                <GlassCardTitle>Student Performance Overview</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-3">
                  {students.map((student) => {
                    const avgScore = Math.round(
                      (student.subjects.math + student.subjects.science + student.subjects.tech + student.subjects.general) / 4
                    );
                    
                    return (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-glass-primary rounded-lg border border-glass-border">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            student.risk === 'low' ? 'bg-neon-cyan/20 text-neon-cyan' :
                            student.risk === 'medium' ? 'bg-neon-violet/20 text-neon-violet' :
                            'bg-neon-pink/20 text-neon-pink'
                          }`}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          
                          <div>
                            <div className="font-semibold text-foreground">{student.name}</div>
                            <div className="text-sm text-muted-foreground">Class {student.class}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-foreground">{avgScore}%</div>
                            <div className="text-xs text-muted-foreground">Average</div>
                          </div>
                          
                          <div className="flex gap-1">
                            {Object.entries(student.subjects).map(([subject, score]) => (
                              <div key={subject} className="text-center">
                                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                                  score >= 90 ? 'bg-neon-cyan/20 text-neon-cyan' :
                                  score >= 80 ? 'bg-neon-violet/20 text-neon-violet' :
                                  score >= 70 ? 'bg-neon-blue/20 text-neon-blue' :
                                  'bg-neon-pink/20 text-neon-pink'
                                }`}>
                                  {score}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Weak Areas */}
              <GlassCard variant="accent">
                <GlassCardHeader>
                  <GlassCardTitle>Weakest Topics</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-3">
                    {weakAreas.map((area, index) => (
                      <div key={index} className="p-3 bg-glass-secondary rounded border border-glass-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{area.topic}</span>
                          <span className="text-sm text-neon-pink">{area.percentage}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {area.subject} • {area.students} students struggling
                        </div>
                        <div className="w-full bg-glass-primary rounded-full h-2">
                          <div 
                            className="bg-neon-pink h-2 rounded-full transition-all" 
                            style={{ width: `${area.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* AI Insights */}
              <GlassCard variant="primary">
                <GlassCardHeader className="flex flex-row items-center justify-between">
                  <GlassCardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Recommendations
                  </GlassCardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={generateAIRecommendations}
                    disabled={isGeneratingInsights}
                  >
                    {isGeneratingInsights ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </GlassCardHeader>
                <GlassCardContent className="max-h-64 overflow-y-auto scrollbar-futuristic">
                  <div className="space-y-3">
                    {aiRecommendations.length > 0 ? (
                      aiRecommendations.map((recommendation, index) => (
                        <div key={index} className={`p-3 bg-${recommendation.color}/10 border border-${recommendation.color}/20 rounded-lg`}>
                          <div className={`text-sm font-medium text-${recommendation.color} mb-1 flex items-center justify-between`}>
                            {recommendation.title}
                            <span className={`text-xs px-2 py-1 rounded bg-${recommendation.color}/20`}>
                              {recommendation.priority}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {recommendation.description}
                          </div>
                          <Button variant="ghost" size="sm" className={`text-${recommendation.color}`}>
                            {recommendation.action}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Generating AI recommendations...</p>
                      </div>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>

      <AIEducationAssistant 
        userType="teacher" 
        grade={grade} 
      />
    </div>
  );
};

export default StudentAnalytics;