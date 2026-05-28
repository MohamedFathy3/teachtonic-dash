/* eslint-disable @typescript-eslint/no-explicit-any */

export interface BankQuestionMediaImage {
    id: number;
    name: string;
    mimeType: string;
    size: number;
    previewUrl: string;
    fullUrl: string;
}

export interface BankQuestionOption {
    id?: number;
    option_text: string;
    is_correct: boolean;
}

export interface BankQuestion {
    id: number;
    teacher: string;
    stage: string;
    subject: string;
    question_type: 'true_false' | 'multiple_choice' | 'essay' | string;
    question: string;
    mark: number | string;
    correct_answer: string | null;
    image: BankQuestionMediaImage | null;
    options: BankQuestionOption[];
    createdAt?: string;
}

export interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

export interface BankQuestionsMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: any[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface PaginatedBankQuestionsResponse {
    status: boolean;
    message: string;
    data: BankQuestion[];
    links: PaginationLinks;
    meta: BankQuestionsMeta;
}

