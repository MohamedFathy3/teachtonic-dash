// src/pages/admin/TeacherProfileView.tsx

import { useLocation, useNavigate } from "react-router-dom";
import { TeacherProfile } from "@/components/admin/teachers/TeacherProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function TeacherProfileView() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const teacherId = location.state?.selectedInstructor;
  
  if (!teacherId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">No teacher selected</p>
        <Button onClick={() => navigate('/admin/instructors')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teachers
        </Button>
      </div>
    );
  }
  
  return (
    <TeacherProfile 
      teacherId={teacherId} 
      onBack={() => navigate('/admin/instructors')} 
    />
  );
}