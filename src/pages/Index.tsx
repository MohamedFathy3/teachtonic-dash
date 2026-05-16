// src/pages/Index.tsx - التعديل الكامل

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { DashboardLayout } from "@/components/lms/DashboardLayout";
import { Navigate, useLocation, useNavigate, Routes, Route } from "react-router-dom";

// Admin Components
import { AdminOverview } from "./admin/AdminOverview";
import { AdminUsers } from "./admin/AdminUsers";
import { TeachersPage } from "./admin/AdminInstructors";
import { TeacherProfile } from "@/components/admin/teachers/TeacherProfile"; // 🔥 اسم صحيح
import { AdminCourses } from "./admin/AdminCourses";
import { AdminPayments } from "./admin/AdminPayments";
import { AdminReviews } from "./admin/AdminReviews";
import { StagesPage } from "./admin/StagesPage";
import { SubjectsPage } from "./admin/SubjectsPage";
import { AssistantTeachersPage } from "./admin/AssistantTeachersPage";
import { HeroesPage } from "./admin/HeroesPage";
import { FeaturesPage } from "./admin/FeaturesPage";
import { AboutsPage } from "./admin/AboutsPage";
import { FootersPage } from "./admin/FootersPage";

// Instructor Components
import { InstructorDashboard } from "./instructor/InstructorDashboard";
import { InstructorCourses } from "./instructor/InstructorCourses";
import { InstructorStudents } from "./instructor/InstructorStudents";
import { InstructorExams } from "./instructor/InstructorExams";
import { InstructorAssignments } from "./instructor/InstructorAssignments";
import { InstructorContent } from "./instructor/InstructorContent";
import { InstructorAnalytics } from "./instructor/InstructorAnalytics";
import { InstructorEarnings } from "./instructor/InstructorEarnings";
import { InstructorAssistants } from "./instructor/InstructorAssistants";
import { InstructorWebsite } from "./instructor/InstructorWebsite";

// Shared Components
import { SettingsPage } from "./shared/SettingsPage";
import { PaymentCodesPage } from "@/components/admin/payment-codes/PaymentCodesPage";
import { CenterHoursPage } from "@/components/admin/center-hours/CenterHoursPage";
import { AssignmentsPage } from "@/components/admin/assignments/AssignmentsPage";
import { BooksPage } from "@/components/admin/books/BooksPage";
import { InstructorRedeemRequests } from "@/components/redeem-requests/RedeemRequestsPage";
import { SemestersPage } from "@/components/admin/SemestersPage";

function AdminRoutes({ setActive, setSelectedInstructor }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const teacherId = params.get('teacherId');
  
  if (teacherId) {
    return (
      <TeacherProfile 
        teacherId={parseInt(teacherId)} 
        onBack={() => {
          navigate('/admin/instructors');
          setSelectedInstructor(null);
        }} 
      />
    );
  }
  
  return <TeachersPage />;
}

function LMSApp() {
  const { role, isLoading, isAuthenticated, user } = useApp();
  const [active, setActive] = useState("dashboard");
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setActive("dashboard");
    setSelectedInstructor(null);
  }, [role]);

  useEffect(() => {
    // Check URL for teacherId param
    const params = new URLSearchParams(location.search);
    const teacherId = params.get('teacherId');
    if (teacherId && role === 'admin') {
      setSelectedInstructor(parseInt(teacherId));
    }
  }, [location.search, role]);

  console.log('📍 LMSApp rendering:', { 
    isLoading, 
    isAuthenticated, 
    role, 
    user,
    pathname: location.pathname 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
          <div className="text-sm text-gray-500 mt-2">Please wait</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('🚫 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const renderPage = () => {
    console.log('🎨 Rendering page for role:', role, 'active:', active);
    
    if (role === "admin") {
      if (selectedInstructor !== null) {
        return (
       <TeacherProfile teacherId={selectedInstructor} onBack={() => setSelectedInstructor(null)} />

        );
      }
      
      switch (active) {
        case "dashboard": return <AdminOverview />;
        case "users": return <AdminUsers />;
        case "stage": return <StagesPage />;
        case "subject": return <SubjectsPage />;
        case "instructors": return <TeachersPage />;
        case "AssistantInstructors": return <AssistantTeachersPage />;
        case "hero": return <HeroesPage />;
        case "about": return <AboutsPage />;
        case "footer": return <FootersPage />;
        case "features": return <FeaturesPage />;
        case "courses": return <AdminCourses />;
        case "payments": return <AdminPayments />;
        case "reviews": return <AdminReviews />;
        case "settings": return <SettingsPage />;
        default: return <AdminOverview />;
      }
    }
    
    if (role === "teacher") {
      switch (active) {
        case "dashboard": return <InstructorDashboard />;
        case "my-courses": return <InstructorCourses />;
        case "students": return <InstructorStudents />;
        case "exams": return <InstructorExams />;
        // case "assignments": return <InstructorAssignments />;
        case "content": return <InstructorContent />;
        case "analytics": return <InstructorAnalytics />;
        case "earnings": return <InstructorEarnings />;
        case "assistants": return <InstructorAssistants />;
        case "website": return <InstructorWebsite />;
         case  "payment-codes": return <PaymentCodesPage />;
         case "assignments": return <AssignmentsPage />;
         case "books": return <BooksPage />;
         case "redeem-requests": return <InstructorRedeemRequests />;
case "semesters": return <SemestersPage />;


         case "center-hours": return <CenterHoursPage />;

        case "settings": return <SettingsPage />;
        
        default: return <InstructorDashboard />;
      }
    }
    
    return <Navigate to="/login" replace />;
  };

  return (
    <DashboardLayout active={active} onNavigate={setActive}>
      {renderPage()}
    </DashboardLayout>
  );
}

export default LMSApp;