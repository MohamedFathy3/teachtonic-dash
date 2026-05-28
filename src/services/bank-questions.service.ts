/* eslint-disable @typescript-eslint/no-explicit-any */

import api from '@/lib/api';
import type { PaginatedBankQuestionsResponse } from '@/types/bank-questions.types';

class BankQuestionsService {
    async getAllBankQuestions(params: { page?: number; perPage?: number;[key: string]: any } = {}): Promise<PaginatedBankQuestionsResponse> {
        const page = params.page ?? 1;
        const perPage = params.perPage ?? 10;

        // Backend looks like Laravel paginator response.
        // Existing services in this project often use POST /{endpoint}/index with a request body.
        const body: Record<string, any> = {
            perPage,
            page,
            paginate: true,
            ...params,
        };

        // Remove duplicate keys just in case
        delete body.perPage;
        delete body.page;

        // keep consistent with body
        body.perPage = perPage;
        body.page = page;

        const response = await api.post('/bank-questions/index', body);
        // Response sample in task: { status, message, data, links, meta }
        return response.data as PaginatedBankQuestionsResponse;
    }
}

export const bankQuestionsService = new BankQuestionsService();

