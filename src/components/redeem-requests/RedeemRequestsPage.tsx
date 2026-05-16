/* eslint-disable react-hooks/set-state-in-effect */
// src/components/instructor/redeem-requests/InstructorRedeemRequests.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { redeemRequestService, type RedeemRequest } from '@/services/redeem-request.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Calendar,
  DollarSign,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

export const InstructorRedeemRequests: React.FC = () => {
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';

  // State
  const [requests, setRequests] = useState<RedeemRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Filter & Search state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Fetch data
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await redeemRequestService.getTeacherRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch redeem requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus);
    }
    if (filterType !== 'all') {
      result = result.filter(r => r.type === filterType);
    }
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(r =>
        r.student.name.toLowerCase().includes(lowerSearch) ||
        r.student.phone.includes(lowerSearch)
      );
    }
    // sort by newest first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [requests, filterStatus, filterType, debouncedSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterType, debouncedSearch, itemsPerPage]);

  // Handlers
  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await redeemRequestService.approveRequest(id);
      await fetchRequests(); // refresh
    } catch (error) {
      console.error('Approve failed:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      await redeemRequestService.rejectRequest(id);
      await fetchRequests();
    } catch (error) {
      console.error('Reject failed:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Helper: get type label and color
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'course':
        return { icon: '📚', label: lang === 'ar' ? 'كورس' : 'Course', color: 'from-blue-500 to-indigo-500' };
      case 'semester':
        return { icon: '📅', label: lang === 'ar' ? 'ترم' : 'Semester', color: 'from-purple-500 to-pink-500' };
      case 'lesson':
        return { icon: '📖', label: lang === 'ar' ? 'درس' : 'Lesson', color: 'from-orange-500 to-amber-500' };
      default:
        return { icon: '📦', label: type, color: 'from-gray-500 to-gray-600' };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('redeemRequests') || 'طلبات الاسترداد'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('redeemRequestsDesc') || 'مراجعة طلبات الشراء من الطلاب'}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={lang === 'ar' ? 'بحث باسم الطالب...' : 'Search by student...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64 rounded-xl"
            />
          </div>
          {/* Type filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 rounded-xl">
              <SelectValue placeholder={lang === 'ar' ? 'كل الأنواع' : 'All types'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === 'ar' ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="course">{lang === 'ar' ? 'كورس' : 'Course'}</SelectItem>
              <SelectItem value="semester">{lang === 'ar' ? 'ترم' : 'Semester'}</SelectItem>
              <SelectItem value="lesson">{lang === 'ar' ? 'درس' : 'Lesson'}</SelectItem>
            </SelectContent>
          </Select>
          {/* Status filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 rounded-xl">
              <SelectValue placeholder={lang === 'ar' ? 'كل الحالات' : 'All status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === 'ar' ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</SelectItem>
              <SelectItem value="approved">{lang === 'ar' ? 'مقبول' : 'Approved'}</SelectItem>
              <SelectItem value="rejected">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredRequests.length} {lang === 'ar' ? 'طلب' : 'requests'}
      </div>

      {/* Cards grid */}
      {paginatedRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{lang === 'ar' ? 'لا توجد طلبات' : 'No requests found'}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {paginatedRequests.map((req, idx) => {
              const typeInfo = getTypeInfo(req.type);
              const isPending = req.status === 'pending';
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="overflow-hidden rounded-2xl border shadow-lg hover:shadow-xl transition-all">
                    {/* Card header with type and status */}
                    <div className={`bg-gradient-to-r ${typeInfo.color} p-4 text-white`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <span className="font-semibold">{typeInfo.label}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-white/20 text-white border-white/30"
                        >
                          {req.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {req.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {req.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {req.status === 'pending'
                            ? (lang === 'ar' ? 'قيد الانتظار' : 'Pending')
                            : req.status === 'approved'
                            ? (lang === 'ar' ? 'مقبول' : 'Approved')
                            : (lang === 'ar' ? 'مرفوض' : 'Rejected')}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-3 border-b pb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{req.student.name}</p>
                          <p className="text-xs text-muted-foreground">{req.student.phone}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {t('price')}
                          </span>
                          <span className="font-bold text-primary">{req.price} EGP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {t('date')}
                          </span>
                          <span className="text-xs">{formatDate(req.created_at)}</span>
                        </div>
                        {req.course_id && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Course ID</span>
                            <span>{req.course_id}</span>
                          </div>
                        )}
                        {req.semester_id && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Semester ID</span>
                            <span>{req.semester_id}</span>
                          </div>
                        )}
                        {req.course_detail_id && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lesson ID</span>
                            <span>{req.course_detail_id}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-5 pt-0">
                      {isPending ? (
                        <div className="flex gap-3 w-full">
                          <Button
                            variant="default"
                            className="flex-1 gap-1 bg-green-500 hover:bg-green-600"
                            onClick={() => handleApprove(req.id)}
                            disabled={processingId === req.id}
                          >
                            {processingId === req.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ThumbsUp className="h-4 w-4" />
                            )}
                            {t('approve') || 'قبول'}
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1 gap-1"
                            onClick={() => handleReject(req.id)}
                            disabled={processingId === req.id}
                          >
                            {processingId === req.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ThumbsDown className="h-4 w-4" />
                            )}
                            {t('reject') || 'رفض'}
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full text-center text-xs text-muted-foreground">
                          {req.status === 'approved'
                            ? (lang === 'ar' ? '✓ تمت الموافقة على هذا الطلب' : '✓ Request approved')
                            : (lang === 'ar' ? '✗ تم رفض هذا الطلب' : '✗ Request rejected')}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{lang === 'ar' ? 'عرض' : 'Show'}</span>
            <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
            <span>{lang === 'ar' ? 'نتيجة' : 'results'}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {lang === 'ar' ? 'السابق' : 'Previous'}
            </Button>
            <span className="px-4 py-1 text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {lang === 'ar' ? 'التالي' : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};