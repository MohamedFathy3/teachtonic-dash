// src/App.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import AdminLoginPage from "./pages/login";
import Index from "./pages/Index";
import { TeacherProfileView } from "./pages/admin/TeacherProfileView";
import { AdminCourses } from "@/pages/admin/AdminCourses";
import { CourseDetails } from "@/pages/admin/CourseDetails";
import { ExamViewer } from "@/components/exams/ExamViewer";
import { StudentLearningPage } from "@/pages/instructor/StudentLearningPage";
import { InstructorExams } from "@/pages/instructor/InstructorExams";
import { InstructorAssignments } from "@/pages/instructor/InstructorAssignments";
import { AssignmentViewer } from "@/components/assignments/AssignmentViewer";
import { AssistantTeachersPage } from "./pages/admin/AssistantTeachersPage";
import { SubjectsPage } from "./pages/admin/SubjectsPage";
import { StagesPage } from "./pages/admin/StagesPage";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { TeachersPage } from "./pages/admin/AdminInstructors";
import { HeroesPage } from "./pages/admin/HeroesPage";
import { AboutsPage } from "./pages/admin/AboutsPage";
import { FootersPage } from "./pages/admin/FootersPage";
import { FeaturesPage } from "./pages/admin/FeaturesPage";
import { AdminReviews } from "./pages/admin/AdminReviews";
import { SettingsPage } from "./pages/shared/SettingsPage";

import { SemestersPage } from "./components/admin/SemestersPage";
import { BooksPage } from "./components/admin/books/BooksPage";
import { OffersPage } from "@/components/offers/OffersPage";
import { BannersPage } from "@/components/offers/BannersPage";
import { CenterHoursPage } from "./components/admin/center-hours/CenterHoursPage";
import { PaymentCodesPage } from "./components/admin/payment-codes/PaymentCodesPage";
import { InstructorRedeemRequests } from "./components/redeem-requests/RedeemRequestsPage";
import { InstructorAnalytics } from "./pages/instructor/InstructorAnalytics";
import { InstructorAssistants } from "./pages/instructor/InstructorAssistants";
import InstructorBankQuestions from "./pages/instructor/InstructorBankQuestions";
import { InstructorContent } from "./pages/instructor/InstructorContent";
import { InstructorCourses } from "./pages/instructor/InstructorCourses";
import { InstructorDashboard } from "./pages/instructor/InstructorDashboard";
import { InstructorEarnings } from "./pages/instructor/InstructorEarnings";
import InstructorStudents from "./pages/instructor/InstructorStudents";
import { InstructorWebsite } from "./pages/instructor/InstructorWebsite";
import { LessonDetailsPage } from "./pages/instructor/LessonDetailsPage";
import { BookDetailsPage } from "./pages/instructor/BookDetailsPage";
import { StudentAttendance } from "./pages/instructor/StudentAttendance";
import { MyAssistantPage } from "./pages/instructor/MyAssistantPage";
import SettingsPages from '@/pages/instructor/SettingsPage';
import SeoCountsPage from '@/pages/instructor/SeoCountsPage';
import { SemesterDetailsPage } from '@/pages/instructor/SemesterDetailsPage';
import { AttendancePage } from '@/pages/instructor/AttendancePage';


const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Login */}
              <Route path="/login" element={<AdminLoginPage />} />

              {/* Admin Routes - داخل Layout */}
              <Route path="/admin" element={<Index />}>
                <Route index element={<AdminOverview />} />
                <Route path="dashboard" element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="stage" element={<StagesPage />} />
                <Route path="subject" element={<SubjectsPage />} />
                <Route path="instructors" element={<TeachersPage />} />
                <Route path="AssistantInstructors" element={<AssistantTeachersPage />} />
                <Route path="hero" element={<HeroesPage />} />
                <Route path="about" element={<AboutsPage />} />
                <Route path="footer" element={<FootersPage />} />
                <Route path="features" element={<FeaturesPage />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="courses/:id" element={<CourseDetails />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="teachers/profile" element={<TeacherProfileView />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="role" element={<SettingsPage />} />

              </Route>

              {/* Instructor Routes - داخل Layout */}
              <Route path="/instructor" element={<Index />}>
                <Route index element={<InstructorDashboard />} />
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="my-courses" element={<InstructorCourses />} />
                <Route path="students" element={<InstructorStudents />} />
                <Route path="exams" element={<InstructorExams />} />
                <Route path="exam/:examId" element={<ExamViewer />} />
                <Route path="assignments" element={<InstructorAssignments />} />
                <Route path="/instructor/assignments/:assignmentId" element={<AssignmentViewer />} />
                <Route path="student/:studentId" element={<StudentLearningPage />} />
                <Route path="bank-questions" element={<InstructorBankQuestions />} />
                <Route path="content" element={<InstructorContent />} />
                <Route path="analytics" element={<InstructorAnalytics />} />
                <Route path="earnings" element={<InstructorEarnings />} />
                <Route path="assistants" element={<InstructorAssistants />} />
                <Route path="website" element={<InstructorWebsite />} />
                <Route path="payment-codes" element={<PaymentCodesPage />} />
                <Route path="books" element={<BooksPage />} />
                <Route path="redeem-requests" element={<InstructorRedeemRequests />} />
                <Route path="semesters" element={<SemestersPage />} />
                <Route path="center-hours" element={<CenterHoursPage />} />
                <Route path="lesson/:lessonId" element={<LessonDetailsPage />} />
                <Route path="books/:id" element={<BookDetailsPage />} />
                <Route path="AttendancePage" element={<AttendancePage />} />
                <Route path="offers" element={<OffersPage />} />
                <Route path="Notifications" element={<BannersPage />} />
                <Route path="attens" element={<StudentAttendance />} />
                <Route path="my-AssistantIns" element={<MyAssistantPage />} />
                <Route path="settings" element={<SettingsPages  />} />
                <Route path="seo-counts" element={<SeoCountsPage />} />
                <Route path="semesters/:id" element={<SemesterDetailsPage />} />

              </Route>

              {/* Fallback */}
              <Route path="*" element={<Index />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;