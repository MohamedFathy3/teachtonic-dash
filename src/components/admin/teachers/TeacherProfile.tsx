/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-next/no-explicit-any */
// src/components/admin/teachers/TeacherProfile.tsx

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Loader2,
  FileText 
} from 'lucide-react';
import { teacherService } from '@/services/teacher.service';
import { teacherReportService } from '@/services/teacher-report.service';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { StagesSection } from './sections/StagesSection';
import { SubjectsSection } from './sections/SubjectsSection';
import { FooterSection } from './sections/FooterSection';
import { TeacherDashboard } from './TeacherDashboard';
import type { Teacher } from '@/types/teacher.types';

interface TeacherProfileProps {
  teacherId: number;
  onBack: () => void;
}

export function TeacherProfile({ teacherId, onBack }: TeacherProfileProps) {
  const { lang } = useApp();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for report date range and download status
  const [reportDateRange, setReportDateRange] = useState({
    from: '2025-01-01',
    to: '2027-12-31'
  });
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const data = await teacherService.getTeacher(teacherId);
        setTeacher(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

  // Handle PDF report download
  const handleDownloadReport = async () => {
    if (!reportDateRange.from || !reportDateRange.to) {
      console.error('Please select both from and to dates');
      return;
    }
    
    setDownloadingReport(true);
    try {
      await teacherReportService.downloadReportPdf(
        teacherId, 
        reportDateRange.from, 
        reportDateRange.to
      );
    } catch (error) {
      console.error('Error downloading report:', error);
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Teacher not found</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const teacherName = lang === 'ar' && (teacher as any).name_ar ? (teacher as any).name_ar : teacher.name;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Header with Back Button and Report Download */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ms-2">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          Back to Teachers
        </Button>
        
        {/* Report Section - Date Picker and Download Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
            <span className="text-xs text-muted-foreground font-medium">From:</span>
            <input
              type="date"
              value={reportDateRange.from}
              onChange={(e) => setReportDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="bg-transparent text-sm focus:outline-none rounded px-1"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
            <span className="text-xs text-muted-foreground font-medium">To:</span>
            <input
              type="date"
              value={reportDateRange.to}
              onChange={(e) => setReportDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="bg-transparent text-sm focus:outline-none rounded px-1"
            />
          </div>
          
          <Button
            onClick={handleDownloadReport}
            disabled={downloadingReport}
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-sm"
          >
            {downloadingReport ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {downloadingReport ? 'Generating PDF...' : 'Download Report PDF'}
          </Button>
        </div>
      </div>

      {/* Hero Card - Teacher Info */}
      <Card className="relative overflow-hidden rounded-3xl border-border shadow-soft">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 -mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="rounded-full ring-4 ring-card">
                <AvatarBadge initials={teacherName?.charAt(0) || 'T'} size="lg" className="h-24 w-24 text-2xl" />
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold">{teacherName}</h1>
                <p className="text-muted-foreground">{teacher.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{teacher.email}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{teacher.phone}</span>
                  <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{teacher.sub_domain}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {teacher.createdAt}</span>
                  <span className="flex items-center gap-1">
                    {teacher.active ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                    {teacher.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Tabs - Dashboard & Website Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1 h-auto flex-nowrap">
          <TabsTrigger value="dashboard" className="rounded-xl px-4 py-2">
            📊 Dashboard
          </TabsTrigger>
          <TabsTrigger value="hero" className="rounded-xl px-4 py-2">
            🌟 Hero
          </TabsTrigger>
          <TabsTrigger value="about" className="rounded-xl px-4 py-2">
            ℹ️ About
          </TabsTrigger>
          <TabsTrigger value="features" className="rounded-xl px-4 py-2">
            ✨ Features
          </TabsTrigger>
          <TabsTrigger value="stages" className="rounded-xl px-4 py-2">
            📚 Stages
          </TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-xl px-4 py-2">
            📖 Subjects
          </TabsTrigger>
          <TabsTrigger value="footer" className="rounded-xl px-4 py-2">
            🦶 Footer
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab - Static Data */}
        <TabsContent value="dashboard" className="mt-6">
          <TeacherDashboard teacherId={teacherId} teacherName={teacherName} />
        </TabsContent>

        {/* Hero Section Tab */}
        <TabsContent value="hero" className="mt-6">
          <HeroSection teacherId={teacherId} />
        </TabsContent>

        {/* About Section Tab */}
        <TabsContent value="about" className="mt-6">
          <AboutSection teacherId={teacherId} />
        </TabsContent>

        {/* Features Section Tab */}
        <TabsContent value="features" className="mt-6">
          <FeaturesSection teacherId={teacherId} />
        </TabsContent>

        {/* Stages Section Tab */}
        <TabsContent value="stages" className="mt-6">
          <StagesSection stages={teacher.website?.stages || []} teacherId={teacherId} />
        </TabsContent>

        {/* Subjects Section Tab */}
        <TabsContent value="subjects" className="mt-6">
          <SubjectsSection subjects={teacher.website?.subjects || []} />
        </TabsContent>

        {/* Footer Section Tab */}
        <TabsContent value="footer" className="mt-6">
          <FooterSection teacherId={teacherId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}