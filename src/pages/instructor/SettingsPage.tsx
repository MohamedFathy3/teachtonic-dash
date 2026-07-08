// src/pages/admin/SettingsPage.tsx

import React, { useState, useEffect } from 'react';
import { useSeoSettings } from '@/hooks/useSeoSettings';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Save, 
  Globe, 
  Search, 
  Share2, 
  MapPin, 
  BarChart3, 
  ImageIcon,
  Settings as SettingsIcon,
  Eye,
  Copy,
  CheckCircle2,
  RefreshCw,
  Zap,
  AlertCircle,
  Monitor,
  Sparkles,
  LayoutGrid,
  Smartphone,
  Code,
  User,
  Info,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  Check,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MapPinned,
  Activity,
  Hash,
  FileImage,
  Globe2,
  Languages,
  Link2,
  Twitter,
  Tag,
  PenTool,
  Image,
  Chrome,
  Smartphone as SmartphoneIcon,
  Tablet,
  Monitor as MonitorIcon,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

// ✅ تعريف المجموعات - مع دعم اللغتين
const GROUPS = [
  { 
    id: 'general', 
    label: 'General', 
    label_ar: 'عام',
    description: 'General site settings and configuration',
    description_ar: 'الإعدادات العامة وتكوين الموقع',
    icon: Globe 
  },
  { 
    id: 'seo', 
    label: 'SEO & Meta', 
    label_ar: 'SEO والوصف',
    description: 'Search engine optimization and meta tags',
    description_ar: 'تحسين محركات البحث والعلامات الوصفية',
    icon: Search 
  },
  { 
    id: 'social', 
    label: 'Social Media', 
    label_ar: 'وسائل التواصل',
    description: 'Social media integration and sharing',
    description_ar: 'تكامل وسائل التواصل الاجتماعي',
    icon: Share2 
  },
  { 
    id: 'geo', 
    label: 'Geo & Location', 
    label_ar: 'الجغرافيا والموقع',
    description: 'Geolocation and regional settings',
    description_ar: 'إعدادات الموقع الجغرافي والمنطقة',
    icon: MapPin 
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    label_ar: 'التحليلات',
    description: 'Analytics and tracking codes',
    description_ar: 'التحليلات وأكواد التتبع',
    icon: BarChart3 
  },
  { 
    id: 'favicon', 
    label: 'Favicon & Icons', 
    label_ar: 'الأيقونات',
    description: 'Favicon and app icons for all devices',
    description_ar: 'أيقونة الموقع وتطبيقات الويب لجميع الأجهزة',
    icon: ImageIcon 
  },
];

