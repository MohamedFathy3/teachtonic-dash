import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";

const lazyNamed = (loader: () => Promise<Record<string, unknown>>, name: string) =>
  lazy(() => loader().then((module) => ({ default: module[name] as ComponentType })));

const AdminLoginPage = lazy(() => import("./pages/login"));
const Index = lazy(() => import("./pages/Index"));
const TeacherProfileView = lazyNamed(() => import("./pages/admin/TeacherProfileView"), "TeacherProfileView");
const AdminCourses = lazyNamed(() => import("@/pages/admin/AdminCourses"), "AdminCourses");
const CourseDetails = lazyNamed(() => import("@/pages/admin/CourseDetails"), "CourseDetails");
const ExamViewer = lazyNamed(() => import("@/components/exams/ExamViewer"), "ExamViewer");
const StudentLearningPage = lazyNamed(() => import("@/pages/instructor/StudentLearningPage"), "StudentLearningPage");
const InstructorExams = lazyNamed(() => import("@/pages/instructor/InstructorExams"), "InstructorExams");
const InstructorAssignments = lazyNamed(() => import("@/pages/instructor/InstructorAssignments"), "InstructorAssignments");
const AssignmentViewer = lazyNamed(() => import("@/components/assignments/AssignmentViewer"), "AssignmentViewer");
const AssistantTeachersPage = lazyNamed(() => import("./pages/admin/AssistantTeachersPage"), "AssistantTeachersPage");
const SubjectsPage = lazyNamed(() => import("./pages/admin/SubjectsPage"), "SubjectsPage");
const StagesPage = lazyNamed(() => import("./pages/admin/StagesPage"), "StagesPage");
const AdminUsers = lazyNamed(() => import("./pages/admin/AdminUsers"), "AdminUsers");
const AdminOverview = lazyNamed(() => import("./pages/admin/AdminOverview"), "AdminOverview");
const TeachersPage = lazyNamed(() => import("./pages/admin/AdminInstructors"), "TeachersPage");
const HeroesPage = lazyNamed(() => import("./pages/admin/HeroesPage"), "HeroesPage");
const AboutsPage = lazyNamed(() => import("./pages/admin/AboutsPage"), "AboutsPage");
const FootersPage = lazyNamed(() => import("./pages/admin/FootersPage"), "FootersPage");
const FeaturesPage = lazyNamed(() => import("./pages/admin/FeaturesPage"), "FeaturesPage");
const AdminReviews = lazyNamed(() => import("./pages/admin/AdminReviews"), "AdminReviews");
const SettingsPage = lazyNamed(() => import("./pages/shared/SettingsPage"), "SettingsPage");
const SemestersPage = lazyNamed(() => import("./components/admin/SemestersPage"), "SemestersPage");
const BooksPage = lazyNamed(() => import("./components/admin/books/BooksPage"), "BooksPage");
const OffersPage = lazyNamed(() => import("@/components/offers/OffersPage"), "OffersPage");
const BannersPage = lazyNamed(() => import("@/components/offers/BannersPage"), "BannersPage");
const CenterHoursPage = lazyNamed(() => import("./components/admin/center-hours/CenterHoursPage"), "CenterHoursPage");
const PaymentCodesPage = lazyNamed(() => import("./components/admin/payment-codes/PaymentCodesPage"), "PaymentCodesPage");
const InstructorRedeemRequests = lazyNamed(() => import("./components/redeem-requests/RedeemRequestsPage"), "InstructorRedeemRequests");
const InstructorAnalytics = lazyNamed(() => import("./pages/instructor/InstructorAnalytics"), "InstructorAnalytics");
const InstructorAssistants = lazyNamed(() => import("./pages/instructor/InstructorAssistants"), "InstructorAssistants");
const InstructorBankQuestions = lazy(() => import("./pages/instructor/InstructorBankQuestions"));
const InstructorContent = lazyNamed(() => import("./pages/instructor/InstructorContent"), "InstructorContent");
const InstructorCourses = lazyNamed(() => import("./pages/instructor/InstructorCourses"), "InstructorCourses");
const InstructorDashboard = lazyNamed(() => import("./pages/instructor/InstructorDashboard"), "InstructorDashboard");
const InstructorEarnings = lazyNamed(() => import("./pages/instructor/InstructorEarnings"), "InstructorEarnings");
const InstructorStudents = lazy(() => import("./pages/instructor/InstructorStudents"));
const InstructorWebsite = lazyNamed(() => import("./pages/instructor/InstructorWebsite"), "InstructorWebsite");
const LessonDetailsPage = lazyNamed(() => import("./pages/instructor/LessonDetailsPage"), "LessonDetailsPage");
const BookDetailsPage = lazyNamed(() => import("./pages/instructor/BookDetailsPage"), "BookDetailsPage");
const StudentAttendance = lazyNamed(() => import("./pages/instructor/StudentAttendance"), "StudentAttendance");
const MyAssistantPage = lazyNamed(() => import("./pages/instructor/MyAssistantPage"), "MyAssistantPage");
const SettingsPages = lazy(() => import("@/pages/instructor/SettingsPage"));
const SeoCountsPage = lazy(() => import("@/pages/instructor/SeoCountsPage"));
const SemesterDetailsPage = lazyNamed(() => import("@/pages/instructor/SemesterDetailsPage"), "SemesterDetailsPage");
const AttendancePage = lazyNamed(() => import("@/pages/instructor/AttendancePage"), "AttendancePage");
const WhatsAppSetup = lazy(() => import("@/pages/instructor/WhatsAppSetup"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center" aria-label="Loading">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<AdminLoginPage />} />
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
              <Route path="/instructor" element={<Index />}>
                <Route index element={<InstructorDashboard />} />
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="my-courses" element={<InstructorCourses />} />
                <Route path="students" element={<InstructorStudents />} />
                <Route path="exams" element={<InstructorExams />} />
                <Route path="exam/:examId" element={<ExamViewer />} />
                <Route path="assignments" element={<InstructorAssignments />} />
                <Route path="assignments/:assignmentId" element={<AssignmentViewer />} />
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
                <Route path="settings" element={<SettingsPages />} />
                <Route path="seo-counts" element={<SeoCountsPage />} />
                <Route path="semesters/:id" element={<SemesterDetailsPage />} />
                <Route path="whatsapp-setup" element={<WhatsAppSetup />} />
              </Route>
              <Route path="*" element={<Index />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
