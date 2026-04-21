import { useState, useEffect } from "react";
import { useApp, AppProvider } from "@/contexts/AppContext";
import { DashboardLayout } from "@/components/lms/DashboardLayout";

import { AdminOverview } from "./admin/AdminOverview";
import { AdminUsers } from "./admin/AdminUsers";
import { AdminInstructors } from "./admin/AdminInstructors";
import { InstructorProfile } from "./admin/InstructorProfile";
import { AdminCourses } from "./admin/AdminCourses";
import { AdminPayments } from "./admin/AdminPayments";
import { AdminReviews } from "./admin/AdminReviews";

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

import { SettingsPage } from "./shared/SettingsPage";

function LMSApp() {
  const { role } = useApp();
  const [active, setActive] = useState("dashboard");
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(null);

  // Reset to dashboard when switching roles
  useEffect(() => {
    setActive("dashboard");
    setSelectedInstructor(null);
  }, [role]);

  const renderPage = () => {
    if (role === "admin") {
      if (selectedInstructor !== null) {
        return <InstructorProfile instructorId={selectedInstructor} onBack={() => setSelectedInstructor(null)} />;
      }
      switch (active) {
        case "dashboard": return <AdminOverview />;
        case "users": return <AdminUsers />;
        case "instructors": return <AdminInstructors onSelectInstructor={(id) => setSelectedInstructor(id)} />;
        case "courses": return <AdminCourses />;
        case "payments": return <AdminPayments />;
        case "reviews": return <AdminReviews />;
        case "settings": return <SettingsPage />;
        default: return <AdminOverview />;
      }
    }
    // instructor
    switch (active) {
      case "dashboard": return <InstructorDashboard />;
      case "my-courses": return <InstructorCourses />;
      case "students": return <InstructorStudents />;
      case "exams": return <InstructorExams />;
      case "assignments": return <InstructorAssignments />;
      case "content": return <InstructorContent />;
      case "analytics": return <InstructorAnalytics />;
      case "earnings": return <InstructorEarnings />;
      case "assistants": return <InstructorAssistants />;
      case "website": return <InstructorWebsite />;
      case "settings": return <SettingsPage />;
      default: return <InstructorDashboard />;
    }
  };

  return (
    <DashboardLayout active={active} onNavigate={setActive}>
      {renderPage()}
    </DashboardLayout>
  );
}

const Index = () => (
  <AppProvider>
    <LMSApp />
  </AppProvider>
);

export default Index;
