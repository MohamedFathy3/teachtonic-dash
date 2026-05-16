// src/components/admin/teachers/TeacherProfile.tsx
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import { ArrowLeft, Mail, Phone, Globe, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { teacherService } from '@/services/teacher.service';
import { useSectionCRUD } from '@/hooks/useWebsiteSection';
import { HeroSection } from '@/components/admin/teachers/sections/HeroSection';
import { AboutSection } from '@/components/admin/teachers/sections/AboutSection';
import { FeaturesSection } from '@/components/admin/teachers/sections/FeaturesSection';
import { StagesSection } from '@/components/admin/teachers/sections/StagesSection';
import { SubjectsSection } from '@/components/admin/teachers/sections/SubjectsSection';
import { FooterSection } from '@/components/admin/teachers/sections/FooterSection';
import type { HeroSection as HeroType, AboutSection as AboutType, FeatureSection as FeatureType, FooterSection as FooterType } from '@/types/section.types';

interface TeacherProfileProps {
  teacherId: number;
  onBack: () => void;
}

export function InstructorProfile({ teacherId, onBack }: TeacherProfileProps) {
  const { t, dir, lang } = useApp();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 كل قسم له hook خاص بيه (SRP + DIP)
  const heroCRUD = useSectionCRUD<HeroType>('hero', teacherId);
  const aboutCRUD = useSectionCRUD<AboutType>('about', teacherId);
  const featureCRUD = useSectionCRUD<FeatureType>('feature', teacherId);
  const footerCRUD = useSectionCRUD<FooterType>('footer', teacherId);

  // جلب بيانات المعلم
  useEffect(() => {
    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const data = await teacherService.getTeacher(teacherId);
        setTeacher(data);
        // جلب كل الأقسام
        await Promise.all([
          heroCRUD.fetchAll(),
          aboutCRUD.fetchAll(),
          featureCRUD.fetchAll(),
          footerCRUD.fetchAll(),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  const teacherName = lang === 'ar' && teacher.name_ar ? teacher.name_ar : teacher.name;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Header with Back Button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ms-2">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        Back to Teachers
      </Button>

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

      {/* Website Sections Tabs */}
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1 h-auto flex-nowrap">
          <TabsTrigger value="hero" className="rounded-xl px-4 py-2">Hero</TabsTrigger>
          <TabsTrigger value="about" className="rounded-xl px-4 py-2">About</TabsTrigger>
          <TabsTrigger value="features" className="rounded-xl px-4 py-2">Features</TabsTrigger>
          <TabsTrigger value="stages" className="rounded-xl px-4 py-2">Stages</TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-xl px-4 py-2">Subjects</TabsTrigger>
          <TabsTrigger value="footer" className="rounded-xl px-4 py-2">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6">
          <HeroSection
            items={heroCRUD.items}
            loading={heroCRUD.loading}
            onCreate={heroCRUD.create}
            onUpdate={heroCRUD.update}
            onDelete={heroCRUD.remove}
          />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <AboutSection
            items={aboutCRUD.items}
            loading={aboutCRUD.loading}
            onCreate={aboutCRUD.create}
            onUpdate={aboutCRUD.update}
            onDelete={aboutCRUD.remove}
          />
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <FeaturesSection
            items={featureCRUD.items}
            loading={featureCRUD.loading}
            onCreate={featureCRUD.create}
            onUpdate={featureCRUD.update}
            onDelete={featureCRUD.remove}
          />
        </TabsContent>

        <TabsContent value="stages" className="mt-6">
          <StagesSection stages={teacher.website?.stages || []} teacherId={teacherId} />
        </TabsContent>

        <TabsContent value="subjects" className="mt-6">
          <SubjectsSection subjects={teacher.website?.subjects || []} teacherId={teacherId} />
        </TabsContent>

        <TabsContent value="footer" className="mt-6">
          <FooterSection
            items={footerCRUD.items}
            loading={footerCRUD.loading}
            onCreate={footerCRUD.create}
            onUpdate={footerCRUD.update}
            onDelete={footerCRUD.remove}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}