// ✅ تعريف الحقول مع Help Text لكل حقل
const FIELDS = {
  seo: [
    { 
      key: 'seo_title', 
      label: 'SEO Title', 
      label_ar: 'عنوان SEO', 
      type: 'text', 
      placeholder: 'Enter SEO title', 
      placeholder_ar: 'أدخل عنوان SEO',
      helpText: 'The main title that appears in search engine results. Should be descriptive and include keywords.',
      helpText_ar: 'العنوان الرئيسي الذي يظهر في نتائج محركات البحث. يجب أن يكون وصفياً ويحتوي على كلمات مفتاحية.',
    },
    { 
      key: 'seo_description', 
      label: 'SEO Description', 
      label_ar: 'وصف SEO', 
      type: 'textarea', 
      placeholder: 'Enter SEO description', 
      placeholder_ar: 'أدخل وصف SEO',
      helpText: 'A brief summary that appears below the title in search results. Keep it between 150-160 characters.',
      helpText_ar: 'ملخص مختصر يظهر تحت العنوان في نتائج البحث. احرص على أن يكون بين 150-160 حرفاً.',
    },
    { 
      key: 'seo_keywords', 
      label: 'SEO Keywords', 
      label_ar: 'كلمات SEO', 
      type: 'text', 
      placeholder: 'Enter SEO keywords', 
      placeholder_ar: 'أدخل كلمات SEO',
      helpText: 'Comma-separated keywords that describe your content. Helps search engines understand your page.',
      helpText_ar: 'كلمات مفتاحية مفصولة بفواصل تصف محتواك. تساعد محركات البحث على فهم صفحتك.',
    },
    { 
      key: 'google_site_verification', 
      label: 'Google Site Verification', 
      label_ar: 'التحقق من جوجل', 
      type: 'text', 
      placeholder: 'Enter Google site verification code', 
      placeholder_ar: 'أدخل رمز التحقق من جوجل',
      helpText: 'This code verifies your site ownership with Google Search Console. Adds a meta tag to your site header.',
      helpText_ar: 'هذا الكود يتحقق من ملكية موقعك في Google Search Console. يضيف علامة ميتا في رأس الموقع.',
      helpLink: 'https://support.google.com/webmasters/answer/9008080',
      helpLink_ar: 'https://support.google.com/webmasters/answer/9008080?hl=ar',
    },
    { 
      key: 'og_title', 
      label: 'OG Title', 
      label_ar: 'عنوان OG', 
      type: 'text', 
      placeholder: 'Enter OG title', 
      placeholder_ar: 'أدخل عنوان OG',
      helpText: 'Title used when your page is shared on social media (Facebook, LinkedIn, WhatsApp).',
      helpText_ar: 'العنوان المستخدم عند مشاركة صفحتك على وسائل التواصل الاجتماعي (فيسبوك، لينكد إن، واتساب).',
    },
    { 
      key: 'og_description', 
      label: 'OG Description', 
      label_ar: 'وصف OG', 
      type: 'textarea', 
      placeholder: 'Enter OG description', 
      placeholder_ar: 'أدخل وصف OG',
      helpText: 'Description shown when your page is shared on social media. Should be engaging and clear.',
      helpText_ar: 'الوصف الذي يظهر عند مشاركة صفحتك على وسائل التواصل. يجب أن يكون جذاباً وواضحاً.',
    },
    { 
      key: 'og_image', 
      label: 'OG Image', 
      label_ar: 'صورة OG', 
      type: 'image', 
      placeholder: 'Enter OG image URL', 
      placeholder_ar: 'أدخل رابط صورة OG',
      helpText: 'Image displayed when your page is shared on social media. Recommended size: 1200x630px.',
      helpText_ar: 'الصورة التي تظهر عند مشاركة صفحتك على وسائل التواصل. الحجم الموصى به: 1200×630 بكسل.',
    },
    { 
      key: 'og_type', 
      label: 'OG Type', 
      label_ar: 'نوع OG', 
      type: 'text', 
      placeholder: 'website', 
      placeholder_ar: 'website',
      helpText: 'Type of content (website, article, video, etc.). Default is "website".',
      helpText_ar: 'نوع المحتوى (موقع، مقال، فيديو، إلخ). القيمة الافتراضية هي "website".',
    },
    { 
      key: 'og_url', 
      label: 'OG URL', 
      label_ar: 'رابط OG', 
      type: 'url', 
      placeholder: 'Enter OG URL', 
      placeholder_ar: 'أدخل رابط OG',
      helpText: 'The canonical URL of your page. Used for social media sharing.',
      helpText_ar: 'الرابط الرسمي لصفحتك. يُستخدم للمشاركة على وسائل التواصل.',
    },
    { 
      key: 'og_site_name', 
      label: 'OG Site Name', 
      label_ar: 'اسم موقع OG', 
      type: 'text', 
      placeholder: 'My Website', 
      placeholder_ar: 'My Website',
      helpText: 'The name of your website as it appears on social media shares.',
      helpText_ar: 'اسم موقعك كما يظهر في مشاركات وسائل التواصل الاجتماعي.',
    },
    { 
      key: 'canonical_url', 
      label: 'Canonical URL', 
      label_ar: 'رابط Canonical', 
      type: 'url', 
      placeholder: 'Enter canonical URL', 
      placeholder_ar: 'أدخل رابط canonical',
      helpText: 'The preferred URL for duplicate content. Helps prevent SEO issues.',
      helpText_ar: 'الرابط المفضل للمحتوى المكرر. يساعد في تجنب مشاكل SEO.',
    },
    { 
      key: 'language', 
      label: 'Language', 
      label_ar: 'اللغة', 
      type: 'text', 
      placeholder: 'en', 
      placeholder_ar: 'en',
      helpText: 'The primary language of your website (e.g., en, ar, fr).',
      helpText_ar: 'اللغة الأساسية لموقعك (مثال: en، ar، fr).',
    },
    { 
      key: 'twitter_card', 
      label: 'Twitter Card', 
      label_ar: 'بطاقة تويتر', 
      type: 'text', 
      placeholder: 'summary/summary_large_image', 
      placeholder_ar: 'summary/summary_large_image',
      helpText: 'Twitter card type. Use "summary_large_image" for image-rich sharing.',
      helpText_ar: 'نوع بطاقة تويتر. استخدم "summary_large_image" للمشاركات الغنية بالصور.',
    },
  ],
  social: [
    { 
      key: 'facebook_page', 
      label: 'Facebook Page', 
      label_ar: 'صفحة فيسبوك', 
      type: 'url', 
      placeholder: 'Enter Facebook page URL', 
      placeholder_ar: 'أدخل رابط صفحة فيسبوك',
      helpText: 'Link to your official Facebook page.',
      helpText_ar: 'رابط صفحة الفيسبوك الرسمية الخاصة بك.',
    },
    { 
      key: 'instagram_url', 
      label: 'Instagram URL', 
      label_ar: 'رابط انستغرام', 
      type: 'url', 
      placeholder: 'Enter Instagram URL', 
      placeholder_ar: 'أدخل رابط انستغرام',
      helpText: 'Link to your Instagram profile.',
      helpText_ar: 'رابط حسابك على انستغرام.',
    },
    { 
      key: 'youtube_url', 
      label: 'YouTube URL', 
      label_ar: 'رابط يوتيوب', 
      type: 'url', 
      placeholder: 'Enter YouTube URL', 
      placeholder_ar: 'أدخل رابط يوتيوب',
      helpText: 'Link to your YouTube channel.',
      helpText_ar: 'رابط قناتك على يوتيوب.',
    },
    { 
      key: 'linkedin_url', 
      label: 'LinkedIn URL', 
      label_ar: 'رابط لينكد إن', 
      type: 'url', 
      placeholder: 'Enter LinkedIn URL', 
      placeholder_ar: 'أدخل رابط لينكد إن',
      helpText: 'Link to your LinkedIn company page or profile.',
      helpText_ar: 'رابط صفحة شركتك أو ملفك الشخصي على لينكد إن.',
    },
  ],
  geo: [
    { 
      key: 'geo_region', 
      label: 'Geo Region', 
      label_ar: 'المنطقة الجغرافية', 
      type: 'text', 
      placeholder: 'US-CA', 
      placeholder_ar: 'US-CA',
      helpText: 'Your geographical region code (e.g., US-CA for California).',
      helpText_ar: 'رمز منطقتك الجغرافية (مثال: US-CA لكاليفورنيا).',
    },
    { 
      key: 'geo_placename', 
      label: 'Place Name', 
      label_ar: 'اسم المكان', 
      type: 'text', 
      placeholder: 'San Francisco', 
      placeholder_ar: 'سان فرانسيسكو',
      helpText: 'The name of your city or location.',
      helpText_ar: 'اسم مدينتك أو موقعك.',
    },
    { 
      key: 'geo_position', 
      label: 'Position', 
      label_ar: 'الإحداثيات', 
      type: 'text', 
      placeholder: '37.7749; -122.4194', 
      placeholder_ar: '37.7749; -122.4194',
      helpText: 'Latitude and longitude coordinates (separated by semicolon).',
      helpText_ar: 'إحداثيات خط الطول والعرض (مفصولة بفاصلة منقوطة).',
    },
    { 
      key: 'geo_icbm', 
      label: 'ICBM', 
      label_ar: 'إحداثيات ICBM', 
      type: 'text', 
      placeholder: '37.7749, -122.4194', 
      placeholder_ar: '37.7749, -122.4194',
      helpText: 'Alternative format for latitude and longitude (comma-separated).',
      helpText_ar: 'صيغة بديلة لخط الطول والعرض (مفصولة بفاصلة).',
    },
  ],
  analytics: [
    { 
      key: 'google_analytics_id', 
      label: 'Google Analytics ID', 
      label_ar: 'معرف جوجل أناليتكس', 
      type: 'text', 
      placeholder: 'Enter Google Analytics ID', 
      placeholder_ar: 'أدخل معرف جوجل أناليتكس',
      helpText: 'Your Google Analytics tracking ID (starts with UA- or G-).',
      helpText_ar: 'معرف التتبع الخاص بجوجل أناليتكس (يبدأ بـ UA- أو G-).',
    },
    { 
      key: 'google_tag_manager_id', 
      label: 'Google Tag Manager ID', 
      label_ar: 'معرف جوجل تاغ مانجر', 
      type: 'text', 
      placeholder: 'Enter GTM ID', 
      placeholder_ar: 'أدخل معرف GTM',
      helpText: 'Your Google Tag Manager container ID (starts with GTM-).',
      helpText_ar: 'معرف الحاوية في جوجل تاغ مانجر (يبدأ بـ GTM-).',
    },
    { 
      key: 'facebook_pixel_id', 
      label: 'Facebook Pixel ID', 
      label_ar: 'معرف فيسبوك بكسل', 
      type: 'text', 
      placeholder: 'Enter Facebook Pixel ID', 
      placeholder_ar: 'أدخل معرف فيسبوك بكسل',
      helpText: 'Your Facebook Pixel ID for tracking conversions and retargeting.',
      helpText_ar: 'معرف فيسبوك بكسل لتتبع التحويلات وإعادة الاستهداف.',
    },
    { 
      key: 'clarity_id', 
      label: 'Microsoft Clarity ID', 
      label_ar: 'معرف مايكروسوفت كلاريتي', 
      type: 'text', 
      placeholder: 'Enter Clarity ID', 
      placeholder_ar: 'أدخل معرف كلاريتي',
      helpText: 'Your Microsoft Clarity project ID for user behavior analytics.',
      helpText_ar: 'معرف مشروع مايكروسوفت كلاريتي لتحليل سلوك المستخدمين.',
    },
  ],
  favicon: [
    { 
      key: 'favicon', 
      label: 'Favicon (.ico)', 
      label_ar: 'أيقونة الموقع .ico', 
      type: 'image', 
      placeholder: 'https://example.com/favicon.ico', 
      placeholder_ar: 'https://example.com/favicon.ico',
      helpText: 'Standard favicon in .ico format. Works on all browsers.',
      helpText_ar: 'أيقونة الموقع بصيغة .ico. تعمل على جميع المتصفحات.',
    },
    { 
      key: 'favicon_svg', 
      label: 'Favicon SVG', 
      label_ar: 'أيقونة SVG', 
      type: 'image', 
      placeholder: 'https://example.com/favicon.svg', 
      placeholder_ar: 'https://example.com/favicon.svg',
      helpText: 'SVG favicon for modern browsers. Supports scaling without quality loss.',
      helpText_ar: 'أيقونة SVG للمتصفحات الحديثة. تدعم التكبير دون فقدان الجودة.',
    },
    { 
      key: 'favicon_32', 
      label: 'Favicon 32x32', 
      label_ar: 'أيقونة 32×32', 
      type: 'image', 
      placeholder: 'https://example.com/favicon-32x32.png', 
      placeholder_ar: 'https://example.com/favicon-32x32.png',
      helpText: 'PNG favicon for desktop browsers. Size: 32x32 pixels.',
      helpText_ar: 'أيقونة PNG لمتصفحات سطح المكتب. الحجم: 32×32 بكسل.',
    },
    { 
      key: 'favicon_16', 
      label: 'Favicon 16x16', 
      label_ar: 'أيقونة 16×16', 
      type: 'image', 
      placeholder: 'https://example.com/favicon-16x16.png', 
      placeholder_ar: 'https://example.com/favicon-16x16.png',
      helpText: 'Small PNG favicon for browser tabs. Size: 16x16 pixels.',
      helpText_ar: 'أيقونة PNG صغيرة لعلامات تبويب المتصفح. الحجم: 16×16 بكسل.',
    },
    { 
      key: 'favicon_apple', 
      label: 'Apple Touch Icon', 
      label_ar: 'أيقونة آبل', 
      type: 'image', 
      placeholder: 'https://example.com/apple-touch-icon.png', 
      placeholder_ar: 'https://example.com/apple-touch-icon.png',
      helpText: 'Icon for Apple devices (iPhone, iPad) when added to home screen.',
      helpText_ar: 'أيقونة لأجهزة آبل (آيفون، آيباد) عند إضافتها إلى الشاشة الرئيسية.',
    },
    { 
      key: 'favicon_android', 
      label: 'Android Chrome Icon', 
      label_ar: 'أيقونة أندرويد', 
      type: 'image', 
      placeholder: 'https://example.com/android-chrome-192x192.png', 
      placeholder_ar: 'https://example.com/android-chrome-192x192.png',
      helpText: 'Icon for Android devices when added to home screen. Size: 192x192px.',
      helpText_ar: 'أيقونة لأجهزة أندرويد عند إضافتها إلى الشاشة الرئيسية. الحجم: 192×192 بكسل.',
    },
    { 
      key: 'browserconfig_xml', 
      label: 'Browser Config', 
      label_ar: 'ملف إعدادات المتصفح', 
      type: 'url', 
      placeholder: 'https://example.com/browserconfig.xml', 
      placeholder_ar: 'https://example.com/browserconfig.xml',
      helpText: 'XML configuration file for Windows 8+ tiles and pinned sites.',
      helpText_ar: 'ملف تكوين XML لبلاط ويندوز 8+ والمواقع المثبتة.',
    },
  ],
};

