/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Loader2, QrCode, CheckCircle, XCircle, RefreshCw, Copy, Save, AlertCircle, Users } from 'lucide-react';


type RecipientType = 'student' | 'parent' | 'both';

const RECIPIENT_OPTIONS: { value: RecipientType; label: string }[] = [
  { value: 'student', label: 'الطالب' },
  { value: 'parent', label: 'ولي الأمر' },
  { value: 'both', label: 'الاثنين معًا' },
];

const WhatsAppSetup: React.FC = () => {
  const { instructorData, user, token } = useApp();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [savedInstanceId, setSavedInstanceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 🔹 إعدادات مستقبل الرسائل
  const [recipientType, setRecipientType] = useState<RecipientType>('both');
  const [isSavingRecipient, setIsSavingRecipient] = useState(false);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(false);

  const teacherId = instructorData?.id || user?.id;
  const teacherName = instructorData?.name || user?.name;

  // 🔹 تحميل Instance ID محفوظ
  useEffect(() => {
    if (teacherId) {
      const saved = localStorage.getItem(`whatsapp_instance_${teacherId}`);
      if (saved) {
        setSavedInstanceId(saved);
        setInstanceId(saved);
      }
    }
  }, [teacherId]);

  // 🔹 تحميل إعداد المستقبل المحفوظ من الباك اند
  useEffect(() => {
    const loadRecipientSetting = async () => {
      if (!teacherId || !token) return;
      setIsLoadingRecipient(true);
      try {
        const response = await api.get(`/whatsapp/settings/${teacherId}`);
        const data = response.data;
        if (data?.recipientType) {
          setRecipientType(data.recipientType as RecipientType);
        }
      } catch (error: any) {
        // مفيش إعداد محفوظ لسه، مش مشكلة - بنستخدم الافتراضي "both"
        console.warn('⚠️ لا يوجد إعداد مستقبل محفوظ بعد، سيتم استخدام الافتراضي.');
      } finally {
        setIsLoadingRecipient(false);
      }
    };
    loadRecipientSetting();
  }, [teacherId, token]);

  // 🔹 حفظ إعداد المستقبل في الباك اند
  const saveRecipientSetting = async (newValue: RecipientType) => {
    if (!teacherId) return;

    const previousValue = recipientType;
    setRecipientType(newValue); // تحديث فوري في الواجهة (optimistic update)
    setIsSavingRecipient(true);

    try {
      const response = await api.post('/whatsapp/settings', {
        teacherId,
        recipientType: newValue,
      });

      const data = response.data;
      if (data.status === 'error') {
        throw new Error(data.message || 'فشل في حفظ الإعداد');
      }

      toast({
        title: '✅ تم الحفظ',
        description: 'تم تحديث إعداد إرسال الرسائل بنجاح',
      });
    } catch (error: any) {
      console.error('❌ Error saving recipient setting:', error);
      setRecipientType(previousValue); // رجوع للقيمة القديمة لو فشل الحفظ
      const msg = error.response?.data?.message || error.message || 'حدث خطأ أثناء حفظ الإعداد';
      toast({
        title: '❌ خطأ',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsSavingRecipient(false);
    }
  };
// أضف هذه الدالة في ملف WhatsAppSetup.tsx

const deleteWhatsAppInstance = async () => {
  if (!teacherId) {
    toast({
      title: 'خطأ',
      description: 'معلم غير محدد',
      variant: 'destructive',
    });
    return;
  }

  // تأكيد الحذف من المستخدم
  const confirmDelete = window.confirm(
    '⚠️ هل أنت متأكد من حذف اتصال واتساب؟\n' +
    'سيتم إلغاء ربط الحساب ولن تتمكن من إرسال رسائل.'
  );

  if (!confirmDelete) return;

  setIsLoading(true);

  try {
    const response = await api.delete(`/teachers/${teacherId}/whatsapp-instance`);
    
    // تنظيف البيانات المحلية
    localStorage.removeItem(`whatsapp_instance_${teacherId}`);
    setInstanceId(null);
    setQrCode(null);
    setStatus('idle');
    setSavedInstanceId(null);

    toast({
      title: '✅ تم الحذف',
      description: 'تم إلغاء ربط حساب واتساب بنجاح',
    });
  } catch (error: any) {
    console.error('❌ Error deleting instance:', error);
    toast({
      title: '❌ خطأ في الحذف',
      description: error.response?.data?.message || 'حدث خطأ أثناء حذف البيانات',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};
  // 🔹 دالة جلب QR Code من الباك اند بتاعنا
  const generateQR = async () => {
    if (!token) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await api.post('/whatsapp/connect', {
        teacherId,
      });

      const data = response.data;

      if (data.status === 'error') {
        throw new Error(data.message || 'فشل في إنشاء رمز QR');
      }

      if (!data.qr_code) {
        throw new Error('لم يتم استلام رمز QR من الخادم');
      }

      setQrCode(data.qr_code);
      setInstanceId(data.instance_id);
      setStatus('idle');

      toast({
        title: '✅ تم إنشاء رمز QR',
        description: 'امسح الكود باستخدام واتساب لربط حسابك',
      });
    } catch (error: any) {
      console.error('❌ Error generating QR:', error);
      setStatus('error');
      const msg = error.response?.data?.message || error.message || 'حدث خطأ أثناء إنشاء الرمز';
      setErrorMessage(msg);
      toast({
        title: '❌ خطأ',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 دالة التحقق من الاتصال (عبر الباك اند بتاعنا)
  const checkConnection = async () => {
    if (!instanceId) {
      toast({
        title: 'تنبيه',
        description: 'يرجى إنشاء رمز QR أولاً',
        variant: 'default',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.get(`/whatsapp/status/${instanceId}`);
      const data = response.data;

      if (data.status === 'connected') {
        setStatus('connected');
        toast({
          title: '✅ متصل!',
          description: 'حساب واتساب مرتبط بنجاح',
        });
      } else {
        setStatus('idle');
        toast({
          title: '⏳ في انتظار الاتصال',
          description: 'لم يتم ربط الحساب بعد، يرجى مسح الكود',
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('❌ Error checking connection:', error);
      const msg = error.response?.data?.message || error.message || 'حدث خطأ أثناء التحقق';
      toast({
        title: '❌ خطأ',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 حفظ محلياً
  const saveLocalInstance = () => {
    if (!instanceId) {
      toast({
        title: 'تنبيه',
        description: 'لا يوجد Instance ID للحفظ',
        variant: 'default',
      });
      return;
    }

    localStorage.setItem(`whatsapp_instance_${teacherId}`, instanceId);
    setSavedInstanceId(instanceId);

    toast({
      title: '💾 تم الحفظ محلياً',
      description: `تم حفظ Instance ID: ${instanceId}`,
    });
  };

  // 🔹 حفظ في الخادم
  const saveInstanceToServer = async () => {
    if (!instanceId || !teacherId) {
      toast({
        title: 'خطأ',
        description: 'بيانات غير مكتملة',
        variant: 'destructive',
      });
      return;
    }

    if (status !== 'connected') {
      toast({
        title: 'تنبيه',
        description: 'يرجى التأكد من اتصال واتساب أولاً',
        variant: 'default',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/teacher/save-whatsapp-instance', {
        teacherId,
        instanceId,
        status: 'active',
        teacherName,
      });

      console.log('✅ Save Response:', response.data);

      setSavedInstanceId(instanceId);

      toast({
        title: '✅ تم الحفظ في الخادم',
        description: 'تم ربط حساب واتساب بالمعلم بنجاح',
      });
    } catch (error: any) {
      console.error('❌ Error saving instance:', error);
      toast({
        title: '❌ خطأ في الحفظ',
        description: error.message || 'حدث خطأ أثناء حفظ البيانات',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 نسخ Instance ID
  const copyInstanceId = () => {
    if (!instanceId) return;
    navigator.clipboard.writeText(instanceId);
    toast({
      title: '📋 تم النسخ',
      description: 'تم نسخ Instance ID إلى الحافظة',
    });
  };

  // 🔹 عرض حالة الاتصال
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="mr-2 h-4 w-4" /> متصل
          </span>
        );
      case 'loading':
        return (
          <span className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري الاتصال...
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
            <XCircle className="mr-2 h-4 w-4" /> خطأ
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-sm">
            <QrCode className="mr-2 h-4 w-4" /> في انتظار المسح
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-2xl">📱 إعدادات واتساب للمعلم</span>
            {getStatusBadge()}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            المعلم: <strong>{teacherName || 'غير محدد'}</strong>
            {teacherId && (
              <span className="ml-3">
                ID: <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{teacherId}</span>
              </span>
            )}
          </p>
          {savedInstanceId && (
            <p className="text-xs text-green-600 mt-1">
              ✅ Instance ID محفوظ: <span className="font-mono">{savedInstanceId}</span>
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateQR}
              disabled={isLoading}
              className="flex-1 min-w-[150px]"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء رمز QR جديد'}
            </Button>


{instanceId && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <Button
      onClick={saveLocalInstance}
      variant="secondary"
      className="flex-1"
      disabled={isLoading}
    >
      <Save className="h-4 w-4 mr-2" />
      حفظ محلياً
    </Button>

    <Button
      onClick={saveInstanceToServer}
      variant="default"
      className="flex-1"
      disabled={isLoading || status !== 'connected'}
    >
      <Save className="h-4 w-4 mr-2" />
      حفظ في الخادم
      {status !== 'connected' && ' (انتظر الاتصال)'}
    </Button>

    {/* 🔹 زر الحذف الجديد */}
    <Button
      onClick={deleteWhatsAppInstance}
      variant="destructive"
      className="flex-1"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <XCircle className="h-4 w-4 mr-2" />
      )}
      حذف الاتصال
    </Button>
  </div>
)}
          </div>

          {qrCode && (
            <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-xl bg-gray-50 dark:bg-gray-800/50 transition-all">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  className="w-64 h-64 object-contain"
                  onError={(e) => {
                    console.error('❌ QR Image Error:', e);
                    setStatus('error');
                    setErrorMessage('فشل في تحميل صورة QR Code');
                  }}
                />
              </div>
              <div className="mt-4 text-center space-y-2">
                <p className="text-sm text-gray-600">📱 امسح الكود باستخدام واتساب</p>
                <p className="text-xs text-gray-400">الإعدادات ← الأجهزة المرتبطة ← ربط جهاز</p>
                {instanceId && (
                  <p className="text-xs text-gray-400 mt-2 font-mono bg-gray-100 px-3 py-1 rounded-full inline-block">
                    ID: {instanceId}
                  </p>
                )}
                <p className="text-xs text-yellow-600">⏱ ينتهي خلال 5 دقائق</p>
              </div>
            </div>
          )}

          {instanceId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={saveLocalInstance}
                variant="secondary"
                className="flex-1"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                حفظ محلياً
              </Button>

              <Button
                onClick={saveInstanceToServer}
                variant="default"
                className="flex-1"
                disabled={isLoading || status !== 'connected'}
              >
                <Save className="h-4 w-4 mr-2" />
                حفظ في الخادم
                {status !== 'connected' && ' (انتظر الاتصال)'}
              </Button>
            </div>
          )}

          <div className="text-sm text-gray-500 border-t pt-4 mt-4 space-y-2">
            <p className="font-semibold text-gray-700">📌 دليل الاستخدام:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>اضغط <strong>"إنشاء رمز QR جديد"</strong> لإنشاء كود جديد</li>
              <li>افتح واتساب ← الإعدادات ← الأجهزة المرتبطة ← ربط جهاز</li>
              <li>امسح الكود الظاهر على الشاشة</li>
              <li>اضغط <strong>"تحقق"</strong> للتأكد من الاتصال</li>
              <li>بعد الاتصال، اضغط <strong>"حفظ في الخادم"</strong> لتثبيت الإعدادات</li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <p className="text-yellow-700 text-xs">
                ⚠️ <strong>ملاحظة:</strong> كل معلم له Instance ID خاص به.
                احتفظ بالـ ID الخاص بك ولا تشاركه مع الآخرين.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 كارت مستقل لإعدادات مستقبل الرسائل */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            نتيجة امتحان (الصفحة الرئيسية)
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            اختر لمن يتم إرسال رسالة نتيجة الامتحان عبر واتساب
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-6" dir="rtl">
            {RECIPIENT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="recipientType"
                  value={option.value}
                  checked={recipientType === option.value}
                  onChange={() => saveRecipientSetting(option.value)}
                  disabled={isSavingRecipient || isLoadingRecipient}
                  className="h-4 w-4 accent-primary cursor-pointer"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
            {(isSavingRecipient || isLoadingRecipient) && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppSetup;