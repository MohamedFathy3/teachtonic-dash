// src/pages/admin/LessonDetailsPage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { 
  Loader2, 
  AlertCircle, 
  ChevronLeft, 
  Info, 
  Video, 
  FileQuestion, 
  ClipboardList, 
  Users, 
  CheckCircle2, 
  Eye,
  FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { examService } from '@/services/exam.service';
import { toast } from "@/hooks/use-toast";

// Hooks
import { useLessonData } from '@/hooks/useLessonData';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { useStudentFilters } from '@/hooks/useStudentFilters';
import { useAttendanceFilters } from '@/hooks/useAttendanceFilters';

// Components
import { LessonHeader } from '@/components/lesson-details/LessonHeader';
import { LessonStats } from '@/components/lesson-details/LessonStats';
import { LessonOverview } from '@/components/lesson-details/LessonOverview';
import { LessonVideos } from '@/components/lesson-details/LessonVideos';
import { LessonExams } from '@/components/lesson-details/LessonExams';
import { LessonAssignments } from '@/components/lesson-details/LessonAssignments';
import { LessonStudents } from '@/components/lesson-details/LessonStudents';
import { LessonAttendance } from '@/components/lesson-details/LessonAttendance';
import { LessonImageModal } from '@/components/lesson-details/LessonImageModal';
import { LessonExamModal } from '@/components/lesson-details/LessonExamModal';
import { LessonAssignmentModal } from '@/components/lesson-details/LessonAssignmentModal';
import { LessonAttendanceModal } from '@/components/lesson-details/LessonAttendanceModal';
import { LessonPDFViewer, LessonPDFThumbnail } from '@/components/lesson-details/LessonPDFViewer';

// Services
import { ExportService } from '@/services/export.service';
import { courseDetailService } from '@/services/course-detail.service';

// Types
import type { ExamDetail, Assignment } from '@/types/lesson.types';
import { fadeIn } from '@/utils/lesson/constants';
import { formatDate, formatDateTime } from '@/utils/lesson/formatters';
import { Card } from '@/components/ui/card';

