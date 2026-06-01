// hooks/useCourseDetails.ts
import { useQuery } from '@tanstack/react-query';
import teachersService from '@/services/teachers.service';

export const useCourseDetails = (courseId: number) => {
  return useQuery({
    queryKey: ['course-details', courseId],
    queryFn: () => teachersService.getCourseDetails(courseId),
    enabled: !!courseId,
  });
};

// hooks/useCourseExams.ts
import { useExams } from './useExams';

export const useCourseExams = (courseId: number) => {
  const { exams, fetchExams } = useExams({ autoFetch: false });
  
  // Filter exams by course_id
  const courseExams = exams.filter(exam => exam.course_id === courseId);
  
  return {
    exams: courseExams,
    fetchExams: () => fetchExams(),
  };
};