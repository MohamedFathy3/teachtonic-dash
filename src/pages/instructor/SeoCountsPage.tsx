// src/pages/admin/SeoCountsPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { seoCountsService } from '@/services/seo-counts.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Save, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3,
  Users,
  Share2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { SeoCounts, AboutResponse } from '@/types/seo.types';
import { FaFacebook, FaGoogle, FaTiktok, FaYoutube } from 'react-icons/fa';

// ✅ Component لعرض Count واحد
const CountCard = ({
  label,
  labelAr,
  value,
  icon: Icon,
  color,
  isRTL,
  onSave,
  saving,
}: {
  label: string;
  labelAr: string;
  value: string | null;
  icon: any;
  color: string;
  isRTL: boolean;
  onSave: (value: string) => void;
  saving: boolean;
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [isChanged, setIsChanged] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value || '');
    setIsChanged(false);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsChanged(newValue !== (value || ''));
  };

  const handleSave = () => {
    if (isChanged) {
      onSave(localValue);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
        isFocused 
          ? `border-${color}-500 shadow-lg shadow-${color}-500/20 bg-${color}-50/50 dark:bg-${color}-950/20` 
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {isRTL ? labelAr : label}
            </h3>
            <p className="text-sm text-gray-400">
              {isRTL ? 'عدد المتابعين' : 'Followers count'}
            </p>
          </div>
        </div>
        {isChanged && (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse">
            <AlertCircle className="h-3 w-3 mr-1" />
            {isRTL ? 'غير محفوظ' : 'Unsaved'}
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <Input
          type="text"
          value={localValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isRTL ? 'أدخل العدد' : 'Enter count'}
          className="text-lg font-medium"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">
            {isRTL ? 'آخر تحديث:' : 'Last updated:'}
            <span className="ml-1">
              {value ? new Date().toLocaleString() : (isRTL ? 'غير محدد' : 'Not set')}
            </span>
          </span>
          <Button
            variant={isChanged ? "default" : "outline"}
            onClick={handleSave}
            disabled={saving || !isChanged}
            size="sm"
            className={`transition-all duration-300 ${
              isChanged 
                ? `bg-gradient-to-r from-${color}-600 to-${color}-700 hover:from-${color}-700 hover:to-${color}-800 shadow-lg shadow-${color}-500/25` 
                : ''
            }`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className={`h-4 w-4 ${isChanged ? 'mr-2' : ''}`} />
            )}
            {isChanged ? (isRTL ? 'حفظ' : 'Save') : (isRTL ? 'محفوظ' : 'Saved')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// ✅ المكون الرئيسي
const SeoCountsPage = () => {
  const { lang } = useApp();
  const isRTL = lang === 'ar';
  const {user} = useApp()
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutData, setAboutData] = useState<AboutResponse | null>(null);
  const [counts, setCounts] = useState<SeoCounts>({
    facebook_count: null,
    google_count: null,
    tiktok_count: null,
    you_tube_count: null,
  });
  const [savingField, setSavingField] = useState<string | null>(null);

const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    const response = await seoCountsService.getAboutWithCounts({
      teacher_id: user.id
    });
    
    console.log('📦 About Data:', response);
    setAboutData(response);
    
    // ✅ استخراج البيانات من الـ response (سواء كانت array أو object)
    let aboutData = response.data;
    
    // إذا كانت البيانات array، نأخذ أول عنصر
    if (Array.isArray(aboutData) && aboutData.length > 0) {
      aboutData = aboutData[0];
    }
    
    // ✅ تعيين الـ Counts
    if (aboutData) {
      setCounts({
        facebook_count: aboutData.facebook_count || null,
        google_count: aboutData.google_count || null,
        tiktok_count: aboutData.tiktok_count || null,
        you_tube_count: aboutData.you_tube_count || null,
      });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    toast({
      title: isRTL ? 'خطأ' : 'Error',
      description: isRTL ? 'فشل تحميل البيانات' : 'Failed to load data',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
}, [isRTL]);

  // ✅ تحديث Count فردي
  const handleUpdateCount = useCallback(async (
    field: keyof SeoCounts,
    value: string
  ) => {
    try {
      setSavingField(field);
      setSaving(true);

      // ✅ تحديث الـ Count في الـ API
      await seoCountsService.updateSingleCount(
        aboutData?.data?.id || 1,
        field,
        value || null
      );

      // ✅ تحديث الـ state المحلي مباشرة (بدون fetchData)
      setCounts(prev => ({
        ...prev,
        [field]: value || null,
      }));

      // ✅ تحديث aboutData أيضاً للتأكد من الاتساق
      setAboutData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            [field]: value || null,
          }
        };
      });

      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL 
          ? `تم تحديث ${field.replace('_', ' ')} بنجاح` 
          : `${field.replace('_', ' ')} updated successfully`,
        variant: 'default',
      });

    } catch (error) {
      console.error('Error updating count:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل حفظ التغييرات' : 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
      setSavingField(null);
    }
  }, [aboutData, isRTL]);

  // ✅ حفظ الكل
  const handleSaveAll = useCallback(async () => {
    try {
      setSaving(true);
      
      const updates = [
        { field: 'facebook_count' as keyof SeoCounts, value: counts.facebook_count },
        { field: 'google_count' as keyof SeoCounts, value: counts.google_count },
        { field: 'tiktok_count' as keyof SeoCounts, value: counts.tiktok_count },
        { field: 'you_tube_count' as keyof SeoCounts, value: counts.you_tube_count },
      ];

      await seoCountsService.batchUpdateCounts(
        aboutData?.data?.id || 1,
        updates
      );

      // ✅ تحديث aboutData
      const updateData: Partial<SeoCounts> = {};
      updates.forEach(({ field, value }) => {
        updateData[field] = value;
      });

      setAboutData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            ...updateData,
          }
        };
      });

      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL 
          ? 'تم حفظ جميع الإحصائيات بنجاح' 
          : 'All statistics saved successfully',
        variant: 'default',
      });

    } catch (error) {
      console.error('Error saving all:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل حفظ التغييرات' : 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [counts, aboutData, isRTL]);

  // ✅ تحميل البيانات عند التهيئة
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ عرض التحميل
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <BarChart3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-600 animate-pulse" />
        </div>
        <p className="text-gray-500 animate-pulse">
          {isRTL ? 'جاري تحميل الإحصائيات...' : 'Loading statistics...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl -z-10"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isRTL ? 'إحصائيات التواصل الاجتماعي' : 'Social Media Statistics'}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                {isRTL 
                  ? 'إدارة إحصائيات المتابعين على منصات التواصل الاجتماعي'
                  : 'Manage follower statistics across social media platforms'
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Button 
              variant="outline" 
              onClick={fetchData}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
            
            <Button 
              onClick={handleSaveAll}
              disabled={saving || loading}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isRTL ? 'حفظ الكل' : 'Save All'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Counts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CountCard
          label="Facebook Count"
          labelAr="عدد متابعين فيسبوك"
          value={counts.facebook_count}
          icon={FaFacebook}
          color="blue"
          isRTL={isRTL}
          onSave={(value) => handleUpdateCount('facebook_count', value)}
          saving={savingField === 'facebook_count'}
        />

        <CountCard
          label="Google Count"
          labelAr="عدد متابعين جوجل"
          value={counts.google_count}
          icon={FaGoogle}
          color="red"
          isRTL={isRTL}
          onSave={(value) => handleUpdateCount('google_count', value)}
          saving={savingField === 'google_count'}
        />

        <CountCard
          label="TikTok Count"
          labelAr="عدد متابعين تيك توك"
          value={counts.tiktok_count}
          icon={FaTiktok}
          color="purple"
          isRTL={isRTL}
          onSave={(value) => handleUpdateCount('tiktok_count', value)}
          saving={savingField === 'tiktok_count'}
        />

        <CountCard
          label="YouTube Count"
          labelAr="عدد متابعين يوتيوب"
          value={counts.you_tube_count}
          icon={FaYoutube}
          color="red"
          isRTL={isRTL}
          onSave={(value) => handleUpdateCount('you_tube_count', value)}
          saving={savingField === 'you_tube_count'}
        />
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Card className="border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Share2 className="h-5 w-5" />
              {isRTL ? 'ملخص الإحصائيات' : 'Statistics Summary'}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? 'إجمالي المتابعين على جميع المنصات'
                : 'Total followers across all platforms'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl text-center">
                <FaFacebook className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {counts.facebook_count || 0}
                </p>
                <p className="text-xs text-gray-400">Facebook</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl text-center">
                <FaGoogle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">
                  {counts.google_count || 0}
                </p>
                <p className="text-xs text-gray-400">Google</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl text-center">
                <FaTiktok className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {counts.tiktok_count || 0}
                </p>
                <p className="text-xs text-gray-400">TikTok</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl text-center">
                <FaYoutube className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">
                  {counts.you_tube_count || 0}
                </p>
                <p className="text-xs text-gray-400">YouTube</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SeoCountsPage;