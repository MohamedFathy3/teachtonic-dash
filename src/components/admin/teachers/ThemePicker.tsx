// src/components/admin/teachers/ThemePicker.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ThemeOption {
  id: string;
  name: string;
  lightImage: string;
  darkImage: string;
  previewClass: string;
}

const themes: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default Blue',
    lightImage: 'https://placehold.co/300x200/3b82f6/ffffff?text=Blue+Theme',
    darkImage: 'https://placehold.co/300x200/1e40af/ffffff?text=Dark+Blue',
    previewClass: 'bg-blue-500'
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    lightImage: 'https://placehold.co/300x200/10b981/ffffff?text=Green+Theme',
    darkImage: 'https://placehold.co/300x200/047857/ffffff?text=Dark+Green',
    previewClass: 'bg-emerald-500'
  },
  {
    id: 'purple',
    name: 'Purple',
    lightImage: 'https://placehold.co/300x200/8b5cf6/ffffff?text=Purple+Theme',
    darkImage: 'https://placehold.co/300x200/6d28d9/ffffff?text=Dark+Purple',
    previewClass: 'bg-purple-500'
  },
  {
    id: 'rose',
    name: 'Rose',
    lightImage: 'https://placehold.co/300x200/f43f5e/ffffff?text=Rose+Theme',
    darkImage: 'https://placehold.co/300x200/be123c/ffffff?text=Dark+Rose',
    previewClass: 'bg-rose-500'
  },
  {
    id: 'orange',
    name: 'Orange',
    lightImage: 'https://placehold.co/300x200/f97316/ffffff?text=Orange+Theme',
    darkImage: 'https://placehold.co/300x200/c2410c/ffffff?text=Dark+Orange',
    previewClass: 'bg-orange-500'
  },
  {
    id: 'cyan',
    name: 'Cyan',
    lightImage: 'https://placehold.co/300x200/06b6d4/ffffff?text=Cyan+Theme',
    darkImage: 'https://placehold.co/300x200/0891b2/ffffff?text=Dark+Cyan',
    previewClass: 'bg-cyan-500'
  }
];

export function ThemePicker() {
  const { dir } = useApp();
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setSelectedTheme(savedTheme);
    
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) setIsDark(savedMode === 'true');
  }, []);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('theme', themeId);
    applyTheme(themeId, isDark);
  };

  const handleModeToggle = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem('darkMode', String(newMode));
    applyTheme(selectedTheme, newMode);
  };

  const applyTheme = (themeId: string, darkMode: boolean) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;
    
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    const colors = {
      default: { primary: '#3b82f6', primaryDark: '#1e40af' },
      emerald: { primary: '#10b981', primaryDark: '#047857' },
      purple: { primary: '#8b5cf6', primaryDark: '#6d28d9' },
      rose: { primary: '#f43f5e', primaryDark: '#be123c' },
      orange: { primary: '#f97316', primaryDark: '#c2410c' },
      cyan: { primary: '#06b6d4', primaryDark: '#0891b2' }
    };
    
    const color = colors[themeId as keyof typeof colors];
    if (color) {
      root.style.setProperty('--primary', color.primary);
      root.style.setProperty('--primary-dark', color.primaryDark);
    }
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Card className="rounded-2xl border-border p-6 shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Theme Picker</h3>
        <p className="text-sm text-muted-foreground mt-1">Choose your favorite theme style</p>
      </div>

      {/* Dark/Light Mode Toggle */}
      <div className="mb-6 flex items-center justify-between p-3 rounded-lg bg-muted/30">
        <Label className="font-medium">Dark Mode</Label>
        <button
          onClick={handleModeToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isDark ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isDark ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Theme Images Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
              selectedTheme === theme.id ? 'border-primary shadow-lg' : 'border-transparent'
            }`}
          >
            <img
              src={isDark ? theme.darkImage : theme.lightImage}
              alt={theme.name}
              className="w-full h-24 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">{theme.name}</span>
            </div>
            {selectedTheme === theme.id && (
              <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}