// src/components/lms/InstructorAssistants.tsx

import { useState, useEffect } from 'react';
import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Mail, BookOpen, Loader2, UserX } from "lucide-react";
import { ExportExcelButton } from "@/components/common/ExportExcelButton";
import { assistantTeacherService } from '@/services/assistant-teacher.service';
import type { AssistantTeacher } from '@/types/assistant-teacher.types';
import { toast } from '@/hooks/use-toast';

// ✅ تحديد نوع البيانات القادمة من API
interface ApiAssistant {
  id: number;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  teacher_id: number;
  createdAt: string;
}

export function InstructorAssistants() {
  const { t, dir } = useApp();
  
  // ✅ State للبيانات
  const [assistants, setAssistants] = useState<ApiAssistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ State للـ Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAssistant, setNewAssistant] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    teacher_id: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ جلب البيانات من API
  const fetchAssistants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await assistantTeacherService.getAssistantTeachers();
      console.log('✅ API Response:', response);
      
      // ✅ التحقق من وجود data
      if (response && response.data) {
        setAssistants(response.data);
      } else {
        setAssistants([]);
      }
    } catch (err) {
      console.error('❌ Error fetching assistants:', err);
      setError('Failed to load assistants');
      toast.error('❌ فشل في تحميل المساعدين');
    } finally {
      setLoading(false);
    }
  };

  // ✅ جلب البيانات عند تحميل المكون
  useEffect(() => {
    fetchAssistants();
  }, []);

  // ✅ حذف مساعد
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this assistant?')) return;
    
    try {
      await assistantTeacherService.deleteAssistantTeacher(id);
      toast.success('✅ Assistant removed successfully');
      // ✅ تحديث القائمة
      fetchAssistants();
    } catch (err) {
      console.error('❌ Error deleting assistant:', err);
      toast.error('❌ Failed to remove assistant');
    }
  };

  // ✅ إضافة مساعد جديد
  const handleAddAssistant = async () => {
    // التحقق من الحقول
    if (!newAssistant.name || !newAssistant.email || !newAssistant.phone) {
      toast.error('⚠️ Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // ✅ استخدام service للإضافة
      await assistantTeacherService.createAssistantTeacher(newAssistant);
      toast.success('✅ Assistant added successfully');
      
      // ✅ إعادة تعيين النموذج
      setNewAssistant({ name: '', email: '', phone: '', password: '', teacher_id: 0 });
      setIsDialogOpen(false);
      
      // ✅ تحديث القائمة
      fetchAssistants();
    } catch (err) {
      console.error('❌ Error adding assistant:', err);
      toast.error('❌ Failed to add assistant');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ تنسيق التاريخ
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // ✅ عرض حالة التحميل
  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader
          title={t("assistants")}
          description="Manage teaching assistants helping you run your courses"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <span className="ml-3 text-lg text-gray-500">Loading assistants...</span>
        </div>
      </div>
    );
  }

  // ✅ عرض خطأ
  if (error) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader
          title={t("assistants")}
          description="Manage teaching assistants helping you run your courses"
        />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-red-500 text-lg font-semibold">❌ {error}</div>
          <Button 
            onClick={fetchAssistants} 
            className="mt-4 rounded-xl"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={t("assistants")}
        description="Manage teaching assistants helping you run your courses"
        actions={
          <div className="flex items-center gap-3">
            {/* ✅ زرار التصدير */}
            {assistants.length > 0 && (
              <ExportExcelButton
                data={assistants.map(a => ({
                  ID: a.id,
                  Name: a.name,
                  Email: a.email,
                  Phone: a.phone,
                  Status: a.active ? 'Active' : 'Inactive',
                  'Teacher ID': a.teacher_id,
                  'Created At': formatDate(a.createdAt),
                }))}
                fileName="assistants-list"
                label={t('export')}
              />
            )}
          
            {/* ✅ Dialog الإضافة */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl gradient-primary border-0 shadow-glow">
                  <Plus className="h-4 w-4" />
                  Add assistant
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Assistant Teacher</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>{t("name")} *</Label>
                    <Input 
                      placeholder="Full name" 
                      className="rounded-xl"
                      value={newAssistant.name}
                      onChange={(e) => setNewAssistant(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("email")} *</Label>
                    <Input 
                      type="email" 
                      placeholder="ta@example.com" 
                      className="rounded-xl"
                      value={newAssistant.email}
                      onChange={(e) => setNewAssistant(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input 
                      placeholder="Phone number" 
                      className="rounded-xl"
                      value={newAssistant.phone}
                      onChange={(e) => setNewAssistant(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input 
                      type="password" 
                      placeholder="Enter password (optional)" 
                      className="rounded-xl"
                      value={newAssistant.password}
                      onChange={(e) => setNewAssistant(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button 
                    className="rounded-xl gradient-primary border-0"
                    onClick={handleAddAssistant}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Assistant'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
    
      {/* ✅ عرض المساعدين من API */}
      {assistants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl">
          <UserX className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            No assistants found
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Click "Add assistant" to invite your first teaching assistant
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assistants.map((a) => (
            <Card key={a.id} className="group rounded-2xl border-border p-5 shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <AvatarBadge 
                  initials={a.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)} 
                  size="lg" 
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.active ? '🟢 Active' : '🔴 Inactive'}
                  </p>
                </div>
                {/* ✅ حالة النشاط */}
                <div className={`w-2 h-2 rounded-full ${a.active ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{a.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Teacher ID: {a.teacher_id}</span>
                </div>
                {a.createdAt && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>📅 Joined: {formatDate(a.createdAt)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    // TODO: فتح نموذج التعديل
                    toast.info('Edit functionality coming soon');
                  }}
                >
                  Manage
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(a.id)}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* ✅ إحصائيات */}
      {assistants.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-border pt-4">
          <span>Total: {assistants.length} assistants</span>
          <span>Active: {assistants.filter(a => a.active).length}</span>
        </div>
      )}
    </div>
  );
}