/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/login/index.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, Mail, Lock, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/1.png'
// صورة افتراضية - يمكنك تغيير الرابط بصورة أخرى
const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, isAuthenticated, user, isLoading: authLoading, t, dir, lang } = useApp();
  const navigate = useNavigate();

  // التحقق من المصادقة والتوجيه
  useEffect(() => {
    console.log('🔍 Auth state check:', { isAuthenticated, user, authLoading });
    
    if (!authLoading && isAuthenticated && user) {
      console.log('✅ User is authenticated, navigating based on role:', user.role);
      
      // التوجيه حسب الدور
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/instructor/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    
    console.log('📝 Submitting login form with:', { email, password: '***' });
    
    try {
      const result = await login(email, password);
      console.log('🎉 Login successful, result:', result);
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      
      // معالجة أخطاء الـ API
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setLocalError(errorMessages);
      } else if (err.response?.data?.message) {
        setLocalError(err.response.data.message);
      } else {
        setLocalError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const formVariants = {
    hidden: { opacity: 0, x: dir === 'rtl' ? 50 : -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, delay: 0.3, ease: "easeOut" } }
  };

  // عرض loading إذا كنا نتحقق من المصادقة
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          <Card className="w-full max-w-md shadow-xl border-0 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="pt-12 pb-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
                  <div className="absolute inset-0 h-12 w-12 rounded-full bg-purple-600/20 dark:bg-purple-400/20 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 font-medium">{t("checkingAuth") || "Checking authentication..."}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t("pleaseWait") || "Please wait"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 overflow-hidden p-4"
    >
      <div className="w-full max-w-6xl h-[90vh] max-h-[800px] flex rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800/95 backdrop-blur-xl">
        
        <motion.div 
          variants={imageVariants}
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
          style={{ order: dir === 'rtl' ? 2 : 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/90 to-indigo-600/90 z-10" />
          <img 
            src={LOGIN_IMAGE}
            alt="LMS Login"
            className="w-full h-full object-cover"
          />
          
          {/* محتوى فوق الصورة */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-white">
            <div className="text-center space-y-6 max-w-md">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="w-30 h-30 mx-auto bg-white/20-sm  flex items-center justify-center mb-6 ">
                   <img 
            src={logo}
            alt="LMS Login"
            className="w-full h-full object-cover"
          />
          
                </div>
              </motion.div>
              
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-4xl font-bold"
              >
                {lang === 'ar' ? ' Teacher Planet ' : 'Teacher Planet'}
              </motion.h2>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="text-lg text-white/90 leading-relaxed"
              >
                {lang === 'ar'   ? 'اسهل و اسرع منصة في مصر ليك يا مستر 🤍'
                  :  'The easiest and fastest platform in Egypt for you, Mr. 🤍'
                }
              </motion.p>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="flex items-center justify-center gap-6 pt-4"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm text-white/80">Students</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm text-white/80">Courses</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-sm text-white/80">Satisfaction</div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* زخرفة أسفل الصورة */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent z-10" />
        </motion.div>

        {/* الجهة اليسرى - الفورم */}
        <motion.div 
          variants={formVariants}
          className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12"
          style={{ order: dir === 'rtl' ? 1 : 2 }}
        >
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <motion.div 
                className="flex justify-center mb-4 lg:hidden"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="h-16 w-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </motion.div>
              
              <motion.h1 
                className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back'}
              </motion.h1>
              
              <motion.p 
                className="text-gray-500 dark:text-gray-400 mt-2"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {lang === 'ar' ? 'قم بتسجيل الدخول إلى حسابك' : 'Sign in to your account'}
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {localError && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                    <AlertDescription className="text-red-800 dark:text-red-300 text-sm">
                      {localError}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </Label>
                <div className="relative group">
                  <Mail className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder={lang === 'ar' ? 'admin@admin.com' : 'admin@admin.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200 text-sm`}
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                    {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                  </Label>
                  <button 
                    type="button"
                    className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                  >
                    {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative group">
                  <Lock className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200`} />
                  <Input
                    id="password"
                    type="password"
                    placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200 text-sm`}
                  />
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {lang === 'ar' ? 'جاري التسجيل...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
            
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
             
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2.5">
                {lang === 'ar' ? 'تواصل مع المسؤول للحصول على صلاحية الوصول' : 'Contact your administrator for access'}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminLoginPage;