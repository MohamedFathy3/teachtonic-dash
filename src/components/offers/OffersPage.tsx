/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/offers/OffersPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOffers } from '@/hooks/useOffers';
import { OfferModal } from './OfferModal';
import { useApp } from '@/contexts/AppContext';
import { 
  Plus, Trash2, Edit, Gift, Percent, Calendar, Search, Filter, 
  Power, X, Image as ImageIcon, Tag, Clock, ChevronLeft, ChevronRight,
  TrendingUp, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast  } from "@/hooks/use-toast";
import api from '@/lib/api';

export const OffersPage: React.FC = () => {
  const { lang, user } = useApp();
  const isRTL = lang === 'ar';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // فلترات
  const [filterActive, setFilterActive] = useState<string>('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  
  const [offers, setOffers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { bulkDeleteOffers, toggleActive } = useOffers();

  // Debounce للبحث
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // جلب العروض (نوعها offer بس)
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchOffers = useCallback(async (page = 1) => {
    setIsLoading(false);
    try {
      const filters: any = {
        type: 'offer', // ✅ هنا الفلتر اللي يضمن يجيب العروض بس
      };
      
      if (debouncedSearch) {
        filters.search = debouncedSearch;
      }
      
      if (user?.id) {
        filters.teacher_id = user.id;
      }
      
      if (filterActive === 'active') {
        filters.active = true;
      } else if (filterActive === 'inactive') {
        filters.active = false;
      }
      
      if (filterFromDate) {
        filters.from_date = filterFromDate;
      }
      
      if (filterToDate) {
        filters.to_date = filterToDate;
      }
      
      const response = await api.post('/offer/index', {
        filters: filters,
        orderByDirection: 'desc',
        perPage: 12,
        page: page,
        paginate: true,
      });
      
     ('🎁 Offers Response:', response.data);
      
      setOffers(response.data?.data || []);
      setMeta(response.data?.meta || null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل العروض' : 'Error loading offers');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, user?.id, filterActive, filterFromDate, filterToDate, lang]);

  useEffect(() => {
    fetchOffers(1);
  }, [fetchOffers]);

  // حذف العروض المحددة
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(lang === 'ar' ? `حذف ${selectedIds.length} عرض؟` : `Delete ${selectedIds.length} offer(s)?`)) {
      await bulkDeleteOffers.mutateAsync(selectedIds);
      setSelectedIds([]);
      fetchOffers(currentPage);
    }
  };

  // تعديل عرض
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // تبديل حالة العرض
  const handleToggleActive = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleActive.mutateAsync(id);
    fetchOffers(currentPage);
  };

  // اختيار عرض
  const handleSelectOffer = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // اختيار الكل
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(offers.map((o: any) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  // إعادة تعيين الفلاتر
  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setFilterActive('');
    setFilterFromDate('');
    setFilterToDate('');
    setShowFilters(false);
  };

  // تطبيق الفلاتر
  const applyFilters = () => {
    fetchOffers(1);
    setShowFilters(false);
  };

  // Pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= (meta?.last_page || 1)) {
      fetchOffers(page);
      setSelectedIds([]);
    }
  };

  // إحصائيات
  const stats = {
    total: offers.length,
    active: offers.filter((o: any) => o.active === 1).length,
    expired: offers.filter((o: any) => o.end_date && new Date(o.end_date) < new Date()).length,
    totalDiscount: offers.reduce((sum, o) => sum + (parseInt(o.offer_discount) || 0), 0),
  };

  // حالة التحميل الأولي
  if (isLoading && offers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="p-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {lang === 'ar' ? 'عروض الخصم' : 'Discount Offers'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {lang === 'ar' ? 'إدارة عروض الخصم والكوبونات' : 'Manage discount offers and coupons'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">

            {/* حذف جماعي */}
            {selectedIds.length > 0 && (
              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                className="gap-2 rounded-xl shadow-md"
              >
                <Trash2 size={18} />
                {lang === 'ar' ? `حذف (${selectedIds.length})` : `Delete (${selectedIds.length})`}
              </Button>
            )}

            {/* بحث */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث عن عرض...' : 'Search offers...'}
                className="pl-9 pr-8 rounded-xl w-64 bg-white dark:bg-gray-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* زر الفلتر */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-xl ${showFilters ? 'bg-orange-600 text-white border-orange-600' : ''}`}
            >
              <Filter size={18} />
            </Button>

            {/* إضافة عرض */}
            <Button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md"
            >
              <Plus size={18} />
              {lang === 'ar' ? 'إضافة عرض' : 'Add Offer'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center bg-gradient-to-r from-orange-500/10 to-red-500/10 border-0">
            <Gift className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'إجمالي العروض' : 'Total Offers'}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-0">
            <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'عروض نشطة' : 'Active Offers'}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-r from-red-500/10 to-rose-500/10 border-0">
            <Clock className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold">{stats.expired}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'عروض منتهية' : 'Expired Offers'}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-0">
            <Percent className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalDiscount}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'إجمالي الخصومات' : 'Total Discount'}</p>
          </Card>
        </div>

        {/* لوحة الفلاتر */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="p-5 bg-white dark:bg-gray-800 border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div>
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <Power className="h-4 w-4 text-orange-500" />
                      {lang === 'ar' ? 'الحالة' : 'Status'}
                    </Label>
                    <select
                      value={filterActive}
                      onChange={(e) => setFilterActive(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border mt-1 bg-white dark:bg-gray-900"
                    >
                      <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                      <option value="active">✅ {lang === 'ar' ? 'نشط' : 'Active'}</option>
                      <option value="inactive">❌ {lang === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                    </select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      {lang === 'ar' ? 'من تاريخ' : 'From Date'}
                    </Label>
                    <Input
                      type="date"
                      value={filterFromDate}
                      onChange={(e) => setFilterFromDate(e.target.value)}
                      className="rounded-xl mt-1"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      {lang === 'ar' ? 'إلى تاريخ' : 'To Date'}
                    </Label>
                    <Input
                      type="date"
                      value={filterToDate}
                      onChange={(e) => setFilterToDate(e.target.value)}
                      className="rounded-xl mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
                  </Button>
                  <Button size="sm" onClick={applyFilters} className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl">
                    <Search className="h-4 w-4" />
                    {lang === 'ar' ? 'تطبيق' : 'Apply'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* اختيار الكل */}
        {offers.length > 0 && (
          <div className="flex items-center justify-end mb-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === offers.length && offers.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              {lang === 'ar' ? 'اختر الكل' : 'Select All'}
            </label>
          </div>
        )}

        {/* شبكة العروض */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {offers.map((offer: any, index: number) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300 dark:bg-gray-800 cursor-pointer border border-gray-100 dark:border-gray-700">
                  {/* الصورة */}
                  <div className="relative h-40 bg-gradient-to-r from-orange-500 to-red-500">
                    {offer.image?.fullUrl ? (
                      <img
                        src={offer.image.fullUrl}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Gift className="h-12 w-12 text-white/40" />
                        <span className="text-white/40 text-xs mt-2">No Image</span>
                      </div>
                    )}

                    {/* حالة النشاط */}
                    <div className="absolute top-2 right-2">
                      <Badge variant={offer.active ? "default" : "secondary"} className="gap-1 backdrop-blur-sm bg-black/50 border-none">
                        <span className={`w-1.5 h-1.5 rounded-full ${offer.active ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                        {offer.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-lg bg-black/60 hover:bg-black/80"
                        onClick={(e) => handleToggleActive(offer.id, e)}
                      >
                        <Power size={14} className="text-white" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-lg bg-black/60 hover:bg-black/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(offer);
                        }}
                      >
                        <Edit size={14} className="text-white" />
                      </Button>
                    </div>

                    {/* شارة الخصم */}
                    {offer.offer_discount && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-red-500 text-white border-none text-sm px-2 py-1 shadow-lg">
                          -{offer.offer_discount}%
                        </Badge>
                      </div>
                    )}

                    {/* حالة انتهاء العرض */}
                    {offer.end_date && new Date(offer.end_date) < new Date() && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle size={12} />
                          {lang === 'ar' ? 'منتهي' : 'Expired'}
                        </Badge>
                      </div>
                    )}

                    {/* Checkbox */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(offer.id)}
                          onChange={(e) => handleSelectOffer(offer.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-white/30 bg-white/20 checked:bg-orange-500 checked:border-orange-500"
                        />
                        <span className="text-xs text-white/80">{lang === 'ar' ? 'تحديد' : 'Select'}</span>
                      </div>
                    </div>
                  </div>

                  {/* معلومات العرض */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1 dark:text-white">
                      {offer.title}
                    </h3>
                    {offer.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {offer.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {offer.offer_discount && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Percent size={14} />
                            {lang === 'ar' ? 'الخصم' : 'Discount'}
                          </span>
                          <span className="font-bold text-red-500">-{offer.offer_discount}%</span>
                        </div>
                      )}
                      
                      {offer.start_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar size={14} />
                            {lang === 'ar' ? 'الفترة' : 'Period'}
                          </span>
                          <span className="text-xs">
                            {format(new Date(offer.start_date), 'dd/MM')} - {format(new Date(offer.end_date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      )}

                      {/* شريط تقدم الوقت المتبقي */}
                      {offer.end_date && new Date(offer.end_date) > new Date() && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{lang === 'ar' ? 'متبقي' : 'Remaining'}</span>
                            <span>{Math.ceil((new Date(offer.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} {lang === 'ar' ? 'يوم' : 'days'}</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                              style={{ 
                                width: `${Math.max(0, Math.min(100, ((new Date(offer.end_date).getTime() - new Date().getTime()) / (new Date(offer.end_date).getTime() - new Date(offer.start_date).getTime()) * 100)))}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400">
                        {format(new Date(offer.createdAt), 'dd/MM/yyyy', {
                          locale: lang === 'ar' ? arSA : enUS,
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* حالة عدم وجود بيانات */}
        {offers.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Gift size={48} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {lang === 'ar' ? 'لا توجد عروض' : 'No offers found'}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="mt-4 gap-2 rounded-xl"
            >
              <Plus size={18} />
              {lang === 'ar' ? 'أضف أول عرض' : 'Add First Offer'}
            </Button>
          </motion.div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <span className="text-sm">
              {currentPage} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === meta.last_page}
            >
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}

        {/* Modal للعروض */}
        <OfferModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            fetchOffers(currentPage);
            setSelectedIds([]);
          }}
          editingItem={editingItem}
          defaultType="offer"
        />
      </div>
    </div>
  );
};

export default OffersPage;