import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from '@/components/ui/glass-card';
import spaceBackground from '@/assets/space-background.jpg';

const Landing = () => {
  const navigate = useNavigate();

  const handleModeSelect = (mode: 'student' | 'teacher') => {
    localStorage.setItem('userRole', mode);
    navigate(`/grade-selection?mode=${mode}`);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-space relative overflow-hidden"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-space-deep/70 backdrop-blur-[1px]" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-glass-primary backdrop-blur-glass border border-glass-border rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-5 h-5 text-neon-blue" />
              <span className="text-sm text-foreground font-medium">Welcome to the Future of Education</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-neon bg-clip-text text-transparent">
              Smart Learning
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Immerse yourself in a premium AI-powered learning ecosystem where holographic interfaces meet intelligent education
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-blue rounded-full" />
                <span>Adaptive Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-violet rounded-full" />
                <span>AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full" />
                <span>Holographic Interface</span>
              </div>
            </div>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Mode */}
            <GlassCard 
              className="group cursor-pointer transform transition-all duration-500 hover:scale-105 animate-slide-up"
              variant="primary"
              glow
              onClick={() => handleModeSelect('student')}
            >
              <GlassCardHeader className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-neon rounded-full flex items-center justify-center shadow-holographic group-hover:animate-float">
                  <GraduationCap className="w-12 h-12 text-space-deep" />
                </div>
                <GlassCardTitle className="text-3xl mb-3 text-foreground">
                  Student Mode
                </GlassCardTitle>
                <GlassCardDescription className="text-lg text-muted-foreground">
                  Embark on your personalized learning journey with AI-guided education
                </GlassCardDescription>
              </GlassCardHeader>
              
              <GlassCardContent className="p-8 pt-0">
                <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neon-blue rounded-full" />
                    <span className="text-foreground">Adaptive quizzes with instant feedback</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neon-violet rounded-full" />
                    <span className="text-foreground">AI-powered learning recommendations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full" />
                    <span className="text-foreground">Progress tracking with XP and badges</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neon-pink rounded-full" />
                    <span className="text-foreground">Interactive digital library</span>
                  </li>
                </ul>
                
                <Button 
                  variant="neon" 
                  size="lg" 
                  className="w-full group-hover:shadow-holographic"
                >
                  Enter Learning Mode
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </GlassCardContent>
            </GlassCard>

            {/* Teacher Mode */}
            <GlassCard 
              className="group cursor-pointer transform transition-all duration-500 hover:scale-105 animate-slide-up"
              variant="primary"
              glow
              onClick={() => handleModeSelect('teacher')}
            >
              <GlassCardHeader className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-holographic rounded-full flex items-center justify-center shadow-holographic group-hover:animate-float border border-neon-violet/30">
                  <Users className="w-12 h-12 text-foreground" />
                </div>
                <GlassCardTitle className="text-3xl mb-3 text-foreground">
                  Teacher Mode
                </GlassCardTitle>
                <GlassCardDescription className="text-lg text-muted-foreground">
                  Empower your teaching with AI-driven insights and curriculum management
                </GlassCardDescription>
              </GlassCardHeader>
              
              <GlassCardContent className="p-8 pt-0">
                <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neon-blue rounded-full" />
                    <span className="text-foreground">AI-powered lesson planning</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neon-violet rounded-full" />
                    <span className="text-foreground">Curriculum coverage heatmaps</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full" />
                    <span className="text-foreground">Student analytics and interventions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neon-pink rounded-full" />
                    <span className="text-foreground">Automated quiz generation</span>
                  </li>
                </ul>
                
                <Button 
                  variant="holographic" 
                  size="lg" 
                  className="w-full group-hover:shadow-holographic"
                >
                  Enter Teaching Mode
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              Powered by advanced AI • Built for the future of education
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;