/* eslint-disable @typescript-eslint/no-explicit-any */

import api from '@/lib/api';
import type { PaginatedBankQuestionsResponse } from '@/types/bank-questions.types';

class BankQuestionsService {
    async getAllBankQuestions(params: { page?: number; perPage?: number;[key: string]: any } = {}): Promise<PaginatedBankQuestionsResponse> {
        const { page = 1, perPage = 10, ...rest } = params;

        // ✅ امسح القيم الـ undefined عشان متتبعتش للـ API
        const cleanedRest = Object.fromEntries(
            Object.entries(rest).filter(([_, v]) => v !== undefined && v !== null)
        );

        const body: Record<string, any> = {
            page,
            perPage,
            paginate: true,
            ...cleanedRest, // ✅ بس الـ rest من غير page و perPage
        };

        const response = await api.post('/bank-questions/index', body);
        return response.data as PaginatedBankQuestionsResponse;
    }
}

export const bankQuestionsService = new BankQuestionsService();

