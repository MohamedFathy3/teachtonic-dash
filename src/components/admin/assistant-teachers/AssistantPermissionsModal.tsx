/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/assistant-teachers/AssistantPermissionsModal.tsx

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Plus, Pencil, Trash2, Save, X, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Permission {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface AssistantPermission {
  permission_id: number;
  permission_name: string;
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

interface AssistantPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  assistantId: number;
  assistantName: string;
  onSuccess?: () => void;
}

export function AssistantPermissionsModal({
  open,
  onClose,
  assistantId,
  assistantName,
  onSuccess,
}: AssistantPermissionsModalProps) {
  const { lang } = useApp();
  const isRTL = lang === 'ar';

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assistantPermissions, setAssistantPermissions] = useState<Record<number, AssistantPermission>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ جلب الصلاحيات المتاحة
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/access-control/permissions');
      if (response.data) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل تحميل الصلاحيات' : 'Failed to load permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ جلب صلاحيات المساعد الحالية - باستخدام الـ API الجديد
  const fetchAssistantPermissions = async () => {
    if (!assistantId) return;
    
    setLoading(true);
    try {
      // 🟢 استخدام الـ API الجديد مع POST
      const response = await api.post('/assistant-teachers/show-permissions', {
        assistant_teacher_id: assistantId
      });
      
      
      if (response.data?.permissions && Array.isArray(response.data.permissions)) {
        const perms: AssistantPermission[] = response.data.permissions;
        const permsMap: Record<number, AssistantPermission> = {};
        perms.forEach((p) => {
          permsMap[p.permission_id] = p;
        });
        setAssistantPermissions(permsMap);
      } else {
        console.warn('⚠️ Unexpected response structure:', response.data);
        // لو مفيش صلاحيات، نبدأ بكل الصلاحيات بقيمة false
        const emptyPerms: Record<number, AssistantPermission> = {};
        permissions.forEach((p) => {
          emptyPerms[p.id] = {
            permission_id: p.id,
            permission_name: p.name,
            view: false,
            create: false,
            update: false,
            delete: false,
          };
        });
        setAssistantPermissions(emptyPerms);
      }
    } catch (error) {
      console.error('Failed to fetch assistant permissions:', error);
      // لو مفيش صلاحيات، نبدأ بكل الصلاحيات بقيمة false
      const emptyPerms: Record<number, AssistantPermission> = {};
      permissions.forEach((p) => {
        emptyPerms[p.id] = {
          permission_id: p.id,
          permission_name: p.name,
          view: false,
          create: false,
          update: false,
          delete: false,
        };
      });
      setAssistantPermissions(emptyPerms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPermissions();
    }
  }, [open]);

  useEffect(() => {
    if (open && permissions.length > 0) {
      fetchAssistantPermissions();
    }
  }, [open, permissions]);

  // ✅ تحديث صلاحية معينة (بدون view)
  const updatePermission = (
    permissionId: number,
    field: 'create' | 'update' | 'delete',
    value: boolean
  ) => {
    setAssistantPermissions((prev) => {
      const current = prev[permissionId] || {
        permission_id: permissionId,
        permission_name: '',
        view: false,
        create: false,
        update: false,
        delete: false,
      };
      return {
        ...prev,
        [permissionId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  // ✅ حفظ الصلاحيات
  const handleSave = async () => {
    if (!assistantId) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'لم يتم العثور على المساعد' : 'Assistant not found',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // بناء الـ payload بالشكل المطلوب
      const permissionsPayload = Object.values(assistantPermissions).map((p) => ({
        permission_id: p.permission_id,
        view: p.view || false,
        create: p.create || false,
        update: p.update || false,
        delete: p.delete || false,
      }));

      const payload = {
        assistant_teacher_id: assistantId,
        permissions: permissionsPayload,
      };


      const response = await api.post('/assistant/permissions', payload);

      if (response.data?.message || response.status === 200 || response.status === 201) {
        toast({
          title: isRTL ? 'نجاح' : 'Success',
          description: isRTL
            ? `تم تحديث صلاحيات المساعد ${assistantName} بنجاح`
            : `Permissions updated successfully for ${assistantName}`,
        });
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to save permissions:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.errors?.permission_id?.[0] ||
                          (isRTL ? 'فشل حفظ الصلاحيات' : 'Failed to save permissions');
      
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ فلترة الصلاحيات
  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ ترجمة الأسماء
  const getPermissionLabel = (name: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      semesters: { ar: 'الفصول الدراسية', en: 'Semesters' },
      courses: { ar: 'الكورسات', en: 'Courses' },
      'course-details': { ar: 'تفاصيل الكورس', en: 'Course Details' },
      books: { ar: 'الكتب', en: 'Books' },
      exams: { ar: 'الامتحانات', en: 'Exams' },
      questions: { ar: 'الأسئلة', en: 'Questions' },
      'center-hours': { ar: 'ساعات السنتر', en: 'Center Hours' },
      offers: { ar: 'العروض', en: 'Offers' },
      'payment-codes': { ar: 'أكواد الدفع', en: 'Payment Codes' },
      'correct-answers': { ar: 'الإجابات الصحيحة', en: 'Correct Answers' },
    };
    return labels[name]?.[isRTL ? 'ar' : 'en'] || name;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            {isRTL ? 'صلاحيات المساعد' : 'Assistant Permissions'}
            <Badge variant="secondary" className="ml-2">
              {assistantName}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? 'قم بتحديد الصلاحيات التي يمتلكها المساعد (إضافة، تعديل، حذف)'
              : 'Set the permissions for the assistant (Create, Update, Delete)'}
          </DialogDescription>
        </DialogHeader>

        {/* 🔍 بحث */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={isRTL ? 'البحث عن صلاحية...' : 'Search permission...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        {/* ✅ قائمة الصلاحيات */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-500">
              {isRTL ? 'جاري تحميل الصلاحيات...' : 'Loading permissions...'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4">
            {filteredPermissions.map((permission) => {
              const perms = assistantPermissions[permission.id] || {
                permission_id: permission.id,
                permission_name: permission.name,
                view: false,
                create: false,
                update: false,
                delete: false,
              };

              return (
                <Card
                  key={permission.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm">
                      {getPermissionLabel(permission.name)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {permission.name}
                    </Badge>
                  </div>

                  {/* 🟢 3 أعمدة فقط (Create, Update, Delete) - بدون View */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* ➕ Create */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`create-${permission.id}`}
                        checked={perms.create}
                        onCheckedChange={(checked) =>
                          updatePermission(permission.id, 'create', !!checked)
                        }
                      />
                      <Label
                        htmlFor={`create-${permission.id}`}
                        className="text-xs cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        {isRTL ? 'إضافة' : 'Create'}
                      </Label>
                    </div>

                    {/* ✏️ Update */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`update-${permission.id}`}
                        checked={perms.update}
                        onCheckedChange={(checked) =>
                          updatePermission(permission.id, 'update', !!checked)
                        }
                      />
                      <Label
                        htmlFor={`update-${permission.id}`}
                        className="text-xs cursor-pointer flex items-center gap-1"
                      >
                        <Pencil className="h-3 w-3" />
                        {isRTL ? 'تعديل' : 'Update'}
                      </Label>
                    </div>

                    {/* 🗑️ Delete */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`delete-${permission.id}`}
                        checked={perms.delete}
                        onCheckedChange={(checked) =>
                          updatePermission(permission.id, 'delete', !!checked)
                        }
                      />
                      <Label
                        htmlFor={`delete-${permission.id}`}
                        className="text-xs cursor-pointer flex items-center gap-1 text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                        {isRTL ? 'حذف' : 'Delete'}
                      </Label>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* 📊 إحصائيات */}
        {!loading && permissions.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <span className="text-sm text-purple-700 dark:text-purple-300">
              {isRTL ? 'إجمالي الصلاحيات:' : 'Total Permissions:'}
              <Badge variant="secondary" className="ml-2">
                {permissions.length}
              </Badge>
            </span>
            <span className="text-sm text-purple-700 dark:text-purple-300">
              {isRTL ? 'المفعلة:' : 'Active:'}
              <Badge variant="default" className="ml-2 bg-green-500">
                {
                  Object.values(assistantPermissions).filter(
                    (p) => p.create || p.update || p.delete
                  ).length
                }
              </Badge>
            </span>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isRTL ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isRTL ? 'حفظ الصلاحيات' : 'Save Permissions'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}