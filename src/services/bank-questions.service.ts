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
}

export const bankQuestionsService = new BankQuestionsService();