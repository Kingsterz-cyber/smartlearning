import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BarChart3, Users, BookOpen, Target, TrendingUp, Calendar, FileText, Settings, Brain, DoorOpen } from 'lucide-react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { AIEducationAssistant } from '@/components/ai-education-assistant';
import spaceBackground from '@/assets/space-background.jpg';

const TeacherDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grade = searchParams.get('grade');

  const subjects = [
    { name: 'Mathematics', students: 32, coverage: 84, avgScore: 87 },
    { name: 'Science', students: 28, coverage: 78, avgScore: 82 },
    { name: 'English', students: 35, coverage: 91, avgScore: 89 },
    { name: 'History', students: 30, coverage: 72, avgScore: 85 }
  ];

  const recentActivity = [
    { action: 'Quiz Generated', subject: 'Math', time: '2 hours ago' },
    { action: 'Lesson Plan Created', subject: 'Science', time: '1 day ago' },
    { action: 'Student Assessment', subject: 'English', time: '2 days ago' },
    { action: 'Curriculum Update', subject: 'History', time: '3 days ago' }
  ];

  const tools = [
    { name: 'AI Professor King', icon: Brain, description: 'Advanced AI tutoring & simulations', route: '/ai-tutor-hub' },
    { name: 'Lesson Planner', icon: Calendar, description: 'AI-powered lesson planning', route: '/lesson-planner' },
    { name: 'Quiz Builder', icon: FileText, description: 'Generate adaptive quizzes', route: '/quiz-generator' },
    { name: 'Analytics', icon: BarChart3, description: 'Student performance insights', route: '/student-analytics' },
    { name: 'Curriculum Map', icon: Target, description: 'Track coverage progress', route: '/curriculum-updater' }
  ];

  // NEW: derive classes from saved teacher setup
  const setupRaw = typeof window !== 'undefined' ? localStorage.getItem('teacherSetup') : null;
  const setup: null | { schoolType: string; classes: { grade: number; sections: string[] }[] } = setupRaw ? JSON.parse(setupRaw) : null;

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
                  Welcome, Professor Chen!
                </h1>
                <p className="text-muted-foreground text-lg">
                  Managing {grade} school curriculum with AI-powered insights
                </p>
              </div>
              <Button variant="neon" size="lg">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <GlassCard variant="primary" glow>
              <GlassCardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-neon-blue" />
                <div className="text-2xl font-bold text-foreground">125</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard variant="primary" glow>
              <GlassCardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-3 text-neon-violet" />
                <div className="text-2xl font-bold text-foreground">4</div>
                <div className="text-sm text-muted-foreground">Active Subjects</div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard variant="primary" glow>
              <GlassCardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-neon-cyan" />
                <div className="text-2xl font-bold text-foreground">86%</div>
                <div className="text-sm text-muted-foreground">Avg Performance</div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard variant="primary" glow>
              <GlassCardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-3 text-neon-pink" />
                <div className="text-2xl font-bold text-foreground">81%</div>
                <div className="text-sm text-muted-foreground">Curriculum Coverage</div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* NEW: Class Workspaces from setup */}
          {setup?.classes?.length ? (
            <GlassCard variant="accent" glow>
              <GlassCardHeader>
                <GlassCardTitle>Your Class Workspaces</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {setup.classes.flatMap((c) =>
                    (c.sections?.length ? c.sections : ['General']).map((section) => (
                      <div key={`${c.grade}-${section}`} className="p-4 bg-glass-primary rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Grade {c.grade}</div>
                          <div className="text-foreground font-semibold">Section {section}</div>
                        </div>
                        <Button
                          variant="holographic"
                          onClick={() =>
                            navigate(`/class-workspace?schoolType=${setup.schoolType}&grade=${c.grade}&section=${encodeURIComponent(section)}`)
                          }
                        >
                          <DoorOpen className="w-4 h-4 mr-2" />
                          Open
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>
          ) : (
            <GlassCard variant="secondary" className="mb-8">
              <GlassCardHeader>
                <GlassCardTitle>No classes yet</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">Set up your grades and sections to generate class workspaces.</p>
                  <Button variant="neon" onClick={() => navigate('/teacher-setup?schoolType=' + (localStorage.getItem('schoolType') || 'middle'))}>
                    Setup Classes
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subject Overview */}
              <GlassCard variant="primary">
                <GlassCardHeader>
                  <GlassCardTitle>Subject Overview</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    {subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-glass-secondary rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{subject.name}</h4>
                          <p className="text-sm text-muted-foreground">{subject.students} students</p>
                        </div>
                        <div className="text-center mx-4">
                          <div className="text-lg font-bold text-neon-blue">{subject.coverage}%</div>
                          <div className="text-xs text-muted-foreground">Coverage</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-neon-violet">{subject.avgScore}%</div>
                          <div className="text-xs text-muted-foreground">Avg Score</div>
                        </div>
                        <Button variant="glass" size="sm" className="ml-4">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* AI Teaching Tools */}
              <GlassCard variant="secondary">
                <GlassCardHeader>
                  <GlassCardTitle>AI Teaching Tools</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {tools.map((tool, index) => {
                      const IconComponent = tool.icon;
                      return (
                        <div 
                          key={index} 
                          className="flex items-center gap-4 p-4 bg-glass-primary rounded-lg hover:bg-glass-secondary transition-colors cursor-pointer group"
                          onClick={() => navigate(tool.route)}
                        >
                          <div className="w-12 h-12 bg-gradient-neon rounded-lg flex items-center justify-center shadow-holographic group-hover:animate-float">
                            <IconComponent className="w-6 h-6 text-space-deep" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{tool.name}</h4>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                         </div>
                       );
                     })}
                   </div>
                 </GlassCardContent>
               </GlassCard>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <GlassCard variant="accent" glow>
                <GlassCardHeader>
                  <GlassCardTitle>Quick Actions</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="space-y-3">
                  <Button 
                    variant="holographic" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/lesson-planner?grade=${grade}`)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create Lesson Plan
                  </Button>
                  <Button 
                    variant="glass" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/quiz-generator?grade=${grade}`)}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Quiz
                  </Button>
                  <Button 
                    variant="glass" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/student-analytics?grade=${grade}`)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Student Analytics
                  </Button>
                  <Button 
                    variant="glass" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/curriculum-updater?grade=${grade}`)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Update Curriculum
                  </Button>
                </GlassCardContent>
              </GlassCard>

              {/* Recent Activity */}
              <GlassCard variant="primary">
                <GlassCardHeader>
                  <GlassCardTitle>Recent Activity</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-glass-secondary rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-foreground">{activity.action}</div>
                          <div className="text-xs text-muted-foreground">{activity.subject}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* Performance Insights */}
              <GlassCard variant="secondary">
                <GlassCardHeader>
                  <GlassCardTitle>AI Insights</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-neon-blue/10 border border-neon-blue/20 rounded-lg">
                      <div className="text-sm font-medium text-neon-blue mb-1">Recommendation</div>
                      <div className="text-xs text-muted-foreground">
                        Consider reviewing fractions concepts with Class 7A - 23% of students show weakness in this area.
                      </div>
                    </div>
                    <div className="p-3 bg-neon-violet/10 border border-neon-violet/20 rounded-lg">
                      <div className="text-sm font-medium text-neon-violet mb-1">Success Pattern</div>
                      <div className="text-xs text-muted-foreground">
                        Visual learning methods increased understanding by 34% in your Science classes.
                      </div>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIEducationAssistant 
        userType="teacher" 
        grade={grade} 
      />
    </div>
  );
};

export default TeacherDashboard;