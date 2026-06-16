/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/select-configs.ts

import api from '@/lib/api';
import type { AsyncSelectOption } from '@/components/ui/AsyncSelect';
import { courseService } from '@/services/course.service';

export interface SelectConfig {
  endpoint: string;
  orderBy: string;
  orderByDirection?: 'asc' | 'desc';
  searchField?: string;
  searchFields?: string[];
  labelField?: string;
  labelFieldAr?: string;
  idField?: string;
  transformData?: (item: any) => AsyncSelectOption;
  customFetcher?: (params: {
    page: number;
    perPage: number;
    search?: string;
    extraFilters?: Record<string, any>;
  }) => Promise<{ data: AsyncSelectOption[]; meta: any }>;
}

export const SELECT_CONFIGS: Record<string, SelectConfig> = {
  stages: {
    endpoint: '/stage/index',
    orderBy: 'position',
    orderByDirection: 'asc',
    searchField: 'name',
    labelField: 'name',
    labelFieldAr: 'name_ar',
    searchFields: ['name', 'name_ar']
  },
  
  subjects: {
    endpoint: '/subject/index',
    orderBy: 'position',
    orderByDirection: 'asc',
    searchField: 'name',
    labelField: 'name',
    labelFieldAr: 'name_ar',
    searchFields: ['name', 'name_ar'],
    
    // ✅ إضافة customFetcher لدعم الفلترة حسب المرحلة
    customFetcher: async (params) => {
      const { page, perPage, search, extraFilters } = params;
        console.log('🔥🔥🔥 Subjects customFetcher called with:', { 
    page, 
    perPage, 
    search, 
    extraFilters 
  });
      const requestBody: any = {
        filters: {},
        orderBy: 'position',
        orderByDirection: 'asc',
        perPage,
        page,
        paginate: true,
      };

      if (search) {
        requestBody.search = search;
        requestBody.searchFields = ['name', 'name_ar'];
      }

      // 🔥 فلترة المواد حسب المرحلة (stage_id)
      if (extraFilters?.stage_id) {
        requestBody.filters.stage_id = extraFilters.stage_id;
        console.log('🔍 Filtering subjects by stage_id:', extraFilters.stage_id);
      }

      console.log('🔍 Subjects Request Body:', requestBody);

      const response = await api.post('/subject/index', requestBody);

      const data = response.data.data.map((subject: any) => ({
        id: subject.id,
        name: subject.name,
        name_ar: subject.name_ar,
        original: subject,
      }));

      return {
        data,
        meta: response.data.meta,
      };
    },
  },
    courseLessons: {
    endpoint: '/course-detail/index',
    orderBy: 'id',
    orderByDirection: 'desc',
    labelField: 'title',
    labelFieldAr: 'title_ar',
    customFetcher: async (params) => {
      const filters: Record<string, any> = {};

      // 🔥 فلتر أساسي: course_id مطلوب
      if (params.extraFilters?.course_id) {
        filters.course_id = params.extraFilters.course_id;
      } else {
        // إذا لم يتم إرسال course_id، نرجع مصفوفة فارغة
        return {
          data: [],
          meta: { total: 0, last_page: 1, current_page: 1, per_page: params.perPage },
        };
      }

      // فلتر إضافي: teacher_id
      if (params.extraFilters?.teacher_id) {
        filters.teacher_id = params.extraFilters.teacher_id;
      }

      // فلتر إضافي: stage_id
      if (params.extraFilters?.stage_id) {
        filters.stage_id = params.extraFilters.stage_id;
      }

      const requestBody: any = {
        filters,
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage: params.perPage,
        page: params.page,
        paginate: true,
      };

      // 🔥 البحث في الدروس
      if (params.search) {
        requestBody.search = params.search;
        requestBody.searchFields = ['titles', 'titles_ar', 'description', 'description_ar'];
      }

      console.log('📤 CourseLessons Request:', requestBody);

      const response = await api.post('/course-detail/index', requestBody);

      const data = response.data.data.map((lesson: any) => ({
        id: lesson.id,
        name: lesson.titles?.[0] || lesson.title || `Lesson ${lesson.id}`,
        name_ar: lesson.titles_ar?.[0] || lesson.title_ar || `الدرس ${lesson.id}`,
        original: lesson,
        course_id: lesson.course_id,
        price: lesson.price,
        lession_date: lesson.lession_date,
        lession_time: lesson.lession_time,
        description: lesson.description,
        description_ar: lesson.description_ar,
        attended: lesson.attended,
        must_pass_to_unlock: lesson.must_pass_to_unlock,
      }));

      return {
        data,
        meta: response.data.meta,
      };
    },
  },

  teachers: {
    endpoint: '/teacher/index',
    orderBy: 'name',
    orderByDirection: 'asc',
    searchField: 'name',
    labelField: 'name',
    labelFieldAr: 'name',
  },
  
  'assistant-teachers': {
    endpoint: '/assistant-teacher/index',
    orderBy: 'name',
    orderByDirection: 'asc',
    searchField: 'name',
    labelField: 'name',
    labelFieldAr: 'name',
  },

 // src/config/select-configs.ts

courses: {
  endpoint: '/course/index',
  orderBy: 'id',
  orderByDirection: 'desc',
  labelField: 'title',
  labelFieldAr: 'title_ar',
  customFetcher: async (params) => {
    // 🔥 بناء الفلاتر من extraFilters
    const filters: Record<string, any> = {};
    
    // ✅ إضافة teacher_id من extraFilters
    if (params.extraFilters?.teacher_id) {
      filters.teacher_id = params.extraFilters.teacher_id;
    }
    
    // ✅ إضافة stage_id من extraFilters (لو موجود)
    if (params.extraFilters?.stage_id) {
      filters.stage_id = params.extraFilters.stage_id;
    }
    
    // ✅ إضافة semester_id من extraFilters (لو موجود)
    if (params.extraFilters?.semester_id) {
      filters.semester_id = params.extraFilters.semester_id;
    }
    
    // ✅ إضافة subject_id من extraFilters (لو موجود)
    if (params.extraFilters?.subject_id) {
      filters.subject_id = params.extraFilters.subject_id;
    }

    console.log('📤 Courses filters:', filters);

    // 🔥 استخدم courseService مع الفلاتر
    const response = await courseService.getAllCourses(
      filters, // الفلاتر
      params.perPage,
      params.page,
      params.search || '',
      false // showDeleted
    );

    const data = response.data.map((course: any) => ({
      id: course.id,
      name: course.title,
      name_ar: course.title_ar,
      original: course,
      price: course.price,
      type: course.type,
      stage_id: course.stage_id,
      subject_id: course.subject_id,
      semester_id: course.semester_id,
    }));

    return {
      data,
      meta: response.meta,
    };
  },
},

  lessons: {
    endpoint: '/course-detail/index',
    orderBy: 'id',
    orderByDirection: 'desc',
    labelField: 'title',
    labelFieldAr: 'title_ar',
    customFetcher: async (params) => {
      const filters: Record<string, any> = {};

      if (params.extraFilters?.teacher_id) {
        filters.teacher_id = params.extraFilters.teacher_id;
      }

      if (params.extraFilters?.stage_id) {
        filters.stage_id = params.extraFilters.stage_id;
      }

      if (params.extraFilters?.course_id) {
        filters.course_id = params.extraFilters.course_id;
      }

      const requestBody: any = {
        filters,
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage: params.perPage,
        page: params.page,
        paginate: true,
      };

      if (params.search) {
        requestBody.search = params.search;
        requestBody.searchFields = ['titles', 'titles_ar', 'description', 'description_ar'];
      }

      const response = await api.post('/course-detail/index', requestBody);

      const data = response.data.data.map((lesson: any) => ({
        id: lesson.id,
        name: lesson.titles?.[0] || lesson.title || `Lesson ${lesson.id}`,
        name_ar: lesson.titles_ar?.[0] || lesson.title_ar || `الدرس ${lesson.id}`,
        original: lesson,
        course_id: lesson.course_id,
        price: lesson.price,
        lession_date: lesson.lession_date,
        lession_time: lesson.lession_time,
        description: lesson.description,
        description_ar: lesson.description_ar,
      }));

      return {
        data,
        meta: response.data.meta,
      };
    },
  },
  
  semesters: {
    endpoint: '/semesters/index',
    orderBy: 'id',
    orderByDirection: 'desc',
    labelField: 'name',
    labelFieldAr: 'name_ar',
    customFetcher: async (params) => {
      const { page, perPage, search, extraFilters } = params;

      const requestBody: any = {
        filters: {},
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
      };

      if (search) {
        requestBody.search = search;
        requestBody.searchFields = ['name', 'name_ar'];
      }

      if (extraFilters?.teacher_id) {
        requestBody.filters.teacher_id = extraFilters.teacher_id;
      }

      const response = await api.post('/semesters/index', requestBody);

      const data = response.data.data.map((semester: any) => ({
        id: semester.id,
        name: semester.name,
        name_ar: semester.name_ar,
        original: semester,
        price: semester.price,
        active: semester.active,
        teacher_id: semester.teacher_id,
      }));

      return {
        data,
        meta: response.data.meta,
      };
    },
  },

};