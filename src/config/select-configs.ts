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
  // 🔥 customFetcher يدخل له extraFilters
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
   
  },
  subjects: {
    endpoint: '/subject/index',
    orderBy: 'position',
    orderByDirection: 'asc',
    searchField: 'name',
    labelField: 'name',
    labelFieldAr: 'name_ar',
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

  courses: {
    endpoint: '/course/index',
    orderBy: 'id',
    orderByDirection: 'desc',
    labelField: 'title',
    labelFieldAr: 'title_ar',
    customFetcher: async (params) => {
      const response = await courseService.getAllCourses(
        {},
        params.perPage,
        params.page,
        params.search || ''
      );

      const data = response.data.map((course: any) => ({
        id: course.id,
        name: course.title,
        name_ar: course.title_ar,
        original: course,
        price: course.price,
        type: course.type,
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
      // 🔥 نبني الـ filters مع course_id من extraFilters
      const filters: Record<string, any> = {};

      // 🔥 المهم: نضيف course_id من extraFilters
      if (params.extraFilters?.course_id) {
        filters.course_id = params.extraFilters.course_id;
      }

      const requestBody: any = {
        filters,  // 🔥 هنا هنبعت course_id
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage: params.perPage,
        page: params.page,
        paginate: true,
      };

      if (params.search) {
        requestBody.search = params.search;
        requestBody.searchFields = ['title', 'title_ar'];
      }

      console.log('🔍 Lessons Request:', requestBody);

      const response = await api.post('/course-detail/index', requestBody);

      const data = response.data.data.map((lesson: any) => ({
        id: lesson.id,
        name: lesson.title,
        name_ar: lesson.title_ar,
        original: lesson,
        course_id: lesson.course_id,
        price: lesson.price,
        lession_date: lesson.lession_date,
        lession_time: lesson.lession_time,
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

      console.log('🔍 Semesters extraFilters received:', extraFilters);

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

      // 🔥 إضافة teacher_id من extraFilters
      if (extraFilters?.teacher_id) {
        requestBody.filters.teacher_id = extraFilters.teacher_id;
      }

      console.log('🔍 Semesters requestBody:', requestBody); // للتأكد

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