// src/components/admin/teachers/components/ThemeCustomizer/ThemePreview.tsx
import { motion } from 'framer-motion';

interface ThemePreviewProps {
  backgroundColor: string;
  fontColor: string;
}

export const ThemePreview = ({ backgroundColor, fontColor }: ThemePreviewProps) => (
  <div className="mt-6 p-4 rounded-xl border bg-muted/20">
    <p className="text-sm font-medium mb-3">Live Preview</p>
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-lg transition-all duration-300"
      style={{ backgroundColor, color: fontColor }}
    >
      <p className="font-medium">Sample Text</p>
      <p className="text-sm opacity-80 mt-1">
        This is how your theme will look with the selected colors.
      </p>
      <div className="flex gap-2 mt-3">
        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${fontColor}20` }}>
          Primary Badge
        </span>
        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${fontColor}10` }}>
          Secondary Badge
        </span>
      </div>
    </motion.div>
  </div>
);