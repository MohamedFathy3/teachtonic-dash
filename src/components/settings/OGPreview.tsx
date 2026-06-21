// src/components/settings/OGPreview.tsx

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

interface OGPreviewProps {
  formData: Record<string, string>;
  isRTL: boolean;
}

export const OGPreview: React.FC<OGPreviewProps> = ({ formData, isRTL }) => {
  const hasOGImage = formData.og_image && formData.og_image.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
          {isRTL ? 'معاينة المشاركة' : 'Share Preview'}
        </span>
        <Badge variant="outline" className="border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400">
          <Smartphone className="h-3 w-3 mr-1" />
          {isRTL ? 'معاينة حية' : 'Live Preview'}
        </Badge>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {hasOGImage && (
          <img 
            src={formData.og_image} 
            alt="OG Preview"
            className="w-full h-48 object-cover bg-gray-100 dark:bg-gray-800"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x630/6C63FF/FFFFFF?text=Image+Not+Found';
            }}
          />
        )}
        <div className="p-4 space-y-1">
          <h4 className="text-base font-semibold text-blue-600 dark:text-blue-400 line-clamp-1">
            {formData.og_title || formData.seo_title || formData.site_title || 'My Website'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {formData.og_description || formData.seo_description || formData.site_description || 'Welcome to our website'}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 truncate">
            {formData.site_url || 'https://example.com'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};