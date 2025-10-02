import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from '@/components/ui/glass-card';
import spaceBackground from '@/assets/space-background.jpg';

const GradeSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') as 'student' | 'teacher';
  const [selectedSchoolType, setSelectedSchoolType] = React.useState<string | null>(null);

  const grades = [
    {
      id: 'primary',
      title: 'Primary',
      description: 'Grades 1-5 • Ages 6-11',
      subjects: ['Math', 'Science', 'Language Arts', 'Social Studies'],
      icon: BookOpen,
      color: 'neon-blue'
    },
    {
      id: 'middle',
      title: 'Middle School',
      description: 'Grades 6-8 • Ages 11-14',
      subjects: ['Algebra', 'Biology', 'Literature', 'History', 'Geography'],
      icon: Users,
      color: 'neon-violet'
    },
    {
      id: 'high',
      title: 'High School',
      description: 'Grades 9-12 • Ages 14-18',
      subjects: ['Advanced Math', 'Physics', 'Chemistry', 'Advanced Literature'],
      icon: GraduationCap,
      color: 'neon-cyan'
    }
  ];

  const gradeOptions: Record<string, number[]> = {
    primary: [1, 2, 3, 4, 5],
    middle: [6, 7, 8],
    high: [9, 10, 11, 12],
  };

  const createStudentWorkspace = (schoolType: string, exactGrade: number) => {
    const key = `studentWorkspace:grade:${exactGrade}`;
    if (!localStorage.getItem(key)) {
      const subjectsByType: Record<string, string[]> = {
        primary: ['Math', 'Science', 'English', 'Social Studies'],
        middle: ['Math', 'Science', 'English', 'History', 'Geography'],
        high: ['Math', 'Physics', 'Chemistry', 'English', 'History'],
      };
      const workspace = {
        schoolType,
        grade: exactGrade,
        subjects: subjectsByType[schoolType] || [],
        learningObjectives: {},
        lessons: {},
        quizzes: {},
        assignments: {},
        progress: {},
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(workspace));
    }
    localStorage.setItem('studentCurrentGrade', String(exactGrade));
    localStorage.setItem('schoolType', schoolType);
  };

  const handleGradeSelect = (gradeId: string) => {
    localStorage.setItem('schoolType', gradeId);

    if (mode === 'student') {
      setSelectedSchoolType(gradeId);
      return;
    } else {
      navigate(`/teacher-setup?schoolType=${gradeId}`);
    }
  };

  const handleExactGradeSelect = (exactGrade: number) => {
    if (!selectedSchoolType) return;
    createStudentWorkspace(selectedSchoolType, exactGrade);
    navigate(`/student-dashboard?grade=${exactGrade}&schoolType=${selectedSchoolType}`);
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
      {/* Overlay */}
      <div className="absolute inset-0 bg-space-deep/70 backdrop-blur-[1px]" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => {
                if (selectedSchoolType) {
                  setSelectedSchoolType(null);
                } else {
                  navigate('/')
                }
              }}
              variant="glass"
              size="icon"
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {selectedSchoolType && mode === 'student' ? 'Choose Your Exact Grade' : 'Select Your Grade Level'}
              </h1>
              <p className="text-muted-foreground">
                {selectedSchoolType && mode === 'student'
                  ? 'Pick your grade so we can set up your personal workspace'
                  : `Choose the grade level for your ${mode === 'student' ? 'learning' : 'teaching'} journey`}
              </p>
            </div>
          </div>
        </div>

        {!selectedSchoolType && (
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {grades.map((grade, index) => {
                const IconComponent = grade.icon;
                return (
                  <GlassCard
                    key={grade.id}
                    className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                    variant="primary"
                    glow
                    style={{
                      animationDelay: `${index * 200}ms`
                    }}
                    onClick={() => handleGradeSelect(grade.id)}
                  >
                    <GlassCardHeader className="text-center p-8">
                      <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-neon rounded-full flex items-center justify-center shadow-holographic group-hover:animate-float`}>
                        <IconComponent className="w-10 h-10 text-space-deep" />
                      </div>
                      <GlassCardTitle className="text-2xl mb-2 text-foreground">
                        {grade.title}
                      </GlassCardTitle>
                      <GlassCardDescription className="text-muted-foreground">
                        {grade.description}
                      </GlassCardDescription>
                    </GlassCardHeader>
                    
                    <GlassCardContent className="p-8 pt-0">
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Core Subjects:</h4>
                        <div className="space-y-2">
                          {grade.subjects.map((subject, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className={`w-2 h-2 bg-${grade.color} rounded-full`} />
                              <span className="text-sm text-muted-foreground">{subject}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        variant="neon" 
                        size="lg" 
                        className="w-full group-hover:shadow-holographic"
                      >
                        {mode === 'student' ? 'Pick Exact Grade' : 'Begin Teaching'}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </GlassCardContent>
                  </GlassCard>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <GlassCard variant="secondary" className="max-w-2xl mx-auto">
                <GlassCardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Adaptive Learning Technology
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our AI system automatically adapts content difficulty, pacing, and learning paths 
                    based on your grade level selection. Each grade offers curriculum-aligned content 
                    with age-appropriate challenges and assessments.
                  </p>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>
        )}

        {selectedSchoolType && mode === 'student' && (
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gradeOptions[selectedSchoolType].map((g) => (
                <Button
                  key={g}
                  variant="glass"
                  className="h-16 text-lg font-semibold"
                  onClick={() => handleExactGradeSelect(g)}
                >
                  Grade {g}
                </Button>
              ))}
            </div>

            <div className="mt-8 text-center text-muted-foreground">
              We'll set up a personal workspace for Grade {gradeOptions[selectedSchoolType][0]}–{gradeOptions[selectedSchoolType].slice(-1)[0]}.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeSelection;