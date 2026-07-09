/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/TeacherForm.tsx

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FileUploader from '@/components/FileUploader';
import { teacherService } from '@/services/teacher.service';
import type { TeacherFormData } from '@/types/teacher.types';
import { teacherToFormData } from '@/types/teacher.types';
import { 
  Loader2, 
  Check,
  User,
  Mail,
  Phone,
  Globe,
  Key,
  UserCircle2,
  Eye,
  EyeOff,
  FolderTree,
  BookMarked,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StagesSubjectsModal } from './StagesSubjectsModal';
import api from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherFormData) => Promise<void>;
  teacherId?: number | null;
  loading?: boolean;
}

export function TeacherForm({ open, onClose, onSubmit, teacherId, loading }: Props) {
  const { t, dir, lang } = useApp();
  
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    sub_domain: '.web-lec.com',
    phone: '',
    password: '',
    stage: [],
    subject: [],
    image: undefined,
  });
  
  const [fetchingTeacher, setFetchingTeacher] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // ✅ State للـ Modal الخاص بالمراحل والمواد
  const [showStagesModal, setShowStagesModal] = useState(false);

  // ✅ State لجلب أسماء المراحل والمواد
  const [stagesMap, setStagesMap] = useState<Map<number, any>>(new Map());
  const [subjectsMap, setSubjectsMap] = useState<Map<number, any>>(new Map());

  // ✅ جلب المراحل والمواد عند فتح الفورم
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب المراحل
        const stagesRes = await api.post('/stage/index', {
          perPage: 1000,
        });
        const stagesData = stagesRes.data?.data || [];
        const stagesMapData = new Map();
        stagesData.forEach((stage: any) => {
          stagesMapData.set(stage.id, stage);
        });
        setStagesMap(stagesMapData);

        // جلب المواد
        const subjectsRes = await api.post('/subject/index', {
          perPage: 1000,
        });
        const subjectsData = subjectsRes.data?.data || [];
        const subjectsMapData = new Map();
        subjectsData.forEach((subject: any) => {
          subjectsMapData.set(subject.id, subject);
        });
        setSubjectsMap(subjectsMapData);
      } catch (error) {
        console.error('Failed to fetch stages/subjects:', error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // جلب بيانات المعلم عند التعديل
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!open || !teacherId) return;
      
      setFetchingTeacher(true);
      try {
        const teacher = await teacherService.getTeacher(teacherId);
        const convertedData = teacherToFormData(teacher);
        
        // ✅ IMPORTANT: تأكد من أن كل مادة معاها stage_id
        const subjectsWithStage = convertedData.subject.map((subject: any) => ({
          ...subject,
          // لو المادة معاها stage من الـ API
          stage_id: subject.stage_id || subject.stage?.id || null
        }));
        
        setFormData({
          ...convertedData,
          sub_domain: convertedData.sub_domain || 'default',
          subject: subjectsWithStage // ✅ المواد مع stage_id
        });
        
        if (teacher.imageUrl) {
          setCurrentImageUrl(teacher.imageUrl);
        } else if (teacher.image?.fullUrl) {
          setCurrentImageUrl(teacher.image.fullUrl);
        } else if (teacher.image?.previewUrl) {
          setCurrentImageUrl(teacher.image.previewUrl);
        }
      } catch (error) {
        console.error('Failed to fetch teacher:', error);
      } finally {
        setFetchingTeacher(false);
      }
    };

    fetchTeacherData();
  }, [teacherId, open]);

  const handleImageUpload = (id: number) => {
    setFormData(prev => ({ ...prev, image: id }));
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ نتأكد أن المواد معاها stage_id قبل الإرسال
    const submitData = {
      ...formData,
      subject: formData.subject.map((s: any) => ({
        subject_id: s.subject_id,
        stage_id: s.stage_id || null
      }))
    };
    
    await onSubmit(submitData);
    
    if (!teacherId) {
      setFormData({
        name: '',
        email: '',
        sub_domain: 'default',
        phone: '',
        password: '',
        stage: [],
        subject: [],
        image: undefined,
      });
      setCurrentImageUrl(null);
      setImagePreview(null);
      setImageFile(null);
    }
    onClose();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ✅ تحديث البيانات من الـ Modal
  const handleStagesSubjectsUpdate = (stages: any[], subjects: any[]) => {
    // ✅ نتأكد أن كل مادة معاها stage_id
    const subjectsWithStage = subjects.map(subject => ({
      ...subject,
      // لو مفيش stage_id، حاول تجيبه من الـ stage object
      stage_id: subject.stage_id || subject.stage?.id || null
    }));
    
    setFormData(prev => ({
      ...prev,
      stage: stages,
      subject: subjectsWithStage,
    }));
  };

  // ✅ دوال لجلب الأسماء من الـ Map
  const getStageName = (stageId: number): string => {
    const stage = stagesMap.get(stageId);
    if (!stage) return `Stage #${stageId}`;
    
    if (lang === 'ar' && stage.name_ar) {
      return stage.name_ar;
    }
    return stage.name || `Stage #${stageId}`;
  };

  const getSubjectName = (subjectId: number): string => {
    const subject = subjectsMap.get(subjectId);
    if (!subject) return `Subject #${subjectId}`;
    
    if (lang === 'ar' && subject.name_ar) {
      return subject.name_ar;
    }
    return subject.name || `Subject #${subjectId}`;
  };

  // ✅ دالة جديدة لجلب اسم المرحلة للمادة
  const getSubjectStageName = (subject: any): string => {
    if (subject.stage_id) {
      const stage = stagesMap.get(subject.stage_id);
      if (stage) {
        return lang === 'ar' ? stage.name_ar : stage.name;
      }
    }
    return '';
  };

  if (fetchingTeacher) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading teacher data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teacherId ? 'Edit Teacher' : 'Add New Teacher'}
                </DialogTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {teacherId 
                    ? 'Update teacher information' 
                    : 'Create a new teacher account'}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-full">
                <UserCircle2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {teacherId ? 'Edit Mode' : 'New Mode'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* صورة المعلم */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Image
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Upload a profile photo
                </p>
              </div>
              <div className="lg:col-span-3">
                <div className="flex items-center gap-6">
                  {(currentImageUrl || imagePreview) && (
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                        <img
                          src={imagePreview || currentImageUrl || ''}
                          alt="Teacher"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <FileUploader
                      label={currentImageUrl ? 'Change Image' : 'Upload Image'}
                      onUploadSuccess={handleImageUpload}
                      onRemoveImage={handleRemoveImage}
                      multiple={false}
                      accept="image/*"
                      maxFiles={1}
                      uniqueId={`teacher-image-${teacherId || 'new'}`}
                    />
                    {imageFile && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* بيانات المعلم */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Full Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="John Doe"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="john@example.com"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  Sub Domain
                </Label>
                <div className="relative">
                  <Input
                    value={formData.sub_domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, sub_domain: e.target.value }))}
                    required
                    placeholder="default"
                    className="h-11 pr-24"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    .web-lec.com
                  </span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Phone Number
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  placeholder="+20123456789"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Key className="w-4 h-4 text-gray-400" />
                  Password {teacherId && <span className="text-xs text-gray-400 font-normal">(leave empty to keep current)</span>}
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={!teacherId}
                    placeholder={teacherId ? '••••••••' : 'Enter password'}
                    className="h-11 pr-12"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formData.password && formData.password.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          formData.password.length < 6 && "w-1/3 bg-red-500",
                          formData.password.length >= 6 && formData.password.length < 10 && "w-2/3 bg-yellow-500",
                          formData.password.length >= 10 && "w-full bg-green-500"
                        )}
                      />
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      formData.password.length < 6 && "text-red-500",
                      formData.password.length >= 6 && formData.password.length < 10 && "text-yellow-500",
                      formData.password.length >= 10 && "text-green-500"
                    )}>
                      {formData.password.length < 6 && 'Weak'}
                      {formData.password.length >= 6 && formData.password.length < 10 && 'Medium'}
                      {formData.password.length >= 10 && 'Strong'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ المراحل والمواد - زر واحد يفتح Modal */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-blue-500" />
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Stages & Subjects
                  </Label>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {formData.stage.length} stages · {formData.subject.length} subjects
                  </span>
                </div>
                <Button 
                  type="button"
                  onClick={() => setShowStagesModal(true)}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Manage Stages & Subjects
                </Button>
              </div>

              {/* ✅ عرض مختصر للمراحل والمواد المضافة مع الأسماء */}
              <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                {formData.stage.length === 0 && formData.subject.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No stages or subjects added yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Click the button above to manage stages and subjects
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* ✅ عرض المراحل بالأسماء */}
                    {formData.stage.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                          Stages ({formData.stage.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.stage.map((stage, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                            >
                              <FolderTree className="w-3 h-3" />
                              {getStageName(stage.stage_id)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* ✅ عرض المواد بالأسماء مع اسم المرحلة */}
                    {formData.subject.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                          Subjects ({formData.subject.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.subject.map((subject, idx) => {
                            const stageName = getSubjectStageName(subject);
                            return (
                              <span 
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                              >
                                <BookMarked className="w-3 h-3" />
                                {getSubjectName(subject.subject_id)}
                                {stageName && (
                                  <span className="text-[10px] text-purple-400 dark:text-purple-500">
                                    ({stageName})
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  teacherId ? 'Update Teacher' : 'Create Teacher'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ✅ الـ Modal الخاص بالمراحل والمواد */}
      <StagesSubjectsModal
        open={showStagesModal}
        onClose={() => setShowStagesModal(false)}
        initialStages={formData.stage}
        initialSubjects={formData.subject}
        onSave={handleStagesSubjectsUpdate}
      />
    </>
  );
}