// src/App.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import AdminLoginPage from "./pages/login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TeacherProfileView } from "./pages/admin/TeacherProfileView"; // 🔥 استورد الـ Component صح

const queryClient = new QueryClient();

const App = () => {
  
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<AdminLoginPage />} />
              <Route path="/admin/teachers/profile" element={<TeacherProfileView />} />
              <Route path="/admin/*" element={<Index />} />
              <Route path="/instructor/*" element={<Index />} />
              <Route path="/*" element={<Index />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;