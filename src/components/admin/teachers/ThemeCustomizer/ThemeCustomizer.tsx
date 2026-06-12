// ==================== src/components/admin/teachers/components/ThemeCustomizer/ThemeCustomizer.tsx ====================
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTeacherTheme, THEMES_CONFIG } from '@/hooks/useTeacherTheme';
import { ThemeCard } from './ThemeCard';
import { ColorPicker } from './ColorPicker';
import { ThemePreview } from './ThemePreview';
import { WebsitePreview } from './WebsitePreview';
import { Globe, RefreshCw, Sparkles, Award, Save, Eye, Palette, Layout, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface ThemeCustomizerProps {
  teacherId: number;
  teacherName?: string;
}

interface TeacherData {
  id: number;
  name: string;
  sub_domain: string;
  theme?: string;
  backgroud_color?: string;
  font_color?: string;
  imageUrl?: string;
}

export const ThemeCustomizer = ({ teacherId, teacherName }: ThemeCustomizerProps) => {
  const {
    activeTheme,
    backgroundColor,
    fontColor,
    isLoading,
    activateTheme,
    updateColors,
    refreshTheme
  } = useTeacherTheme(teacherId);
  
  const [localBgColor, setLocalBgColor] = useState(backgroundColor);
  const [localFontColor, setLocalFontColor] = useState(fontColor);
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  
  // جلب بيانات المعلم (خصوصاً sub_domain)
  const fetchTeacherData = useCallback(async () => {
    if (!teacherId) return;
    
    setLoadingTeacher(true);
    try {
      const response = await api.get(`/teacher/${teacherId}`);
      console.log("Teacher data:", response.data);
      
      if (response.data?.result === "Success" && response.data?.data) {
        setTeacherData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoadingTeacher(false);
    }
  }, [teacherId]);
  
  useEffect(() => {
    setLocalBgColor(backgroundColor);
    setLocalFontColor(fontColor);
  }, [backgroundColor, fontColor]);
  
  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);
  
  const handleThemeSelect = async (themeName: string, defaultBg: string, defaultFont: string) => {
    const result = await activateTheme(themeName, defaultBg, defaultFont);
    if (!result.success) {
      toast.error(result.message);
    }
  };
  
  const handleSaveColors = async () => {
    const result = await updateColors(localBgColor, localFontColor);
    if (!result.success) {
      toast.error(result.message);
    }
  };
  
  const teacherSubdomain = teacherData?.sub_domain;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/70">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Website Theme Settings</h2>
              <p className="text-muted-foreground text-sm">
                Customize the appearance of your public website
              </p>
              {teacherName && (
                <p className="text-xs text-muted-foreground mt-1">
                  For: <span className="font-medium text-foreground">{teacherName}</span>
                </p>
              )}
              {teacherSubdomain && (
                <p className="text-xs text-primary mt-1">
                  Website: {teacherSubdomain}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refreshTheme} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>
      
      {/* Tabs for Themes, Colors, and Live Preview */}
      <Tabs defaultValue="themes" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full justify-start">
          <TabsTrigger value="themes" className="gap-2">
            <Layout className="h-4 w-4" />
            Themes
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Live Preview
          </TabsTrigger>
        </TabsList>
        
        {/* Themes Tab */}
        <TabsContent value="themes">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 w-fit mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Choose Your Theme</h3>
              <p className="text-muted-foreground mt-2">
                Select a design that represents your teaching brand
              </p>
              {activeTheme && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  <Award className="h-3 w-3" />
                  Current: {activeTheme === 'theme1' ? 'Scientific Theme' : 'Basic Theme'}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {THEMES_CONFIG.map((theme) => (
                <ThemeCard
                  key={theme.name}
                  theme={theme}
                  isActive={activeTheme === theme.name}
                  onClick={() => handleThemeSelect(theme.name, theme.defaultBg, theme.defaultFont)}
                />
              ))}
            </div>
          </Card>
        </TabsContent>
        
        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Custom Colors</h4>
                <p className="text-sm text-muted-foreground">
                  Personalize your theme with custom colors
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPicker
                label="Background Color"
                color={localBgColor}
                onChange={setLocalBgColor}
              />
              <ColorPicker
                label="Font Color"
                color={localFontColor}
                onChange={setLocalFontColor}
              />
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveColors} disabled={isLoading || !activeTheme} className="gap-2">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Colors
              </Button>
            </div>
            
            {/* Mini Preview inside Colors tab */}
            <ThemePreview backgroundColor={localBgColor} fontColor={localFontColor} />
          </Card>
        </TabsContent>
        
        {/* Live Preview Tab - Website iframe */}
        <TabsContent value="preview" className="p-0">
          {loadingTeacher ? (
            <Card className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Loading website preview...</p>
            </Card>
          ) : teacherSubdomain ? (
            <WebsitePreview 
              teacherSlug={teacherSubdomain}
              activeTheme={activeTheme}
              backgroundColor={localBgColor}
              fontColor={localFontColor}
            />
          ) : (
            <Card className="p-8 text-center">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Cannot load preview: Teacher website address (subdomain) is missing.</p>
              <p className="text-xs text-muted-foreground mt-2">Please make sure the teacher has a subdomain configured.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};