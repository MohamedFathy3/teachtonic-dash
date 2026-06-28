/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/offers/BannersPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOffers } from '@/hooks/useOffers';
import { OfferModal } from './OfferModal';
import { useApp } from '@/contexts/AppContext';
import { 
  Plus, Trash2, Edit, Image as ImageIcon, Search, Filter, 
  Power, X, Calendar, ChevronLeft, ChevronRight, Link as LinkIcon,
  Eye, ExternalLink, LayoutGrid, TrendingUp
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

export const BannersPage: React.FC = () => {
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
  
  const [banners, setBanners] = useState<any[]>([]);
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

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchBanners = useCallback(async (page = 1) => {
    setIsLoading(false);
    try {
      const filters: any = {
        type: 'banner', // ✅ هنا الفلتر اللي يضمن يجيب البانرات بس
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
      
      const response = await api.post('/offer/index', {
        filters: filters,
        orderByDirection: 'desc',
        perPage: 12,
        page: page,
        paginate: true,
      });
      
     ('🎨 Banners Response:', response.data);
      
      setBanners(response.data?.data || []);
      setMeta(response.data?.meta || null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل البانرات' : 'Error loading banners');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, user?.id, filterActive, lang]);

  useEffect(() => {
    fetchBanners(1);
  }, [fetchBanners]);

  // حذف البانرات المحددة
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(lang === 'ar' ? `حذف ${selectedIds.length} بانر؟` : `Delete ${selectedIds.length} banner(s)?`)) {
      await bulkDeleteOffers.mutateAsync(selectedIds);
      setSelectedIds([]);
      fetchBanners(currentPage);
    }
  };

  // تعديل بانر
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // تبديل حالة البانر
  const handleToggleActive = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleActive.mutateAsync(id);
    fetchBanners(currentPage);
  };

  // اختيار بانر
  const handleSelectBanner = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // اختيار الكل
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(banners.map((b: any) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  // إعادة تعيين الفلاتر
  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setFilterActive('');
    setShowFilters(false);
  };

  // تطبيق الفلاتر
  const applyFilters = () => {
    fetchBanners(1);
    setShowFilters(false);
  };

  // Pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= (meta?.last_page || 1)) {
      fetchBanners(page);
      setSelectedIds([]);
    }
  };

  // فتح الرابط
  const openLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
  };

  // إحصائيات
  const stats = {
    total: banners.length,
    active: banners.filter((b: any) => b.active === 1).length,
  };

  // حالة التحميل الأولي
  if (isLoading && banners.length === 0) {
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {lang === 'ar' ? 'البانرات الترويجية' : 'Promotional Banners'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {lang === 'ar' ? 'إدارة البانرات الترويجية والإعلانات' : 'Manage promotional banners and ads'}
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
                placeholder={lang === 'ar' ? 'بحث عن بانر...' : 'Search banners...'}
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
              className={`rounded-xl ${showFilters ? 'bg-purple-600 text-white border-purple-600' : ''}`}
            >
              <Filter size={18} />
            </Button>

            {/* إضافة بانر */}
            <Button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md"
            >
              <Plus size={18} />
              {lang === 'ar' ? 'إضافة بانر' : 'Add Banner'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-0">
            <ImageIcon className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'إجمالي البانرات' : 'Total Banners'}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-0">
            <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'بانرات نشطة' : 'Active Banners'}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-0">
            <Eye className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{banners.filter((b: any) => b.url).length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'بها رابط' : 'With Links'}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div>
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <Power className="h-4 w-4 text-purple-500" />
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
                </div>

                <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
                  </Button>
                  <Button size="sm" onClick={applyFilters} className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">
                    <Search className="h-4 w-4" />
                    {lang === 'ar' ? 'تطبيق' : 'Apply'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* اختيار الكل */}
        {banners.length > 0 && (
          <div className="flex items-center justify-end mb-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === banners.length && banners.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              {lang === 'ar' ? 'اختر الكل' : 'Select All'}
            </label>
          </div>
        )}

        {/* شبكة البانرات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {banners.map((banner: any, index: number) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
                onClick={() => banner.url && openLink(banner.url, {} as any)}
              >
                <Card className="overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  {/* الصورة */}
                  <div className="relative h-48 bg-gradient-to-r from-purple-500 to-pink-500">
                    {banner.image?.fullUrl ? (
                      <img
                        src={banner.image.fullUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-white/40" />
                        <span className="text-white/40 text-xs mt-2">No Image</span>
                      </div>
                    )}

                    {/* حالة النشاط */}
                    <div className="absolute top-2 right-2">
                      <Badge variant={banner.active ? "default" : "secondary"} className="gap-1 backdrop-blur-sm bg-black/50 border-none">
                        <span className={`w-1.5 h-1.5 rounded-full ${banner.active ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                        {banner.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-lg bg-black/60 hover:bg-black/80"
                        onClick={(e) => handleToggleActive(banner.id, e)}
                      >
                        <Power size={14} className="text-white" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-lg bg-black/60 hover:bg-black/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(banner);
                        }}
                      >
                        <Edit size={14} className="text-white" />
                      </Button>
                    </div>

                    {/* شارة الرابط */}
                    {banner.url && (
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-blue-500/80 text-white border-none gap-1 backdrop-blur-sm">
                          <LinkIcon size={12} />
                          {lang === 'ar' ? 'رابط' : 'Link'}
                        </Badge>
                      </div>
                    )}

                    {/* Checkbox */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(banner.id)}
                          onChange={(e) => handleSelectBanner(banner.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-white/30 bg-white/20 checked:bg-purple-500 checked:border-purple-500"
                        />
                        <span className="text-xs text-white/80">{lang === 'ar' ? 'تحديد' : 'Select'}</span>
                      </div>
                    </div>
                  </div>

                  {/* معلومات البانر */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1 dark:text-white">
                      {banner.title}
                    </h3>
                    {banner.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {banner.description}
                      </p>
                    )}
                    
                    {/* الرابط */}
                    {banner.url && (
                      <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 mb-3">
                        <LinkIcon size={14} className="text-purple-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                          {banner.url}
                        </span>
                        <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
                      </div>
                    )}
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400">
                        {format(new Date(banner.createdAt), 'dd/MM/yyyy', {
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
        {banners.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ImageIcon size={48} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {lang === 'ar' ? 'لا توجد بانرات' : 'No banners found'}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="mt-4 gap-2 rounded-xl"
            >
              <Plus size={18} />
              {lang === 'ar' ? 'أضف أول بانر' : 'Add First Banner'}
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

        {/* Modal للبانرات */}
        <OfferModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            fetchBanners(currentPage);
            setSelectedIds([]);
          }}
          editingItem={editingItem}
          defaultType="banner"
        />
      </div>
    </div>
  );
};

export default BannersPage;