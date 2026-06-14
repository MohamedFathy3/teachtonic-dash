// src/components/admin/teachers/components/ThemeCustomizer/ColorPicker.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  color: string | null;
  onChange: (color: string | null) => void;
  className?: string;
}

export const ColorPicker = ({ 
  label, 
  color, 
  onChange, 
  className 
}: ColorPickerProps) => {
  // حذف اللون (يرجع null)
  const handleClear = () => {
    onChange(null);
  };

  // هل اللون محدد؟
  const hasColor = color !== null && color !== '';

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded border shadow-sm" 
          style={{ backgroundColor: hasColor ? color : '#e5e7eb' }} 
        />
        {label}
      </Label>
      
      <div className="flex gap-3 items-center">
        {hasColor ? (
          // حالة وجود لون
          <>
            <Input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-20 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#RRGGBB"
              className="font-mono flex-1"
            />
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleClear}
              className="shrink-0 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200"
              title="Remove color"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          // حالة عدم وجود لون (null)
          <>
            <div className="flex-1 px-3 py-2 rounded-md border bg-gray-50 dark:bg-gray-900 text-gray-400 text-sm">
              No color selected
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => onChange('#3b82f6')}
              className="shrink-0 gap-1"
            >
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Pick color
            </Button>
          </>
        )}
      </div>
      
      {/* رسالة توضيحية */}
      {!hasColor && (
        <p className="text-xs text-muted-foreground">
          ✨ No color selected - theme default will be used
        </p>
      )}
    </div>
  );
};