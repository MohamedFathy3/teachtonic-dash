// src/App.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import AdminLoginPage from "./pages/login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TeacherProfileView } from "./pages/admin/TeacherProfileView";
import { AdminCourses } from "@/pages/admin/AdminCourses";
import { CourseDetails } from "@/pages/admin/CourseDetails";
import { ExamViewer } from "@/components/exams/ExamViewer";
import { StudentLearningPage } from "@/pages/instructor/StudentLearningPage";
import { InstructorExams } from "@/pages/instructor/InstructorExams";
import { DashboardLayout } from "./components/lms/DashboardLayout";
import { useState } from "react"; // 🔥 أضف هذا السطر
import AssignmentViewer from "./components/assignments/AssignmentViewer";

const queryClient = new QueryClient();

const App = () => {
  const [active, setActive] = useState("dashboard");

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Login - بدون layout */}
              <Route path="/login" element={<AdminLoginPage />} />

              {/* Admin Routes - مع DashboardLayout */}
              <Route
                path="/admin/*"
                element={
                    <Routes>
                      <Route path="teachers/profile" element={<TeacherProfileView />} />
                      <Route path="courses" element={<AdminCourses />} />
                      <Route path="courses/:id" element={<CourseDetails />} />
                      <Route path="*" element={<Index />} />
                    </Routes>
                }
              />

              {/* Instructor Routes - مع DashboardLayout */}
              <Route
                path="/instructor/*"
                element={
                    <Routes>
                      {/* <Route path="exams" element={<InstructorExams />} /> */}
                      <Route path="exam/:examId" element={<ExamViewer />} />
                        <Route path="/instructor/assignment/:assignmentId" element={<AssignmentViewer />} />
                      <Route path="student/:studentId" element={<StudentLearningPage />} />
                      <Route path="*" element={<Index />} />
                    </Routes>
                }
              />

              {/* Default Route */}
              <Route path="/*" element={<Index />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;