// ✅ مكون معاينة OG
const OGPreview = ({ formData, isRTL }: { formData: Record<string, string>; isRTL: boolean }) => {
  const hasOGImage = formData.og_image && formData.og_image.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
          {isRTL ? 'معاينة المشاركة' : 'Share Preview'}
        </span>
        <Badge variant="outline" className="border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400">
          <Smartphone className="h-3 w-3 mr-1" />
          {isRTL ? 'معاينة حية' : 'Live Preview'}
        </Badge>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {hasOGImage && (
          <img 
            src={formData.og_image} 
            alt="OG Preview"
            className="w-full h-48 object-cover bg-gray-100 dark:bg-gray-800"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x630/6C63FF/FFFFFF?text=Image+Not+Found';
            }}
          />
        )}
        <div className="p-4 space-y-1">
          <h4 className="text-base font-semibold text-blue-600 dark:text-blue-400 line-clamp-1">
            {formData.og_title || formData.seo_title || formData.site_title || 'My Website'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {formData.og_description || formData.seo_description || formData.site_description || 'Welcome to our website'}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 truncate">
            {formData.site_url || 'https://example.com'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ✅ مكون الـ Help Text
const HelpText = ({ 
  helpText, 
  helpLink, 
  isRTL 
}: { 
  helpText?: string; 
  helpLink?: string; 
  isRTL: boolean;
}) => {
  if (!helpText) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 shrink-0 mt-0.5">
          <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            {helpText}
          </p>
          {helpLink && (
            <a
              href={helpLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline-offset-2 hover:underline transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {isRTL ? 'معرفة المزيد' : 'Learn more'}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ✅ المكون الرئيسي
const SettingsPage = () => {
  const { lang } = useApp();
  const isRTL = lang === 'ar';
  const { 
    settings, 
    seoId,
    loading, 
    saving, 
    saveAllSettings, 
    fetchData,
    hasSettings 
  } = useSeoSettings();
  
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] = useState<Record<string, string>>({});
  const [saveProgress, setSaveProgress] = useState(0);

  // ✅ تهيئة الفورم من settings
  useEffect(() => {
    if (settings) {
      console.log('📋 Settings loaded:', settings);
      const data: Record<string, string> = {};
      Object.keys(settings).forEach(key => {
        const value = settings[key as keyof typeof settings];
        data[key] = value !== null && value !== undefined ? String(value) : '';
      });
      setFormData(data);
      setOriginalData(data);
    }
  }, [settings]);

  // ✅ تغيير قيمة حقل
  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // ✅ نسخ النص
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(isRTL ? 'تم النسخ' : 'Copied!');
  };

  // ✅ حفظ كل البيانات
  const handleSaveAll = async () => {
    console.log('🆔 SEO ID:', seoId);
    console.log('📦 Current Form Data:', formData);
    console.log('📦 Original Data:', originalData);

    const changedCount = Object.keys(formData).filter(key => 
      formData[key] !== originalData[key]
    ).length;

    console.log('📊 Changed Count:', changedCount);

    if (changedCount === 0) {
      toast.info(isRTL ? 'لا توجد تغييرات للحفظ' : 'No changes to save');
      return;
    }

    if (!seoId) {
      toast.error(isRTL ? '❌ لا يوجد ID للحفظ' : '❌ No ID found to save');
      return;
    }

    try {
      setSaveProgress(10);
      
      const dataToSave = { ...formData };
      
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === null || dataToSave[key] === undefined) {
          dataToSave[key] = '';
        }
      });

      console.log('📤 Sending to API:', dataToSave);
      
      setSaveProgress(50);
      
      await saveAllSettings(dataToSave);
      setSaveProgress(100);
      setOriginalData({ ...formData });
      
      toast.success(isRTL ? '✅ تم حفظ جميع الإعدادات بنجاح' : '✅ All settings saved successfully');
      
      setTimeout(() => setSaveProgress(0), 2000);
    } catch (error) {
      console.error('❌ Save Error:', error);
      setSaveProgress(0);
      toast.error(isRTL ? '❌ فشل في حفظ الإعدادات' : '❌ Failed to save settings');
    }
  };

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

  // ✅ حساب عدد التغييرات
  const changedCount = Object.keys(formData).filter(key => 
    formData[key] !== originalData[key]
  ).length;

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`container mx-auto py-8 px-4 max-w-7xl ${isRTL ? 'rtl' : 'ltr'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* ✅ Header */}
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
                {seoId && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {isRTL ? `معرف الإعدادات: ${seoId}` : `Settings ID: ${seoId}`}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {changedCount > 0 && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {changedCount} {isRTL ? 'تغيير' : 'changes'}
                </Badge>
              )}

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
                disabled={saving || loading || changedCount === 0}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 disabled:opacity-50"
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

          {/* ✅ Progress bar */}
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

        {/* ✅ Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2 p-1 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl">
            {GROUPS.map(group => {
              const Icon = group.icon;
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

          {GROUPS.map(group => {
            const fields = FIELDS[group.id as keyof typeof FIELDS] || [];
            const groupHasChanges = fields.some(f => formData[f.key] !== originalData[f.key]);
            
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
                            <group.icon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {isRTL ? group.label_ar : group.label}
                              <Badge variant="secondary" className="ml-2">
                                {fields.length} {isRTL ? 'حقل' : 'fields'}
                              </Badge>
                              {groupHasChanges && (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  {isRTL ? 'تغييرات' : 'changes'}
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
                    
                    <CardContent className="p-6 space-y-6">
                      {fields.map((field) => {
                        const value = formData[field.key] || '';
                        const isChanged = formData[field.key] !== originalData[field.key];
                        const label = isRTL ? field.label_ar : field.label;
                        const placeholder = isRTL ? field.placeholder_ar : field.placeholder;
                        const helpText = isRTL ? field.helpText_ar : field.helpText;
                        const helpLink = isRTL ? field.helpLink_ar : field.helpLink;
                        
                        return (
                          <motion.div 
                            key={field.key}
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`space-y-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                              isChanged 
                                ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20' 
                                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium flex items-center gap-2">
                                {field.key === 'google_site_verification' && (
                                  <ShieldCheck className="h-4 w-4 text-green-600" />
                                )}
                                {label}
                                {isChanged && (
                                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                                    {isRTL ? 'غير محفوظ' : 'Unsaved'}
                                  </Badge>
                                )}
                              </label>
                              {(field.type === 'url' || field.type === 'image') && value && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(value)}
                                  className="h-7 px-2"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            {field.type === 'textarea' ? (
                              <Textarea
                                value={value}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                placeholder={placeholder}
                                rows={3}
                                className="w-full resize-y"
                                dir={isRTL ? 'rtl' : 'ltr'}
                              />
                            ) : field.type === 'url' ? (
                              <div className="flex gap-2">
                                <Input
                                  type="url"
                                  value={value}
                                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                  placeholder={placeholder}
                                  className="flex-1"
                                  dir="ltr"
                                />
                                {value && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => window.open(value, '_blank')}
                                    className="shrink-0"
                                  >
                                    <Monitor className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ) : field.type === 'image' ? (
                              <div className="space-y-3">
                                <Input
                                  type="text"
                                  value={value}
                                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                  placeholder={placeholder}
                                  className="w-full"
                                  dir="ltr"
                                />
                                {value && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-2"
                                  >
                                    <img 
                                      src={value} 
                                      alt={field.key}
                                      className={`${
                                        field.key === 'og_image' 
                                          ? 'max-h-48 w-full' 
                                          : 'h-16 w-16'
                                      } rounded-lg border-2 border-gray-200 dark:border-gray-700 object-contain bg-gray-50 dark:bg-gray-900`}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Image+Not+Found';
                                      }}
                                    />
                                  </motion.div>
                                )}
                              </div>
                            ) : (
                              <>
                                <Input
                                  type="text"
                                  value={value}
                                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                  placeholder={placeholder}
                                  className="w-full"
                                  dir={isRTL ? 'rtl' : 'ltr'}
                                />
                                
                                {/* ✅ عرض الـ Help Text تحت كل حقل */}
                                {helpText && (
                                  <HelpText 
                                    helpText={helpText} 
                                    helpLink={helpLink} 
                                    isRTL={isRTL} 
                                  />
                                )}
                              </>
                            )}
                          </motion.div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* ✅ OG Preview - يظهر في تبويب SEO و favicon */}
                  {(group.id === 'seo' || group.id === 'favicon') && (
                    <OGPreview formData={formData} isRTL={isRTL} />
                  )}
                </motion.div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* ✅ Footer */}
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
                {Object.keys(formData).length} {isRTL ? 'إعداد' : 'Settings'}
              </Badge>
              
              {seoId && (
                <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
                  <Info className="h-3 w-3" />
                  {isRTL ? `ID: ${seoId}` : `ID: ${seoId}`}
                </Badge>
              )}
              
              {changedCount > 0 && (
                <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  {changedCount} {isRTL ? 'تغيير غير محفوظ' : 'Unsaved changes'}
                </Badge>
              )}
              
              {changedCount === 0 && Object.keys(formData).length > 0 && (
                <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {isRTL ? 'كل الإعدادات محفوظة' : 'All settings saved'}
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