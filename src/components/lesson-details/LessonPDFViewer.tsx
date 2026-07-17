// src/components/lesson-details/LessonPDFViewer.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Loader2, 
  X,
  Maximize2,
  Minimize2,
  File,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';

interface LessonPDFViewerProps {
  pdfUrl: string;
  pdfName?: string;
  onClose?: () => void;
}

export const LessonPDFViewer: React.FC<LessonPDFViewerProps> = ({ 
  pdfUrl, 
  pdfName,
  onClose 
}) => {
  const { lang } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfName || 'lesson.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black/95 p-4' : 'w-full'}`}
    >
      <Card className={`overflow-hidden ${isFullscreen ? 'h-full rounded-none' : 'rounded-xl shadow-lg'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b bg-white/5 backdrop-blur-sm ${isFullscreen ? 'bg-black/80' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {pdfName || (lang === 'ar' ? 'ملف PDF' : 'PDF File')}
              </h3>
              <Badge variant="outline" className="text-[10px]">
                PDF
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Button */}
         

            {/* Fullscreen Toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={toggleFullscreen}
              className="gap-2"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            {/* Close Button */}
            {onClose && (
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* PDF Viewer */}
        <div className={`relative ${isFullscreen ? 'h-[calc(100%-80px)]' : 'h-[500px]'}`}>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground text-sm">
                {lang === 'ar' ? 'جاري تحميل PDF...' : 'Loading PDF...'}
              </p>
            </div>
          )}

          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            title={pdfName || 'PDF Viewer'}
          />
        </div>
      </Card>
    </motion.div>
  );
};

// ✅ Component لعرض PDF مصغر (thumbnail)
export const LessonPDFThumbnail: React.FC<{
  pdfUrl: string;
  pdfName?: string;
  onClick?: () => void;
}> = ({ pdfUrl, pdfName, onClick }) => {
  const { lang } = useApp();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <Card className="p-4 border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-4 rounded-xl bg-red-500/10">
              <File className="h-8 w-8 text-red-500" />
            </div>
            {isHovered && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1"
              >
                <div className="bg-primary rounded-full p-1">
                  <Eye className="h-3 w-3 text-white" />
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {pdfName || (lang === 'ar' ? 'ملف PDF' : 'PDF File')}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px]">
                PDF
              </Badge>
              <span className="text-xs text-muted-foreground">
                {lang === 'ar' ? 'اضغط للعرض' : 'Click to view'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                window.open(pdfUrl, '_blank');
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};