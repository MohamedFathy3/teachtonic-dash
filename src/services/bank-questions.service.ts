/* eslint-disable @typescript-eslint/no-explicit-any */

import api from '@/lib/api';
import type { PaginatedBankQuestionsResponse } from '@/types/bank-questions.types';

class BankQuestionsService {
    async getAllBankQuestions(params: { 
        page?: number; 
        perPage?: number;
        search?: string;
        stage_id?: number | null;
        subject_id?: number | null;
        course_id?: number | null;        // ✅ فلتر الكورس
        course_detail_id?: number | null; // ✅ فلتر الدرس
        question_type?: string | null;
        min_mark?: number | null;
        max_mark?: number | null;
        teacher_id?: number;
        [key: string]: any 
    } = {}): Promise<PaginatedBankQuestionsResponse> {
        
        const { 
            page = 1, 
            perPage = 10,
            search,
            stage_id,
            subject_id,
            course_id,        // ✅ فلتر الكورس
            course_detail_id, // ✅ فلتر الدرس
            question_type,
            min_mark,
            max_mark,
            teacher_id,
            ...rest 
        } = params;

        // ✅ بناء object الفلاتر
        const filters: Record<string, any> = {};
        
        if (stage_id) filters.stage_id = stage_id;
        if (subject_id) filters.subject_id = subject_id;
        if (course_id) filters.course_id = course_id;              // ✅ فلتر الكورس داخل filters
        if (course_detail_id) filters.course_detail_id = course_detail_id; // ✅ فلتر الدرس داخل filters
        if (question_type) filters.question_type = question_type;
        if (min_mark !== undefined && min_mark !== null) filters.min_mark = min_mark;
        if (max_mark !== undefined && max_mark !== null) filters.max_mark = max_mark;
        if (search) filters.search = search;
        if (teacher_id) filters.teacher_id = teacher_id;

        // ✅ بناء الـ body بالشكل المطلوب
        const body: Record<string, any> = {
            perPage: perPage,
            paginate: true,
            orderBy: "id",
            orderByDirection: "asc",
        };

        // ✅ إضافة filters لو فيه قيم
        if (Object.keys(filters).length > 0) {
            body.filters = filters;
        }

        // ✅ إضافة باقي الـ params
        if (page) body.page = page;
        
        // ✅ دمج أي params إضافية
        Object.assign(body, rest);

        console.log('📤 Sending request to API:', {
            url: '/bank-questions/index',
            body: body
        });

        const response = await api.post('/bank-questions/index', body);
        
        console.log('📥 API Response:', response.data);
        
        return response.data as PaginatedBankQuestionsResponse;
    }

    // ✅ دالة حذف السؤال
    async deleteBankQuestion(id: number): Promise<{ message: string }> {
        console.log('📤 Deleting question with ID:', id);
        
        try {
            const response = await api.delete(`/bank-questions/${id}`);
            console.log('📥 Delete response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error deleting question:', error);
            throw error;
        }
    }

    // ✅ دالة حذف السؤال باستخدام courseDetail/student
    async deleteBankQuestionByCourseDetail(courseDetailId: number, studentId: number): Promise<{ message: string }> {
        console.log('📤 Deleting question by course detail:', { courseDetailId, studentId });
        
        try {
            const response = await api.delete(`/bank-questions/${courseDetailId}/${studentId}`);
            console.log('📥 Delete response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error deleting question:', error);
            throw error;
        }
    }

    // ✅ دالة إنشاء سؤال جديد
    async createBankQuestion(data: any): Promise<any> {
        console.log('📤 Creating new question:', data);
        
        try {
            const response = await api.post('/bank-questions', data);
            console.log('📥 Create response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating question:', error);
            throw error;
        }
    }

    // ✅ دالة تحديث سؤال
    async updateBankQuestion(id: number, data: any): Promise<any> {
        console.log('📤 Updating question:', { id, data });
        
        try {
            const response = await api.put(`/bank-questions/${id}`, data);
            console.log('📥 Update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error updating question:', error);
            throw error;
        }
    }

    // ✅ دالة جلب سؤال واحد
    async getBankQuestion(id: number): Promise<any> {
        console.log('📤 Fetching question with ID:', id);
        
        try {
            const response = await api.get(`/bank-questions/${id}`);
            console.log('📥 Get question response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching question:', error);
            throw error;
        }
    }
}

export const bankQuestionsService = new BankQuestionsService();