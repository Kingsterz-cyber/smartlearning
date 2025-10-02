import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from '@/components/ui/glass-card';
import { ArrowLeft, Brain, FileText, ListChecks, LineChart, Users, BookOpen, Plus, Save, CalendarClock } from 'lucide-react';
import spaceBackground from '@/assets/space-background.jpg';

// Simple, reliable client-side generators to avoid API/env requirements
function suggestSubjects(schoolType: string, gradeNum: number): string[] {
  const base = {
    primary: ['Math', 'Science', 'English', 'Social Studies', 'Art'],
    middle: ['Math', 'Science', 'English', 'History', 'Geography', 'Computer'],
    high: ['Algebra/Calculus', 'Physics', 'Chemistry', 'Biology', 'English', 'History']
  } as const;
  const list = base[(schoolType as 'primary'|'middle'|'high') || 'middle'] || [];
  // Small tweak by grade
  if (schoolType === 'primary' && gradeNum >= 4) return [...list, 'Intro to Coding'];
  if (schoolType === 'high' && gradeNum >= 11) return [...list, 'Economics'];
  return list;
}

function generateObjectives(gradeNum: number, subjects: string[]) {
  return subjects.slice(0, 4).map((s) => ({
    subject: s,
    objectives: [
      `Master core ${s} skills for Grade ${gradeNum}`,
      `Apply ${s} concepts to real-world problems`,
      `Demonstrate understanding via formative assessments`
    ]
  }));
}

function generateQuiz(subject: string, gradeNum: number) {
  // Deterministic, structured quiz for reliability
  return {
    meta: { subject, grade: gradeNum, difficulty: gradeNum < 6 ? 'easy' : gradeNum < 9 ? 'medium' : 'hard' },
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        prompt: `${subject}: Core concept check for Grade ${gradeNum}`,
        choices: ['Option A', 'Option B', 'Option C', 'Option D'],
        answerIndex: 1,
        explanation: 'Option B aligns with the targeted grade-level standard.'
      },
      {
        id: 'q2',
        type: 'short_answer',
        prompt: `Explain a key idea in ${subject} appropriate for Grade ${gradeNum}.`,
        rubric: 'Clear, concise, grade-appropriate explanation with one example.'
      }
    ]
  };
}

function generateInsights(students: StudentRecord[], subjects: string[]) {
  const bySubject: Record<string, number[]> = {};
  subjects.forEach((s) => (bySubject[s] = []));
  students.forEach((st) => {
    subjects.forEach((s) => {
      const m = st.marks?.[s];
      if (typeof m === 'number') bySubject[s].push(m);
    });
  });
  const averages = Object.fromEntries(
    subjects.map((s) => {
      const arr = bySubject[s];
      const avg = arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
      return [s, avg];
    })
  );
  const weakest = Object.entries(averages).sort((a, b) => a[1] - b[1])[0]?.[0];
  return {
    averages,
    recommendations: weakest
      ? [`Students need reinforcement in ${weakest}. Provide extra practice sets and a mini-lesson.`]
      : ['Add marks to unlock insights.']
  };
}

function buildTimetable(subjects: string[]) {
  // Simple 5-day x 6-slot timetable
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const slots = 6;
  const schedule: { day: string; blocks: string[] }[] = [];
  let idx = 0;
  for (const d of days) {
    const blocks = Array.from({ length: slots }, () => subjects[(idx++) % subjects.length]);
    schedule.push({ day: d, blocks });
  }
  return schedule;
}

type StudentRecord = { id: string; name: string; section: string; marks: Record<string, number> };

type PersistedData = {
  objectives: ReturnType<typeof generateObjectives>;
  lessons: { id: string; title: string; description: string; subject: string }[];
  quizzes: { id: string; subject: string; payload: ReturnType<typeof generateQuiz> }[];
  students: StudentRecord[];
  timetable: { day: string; blocks: string[] }[];
};

const ClassWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const schoolType = (params.get('schoolType') || 'middle') as 'primary'|'middle'|'high';
  const gradeNum = Number(params.get('grade') || 7);
  const section = params.get('section') || 'General';

  // Add teacher/student view toggle
  const [teacherMode, setTeacherMode] = useState(true);

  const storageKey = useMemo(
    () => `workspace:${schoolType}:g${gradeNum}:s${section}`,
    [schoolType, gradeNum, section]
  );

  const subjects = useMemo(() => {
    const setupRaw = typeof window !== 'undefined' ? localStorage.getItem('teacherSetup') : null;
    if (setupRaw) {
      try {
        const setup = JSON.parse(setupRaw) as { schoolType?: string; classes?: { grade: number; sections: string[]; subjects?: string[] }[] };
        const cls = setup.classes?.find((c) => c.grade === gradeNum);
        const confirmed = cls?.subjects?.filter(Boolean) ?? [];
        if (confirmed.length) return confirmed;
      } catch {
        // ignore parse errors and fall back
      }
    }
    return suggestSubjects(schoolType, gradeNum);
  }, [schoolType, gradeNum]);

  const [data, setData] = useState<PersistedData | null>(null);
  const [newLesson, setNewLesson] = useState({ title: '', description: '', subject: subjects[0] || 'Math' });
  const [newStudent, setNewStudent] = useState({ name: '', section });

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) setData(JSON.parse(raw));
    else {
      // Initialize with defaults
      const init: PersistedData = {
        objectives: generateObjectives(gradeNum, subjects),
        lessons: [],
        quizzes: [],
        students: [],
        timetable: buildTimetable(subjects)
      };
      setData(init);
      localStorage.setItem(storageKey, JSON.stringify(init));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const save = (next: PersistedData) => {
    setData(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  if (!data) return null;

  const addLesson = () => {
    if (!newLesson.title.trim()) return;
    const next = { ...data, lessons: [...data.lessons, { id: crypto.randomUUID(), ...newLesson }] };
    save(next);
    setNewLesson({ title: '', description: '', subject: subjects[0] || 'Math' });
  };

  const addStudent = () => {
    if (!newStudent.name.trim()) return;
    const record: StudentRecord = { id: crypto.randomUUID(), name: newStudent.name.trim(), section, marks: {} };
    save({ ...data, students: [...data.students, record] });
    setNewStudent({ name: '', section });
  };

  const addMark = (studentId: string, subject: string, val: number) => {
    const nextStudents = data.students.map((s) =>
      s.id === studentId ? { ...s, marks: { ...s.marks, [subject]: Math.max(0, Math.min(100, val)) } } : s
    );
    save({ ...data, students: nextStudents });
  };

  const onGenerateQuiz = (subject: string) => {
    const payload = generateQuiz(subject, gradeNum);
    save({ ...data, quizzes: [...data.quizzes, { id: crypto.randomUUID(), subject, payload }] });
  };

  const onRegenerateObjectives = () => {
    save({ ...data, objectives: generateObjectives(gradeNum, subjects) });
  };

  const onRebuildTimetable = () => {
    save({ ...data, timetable: buildTimetable(subjects) });
  };

  const insights = generateInsights(data.students, subjects);

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
          <div className="flex items-center gap-4 mb-6">
            <Button variant="glass" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Class Workspace</h1>
              <p className="text-muted-foreground">{schoolType.toUpperCase()} • Grade {gradeNum} • Section {section}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant={teacherMode ? 'holographic' : 'glass'} size="sm" onClick={() => setTeacherMode(true)}>Teacher</Button>
              <Button variant={!teacherMode ? 'holographic' : 'glass'} size="sm" onClick={() => setTeacherMode(false)}>Student</Button>
              <Button variant="neon" onClick={() => localStorage.setItem(storageKey, JSON.stringify(data))}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </div>

          {/* Subjects + Objectives */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <GlassCard variant="primary">
              <GlassCardHeader>
                <GlassCardTitle>Subjects</GlassCardTitle>
                <GlassCardDescription>Auto-suggested based on school type and grade</GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-md bg-glass-secondary text-sm text-foreground border border-glass-border">{s}</span>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard variant="secondary">
              <GlassCardHeader>
                <GlassCardTitle>Learning Objectives</GlassCardTitle>
                <GlassCardDescription>Editable, AI-regenerable objectives</GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  {data.objectives.map((obj, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-glass-primary">
                      <div className="font-semibold text-foreground mb-2">{obj.subject}</div>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {obj.objectives.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="holographic" onClick={onRegenerateObjectives}>
                    <Brain className="w-4 h-4 mr-2" /> Regenerate Objectives
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Lesson Plans */}
          <GlassCard variant="primary" className="mb-8">
            <GlassCardHeader>
              <GlassCardTitle>Lesson Plans</GlassCardTitle>
              <GlassCardDescription>Add and manage your lessons</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid md:grid-cols-3 gap-3 mb-4">
                <Input placeholder="Title" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} />
                <Input placeholder="Description" value={newLesson.description} onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })} />
                <select className="bg-glass-secondary border border-glass-border rounded-md px-3 py-2 text-sm text-foreground" value={newLesson.subject} onChange={(e) => setNewLesson({ ...newLesson, subject: e.target.value })}>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mb-4">
                <Button variant="neon" onClick={addLesson}><Plus className="w-4 h-4 mr-2" />Add Lesson</Button>
                <Button variant="glass" onClick={() => navigate(`/lesson-planner?grade=${gradeNum}`)}><FileText className="w-4 h-4 mr-2" /> AI Lesson Planner</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {data.lessons.map((l) => (
                  <div key={l.id} className="p-4 bg-glass-secondary rounded-lg border border-glass-border">
                    <div className="text-sm text-muted-foreground">{l.subject}</div>
                    <div className="font-semibold text-foreground">{l.title}</div>
                    <div className="text-sm text-muted-foreground">{l.description}</div>
                  </div>
                ))}
                {!data.lessons.length && <div className="text-sm text-muted-foreground">No lessons yet.</div>}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Quizzes & Assignments */}
          <GlassCard variant="secondary" className="mb-8">
            <GlassCardHeader>
              <GlassCardTitle>Quizzes & Assignments</GlassCardTitle>
              <GlassCardDescription>Generate and manage assessments</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {subjects.map((s) => (
                  <Button key={s} variant="glass" onClick={() => onGenerateQuiz(s)}>
                    <ListChecks className="w-4 h-4 mr-2" /> Generate {s} Quiz
                  </Button>
                ))}
              </div>
              <div className="space-y-3">
                {data.quizzes.map((q) => (
                  <div key={q.id} className="p-4 bg-glass-primary rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">
                        📘 Quiz: {q.payload.meta.subject} – Grade {q.payload.meta.grade} – {String(q.payload.meta.difficulty).toString().charAt(0).toUpperCase() + String(q.payload.meta.difficulty).toString().slice(1)}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {q.payload.questions.map((qq: any, idx: number) => (
                        <div key={qq.id || idx} className="p-3 rounded-md bg-glass-secondary border border-glass-border">
                          <div className="text-sm font-medium text-foreground mb-2">Q{idx + 1}. {qq.prompt}</div>

                          {/* MCQ */}
                          {qq.type === 'multiple_choice' && (
                            <div className="space-y-2">
                              {qq.choices.map((c: string, i: number) => (
                                <label key={i} className="flex items-start gap-2 text-sm">
                                  <input type="radio" name={`q-${q.id}-${idx}`} className="mt-1" disabled={teacherMode} />
                                  <span>
                                    {c}
                                    {teacherMode && i === qq.answerIndex ? ' ✅' : ''}
                                  </span>
                                </label>
                              ))}
                              {teacherMode && qq.explanation && (
                                <div className="text-xs text-muted-foreground">Explanation: {qq.explanation}</div>
                              )}
                              {teacherMode && (
                                <div className="text-xs text-muted-foreground pt-1">Controls: ✏️ Edit Question | ➕ Add Option | 🗑️ Delete Option | 🔄 Change Correct Answer</div>
                              )}
                            </div>
                          )}

                          {/* Short Answer */}
                          {qq.type === 'short_answer' && (
                            <div className="space-y-2">
                              <Input placeholder="📝 Student Answer Box" />
                              {teacherMode && qq.rubric && (
                                <div className="text-xs text-muted-foreground">Rubric: {qq.rubric}</div>
                              )}
                              {teacherMode && (
                                <div className="text-xs text-muted-foreground pt-1">Controls: ✏️ Edit Question | 📝 Edit Rubric</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {!data.quizzes.length && <div className="text-sm text-muted-foreground">No quizzes yet.</div>}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Students */}
          <GlassCard variant="primary" className="mb-8">
            <GlassCardHeader>
              <GlassCardTitle>Students</GlassCardTitle>
              <GlassCardDescription>Add students and record marks</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid md:grid-cols-3 gap-3 mb-3">
                <Input placeholder="Student name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                <Input disabled value={section} />
                <Button variant="neon" onClick={addStudent}><Users className="w-4 h-4 mr-2" />Add Student</Button>
              </div>

              <div className="space-y-3">
                {data.students.map((st) => (
                  <div key={st.id} className="p-3 rounded-lg bg-glass-secondary border border-glass-border">
                    <div className="font-medium text-foreground mb-2">{st.name}</div>
                    <div className="grid md:grid-cols-3 gap-2">
                      {subjects.map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-24">{s}</span>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={st.marks?.[s] ?? ''}
                            onChange={(e) => addMark(st.id, s, Number(e.target.value))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {!data.students.length && <div className="text-sm text-muted-foreground">No students yet.</div>}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Timetable */}
          <GlassCard variant="secondary" className="mb-8">
            <GlassCardHeader>
              <GlassCardTitle>Timetable</GlassCardTitle>
              <GlassCardDescription>AI-generated, editable by teachers</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-muted-foreground">Day</th>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <th key={i} className="text-left p-2 text-muted-foreground">Block {i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.timetable.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-2 text-foreground font-medium">{row.day}</td>
                        {row.blocks.map((b, cIdx) => (
                          <td key={cIdx} className="p-2">
                            <Input value={b} onChange={(e) => {
                              const tt = data.timetable.map((rr, idx) => idx === rIdx ? { ...rr, blocks: rr.blocks.map((bb, j) => j === cIdx ? e.target.value : bb) } : rr);
                              save({ ...data, timetable: tt });
                            }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <Button variant="glass" onClick={onRebuildTimetable}><CalendarClock className="w-4 h-4 mr-2" /> Rebuild Timetable</Button>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Analytics */}
          <GlassCard variant="accent" glow>
            <GlassCardHeader>
              <GlassCardTitle>Analytics</GlassCardTitle>
              <GlassCardDescription>AI-generated insights based on marks</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-glass-primary border border-glass-border">
                  <div className="font-semibold text-foreground mb-2 flex items-center"><LineChart className="w-4 h-4 mr-2" /> Averages</div>
                  <pre className="text-xs text-foreground">{JSON.stringify(insights.averages, null, 2)}</pre>
                </div>
                <div className="p-4 rounded-lg bg-glass-primary border border-glass-border">
                  <div className="font-semibold text-foreground mb-2 flex items-center"><Brain className="w-4 h-4 mr-2" /> Recommendations</div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {insights.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ClassWorkspace;