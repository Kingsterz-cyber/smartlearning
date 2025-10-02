import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from '@/components/ui/glass-card';
import { Check, ChevronLeft, GraduationCap, School, Users, Plus } from 'lucide-react';
import spaceBackground from '@/assets/space-background.jpg';

type SchoolType = 'primary' | 'middle' | 'high';

const gradeOptions: Record<SchoolType, number[]> = {
  primary: [1, 2, 3, 4, 5],
  middle: [6, 7, 8],
  high: [9, 10, 11, 12],
};

const TeacherSetup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const schoolType = (searchParams.get('schoolType') as SchoolType) || (localStorage.getItem('schoolType') as SchoolType) || 'middle';

  const availableGrades = useMemo(() => gradeOptions[schoolType] ?? [], [schoolType]);
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [sectionsByGrade, setSectionsByGrade] = useState<Record<number, string>>({});
  const [subjectsByGrade, setSubjectsByGrade] = useState<Record<number, string[]>>({});
  const [customSubjectByGrade, setCustomSubjectByGrade] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const commonSubjects: string[] = useMemo(() => {
    if (schoolType === 'primary') return ['Math', 'Science', 'English', 'Social Studies', 'Art'];
    if (schoolType === 'middle') return ['Math', 'Science', 'English', 'History', 'Geography', 'ICT'];
    return ['Algebra/Calculus', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
  }, [schoolType]);

  const toggleGrade = (g: number) => {
    setSelectedGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const toggleSubject = (g: number, subject: string) => {
    setSubjectsByGrade((prev) => {
      const current = prev[g] || [];
      const next = current.includes(subject)
        ? current.filter((s) => s !== subject)
        : [...current, subject];
      return { ...prev, [g]: next };
    });
  };

  const addCustomSubject = (g: number) => {
    const val = (customSubjectByGrade[g] || '').trim();
    if (!val) return;
    setSubjectsByGrade((prev) => {
      const current = new Set([...(prev[g] || [])]);
      current.add(val);
      return { ...prev, [g]: Array.from(current) };
    });
    setCustomSubjectByGrade((prev) => ({ ...prev, [g]: '' }));
  };

  const handleSave = () => {
    setSaving(true);

    const normalized = selectedGrades
      .sort((a, b) => a - b)
      .map((g) => ({
        grade: g,
        sections: (sectionsByGrade[g] || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        subjects: (subjectsByGrade[g] || []).map((s) => s.trim()).filter(Boolean),
      }));

    const payload = {
      role: 'teacher' as const,
      schoolType,
      classes: normalized,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('userRole', 'teacher');
    localStorage.setItem('schoolType', schoolType);
    localStorage.setItem('teacherSetup', JSON.stringify(payload));

    navigate(`/teacher-dashboard?grade=${schoolType}`, { replace: true });
  };

  const isValid = useMemo(() => {
    if (!selectedGrades.length) return false;
    for (const g of selectedGrades) {
      const hasSections = (sectionsByGrade[g] || '').split(',').map((s) => s.trim()).filter(Boolean).length > 0;
      const hasSubjects = (subjectsByGrade[g] || []).length > 0;
      if (!hasSections || !hasSubjects) return false;
    }
    return true;
  }, [selectedGrades, sectionsByGrade, subjectsByGrade]);

  return (
    <div
      className="min-h-screen bg-gradient-space relative"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-space-deep/70 backdrop-blur-[1px]" />

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate('/grade-selection?mode=teacher')}
              variant="glass"
              size="icon"
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Teacher Setup</h1>
              <p className="text-muted-foreground">
                Choose the grades you teach and add class sections. School type: {schoolType}
              </p>
            </div>
          </div>

          {/* School Type Summary */}
          <GlassCard variant="secondary" className="mb-6">
            <GlassCardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-neon flex items-center justify-center">
                {schoolType === 'primary' && <School className="w-5 h-5 text-space-deep" />}
                {schoolType === 'middle' && <Users className="w-5 h-5 text-space-deep" />}
                {schoolType === 'high' && <GraduationCap className="w-5 h-5 text-space-deep" />}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Selected School Type</div>
                <div className="font-medium text-foreground capitalize">{schoolType}</div>
              </div>
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/grade-selection?mode=teacher')}
                >
                  Change
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Grade Selection */}
          <GlassCard variant="primary" className="mb-8">
            <GlassCardHeader>
              <GlassCardTitle>Select Grades</GlassCardTitle>
              <GlassCardDescription>
                You can select multiple grades. Click again to deselect.
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex flex-wrap gap-3">
                {availableGrades.map((g) => {
                  const active = selectedGrades.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGrade(g)}
                      className={`px-3 py-2 rounded-md border transition-colors flex items-center gap-2 ${
                        active
                          ? 'bg-neon-blue/20 border-neon-blue/40 text-foreground'
                          : 'bg-glass-secondary border-glass-border text-muted-foreground'
                      }`}
                    >
                      <span className="text-sm">Grade {g}</span>
                      {active && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Sections + Subjects per Grade */}
          {selectedGrades.length > 0 && (
            <GlassCard variant="primary" className="mb-8">
              <GlassCardHeader>
                <GlassCardTitle>Class Sections & Subjects</GlassCardTitle>
                <GlassCardDescription>
                  For each selected grade, enter sections (comma-separated) and select subjects. Add custom subjects if needed.
                </GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent className="space-y-6">
                {selectedGrades
                  .slice()
                  .sort((a, b) => a - b)
                  .map((g) => (
                    <div key={g} className="p-4 rounded-lg bg-glass-secondary border border-glass-border space-y-3">
                      <div className="font-medium text-foreground">Grade {g}</div>

                      {/* Sections */}
                      <div className="flex items-center gap-3">
                        <div className="w-28 text-sm text-muted-foreground">Sections</div>
                        <Input
                          placeholder={`e.g., ${g}A, ${g}B`}
                          value={sectionsByGrade[g] || ''}
                          onChange={(e) =>
                            setSectionsByGrade((prev) => ({ ...prev, [g]: e.target.value }))
                          }
                          className="bg-glass-secondary border-glass-border"
                        />
                      </div>

                      {/* Subjects selector */}
                      <div className="flex items-start gap-3">
                        <div className="w-28 text-sm text-muted-foreground">Subjects</div>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {commonSubjects.map((s) => {
                              const active = (subjectsByGrade[g] || []).includes(s);
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => toggleSubject(g, s)}
                                  className={`px-3 py-1 rounded-md border text-sm ${
                                    active
                                      ? 'bg-neon-violet/20 border-neon-violet/40 text-foreground'
                                      : 'bg-glass-primary border-glass-border text-muted-foreground'
                                  }`}
                                >
                                  {s}
                                </button>
                              );
                            })}
                          </div>
                          {/* Custom subject input */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add custom subject"
                              value={customSubjectByGrade[g] || ''}
                              onChange={(e) => setCustomSubjectByGrade((prev) => ({ ...prev, [g]: e.target.value }))}
                              className="bg-glass-primary border-glass-border"
                            />
                            <Button variant="glass" onClick={() => addCustomSubject(g)}>
                              <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                          </div>
                          {/* Selected subjects preview */}
                          {(subjectsByGrade[g]?.length ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {subjectsByGrade[g].map((s) => (
                                <span key={s} className="px-2 py-0.5 rounded bg-glass-primary border border-glass-border text-xs text-foreground">
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">No subjects selected yet.</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </GlassCardContent>
            </GlassCard>
          )}

          {/* Save */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="glass" onClick={() => navigate('/')}>Cancel</Button>
            <Button
              variant="neon"
              disabled={saving || !isValid}
              onClick={handleSave}
            >
              {saving ? 'Saving…' : 'Save & Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSetup;