/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/SettingsPage.tsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Save, 
  Globe, 
  Settings as SettingsIcon,
  Eye,
  Code,
  Share2,
  Search,
  Image as ImageIcon,
  Link,
  FileText,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Copy,
  RefreshCw,
  Zap,
  Lock,
  BarChart3,
  Smartphone,
  Monitor,
  LayoutGrid,
  MapPin,
  FolderOpen
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ البيانات الافتراضية
const DEFAULT_META_TAGS = {
  // General
  site_name: 'My Website',
  site_title: 'My Website | Home',
  site_description: 'Welcome to my website - The best platform for learning',
  site_url: 'https://example.com',
  site_keywords: 'website, blog, learning, courses',
  default_language: 'en',
  
  // Favicon (جديد)
  favicon: 'https://example.com/favicon.ico',
  favicon_svg: 'https://example.com/favicon.svg',
  favicon_32: 'https://example.com/favicon-32x32.png',
  favicon_16: 'https://example.com/favicon-16x16.png',
  favicon_apple: 'https://example.com/apple-touch-icon.png',
  favicon_android: 'https://example.com/android-chrome-192x192.png',
  favicon_ms: 'https://example.com/mstile-150x150.png',
  manifest_json: 'https://example.com/site.webmanifest',
  browserconfig_xml: 'https://example.com/browserconfig.xml',
  
  // SEO Basic
  seo_title: 'My Website - Best Learning Platform',
  seo_description: 'Learn programming, web development, and design with our comprehensive courses',
  seo_keywords: 'learning, courses, web development, programming, design',
  
  // OG Tags
  og_title: 'My Website - Learn Online',
  og_description: 'Join thousands of students learning web development and programming',
  og_image: 'https://via.placeholder.com/1200x630/6C63FF/FFFFFF?text=My+Website',
  og_image_width: '1200',
  og_image_height: '630',
  og_type: 'website',
  og_url: 'https://example.com',
  og_site_name: 'My Website',
  
  // Geo Tags
  geo_region: 'US-CA',
  geo_placename: 'San Francisco',
  geo_position: '37.7749; -122.4194',
  geo_icbm: '37.7749, -122.4194',
  
  // Canonical & Language
  canonical_url: 'https://example.com',
  language: 'en',
  
  // Twitter Card
  twitter_card: 'summary_large_image',
  
  // Social Media
  facebook_app_id: '123456789',
  facebook_page: 'https://facebook.com/mywebsite',
  twitter_username: '@mywebsite',
  instagram_url: 'https://instagram.com/mywebsite',
  youtube_url: 'https://youtube.com/c/mywebsite',
  linkedin_url: 'https://linkedin.com/company/mywebsite',
  
  // Analytics
  google_analytics_id: 'UA-123456789-1',
  google_tag_manager_id: 'GTM-XXXXXXX',
  facebook_pixel_id: '123456789',
  clarity_id: 'abcdefghij',
};

// ✅ المجموعات الافتراضية مع أيقونات محسنة
const DEFAULT_GROUPS = [
  {
    id: 'general',
    label: 'General',
    label_ar: 'عام',
    description: 'General site settings and configuration',
    description_ar: 'الإعدادات العامة وتكوين الموقع',
    icon: Globe,
    color: 'blue'
  },
  {
    id: 'favicon',
    label: 'Favicon & Icons',
    label_ar: 'أيقونة الموقع',
    description: 'Favicon and app icons for all devices',
    description_ar: 'أيقونة الموقع وتطبيقات الويب لجميع الأجهزة',
    icon: ImageIcon,
    color: 'orange'
  },
  {
    id: 'seo',
    label: 'SEO & Meta',
    label_ar: 'SEO والوصف',
    description: 'Search engine optimization and meta tags',
    description_ar: 'تحسين محركات البحث والعلامات الوصفية',
    icon: Search,
    color: 'purple'
  },
  {
    id: 'geo',
    label: 'Geo & Location',
    label_ar: 'الجغرافيا والموقع',
    description: 'Geolocation and regional settings',
    description_ar: 'إعدادات الموقع الجغرافي والمنطقة',
    icon: MapPin,
    color: 'emerald'
  },
  {
    id: 'social',
    label: 'Social Media',
    label_ar: 'وسائل التواصل',
    description: 'Social media integration and sharing',
    description_ar: 'تكامل وسائل التواصل الاجتماعي',
    icon: Share2,
    color: 'pink'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    label_ar: 'التحليلات',
    description: 'Analytics and tracking codes',
    description_ar: 'التحليلات وأكواد التتبع',
    icon: BarChart3,
    color: 'green'
  }
];

