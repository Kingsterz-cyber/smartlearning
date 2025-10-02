import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import GradeSelection from "./pages/GradeSelection";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import SubjectView from "./pages/SubjectView";
import QuizView from "./pages/QuizView";
import QuizGenerator from "./pages/QuizGenerator";
import LessonPlanner from "./pages/LessonPlanner";
import StudentAnalytics from "./pages/StudentAnalytics";
import CurriculumUpdater from "./pages/CurriculumUpdater";
import AITutorHub from "./pages/AITutorHub";
import NotFound from "./pages/NotFound";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";
import TeacherSetup from "./pages/TeacherSetup";
import ClassWorkspace from "./pages/ClassWorkspace";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HoverReceiver />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/grade-selection" element={<GradeSelection />} />
          <Route path="/teacher-setup" element={<TeacherSetup />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/subject/:subjectId" element={<SubjectView />} />
          <Route path="/quiz/:subjectId" element={<QuizView />} />
          <Route path="/quiz-generator" element={<QuizGenerator />} />
          <Route path="/lesson-planner" element={<LessonPlanner />} />
          <Route path="/student-analytics" element={<StudentAnalytics />} />
          <Route path="/curriculum-updater" element={<CurriculumUpdater />} />
          <Route path="/ai-tutor-hub" element={<AITutorHub />} />
          <Route path="/class-workspace" element={<ClassWorkspace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;