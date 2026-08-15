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
import { Loader2, LogIn, Mail, Lock, Shield, Sparkles, Zap, Rocket, Crown, Gem, Award, Star, Users, BookOpen, TrendingUp, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logos.png'

// صورة جديدة
const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, user, isLoading: authLoading, t, dir, lang } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 Auth state check:', { isAuthenticated, user, authLoading });
    
    if (!authLoading && isAuthenticated && user) {
      console.log('✅ User is authenticated, navigating based on role:', user.role);
      
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
    visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const formVariants = {
    hidden: { opacity: 0, x: dir === 'rtl' ? 60 : -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.2, ease: "easeOut" } }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.3, ease: "easeOut" } }
  };

  // ✅ إحصائيات
  const stats = [
    { value: "50K+", label: lang === 'ar' ? 'طلاب' : 'Students', icon: Users },
    { value: "500+", label: lang === 'ar' ? 'دورات' : 'Courses', icon: BookOpen },
    { value: "4.9", label: lang === 'ar' ? 'تقييم' : 'Rating', icon: Star },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-950">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardContent className="pt-12 pb-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
                  <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
                </div>
                <div className="text-center">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {t("checkingAuth") || "Checking authentication..."}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {t("pleaseWait") || "Please wait"}
                  </p>
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
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-950 overflow-hidden p-4"
    >
      <div className="w-full max-w-6xl h-[90vh] max-h-[800px] flex rounded-3xl shadow-2xl overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-800/50">
        
        {/* ===== LEFT SIDE - HERO ===== */}
        <motion.div 
          variants={imageVariants}
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
          style={{ order: dir === 'rtl' ? 2 : 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-pink-600/90 z-10" />
          <img 
            src={LOGIN_IMAGE}
            alt="Fusion Login"
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-white">
            <div className="text-center space-y-6 max-w-md">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                  <img 
                    src={logo}
                    alt="Fusion LMS"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </motion.div>
              
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-4xl font-black tracking-tight"
              >
                <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                  Fusion
                </span>
                <span className="block text-2xl font-bold text-white/80 mt-1">
                  {lang === 'ar' ? 'منصة تعليمية متكاملة' : 'Complete Learning Platform'}
                </span>
              </motion.h2>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="text-lg text-white/90 leading-relaxed"
              >
                {lang === 'ar' 
                  ? '🚀 المنصة الأسرع والأسهل في مصر للمعلمين والطلاب'
                  : '🚀 The fastest and easiest platform in Egypt for teachers and students'
                }
              </motion.p>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="flex items-center justify-center gap-6 pt-4"
              >
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Icon className="w-5 h-5 text-white/70" />
                        <div className="text-2xl font-black">{stat.value}</div>
                      </div>
                      <div className="text-sm text-white/70">{stat.label}</div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Features */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="flex items-center justify-center gap-4 pt-2 text-xs text-white/60"
              >
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'آمن' : 'Secure'}
                </span>
                <span className="w-px h-4 bg-white/20" />
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'سريع' : 'Fast'}
                </span>
                <span className="w-px h-4 bg-white/20" />
                <span className="flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'متميز' : 'Premium'}
                </span>
              </motion.div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent z-10" />
        </motion.div>

        {/* ===== RIGHT SIDE - FORM ===== */}
        <motion.div 
          variants={formVariants}
          className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12"
          style={{ order: dir === 'rtl' ? 1 : 2 }}
        >
          <div className="w-full max-w-md">
            
            {/* Logo - Mobile */}
            <div className="text-center mb-6">
              <motion.div 
                className="flex justify-center mb-4 lg:hidden"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <img 
                    src={logo}
                    alt="Fusion LMS"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </motion.div>
              
              <motion.h1 
                className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back'}
              </motion.h1>
              
              <motion.p 
                className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {lang === 'ar' 
                  ? 'سجل الدخول إلى لوحة التحكم' 
                  : 'Sign in to your dashboard'}
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {localError && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 rounded-xl">
                    <AlertDescription className="text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {localError}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </Label>
                <div className="relative group">
                  <Mail className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="mr.eslammohamed@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} h-12 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 text-sm`}
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                    {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                  </Label>
                  <button 
                    type="button"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                  >
                    {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative group">
                  <Lock className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} h-12 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 transition-all duration-300 rounded-xl group text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {lang === 'ar' ? 'جاري التسجيل...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                      <ArrowRight className={`ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
            
            {/* Footer */}
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <Shield className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ar' 
                    ? '🔒 دخول آمن ومحمي' 
                    : '🔒 Secure & Protected Login'}
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {lang === 'ar' 
                  ? 'تواصل مع المسؤول للحصول على صلاحية الوصول' 
                  : 'Contact your administrator for access'}
              </p>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ✅ أيقونات إضافية
const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOff = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default AdminLoginPage;