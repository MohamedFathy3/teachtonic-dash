// src/components/exams/QuestionBankModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Loader2,
  Database,
  Search,
  BookOpen,
  Check,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import api from '@/lib/api';

interface BankQuestion {
  id: number;
  teacher: string;
  stage: string;
  subject: string;
  course_detail: string | null;
  question_type: 'true_false' | 'multiple_choice' | 'essay';
  question: string;
  mark: string;
  correct_answer: string | null;
  image: any;
  options: any[] | null; // ✅ Allow null
  createdAt: string;
}

interface QuestionBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: number;
  onImportSuccess: () => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  open,
  onOpenChange,
  examId,
  onImportSuccess,
}) => {
  const { t, lang, user, instructorData } = useApp();
  const isRTL = lang === 'ar';

  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [selectedBankQuestions, setSelectedBankQuestions] = useState<Set<number>>(new Set());
  const [bankFilters, setBankFilters] = useState({
    subject_id: '',
    stage_id: '',
    question_type: '',
    question: '',
  });
  const [bankPagination, setBankPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [selectedQuestion, setSelectedQuestion] = useState<BankQuestion | null>(null);
  const [questionDetailsOpen, setQuestionDetailsOpen] = useState(false);
  
  // ✅ Refs للسكرول
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ✅ الحصول على teacher_id المناسب
  const getTeacherId = (): number | null => {
    if (instructorData?.id) return instructorData.id;
    if (user?.id) return user.id;
    return null;
  };

  // ✅ جلب أسئلة البنك مع دعم البحث
  const fetchBankQuestions = async (page = 1) => {
    const teacherId = getTeacherId();
    
    if (!teacherId) {
      toast.error(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
      return;
    }

    setBankLoading(true);
    try {
      const filters: any = {};
      
      // ✅ إضافة فلتر البحث في النص
      if (bankFilters.question && bankFilters.question.trim()) {
        filters.question = bankFilters.question.trim();
      }
      
      if (bankFilters.subject_id) filters.subject_id = bankFilters.subject_id;
      if (bankFilters.stage_id) filters.stage_id = bankFilters.stage_id;
      if (bankFilters.question_type) filters.question_type = bankFilters.question_type;
      filters.teacher_id = teacherId;

      console.log('📤 Fetching with filters:', filters);

      const response = await api.post('/bank-questions/index', {
        filters,
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage: 10,
        paginate: true,
        delete: false,
        page,
      });

      const data = response.data;
      
      console.log('📥 Bank questions response:', data);
      
      // ✅ FIX: Check if data and meta exist before accessing
      if (data && data.status) {
        // ✅ Ensure data.data is an array
        const questions = Array.isArray(data.data) ? data.data : [];
        setBankQuestions(questions);
        
        // ✅ Safely set pagination with fallback values
        setBankPagination({
          current_page: data.meta?.current_page || 1,
          last_page: data.meta?.last_page || 1,
          per_page: data.meta?.per_page || 10,
          total: data.meta?.total || 0,
        });
        
        // ✅ إعادة السكرول للأعلى عند تغيير الصفحة
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      } else {
        // ✅ Handle case where status is false or data is missing
        setBankQuestions([]);
        setBankPagination({
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        });
        toast.error(data?.message || 'Failed to fetch questions');
      }
    } catch (error: any) {
      console.error('❌ Error fetching bank questions:', error);
      setBankQuestions([]);
      setBankPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      });
      toast.error(error.response?.data?.message || 'Error loading question bank');
    } finally {
      setBankLoading(false);
    }
  };

  // ✅ إضافة أسئلة مختارة من البنك
  const importSelectedQuestions = async () => {
    if (selectedBankQuestions.size === 0) {
      toast.error(lang === 'ar' ? 'يرجى اختيار سؤال واحد على الأقل' : 'Please select at least one question');
      return;
    }

    setBankLoading(true);
    try {
      const response = await api.post('/exams/add-questions-from-bank', {
        exam_id: examId,
        question_bank_ids: Array.from(selectedBankQuestions),
      });

      const data = response.data;
      
      if (data.status) {
        toast.success(lang === 'ar' ? 'تم إضافة الأسئلة بنجاح' : 'Questions imported successfully');
        setSelectedBankQuestions(new Set());
        onImportSuccess();
        onOpenChange(false);
      } else {
        toast.error(data.message || 'Failed to import questions');
      }
    } catch (error: any) {
      console.error('❌ Error importing questions:', error);
      toast.error(error.response?.data?.message || 'Error importing questions');
    } finally {
      setBankLoading(false);
    }
  };

  // ✅ تبديل اختيار سؤال
  const toggleBankQuestion = (id: number) => {
    const newSelected = new Set(selectedBankQuestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBankQuestions(newSelected);
  };

  // ✅ اختيار كل الأسئلة
  const selectAllBankQuestions = () => {
    if (selectedBankQuestions.size === bankQuestions.length) {
      setSelectedBankQuestions(new Set());
    } else {
      setSelectedBankQuestions(new Set(bankQuestions.map(q => q.id)));
    }
  };

  // ✅ عرض تفاصيل السؤال
  const openQuestionDetails = (question: BankQuestion) => {
    setSelectedQuestion(question);
    setQuestionDetailsOpen(true);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'true_false': return lang === 'ar' ? 'صح/خطأ' : 'True/False';
      case 'multiple_choice': return lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice';
      case 'essay': return lang === 'ar' ? 'مقالي' : 'Essay';
      default: return type;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'true_false': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'multiple_choice': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'essay': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ✅ إعادة تعيين الفلاتر
  const resetFilters = () => {
    setBankFilters({ subject_id: '', stage_id: '', question_type: '', question: '' });
    fetchBankQuestions(1);
  };

  // ✅ معالج البحث - إرسال الطلب عند الضغط على Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchBankQuestions(1);
    }
  };

  // ✅ معالج البحث - استخدام زر البحث
  const handleSearch = () => {
    fetchBankQuestions(1);
  };

  // ✅ فتح المودال
  useEffect(() => {
    if (open) {
      setSelectedBankQuestions(new Set());
      fetchBankQuestions(1);
    }
  }, [open]);

  return (
    <>
      {/* ✅ مودال بنك الأسئلة الرئيسي */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden rounded-2xl p-0 flex flex-col">
          {/* Header - ثابت في الأعلى */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 border-b rounded-t-2xl flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <Database className="h-6 w-6 text-indigo-500" />
                {lang === 'ar' ? 'بنك الأسئلة' : 'Question Bank'}
                <Badge variant="secondary" className="ml-2">
                  {bankPagination.total} {lang === 'ar' ? 'سؤال' : 'questions'}
                </Badge>
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {/* Filters - ثابت في المنتصف */}
            <div className="p-4 border-b bg-muted/20 flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={lang === 'ar' ? 'بحث في الأسئلة...' : 'Search questions...'}
                    value={bankFilters.question}
                    onChange={(e) => setBankFilters({ ...bankFilters, question: e.target.value })}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-9 rounded-xl"
                  />
                </div> */}
                <Select
                  value={bankFilters.subject_id || "all_subjects"}
                  onValueChange={(value) => setBankFilters({ 
                    ...bankFilters, 
                    subject_id: value === "all_subjects" ? "" : value 
                  })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={lang === 'ar' ? 'المادة' : 'Subject'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_subjects">{lang === 'ar' ? 'كل المواد' : 'All Subjects'}</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={bankFilters.stage_id || "all_stages"}
                  onValueChange={(value) => setBankFilters({ 
                    ...bankFilters, 
                    stage_id: value === "all_stages" ? "" : value 
                  })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={lang === 'ar' ? 'المرحلة' : 'Stage'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_stages">{lang === 'ar' ? 'كل المراحل' : 'All Stages'}</SelectItem>
                    <SelectItem value="First Secondary">First Secondary</SelectItem>
                    <SelectItem value="Second Secondary">Second Secondary</SelectItem>
                    <SelectItem value="Third Secondary">Third Secondary</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={bankFilters.question_type || "all_types"}
                  onValueChange={(value) => setBankFilters({ 
                    ...bankFilters, 
                    question_type: value === "all_types" ? "" : value 
                  })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={lang === 'ar' ? 'نوع السؤال' : 'Question Type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">{lang === 'ar' ? 'الكل' : 'All'}</SelectItem>
                    <SelectItem value="multiple_choice">{lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice'}</SelectItem>
                    <SelectItem value="true_false">{lang === 'ar' ? 'صح/خطأ' : 'True/False'}</SelectItem>
                    <SelectItem value="essay">{lang === 'ar' ? 'مقالي' : 'Essay'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetFilters}
                  className="rounded-xl"
                >
                  <X className="h-4 w-4 mr-2" />
                  {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSearch}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {lang === 'ar' ? 'بحث' : 'Search'}
                </Button>
              </div>
            </div>

            {/* ✅ قائمة الأسئلة مع Scroll - الجزء الذي يمكن التمرير */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 min-h-0"
              style={{ maxHeight: 'calc(100% - 180px)' }}
            >
              {bankLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : bankQuestions.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {lang === 'ar' ? 'لا توجد أسئلة في البنك' : 'No questions in the bank'}
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    {lang === 'ar' ? 'يمكنك إضافة أسئلة جديدة من خلال زر "إضافة سؤال"' : 'You can add new questions using the "Add Question" button'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3" ref={contentRef}>
                  <div className="flex items-center justify-between mb-4 sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={selectAllBankQuestions}
                      className="rounded-xl"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {selectedBankQuestions.size === bankQuestions.length && bankQuestions.length > 0
                        ? (lang === 'ar' ? 'إلغاء التحديد الكل' : 'Deselect All')
                        : (lang === 'ar' ? 'تحديد الكل' : 'Select All')}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {lang === 'ar' ? 'تم الاختيار' : 'Selected'}: {selectedBankQuestions.size}
                    </span>
                  </div>

                  {bankQuestions.map((q) => (
                    <Card
                      key={q.id}
                      className={`p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
                        selectedBankQuestions.has(q.id)
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                      }`}
                      onClick={() => toggleBankQuestion(q.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedBankQuestions.has(q.id)}
                          onCheckedChange={() => toggleBankQuestion(q.id)}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getQuestionTypeColor(q.question_type)}>
                              {getQuestionTypeLabel(q.question_type)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {q.subject}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {q.stage}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              🔖 {q.mark} {lang === 'ar' ? 'درجة' : 'mark'}
                            </Badge>
                          </div>
                          <p className="font-medium mt-2 line-clamp-2">{q.question}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>👨‍🏫 {q.teacher}</span>
                            <span>📅 {q.createdAt}</span>
                            {q.image && <span>📷 {lang === 'ar' ? 'يوجد صورة' : 'Has image'}</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuestionDetails(q);
                          }}
                          className="rounded-xl"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ Pagination - ثابت في الأسفل */}
            {bankPagination.last_page > 1 && (
              <div className="p-4 border-t flex-shrink-0 bg-background">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => {
                          if (bankPagination.current_page > 1) {
                            fetchBankQuestions(bankPagination.current_page - 1);
                          }
                        }}
                        className={bankPagination.current_page <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(bankPagination.last_page, 5))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === bankPagination.current_page}
                            onClick={() => fetchBankQuestions(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    {bankPagination.last_page > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => {
                          if (bankPagination.current_page < bankPagination.last_page) {
                            fetchBankQuestions(bankPagination.current_page + 1);
                          }
                        }}
                        className={bankPagination.current_page >= bankPagination.last_page ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 pt-0 gap-3 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6">
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={importSelectedQuestions} 
              disabled={selectedBankQuestions.size === 0 || bankLoading}
              className="rounded-xl px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bankLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              {lang === 'ar' 
                ? `استيراد (${selectedBankQuestions.size})` 
                : `Import (${selectedBankQuestions.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ مودال تفاصيل السؤال */}
      <Dialog open={questionDetailsOpen} onOpenChange={setQuestionDetailsOpen}>
        <DialogContent className="max-w-2xl rounded-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {lang === 'ar' ? 'تفاصيل السؤال' : 'Question Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getQuestionTypeColor(selectedQuestion.question_type)}>
                  {getQuestionTypeLabel(selectedQuestion.question_type)}
                </Badge>
                <Badge variant="outline">{selectedQuestion.subject}</Badge>
                <Badge variant="secondary">{selectedQuestion.stage}</Badge>
                <Badge variant="secondary">🔖 {selectedQuestion.mark} {lang === 'ar' ? 'درجة' : 'marks'}</Badge>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="font-medium text-lg">{selectedQuestion.question}</p>
              </div>
              {selectedQuestion.image && (
                <div className="rounded-xl overflow-hidden border">
                  <img 
                    src={selectedQuestion.image.previewUrl || selectedQuestion.image.fullUrl} 
                    alt="Question"
                    className="w-full max-h-64 object-contain"
                  />
                </div>
              )}
              {selectedQuestion.correct_answer && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✓ {lang === 'ar' ? 'الإجابة الصحيحة' : 'Correct Answer'}: {selectedQuestion.correct_answer}
                  </p>
                </div>
              )}
              {/* ✅ FIX: Check if options exist and is an array before mapping */}
              {selectedQuestion.options && Array.isArray(selectedQuestion.options) && selectedQuestion.options.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">{lang === 'ar' ? 'الخيارات' : 'Options'}</p>
                  {selectedQuestion.options.map((opt: any, idx: number) => (
                    <div key={idx} className={`p-2 rounded-lg flex items-center gap-2 ${
                      opt.is_correct ? 'bg-green-50 dark:bg-green-950/20 border border-green-200' : 'bg-muted/20'
                    }`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        opt.is_correct ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt.option_text}</span>
                      {opt.is_correct && <Check className="h-4 w-4 text-green-500 ml-auto" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setQuestionDetailsOpen(false)} className="rounded-xl">
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};