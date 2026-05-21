// src/types/dashboard.types.ts

export interface DashboardCourse {
    id: number;

    title: string;

    category: string;

    students: number;

    price: number;


    status: 'published' | 'draft';

    image: string;

    semesterName?: string;
    discount?: number;
    priceBeforeDiscount?: number;
    lessonsCount?: number;
    examsCount?: number;
    assignmentsCount?: number;


    description?: string;
    stageId?: number;
    subjectId?: number;

    duration?: string;
    startDate?: string;
    endDate?: string;

    active?: boolean;

    totalContent?: number; // lessons + exams + assignments
}