export const LessonDetailsPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';
  const lessonIdNum = Number(lessonId);

  // ✅ Data Hooks
  const { lesson, loading, refetch } = useLessonData(lessonIdNum);
  const { attendanceData, attendanceStats, loading: attendanceLoading, refetch: refetchAttendance } = useAttendanceData(lessonIdNum);
  
  // ✅ Filter Hooks
  const studentFilters = useStudentFilters(lesson?.students);
  const attendanceFilters = useAttendanceFilters(attendanceData);

  // ✅ Local State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamDetail | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [examLoading, setExamLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  
  // ✅ Attendance Modal State
  const [studentIdInput, setStudentIdInput] = useState('');
  const [attendanceMarkLoading, setAttendanceMarkLoading] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState<{ studentName: string; status: string } | null>(null);

  // ✅ Stats
  const stats = {
    students: lesson?.students?.length || 0,
    activeStudents: lesson?.students?.filter(s => s.active).length || 0,
    onlineStudents: lesson?.students?.filter(s => s.type_of_attendance === 'online').length || 0,
    centerStudents: lesson?.students?.filter(s => s.type_of_attendance === 'center').length || 0,
    exams: lesson?.exams?.length || 0,
    assignments: lesson?.assignments?.length || 0,
    videos: lesson?.link_video?.filter(v => v?.trim()).length || 0,
    hasPDF: !!lesson?.pdf,
  };

  // ✅ Handlers
  const handleExportStudents = () => {
    ExportService.exportStudentsToExcel(
      studentFilters.filteredStudents,
      lessonId!,
      lang,
      lesson?.exams,
      lesson?.assignments
    );
  };

  const handleExportAttendance = () => {
    ExportService.exportAttendanceToExcel(
      attendanceFilters.filteredAttendance,
      lessonId!,
      lang
    );
  };

  const handleViewExam = async (examId: number) => {
    setExamLoading(true);
    try {
      const response = await examService.getExamById(examId);
      setSelectedExam(response);
      setIsExamModalOpen(true);
    } catch (error) {
      console.error('Error fetching exam:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل الامتحان' : 'Error loading exam');
    } finally {
      setExamLoading(false);
    }
  };

  const handleViewAssignment = (assignmentId: number) => {
    const assignment = lesson?.assignments?.find(a => a.id === assignmentId);
    setSelectedAssignment(assignment || null);
    setIsAssignmentModalOpen(true);
  };

  const handleMarkAttendance = async () => {
    if (!studentIdInput.trim()) {
      toast.error(lang === 'ar' ? 'الرجاء إدخال ID الطالب' : 'Please enter student ID');
      return;
    }

    setAttendanceMarkLoading(true);
    try {
      const foundStudent = lesson?.students?.find(s => s.id === parseInt(studentIdInput));
      
      await courseDetailService.markStudentAttendance(Number(lessonId), parseInt(studentIdInput));
      
      setAttendanceSuccess({
        studentName: foundStudent?.name || `ID: ${studentIdInput}`,
        status: lang === 'ar' ? 'تم تسجيل الحضور بنجاح' : 'Attendance recorded successfully'
      });
      
      setStudentIdInput('');
      
      setTimeout(() => {
        refetch();
        refetchAttendance();
        setAttendanceSuccess(null);
        setShowAttendanceModal(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تسجيل الحضور' : 'Error marking attendance');
    } finally {
      setAttendanceMarkLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(lang === 'ar' ? 'تم نسخ الرابط' : 'Link copied');
  };

  const getTitle = () => {
    if (isRTL && lesson?.titles_ar?.length) return lesson.titles_ar[0];
    if (lesson?.titles?.length) return lesson.titles[0];
    return '—';
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{lang === 'ar' ? 'جاري تحميل الدرس...' : 'Loading lesson...'}</p>
      </div>
    );
  }

  // ✅ Not Found State
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{lang === 'ar' ? 'الدرس غير موجود' : 'Lesson not found'}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
        </div>
      </div>
    );
  }

  const title = getTitle();

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="space-y-6 max-w-7xl mx-auto px-4 pb-8"
      >
        {/* ==================== Header ==================== */}
        <LessonHeader
          lesson={lesson}
          onBack={() => navigate(-1)}
          onCopyLink={handleCopyLink}
          onPrint={() => window.print()}
          onMarkAttendance={() => setShowAttendanceModal(true)}
          lang={lang}
          isRTL={isRTL}
          copied={copied}
        />

        {/* ==================== Hero Section with Image ==================== */}
        {lesson.image?.fullUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
            onClick={() => setSelectedImage(lesson.image?.fullUrl || null)}
          >
            <img 
              src={lesson.image.fullUrl} 
              alt={title} 
              className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-black/60 rounded-full p-3">
                <Eye className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== Stats Cards ==================== */}
        <LessonStats
          lesson={lesson}
          stats={stats}
          lang={lang}
        />

        {/* ==================== Tabs ==================== */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'نظرة عامة' : 'Overview'}</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="rounded-lg gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">🎬 {lang === 'ar' ? 'فيديوهات' : 'Videos'}</span>
              {stats.videos > 0 && <span className="h-5 w-5 p-0 text-[10px] bg-primary/10 rounded-full flex items-center justify-center">{stats.videos}</span>}
            </TabsTrigger>
            <TabsTrigger value="exams" className="rounded-lg gap-2">
              <FileQuestion className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'امتحانات' : 'Exams'}</span>
              {stats.exams > 0 && <span className="h-5 w-5 p-0 text-[10px] bg-primary/10 rounded-full flex items-center justify-center">{stats.exams}</span>}
            </TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-lg gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'واجبات' : 'Assignments'}</span>
              {stats.assignments > 0 && <span className="h-5 w-5 p-0 text-[10px] bg-primary/10 rounded-full flex items-center justify-center">{stats.assignments}</span>}
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded-lg gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'طلاب' : 'Students'}</span>
              {stats.students > 0 && <span className="h-5 w-5 p-0 text-[10px] bg-primary/10 rounded-full flex items-center justify-center">{stats.students}</span>}
            </TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-lg gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'الحضور' : 'Attendance'}</span>
              {attendanceStats.total > 0 && <span className="h-5 w-5 p-0 text-[10px] bg-primary/10 rounded-full flex items-center justify-center">{attendanceStats.total}</span>}
            </TabsTrigger>
            <TabsTrigger value="pdf" className="rounded-lg gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'PDF' : 'PDF'}</span>
              {stats.hasPDF && <span className="h-5 w-5 p-0 text-[10px] bg-primary/10 rounded-full flex items-center justify-center">1</span>}
            </TabsTrigger>
          </TabsList>

          {/* ==================== Overview Tab ==================== */}
          <TabsContent value="overview">
            <LessonOverview
              lesson={lesson}
              lang={lang}
              isRTL={isRTL}
            />
          </TabsContent>

          {/* ==================== Videos Tab ==================== */}
          <TabsContent value="videos">
            <LessonVideos
              videos={lesson.link_video || []}
              lang={lang}
            />
          </TabsContent>

          {/* ==================== Exams Tab ==================== */}
          <TabsContent value="exams">
            <LessonExams
              exams={lesson.exams || []}
              lang={lang}
              onViewExam={handleViewExam}
            />
          </TabsContent>

          {/* ==================== Assignments Tab ==================== */}
          <TabsContent value="assignments">
            <LessonAssignments
              assignments={lesson.assignments || []}
              lang={lang}
              onViewAssignment={handleViewAssignment}
            />
          </TabsContent>

          {/* ==================== Students Tab ==================== */}
          <TabsContent value="students">
            <LessonStudents
              students={lesson.students || []}
              filteredStudents={studentFilters.filteredStudents}
              stats={studentFilters.stats}
              filters={studentFilters.filters}
              setFilters={studentFilters.setFilters}
              showFilters={studentFilters.showFilters}
              setShowFilters={studentFilters.setShowFilters}
              clearFilters={studentFilters.clearFilters}
              hasActiveFilters={studentFilters.hasActiveFilters}
              onExport={handleExportStudents}
              lang={lang}
              formatDate={(date) => formatDate(date, lang)}
            />
          </TabsContent>

          {/* ==================== Attendance Tab ==================== */}
          <TabsContent value="attendance">
            <LessonAttendance
              attendanceData={attendanceData}
              attendanceStats={attendanceStats}
              loading={attendanceLoading}
              filters={attendanceFilters.filters}
              setFilters={attendanceFilters.setFilters}
              filteredAttendance={attendanceFilters.filteredAttendance}
              onExport={handleExportAttendance}
              lang={lang}
            />
          </TabsContent>

          {/* ==================== PDF Tab ==================== */}
          <TabsContent value="pdf">
            {lesson.pdf?.fullUrl ? (
              <div className="space-y-4">
                {/* PDF Thumbnail */}
                <LessonPDFThumbnail
                  pdfUrl={lesson.pdf.fullUrl}
                  pdfName={lesson.pdf.name || (lang === 'ar' ? 'ملف PDF' : 'PDF File')}
                  onClick={() => setShowPDF(true)}
                />

                {/* PDF Viewer Modal */}
                {showPDF && (
                  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <LessonPDFViewer
                      pdfUrl={lesson.pdf.fullUrl}
                      pdfName={lesson.pdf.name || (lang === 'ar' ? 'ملف PDF' : 'PDF File')}
                      onClose={() => setShowPDF(false)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {lang === 'ar' ? 'لا يوجد ملف PDF لهذا الدرس' : 'No PDF file for this lesson'}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* ==================== Image Modal ==================== */}
        <LessonImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />

        {/* ==================== Exam Modal ==================== */}
        <LessonExamModal
          open={isExamModalOpen}
          onClose={() => setIsExamModalOpen(false)}
          exam={selectedExam}
          loading={examLoading}
          lang={lang}
        />

        {/* ==================== Assignment Modal ==================== */}
        <LessonAssignmentModal
          open={isAssignmentModalOpen}
          onClose={() => setIsAssignmentModalOpen(false)}
          assignment={selectedAssignment}
          loading={assignmentLoading}
          lang={lang}
        />

        {/* ==================== Attendance Modal ==================== */}
        <LessonAttendanceModal
          open={showAttendanceModal}
          onClose={() => {
            setShowAttendanceModal(false);
            setStudentIdInput('');
            setAttendanceSuccess(null);
          }}
          onConfirm={handleMarkAttendance}
          studentId={studentIdInput}
          setStudentId={setStudentIdInput}
          loading={attendanceMarkLoading}
          success={attendanceSuccess}
          lessonTitle={title}
          students={lesson.students || []}
          lang={lang}
        />
      </motion.div>
    </TooltipProvider>
  );
};