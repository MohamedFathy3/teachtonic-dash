// src/utils/lesson/formatters.ts

export const formatDate = (date: string, lang: string): string => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string, lang: string): string => {
  if (!date) return '—';
  return new Date(date).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
};

export const getEmbedUrl = (url: string): string => {
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'www.youtube.com/embed/');
  }
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  return url;
};

export const getInitials = (name: string): string => {
  if (!name) return 'S';
  return name.charAt(0).toUpperCase();
};