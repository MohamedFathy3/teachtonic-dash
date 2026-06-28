/* eslint-disable @typescript-eslint/no-explicit-any */
// ==================== src/services/teacherTheme.service.ts ====================
import api from '@/lib/api';

export interface WebsiteThemeData {
  status: boolean;
  teacher_id: number;
  active_theme: string | null;
  active_backgroud_color: string;
  active_font_color: string;
}

export interface ActivateThemeResponse {
  status: boolean;
  message: string;
  data: {
    teacher_id: number;
    active_theme: string;
    active_backgroud_color: string;
    active_font_color: string;
    themes: Array<{
      name: string;
      active: boolean;
    }>;
  };
}

class TeacherWebsiteThemeService {
  private static instance: TeacherWebsiteThemeService;
  
  private constructor() {}
  
  public static getInstance(): TeacherWebsiteThemeService {
    if (!TeacherWebsiteThemeService.instance) {
      TeacherWebsiteThemeService.instance = new TeacherWebsiteThemeService();
    }
    return TeacherWebsiteThemeService.instance;
  }
  
  async getWebsiteTheme(teacherId: number): Promise<WebsiteThemeData> {
    const response = await api.post(`/teachers/theme`, { 
      teacher_id: teacherId 
    });
    return response.data;
  }
  
  async activateWebsiteTheme(
    teacherId: number,
    theme: string,
    backgroundColor?: string | null,
    fontColor?: string | null
  ): Promise<ActivateThemeResponse> {
    const payload: any = {
      theme: theme,
      teacher_id: teacherId
    };
    
    // ✅ لو اللون null أو undefined أو "null" → نبعت string "null"
    if (backgroundColor === null || backgroundColor === undefined || backgroundColor === 'null') {
      payload.backgroud_color = "null";
    } else if (backgroundColor && backgroundColor.trim() !== '') {
      payload.backgroud_color = backgroundColor;
    }
    
    if (fontColor === null || fontColor === undefined || fontColor === 'null') {
      payload.font_color = "null";
    } else if (fontColor && fontColor.trim() !== '') {
      payload.font_color = fontColor;
    }
    
   ("📤 Activate theme payload:", payload);
    
    const response = await api.post<ActivateThemeResponse>('/activate/theme', payload);
   ("📥 Activate theme response:", response.data);
    
    return response.data;
  }
}

export const teacherWebsiteThemeService = TeacherWebsiteThemeService.getInstance();