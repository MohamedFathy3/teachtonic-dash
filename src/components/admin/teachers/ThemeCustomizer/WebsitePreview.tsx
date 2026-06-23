// ==================== src/components/admin/teachers/components/ThemeCustomizer/WebsitePreview.tsx ====================
import { useState } from 'react';
import { Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WebsitePreviewProps {
  teacherSlug: string; // الـ sub_domain الخاص بالمعلم، مثل "Mreslammohamed.com"
  activeTheme: string | null;
  backgroundColor: string;
  fontColor: string;
}

export const WebsitePreview = ({ teacherSlug, activeTheme, backgroundColor, fontColor }: WebsitePreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0); // لإعادة تحميل الـ Iframe

  // بناء رابط المعاينة مع إضافة query parameter للتمييز
  // نفترض أن الدومين الأساسي للمنصة هو https://web-lec.com/
  const baseWebsiteUrl = `https://web-lec.com//${teacherSlug}`;
  const previewUrl = `${baseWebsiteUrl}?preview=true&theme=${activeTheme}&bg=${backgroundColor.replace('#', '')}&font=${fontColor.replace('#', '')}`;

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1); // تغيير الـ key يعيد تحميل الـ Iframe
  };

  const openInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl">
      {/* Header Bar للـ Preview */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30" style={{ borderColor: `${fontColor}20` }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-2 truncate max-w-md">
            {baseWebsiteUrl}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh} title="Refresh Preview">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openInNewTab} title="Open in New Tab">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Iframe لعرض الموقع */}
      <div className="relative bg-white" style={{ height: '70vh', minHeight: '500px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading website preview...</p>
            </div>
          </div>
        )}
        <iframe
          key={iframeKey}
          src={previewUrl}
          className="w-full h-full border-0"
          title={`Preview of ${teacherSlug}'s website`}
          onLoad={() => setIsLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        />
      </div>
    </Card>
  );
};