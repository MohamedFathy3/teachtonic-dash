/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { externalApi } from '@/lib/api';
import api from '@/lib/api';
import { Loader2, QrCode, CheckCircle, XCircle, RefreshCw, Copy, Save, AlertCircle } from 'lucide-react';

// 🔧 دالة مساعدة: تستخرج أول كائن JSON صالح من أي نص،
// حتى لو السيرفر طبع قبله PHP Warning/Notice أو أي HTML زيادة.
// السبب: بعض الـ endpoints بتاعت wzila.com بترجّع warning زي:
// "<br /><b>Warning</b>: ... on line 65<br />{"status":"success",...}"
// فلو حاولنا نعمل JSON.parse للرد كامل، هيفشل. الحل إننا نجيب الرد كنص خام
// (responseType: 'text') وبعدين نستخرج منه أول { ... } ونعمل parse له بس.
const extractJson = (raw: any): any => {
  // لو axios قدر يعمل parse لوحده (رد نضيف)، استخدمه زي ما هو
  if (raw && typeof raw === 'object') return raw;

  const str = String(raw ?? '');
  const match = str.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error('لم يتم العثور على بيانات JSON صالحة في رد السيرفر');
  }

  try {
    return JSON.parse(match[0]);
  } catch {
    throw new Error('تعذر تحليل رد السيرفر (JSON غير صالح)');
  }
};

const WhatsAppSetup: React.FC = () => {
  const { instructorData, user, token } = useApp();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [savedInstanceId, setSavedInstanceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const teacherId = instructorData?.id || user?.id;
  const teacherName = instructorData?.name || user?.name;

  // 🔹 تحميل Instance ID محفوظ
  useEffect(() => {
    if (teacherId) {
      const saved = localStorage.getItem(`whatsapp_instance_${teacherId}`);
      if (saved) {
        setSavedInstanceId(saved);
        setInstanceId(saved);
        console.log('📂 Loaded saved instance:', saved);
      }
    }
  }, [teacherId]);

  // 🔹 دالة جلب QR Code - الخطوتين مع بعض
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
      console.log('🔄 1. جلب Instance ID جديد...');
      console.log('🔑 Using token:', token);

      // ✅ الخطوة 1: جلب Instance ID جديد
      // ⚠️ responseType: 'text' مهم عشان مايحصلش فشل تلقائي في الـ parsing
      // لو السيرفر طبع Warning قبل الـ JSON
      const instanceResponse = await externalApi.get(
        `https://wzila.com/whatsapp/api/get_instance_id_key.php?access_token=6a162117743d3`,
        { responseType: 'text' }
      );

      console.log('✅ Instance Raw Response:', instanceResponse.data);

      const instanceData = extractJson(instanceResponse.data);

      console.log('✅ Instance Parsed Response:', instanceData);

      // تحقق من نجاح العملية
      if (instanceData.status !== 'success') {
        throw new Error(instanceData.message || 'فشل في إنشاء معرف الجلسة');
      }

      // 🔑 استخراج الـ ID الجديد
      const newInstanceId = instanceData.instance_id;
      setInstanceId(newInstanceId);
      console.log('✅ New Instance ID:', newInstanceId);

      // ✅ الخطوة 2: استخدم الـ ID الجديد في الرابط التاني
      console.log('🔄 2. جلب QR Code باستخدام ID:', newInstanceId);
      const qrResponse = await externalApi.get(
        `https://apis.wzila.com/get_qrcode?access_token=6a162117743d3&instance_id=${newInstanceId}`,
        { responseType: 'text' }
      );

      console.log('✅ QR Raw Response:', qrResponse.data);

      const qrData = extractJson(qrResponse.data);

      console.log('✅ QR Parsed Response:', qrData);

      // تحقق من نجاح جلب QR Code
      if (qrData.status === 'success' && qrData.base64) {
        setQrCode(qrData.base64);
        setStatus('idle');
        toast({
          title: '✅ تم إنشاء رمز QR',
          description: 'امسح الكود باستخدام واتساب لربط حسابك (ينتهي خلال 5 دقائق)',
        });
      } else {
        throw new Error(qrData.message || 'فشل في جلب رمز QR');
      }
    } catch (error: any) {
      console.error('❌ Error generating QR:', error);
      setStatus('error');
      setErrorMessage(error.message || 'حدث خطأ أثناء إنشاء الرمز');
      toast({
        title: '❌ خطأ',
        description: error.message || 'حدث خطأ أثناء إنشاء الرمز',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 دالة التحقق من الاتصال
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
      console.log('🔄 Checking connection for:', instanceId);

      const response = await externalApi.get(
        `https://apis.wzila.com/check_connection?access_token=6a162117743d3&instance_id=${instanceId}`,
        { responseType: 'text' }
      );

      console.log('✅ Connection Check Raw:', response.data);

      const connectionData = extractJson(response.data);

      console.log('✅ Connection Check Parsed:', connectionData);

      if (connectionData.status === 'connected') {
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
      toast({
        title: '❌ خطأ',
        description: error.message || 'حدث خطأ أثناء التحقق',
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
      console.log('🔄 Saving instance to server:', { teacherId, instanceId, status });

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
    <div className="container mx-auto p-6 max-w-3xl">
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
              <>
                <Button
                  variant="outline"
                  onClick={checkConnection}
                  className="min-w-[100px]"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  تحقق
                </Button>
                <Button
                  variant="outline"
                  onClick={copyInstanceId}
                  className="min-w-[80px]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </>
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
    </div>
  );
};

export default WhatsAppSetup;