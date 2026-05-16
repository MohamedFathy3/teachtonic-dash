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
import { Loader2, LogIn, Mail, Lock, Shield, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@admin.com');
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
        navigate('/dashboard', { replace: true });
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const iconVariants = {
    hover: { scale: 1.1, rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/30 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 dark:from-purple-600/10 dark:to-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className="z-10 w-full max-w-md px-4"
      >
        <Card className="relative overflow-hidden border-0 shadow-2xl dark:shadow-purple-500/10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ padding: '1px', borderRadius: '1rem' }} />
          
          <CardHeader className="relative space-y-1 text-center pb-8 pt-8">
            <motion.div 
              className="flex justify-center mb-4"
              whileHover="hover"
              variants={iconVariants}
            >
              <div className="h-20 w-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-glow">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {lang === 'ar' ? 'قم بتسجيل الدخول إلى حسابك' : 'Sign in to your account'}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative">
            <form onSubmit={handleSubmit} className="space-y-6">
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
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
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
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200`}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
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
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200`}
                  />
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {lang === 'ar' ? 'جاري التسجيل...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
            
            <motion.div 
              className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <p>{lang === 'ar' ? 'بيانات تجريبية: admin@admin.com' : 'Demo credentials: admin@admin.com'}</p>
              </div>
              <p className="text-xs mt-2">
                {lang === 'ar' ? 'تواصل مع المسؤول للحصول على صلاحية الوصول' : 'Contact your administrator for access'}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;