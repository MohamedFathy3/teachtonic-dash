// src/pages/Index.tsx

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { DashboardLayout } from "@/components/lms/DashboardLayout";
import { Navigate, useLocation, Outlet, useNavigate } from "react-router-dom";

// Admin Components
import { AdminOverview } from "./admin/AdminOverview";
import { AdminUsers } from "./admin/AdminUsers";
import { TeachersPage } from "./admin/AdminInstructors";
import { TeacherProfile } from "@/components/admin/teachers/TeacherProfile";
import { AdminCourses } from "./admin/AdminCourses";
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
import { InstructorBankQuestions } from "./instructor/InstructorBankQuestions";
import { InstructorContent } from "./instructor/InstructorContent";
import { InstructorAnalytics } from "./instructor/InstructorAnalytics";
import { InstructorEarnings } from "./instructor/InstructorEarnings";
import { InstructorAssistants } from "./instructor/InstructorAssistants";
import { InstructorWebsite } from "./instructor/InstructorWebsite";

// Shared Components
import { SettingsPage } from "./shared/SettingsPage";
import { PaymentCodesPage } from "@/components/admin/payment-codes/PaymentCodesPage";
import { CenterHoursPage } from "@/components/admin/center-hours/CenterHoursPage";
import { BooksPage } from "@/components/admin/books/BooksPage";
import { InstructorRedeemRequests } from "@/components/redeem-requests/RedeemRequestsPage";
import { SemestersPage } from "@/components/admin/SemestersPage";
import api from "@/lib/api"; // ✅ استيراد الـ api
import { useFavicon } from "@/hooks/useFavicon"; // ✅ استيراد الـ Hook

function LMSApp() {
  const { role, isLoading, isAuthenticated, user, instructorData } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
 useFavicon();
  // تحديث الـ active بناءً على المسار الحالي
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/instructor/exam")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive("exams");
    } else if (path.includes("/instructor/assignment")) {
      setActive("assignments");
    } else if (path.includes("/instructor/student")) {
      setActive("students");
    } else if (path.includes("/instructor/dashboard")) {
      setActive("dashboard");
    } else if (path.includes("/instructor/my-courses")) {
      setActive("my-courses");
    } else if (path.includes("/instructor/students")) {
      setActive("students");
    } else if (path.includes("/instructor/exams")) {
      setActive("exams");
    } else if (path.includes("/instructor/assignments")) {
      setActive("assignments");
    } else if (path.includes("/instructor/bank-questions")) {
      setActive("bank-questions");
    } else if (path.includes("/instructor/content")) {
      setActive("content");
    } else if (path.includes("/instructor/analytics")) {
      setActive("analytics");
    } else if (path.includes("/instructor/earnings")) {
      setActive("earnings");
    } else if (path.includes("/instructor/assistants")) {
      setActive("assistants");
    } else if (path.includes("/instructor/website")) {
      setActive("website");
    // } else if (path.includes("/instructor/payment-codes")) {
    //   setActive("payment-codes");
    } 
    else if (path.includes("/instructor/books")) {
      setActive("books");
    } else if (path.includes("/instructor/redeem-requests")) {
      setActive("redeem-requests");
    } else if (path.includes("/instructor/semesters")) {
      setActive("semesters");
    } else if (path.includes("/instructor/center-hours")) {
      setActive("center-hours");
    } else if (path.includes("/instructor/settings")) {
      setActive("settings");
    } else if (path.includes("/admin/dashboard")) {
      setActive("dashboard");
    } else if (path.includes("/admin/users")) {
      setActive("users");
    } else if (path.includes("/admin/stage")) {
      setActive("stage");
    } else if (path.includes("/admin/subject")) {
      setActive("subject");
    } else if (path.includes("/admin/instructors")) {
      setActive("instructors");
    } else if (path.includes("/admin/courses")) {
      setActive("courses");
    } else if (path.includes("/admin/reviews")) {
      setActive("reviews");
    } else if (path.includes("/admin/settings")) {
      setActive("settings");
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleNavigate = (to: string) => {
    setActive(to);
    if (role === "admin") {
      navigate(`/admin/${to}`);
    } else {
      navigate(`/instructor/${to}`);
    }
  };

  return (
    <DashboardLayout active={active} onNavigate={handleNavigate}>
      <Outlet />
    </DashboardLayout>
  );
}

export default LMSApp;