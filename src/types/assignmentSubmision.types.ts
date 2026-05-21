/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/assignmentSubmision.types.ts

export type QuestionType = 'true_false' | 'essay' | 'multiple_choice';

export interface AssignmentQuestion {
    id: number;
    exam_id: number;
    // API may send string values, so keep it permissive
    question_type: QuestionType | string;
    question: string;
    mark: string;
    image: string | null;
    correct_answer: string | null;
    options: any[];
    created_at: string;
    updated_at: string;
}

export interface AssignmentImage {
    id: number;
    name: string;
    mimeType: string;
    size: number;
    authorId: number | null;
    previewUrl: string;
    fullUrl: string;
    createdAt: string;
}

export interface Assignment {
    id: number;
    title: string;
    description: string;
    type: string;

    questions: AssignmentQuestion[];

    total_marks: number;
    total_must_pass_marks: number;

    duration_minutes: number;
    random_questions: boolean;
    random_answers: boolean;
    show_result: boolean;

    active: boolean | null;

    imageUrl: string;
    image: AssignmentImage | null;

    // timestamps from API
    created_at: string;
    updated_at: string; 
    courseTitle?: string;
}