// ✅ الحقول الافتراضية مع إضافة favicon
const DEFAULT_FIELDS = [
  // General
  { key: 'site_name', group: 'general', type: 'text', label: 'Site Name', label_ar: 'اسم الموقع', placeholder: 'Enter site name', placeholder_ar: 'أدخل اسم الموقع', required: true },
  { key: 'site_title', group: 'general', type: 'text', label: 'Site Title', label_ar: 'عنوان الموقع', placeholder: 'Enter site title', placeholder_ar: 'أدخل عنوان الموقع', required: true },
  { key: 'site_description', group: 'general', type: 'textarea', label: 'Site Description', label_ar: 'وصف الموقع', placeholder: 'Enter site description', placeholder_ar: 'أدخل وصف الموقع', required: false },
  { key: 'site_url', group: 'general', type: 'url', label: 'Site URL', label_ar: 'رابط الموقع', placeholder: 'Enter site URL', placeholder_ar: 'أدخل رابط الموقع', required: false },
  { key: 'site_keywords', group: 'general', type: 'text', label: 'Keywords', label_ar: 'الكلمات المفتاحية', placeholder: 'Enter keywords separated by comma', placeholder_ar: 'أدخل الكلمات المفتاحية مفصولة بفواصل', required: false },
  { key: 'default_language', group: 'general', type: 'text', label: 'Default Language', label_ar: 'اللغة الافتراضية', placeholder: 'en/ar', placeholder_ar: 'en/ar', required: false },
  
  // Favicon - أيقونات الموقع
  { key: 'favicon', group: 'favicon', type: 'image', label: 'Favicon (.ico)', label_ar: 'أيقونة الموقع .ico', placeholder: 'https://example.com/favicon.ico', placeholder_ar: 'https://example.com/favicon.ico', required: false },
  { key: 'favicon_svg', group: 'favicon', type: 'image', label: 'Favicon SVG', label_ar: 'أيقونة SVG', placeholder: 'https://example.com/favicon.svg', placeholder_ar: 'https://example.com/favicon.svg', required: false },
  { key: 'favicon_32', group: 'favicon', type: 'image', label: 'Favicon 32x32 PNG', label_ar: 'أيقونة 32×32', placeholder: 'https://example.com/favicon-32x32.png', placeholder_ar: 'https://example.com/favicon-32x32.png', required: false },
  { key: 'favicon_16', group: 'favicon', type: 'image', label: 'Favicon 16x16 PNG', label_ar: 'أيقونة 16×16', placeholder: 'https://example.com/favicon-16x16.png', placeholder_ar: 'https://example.com/favicon-16x16.png', required: false },
  { key: 'favicon_apple', group: 'favicon', type: 'image', label: 'Apple Touch Icon', label_ar: 'أيقونة آبل (iPhone)', placeholder: 'https://example.com/apple-touch-icon.png', placeholder_ar: 'https://example.com/apple-touch-icon.png', required: false },
  { key: 'favicon_android', group: 'favicon', type: 'image', label: 'Android Chrome Icon', label_ar: 'أيقونة أندرويد', placeholder: 'https://example.com/android-chrome-192x192.png', placeholder_ar: 'https://example.com/android-chrome-192x192.png', required: false },
  { key: 'favicon_ms', group: 'favicon', type: 'image', label: 'MS Tile Icon', label_ar: 'أيقونة مايكروسوفت', placeholder: 'https://example.com/mstile-150x150.png', placeholder_ar: 'https://example.com/mstile-150x150.png', required: false },
  { key: 'manifest_json', group: 'favicon', type: 'url', label: 'Web Manifest', label_ar: 'ملف المانيفست', placeholder: 'https://example.com/site.webmanifest', placeholder_ar: 'https://example.com/site.webmanifest', required: false },
  { key: 'browserconfig_xml', group: 'favicon', type: 'url', label: 'Browser Config', label_ar: 'ملف إعدادات المتصفح', placeholder: 'https://example.com/browserconfig.xml', placeholder_ar: 'https://example.com/browserconfig.xml', required: false },
  
  // SEO Basic
  { key: 'seo_title', group: 'seo', type: 'text', label: 'SEO Title', label_ar: 'عنوان SEO', placeholder: 'Enter SEO title', placeholder_ar: 'أدخل عنوان SEO', required: true },
  { key: 'seo_description', group: 'seo', type: 'textarea', label: 'SEO Description', label_ar: 'وصف SEO', placeholder: 'Enter SEO description', placeholder_ar: 'أدخل وصف SEO', required: true },
  { key: 'seo_keywords', group: 'seo', type: 'text', label: 'SEO Keywords', label_ar: 'كلمات SEO المفتاحية', placeholder: 'Enter SEO keywords', placeholder_ar: 'أدخل كلمات SEO المفتاحية', required: false },
  
  // OG Tags
  { key: 'og_title', group: 'seo', type: 'text', label: 'OG Title', label_ar: 'عنوان OG', placeholder: 'Enter OG title', placeholder_ar: 'أدخل عنوان OG', required: false },
  { key: 'og_description', group: 'seo', type: 'textarea', label: 'OG Description', label_ar: 'وصف OG', placeholder: 'Enter OG description', placeholder_ar: 'أدخل وصف OG', required: false },
  { key: 'og_image', group: 'seo', type: 'image', label: 'OG Image', label_ar: 'صورة OG', placeholder: 'Enter OG image URL', placeholder_ar: 'أدخل رابط صورة OG', required: false },
  { key: 'og_image_width', group: 'seo', type: 'text', label: 'OG Image Width', label_ar: 'عرض صورة OG', placeholder: '1200', placeholder_ar: '1200', required: false },
  { key: 'og_image_height', group: 'seo', type: 'text', label: 'OG Image Height', label_ar: 'ارتفاع صورة OG', placeholder: '630', placeholder_ar: '630', required: false },
  { key: 'og_type', group: 'seo', type: 'text', label: 'OG Type', label_ar: 'نوع OG', placeholder: 'website', placeholder_ar: 'website', required: false },
  { key: 'og_url', group: 'seo', type: 'url', label: 'OG URL', label_ar: 'رابط OG', placeholder: 'https://example.com', placeholder_ar: 'https://example.com', required: false },
  { key: 'og_site_name', group: 'seo', type: 'text', label: 'OG Site Name', label_ar: 'اسم موقع OG', placeholder: 'My Website', placeholder_ar: 'My Website', required: false },
  
  // Canonical & Language
  { key: 'canonical_url', group: 'seo', type: 'url', label: 'Canonical URL', label_ar: 'رابط Canonical', placeholder: 'https://example.com', placeholder_ar: 'https://example.com', required: false },
  { key: 'language', group: 'seo', type: 'text', label: 'Language', label_ar: 'اللغة', placeholder: 'en', placeholder_ar: 'en', required: false },
  
  // Twitter Card
  { key: 'twitter_card', group: 'seo', type: 'text', label: 'Twitter Card', label_ar: 'بطاقة تويتر', placeholder: 'summary/summary_large_image', placeholder_ar: 'summary/summary_large_image', required: false },
  
  // Geo Tags
  { key: 'geo_region', group: 'geo', type: 'text', label: 'Geo Region', label_ar: 'المنطقة الجغرافية', placeholder: 'US-CA', placeholder_ar: 'US-CA', required: false },
  { key: 'geo_placename', group: 'geo', type: 'text', label: 'Geo Place Name', label_ar: 'اسم المكان', placeholder: 'San Francisco', placeholder_ar: 'سان فرانسيسكو', required: false },
  { key: 'geo_position', group: 'geo', type: 'text', label: 'Geo Position', label_ar: 'الإحداثيات', placeholder: '37.7749; -122.4194', placeholder_ar: '37.7749; -122.4194', required: false },
  { key: 'geo_icbm', group: 'geo', type: 'text', label: 'Geo ICBM', label_ar: 'إحداثيات ICBM', placeholder: '37.7749, -122.4194', placeholder_ar: '37.7749, -122.4194', required: false },
  
  // Social Media
  { key: 'facebook_app_id', group: 'social', type: 'text', label: 'Facebook App ID', label_ar: 'معرف تطبيق فيسبوك', placeholder: 'Enter Facebook App ID', placeholder_ar: 'أدخل معرف تطبيق فيسبوك', required: false },
  { key: 'facebook_page', group: 'social', type: 'url', label: 'Facebook Page', label_ar: 'صفحة فيسبوك', placeholder: 'Enter Facebook page URL', placeholder_ar: 'أدخل رابط صفحة فيسبوك', required: false },
  { key: 'twitter_username', group: 'social', type: 'text', label: 'Twitter Username', label_ar: 'اسم المستخدم في تويتر', placeholder: 'Enter Twitter username', placeholder_ar: 'أدخل اسم المستخدم في تويتر', required: false },
  { key: 'instagram_url', group: 'social', type: 'url', label: 'Instagram URL', label_ar: 'رابط انستغرام', placeholder: 'Enter Instagram URL', placeholder_ar: 'أدخل رابط انستغرام', required: false },
  { key: 'youtube_url', group: 'social', type: 'url', label: 'YouTube URL', label_ar: 'رابط يوتيوب', placeholder: 'Enter YouTube URL', placeholder_ar: 'أدخل رابط يوتيوب', required: false },
  { key: 'linkedin_url', group: 'social', type: 'url', label: 'LinkedIn URL', label_ar: 'رابط لينكد إن', placeholder: 'Enter LinkedIn URL', placeholder_ar: 'أدخل رابط لينكد إن', required: false },
  
  // Analytics
  { key: 'google_analytics_id', group: 'analytics', type: 'text', label: 'Google Analytics ID', label_ar: 'معرف جوجل أناليتكس', placeholder: 'Enter Google Analytics ID', placeholder_ar: 'أدخل معرف جوجل أناليتكس', required: false },
  { key: 'google_tag_manager_id', group: 'analytics', type: 'text', label: 'Google Tag Manager ID', label_ar: 'معرف جوجل تاغ مانجر', placeholder: 'Enter GTM ID', placeholder_ar: 'أدخل معرف جوجل تاغ مانجر', required: false },
  { key: 'facebook_pixel_id', group: 'analytics', type: 'text', label: 'Facebook Pixel ID', label_ar: 'معرف فيسبوك بكسل', placeholder: 'Enter Facebook Pixel ID', placeholder_ar: 'أدخل معرف فيسبوك بكسل', required: false },
  { key: 'clarity_id', group: 'analytics', type: 'text', label: 'Microsoft Clarity ID', label_ar: 'معرف مايكروسوفت كلاريتي', placeholder: 'Enter Clarity ID', placeholder_ar: 'أدخل معرف مايكروسوفت كلاريتي', required: false },
];

// ✅ مكون FieldCard
const FieldCard = ({ 
  tag, 
  editedValue, 
  isChanged, 
  isUsingDefault, 
  saving, 
  onValueChange, 
  onSave,
  isRTL
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedValue || '');
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
        isFocused 
          ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20' 
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${
            isFocused 
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
          }`}>
            {tag.type === 'textarea' ? <FileText className="h-4 w-4" /> :
             tag.type === 'url' ? <Link className="h-4 w-4" /> :
             tag.type === 'image' ? <ImageIcon className="h-4 w-4" /> :
             <FileText className="h-4 w-4" />}
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              {isRTL ? tag.label_ar : tag.label}
              {tag.required && (
                <span className="text-red-500 text-lg">*</span>
              )}
            </label>
            <span className="text-xs text-gray-400 font-mono">{tag.key}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isChanged && !isUsingDefault && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              {isRTL ? 'غير محفوظ' : 'Unsaved'}
            </Badge>
          )}
          {isUsingDefault && (
            <Badge variant="outline" className="text-gray-400 border-gray-300">
              <Lock className="h-3 w-3 mr-1" />
              {isRTL ? 'قراءة فقط' : 'Read Only'}
            </Badge>
          )}
        </div>
      </div>

      <div className="relative">
        {tag.type === 'textarea' ? (
          <div className="relative">
            <Textarea
              value={editedValue || ''}
              onChange={(e) => onValueChange(tag.key, e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isRTL ? tag.placeholder_ar : tag.placeholder}
              className="min-h-[100px] resize-y transition-all duration-200"
              dir={isRTL ? 'rtl' : 'ltr'}
              disabled={isUsingDefault}
            />
            {!isUsingDefault && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {editedValue?.length || 0} chars
              </div>
            )}
          </div>
        ) : tag.type === 'url' ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="url"
                value={editedValue || ''}
                onChange={(e) => onValueChange(tag.key, e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={isRTL ? tag.placeholder_ar : tag.placeholder}
                className="pl-9"
                dir="ltr"
                disabled={isUsingDefault}
              />
            </div>
            {editedValue && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(editedValue, '_blank')}
                      className="shrink-0"
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRTL ? 'فتح الرابط' : 'Open URL'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : tag.type === 'image' ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                value={editedValue || ''}
                onChange={(e) => onValueChange(tag.key, e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={isRTL ? tag.placeholder_ar : tag.placeholder}
                className="flex-1"
                dir={isRTL ? 'rtl' : 'ltr'}
                disabled={isUsingDefault}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {showCopyFeedback ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {editedValue && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700"
              >
                <img 
                  src={editedValue} 
                  alt={tag.key}
                  className="w-full max-h-48 object-contain bg-gray-50 dark:bg-gray-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Image+Not+Found';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                  <span className="text-xs text-white/80">{isRTL ? 'معاينة الصورة' : 'Image Preview'}</span>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <Input
            type="text"
            value={editedValue || ''}
            onChange={(e) => onValueChange(tag.key, e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isRTL ? tag.placeholder_ar : tag.placeholder}
            className="flex-1"
            dir={isRTL ? 'rtl' : 'ltr'}
            disabled={isUsingDefault}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{isRTL ? 'آخر تحديث:' : 'Last updated:'}</span>
          <span>{new Date(tag.updated_at).toLocaleString()}</span>
        </div>
        <Button
          variant={isChanged ? "default" : "outline"}
          onClick={() => onSave(tag.key)}
          disabled={saving || !isChanged || isUsingDefault}
          size="sm"
          className={`transition-all duration-300 ${
            isChanged 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25' 
              : ''
          }`}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className={`h-4 w-4 ${isChanged ? 'mr-2' : ''}`} />
          )}
          {isChanged ? (isRTL ? 'حفظ التغيير' : 'Save Change') : (isRTL ? 'محفوظ' : 'Saved')}
        </Button>
      </div>
    </motion.div>
  );
};

// ✅ مكون PreviewCard
const PreviewCard = ({ metaTags, editedValues, isRTL }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Eye className="h-5 w-5" />
              {isRTL ? 'معاينة الموقع' : 'Site Preview'}
            </CardTitle>
            <Badge variant="outline" className="border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400">
              <Smartphone className="h-3 w-3 mr-1" />
              {isRTL ? 'معاينة حية' : 'Live Preview'}
            </Badge>
          </div>
          <CardDescription>
            {isRTL ? 'هذا ما سيراه الزوار عند مشاركة الموقع' : 'This is what visitors will see when sharing the site'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-inner">
            <div className="flex items-center gap-4">
              {/* معاينة الأيقونة */}
              {editedValues.favicon && (
                <div className="flex-shrink-0">
                  <img 
                    src={editedValues.favicon} 
                    alt="Favicon"
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48/6C63FF/FFFFFF?text=F';
                    }}
                  />
                </div>
              )}
              <div className="space-y-1 flex-1">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {editedValues.site_title || DEFAULT_META_TAGS.site_title}
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {editedValues.site_url || DEFAULT_META_TAGS.site_url}
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {editedValues.site_description || DEFAULT_META_TAGS.site_description}
            </p>

            <Separator />

            {/* SEO Meta */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Search className="h-3 w-3" />
                {isRTL ? 'بيانات SEO' : 'SEO Data'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-400 text-xs">{isRTL ? 'العنوان' : 'Title'}</span>
                  <p className="font-medium truncate">{editedValues.seo_title || DEFAULT_META_TAGS.seo_title}</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-400 text-xs">{isRTL ? 'الكلمات المفتاحية' : 'Keywords'}</span>
                  <p className="font-medium truncate">{editedValues.seo_keywords || DEFAULT_META_TAGS.seo_keywords}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Social Media */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Share2 className="h-3 w-3" />
                {isRTL ? 'وسائل التواصل' : 'Social Media'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {metaTags.filter((tag: any) => tag.group === 'social').map((tag: any) => (
                  editedValues[tag.key] && (
                    <Badge key={tag.key} variant="secondary" className="gap-1.5 px-3 py-1.5">
                      <span className="text-xs">{tag.key.replace('_', ' ')}</span>
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    </Badge>
                  )
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ✅ المكون الرئيسي
const SettingsPage = () => {
  const { lang } = useApp();
  const isRTL = lang === 'ar';
  const { metaTags, groups, loading, saving, updateMetaTag, refresh } = useSettings();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('general');
  const [isUsingDefault, setIsUsingDefault] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);

  // ✅ دمج البيانات
  const mergedMetaTags = useMemo(() => {
    if (!metaTags || metaTags.length === 0) {
      setIsUsingDefault(true);
      return DEFAULT_FIELDS.map(field => ({
        id: 0,
        key: field.key,
        value: DEFAULT_META_TAGS[field.key as keyof typeof DEFAULT_META_TAGS] || '',
        group: field.group,
        type: field.type,
        label: field.label,
        label_ar: field.label_ar,
        placeholder: field.placeholder,
        placeholder_ar: field.placeholder_ar,
        required: field.required,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
    setIsUsingDefault(false);
    return metaTags;
  }, [metaTags]);

  const mergedGroups = useMemo(() => {
    if (!groups || groups.length === 0) {
      return DEFAULT_GROUPS;
    }
    return groups;
  }, [groups]);

  // ✅ تهيئة القيم
  useEffect(() => {
    if (mergedMetaTags.length > 0 && !initialized) {
      const initial: Record<string, string> = {};
      mergedMetaTags.forEach(tag => {
        initial[tag.key] = tag.value || '';
      });
      setEditedValues(initial);
      setInitialized(true);
    }
  }, [mergedMetaTags, initialized]);

  useEffect(() => {
    if (metaTags && metaTags.length > 0 && !isUsingDefault) {
      const initial: Record<string, string> = {};
      metaTags.forEach(tag => {
        initial[tag.key] = tag.value || '';
      });
      setEditedValues(initial);
    }
  }, [metaTags, isUsingDefault]);

  // ✅ دوال معالجة
  const handleValueChange = useCallback((key: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleSave = useCallback(async (key: string) => {
    if (isUsingDefault) {
      toast({
        title: isRTL ? 'تنبيه' : 'Warning',
        description: isRTL 
          ? 'لا يمكن الحفظ في وضع العرض الافتراضي'
          : 'Cannot save in default mode',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateMetaTag(key, editedValues[key] || '');
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم تحديث الإعداد بنجاح' : 'Setting updated successfully',
        variant: 'default',
      });
    } catch (error) {
      // معالج الخطأ في الـ hook
    }
  }, [isUsingDefault, updateMetaTag, editedValues, isRTL]);

  const handleSaveAll = useCallback(async () => {
    if (isUsingDefault) {
      toast({
        title: isRTL ? 'تنبيه' : 'Warning',
        description: isRTL 
          ? 'لا يمكن الحفظ في وضع العرض الافتراضي'
          : 'Cannot save in default mode',
        variant: 'destructive',
      });
      return;
    }

    const changed: Record<string, string> = {};
    mergedMetaTags.forEach(tag => {
      if (editedValues[tag.key] !== tag.value) {
        changed[tag.key] = editedValues[tag.key] || '';
      }
    });

    if (Object.keys(changed).length === 0) {
      toast({
        title: isRTL ? 'معلومات' : 'Info',
        description: isRTL ? 'لا توجد تغييرات للحفظ' : 'No changes to save',
      });
      return;
    }

    const total = Object.keys(changed).length;
    let saved = 0;

    try {
      for (const [key, value] of Object.entries(changed)) {
        await updateMetaTag(key, value);
        saved++;
        setSaveProgress((saved / total) * 100);
      }
      
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL 
          ? `تم حفظ ${total} تغيير بنجاح` 
          : `Saved ${total} changes successfully`,
        variant: 'default',
      });
      
      setTimeout(() => setSaveProgress(0), 3000);
    } catch (error) {
      // معالج الخطأ
    }
  }, [isUsingDefault, mergedMetaTags, editedValues, updateMetaTag, isRTL]);

  // ✅ عرض التحميل
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-600 animate-pulse" />
        </div>
        <p className="text-gray-500 animate-pulse">
          {isRTL ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 px-4 max-w-7xl"
      >
        {/* Header */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl -z-10"></div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25">
                <SettingsIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {isRTL ? 'إعدادات الموقع' : 'Site Settings'}
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  {isRTL 
                    ? 'إدارة الـ Meta Tags وإعدادات SEO ووسائل التواصل الاجتماعي'
                    : 'Manage Meta Tags, SEO settings, and social media integration'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {isUsingDefault && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-nowrap">
                    {isRTL ? 'وضع العرض فقط' : 'View Only Mode'}
                  </span>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={refresh}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
              
              <Button 
                onClick={handleSaveAll}
                disabled={saving || loading || isUsingDefault}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25"
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

          {saveProgress > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{isRTL ? 'جاري الحفظ...' : 'Saving...'}</span>
                <span>{Math.round(saveProgress)}%</span>
              </div>
              <Progress value={saveProgress} className="h-2" />
            </motion.div>
          )}
        </div>

        {/* Tabs - 6 أعمدة */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2 p-1 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl">
            {mergedGroups.map(group => {
              const Icon = group.icon || SettingsIcon;
              const isActive = activeTab === group.id;
              return (
                <TabsTrigger 
                  key={group.id} 
                  value={group.id}
                  className={`gap-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-white dark:bg-gray-900 shadow-lg' 
                      : ''
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : ''}`} />
                  <span className="hidden sm:inline">
                    {isRTL ? group.label_ar : group.label}
                  </span>
                  <span className="sm:hidden">
                    {isRTL ? group.label_ar.slice(0, 4) : group.label.slice(0, 4)}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {mergedGroups.map(group => {
            const groupTags = mergedMetaTags.filter(tag => tag.group === group.id);
            const changedCount = groupTags.filter(tag => editedValues[tag.key] !== tag.value).length;
            
            return (
              <TabsContent key={group.id} value={group.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                            {group.icon ? (
                              <group.icon className="h-5 w-5 text-purple-600" />
                            ) : (
                              <SettingsIcon className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {isRTL ? group.label_ar : group.label}
                              <Badge variant="secondary" className="ml-2">
                                {groupTags.length} {isRTL ? 'حقل' : 'fields'}
                              </Badge>
                              {changedCount > 0 && (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  {changedCount} {isRTL ? 'تغيير' : 'changes'}
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>
                              {isRTL ? group.description_ar : group.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-4">
                      <AnimatePresence>
                        {groupTags.map(tag => {
                          const isChanged = editedValues[tag.key] !== tag.value;
                          return (
                            <FieldCard
                              key={tag.key}
                              tag={tag}
                              editedValue={editedValues[tag.key]}
                              isChanged={isChanged}
                              isUsingDefault={isUsingDefault}
                              saving={saving}
                              onValueChange={handleValueChange}
                              onSave={handleSave}
                              isRTL={isRTL}
                            />
                          );
                        })}
                      </AnimatePresence>
                    </CardContent>
                  </Card>

                  {/* Preview for SEO, Favicon, and Geo tabs */}
                  {(group.id === 'seo' || group.id === 'favicon' || group.id === 'geo') && (
                    <div className="mt-6">
                      <PreviewCard 
                        metaTags={mergedMetaTags}
                        editedValues={editedValues}
                        isRTL={isRTL}
                      />
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Code className="h-4 w-4 text-purple-600" />
              </div>
              <span>
                {isRTL 
                  ? 'جميع الـ Meta Tags سيتم تطبيقها على جميع صفحات الموقع' 
                  : 'All Meta Tags will be applied across all site pages'}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
                <LayoutGrid className="h-3 w-3" />
                {mergedMetaTags.length} {isRTL ? 'إعداد' : 'Settings'}
              </Badge>
              
              {!isUsingDefault && (
                <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {Object.keys(editedValues).filter(k => {
                    const original = mergedMetaTags.find(m => m.key === k);
                    return original && editedValues[k] !== original.value;
                  }).length} 
                  {isRTL ? ' تغيير' : ' Changes'}
                </Badge>
              )}
              
              {isUsingDefault && (
                <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
                  <Eye className="h-3 w-3" />
                  {isRTL ? 'وضع العرض الافتراضي' : 'Default View Mode'}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
};

export default SettingsPage;