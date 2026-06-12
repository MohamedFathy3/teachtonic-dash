// src/components/admin/teachers/components/ThemeCustomizer/ColorPicker.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker = ({ label, color, onChange, className }: ColorPickerProps) => (
  <div className={`space-y-2 ${className}`}>
    <Label className="flex items-center gap-2">
      <div className="w-4 h-4 rounded border shadow-sm" style={{ backgroundColor: color }} />
      {label}
    </Label>
    <div className="flex gap-3">
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
        className="font-mono"
      />
    </div>
  </div>
);