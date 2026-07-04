// src/components/lesson-details/LessonVideos.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { EmptyState } from './SharedComponents';
import { getEmbedUrl } from '@/utils/lesson/formatters';

interface LessonVideosProps {
  videos: string[];
  lang: string;
}

export const LessonVideos: React.FC<LessonVideosProps> = ({ videos, lang }) => {
  const validVideos = videos.filter(v => v?.trim());

  if (validVideos.length === 0) {
    return <EmptyState icon={Video} message={lang === 'ar' ? 'لا توجد فيديوهات لهذا الدرس' : 'No videos for this lesson'} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {validVideos.map((video, idx) => (
        <Card key={idx} className="overflow-hidden rounded-xl hover:shadow-lg transition-all">
          <div className="aspect-video bg-black/5">
            <iframe
              src={getEmbedUrl(video)}
              title={`Video ${idx + 1}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
          <CardContent className="p-3">
            <a href={video} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
              {lang === 'ar' ? `فيديو ${idx + 1}` : `Video ${idx + 1}`}
              <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};