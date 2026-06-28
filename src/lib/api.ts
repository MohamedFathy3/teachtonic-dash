/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/api.ts
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "/api";

// 🟢 Helper function for conditional logging
const isDevelopment = import.meta.env.DEV;

const logOnlyDev = (...args: any[]) => {
  if (isDevelopment) {
  }
};

const errorOnlyDev = (...args: any[]) => {
  if (isDevelopment) {
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true, 
});

// 🔧 متغير لتتبع حالة CSRF
let csrfTokenRetrieved = false;


// 🟢 Interceptor محسن للطلبات
api.interceptors.request.use(async (config) => {
  const token = Cookies.get("token");
  const method = config.method?.toUpperCase();

  if (isDevelopment) {
    logOnlyDev("🔍 API Request Details:", {
      url: config.url,
      method: method,
      hasToken: !!token,
      baseURL: config.baseURL,
    });
  }

  // 🟢 الحصول على CSRF token قبل الطلبات التي تغير البيانات
  if (method && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    logOnlyDev("🔄 CSRF Token required for", method, "request");
    
    // إضافة X-XSRF-TOKEN header إذا كان موجود في الـ cookies
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    if (xsrfToken) {
      config.headers["X-XSRF-TOKEN"] = xsrfToken;
      logOnlyDev("✅ X-XSRF-TOKEN header added");
    }
  }

  // 🟢 إضافة Authorization header إذا كان التوكن موجود
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    logOnlyDev("✅ Authorization header added");
  }

  if (isDevelopment) {
    logOnlyDev("📋 Final Request Headers:", config.headers);
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      logOnlyDev("✅ Success Response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    errorOnlyDev("📡 Response Status:", error.response?.status, error.response?.statusText);

    // 🔄 معالجة خطأ 419 (CSRF Token Mismatch)
    if (error.response?.status === 419) {
      logOnlyDev("🔄 419 CSRF Token Mismatch - Retrying with new token...");
      
      // إعادة تعيين حالة CSRF
      csrfTokenRetrieved = false;
      
      try {
        // الحصول على CSRF token جديد
        
        // إعادة الطلب الأصلي
        if (originalRequest) {
          logOnlyDev("🔄 Retrying original request with new CSRF token");
          return api(originalRequest);
        }
      } catch (retryError) {
        errorOnlyDev("❌ Failed to retry request after 419:", retryError);
      }
    }

    // 🚨 معالجة خطأ 401 (Unauthorized)
    if (error.response?.status === 401) {
      logOnlyDev("🔐 401 Unauthorized - Removing token and redirecting to login");
      Cookies.remove("token");
      window.location.href = "/login";
    }

    if (isDevelopment) {
      errorOnlyDev("🚨 API Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }

    return Promise.reject(error);
  }
);

// 🟢 دالة لتهيئة التطبيق بـ CSRF token
export const initializeApp = async (): Promise<void> => {
  logOnlyDev("🚀 Initializing app with CSRF token...");
  logOnlyDev("🚀 App initialized successfully");
};

export default api;