
export interface Student {
    name: string;
    id: number;

    email: string;

    phone?: string;

    avatar?: string;

    progress?: number;

    status?: 'active' | 'inactive';

    enrolledCourses?: number;

    completedCourses?: number;

    totalAssignments?: number;

    totalExams?: number;

    totalPoints?: number;

    lastActive?: string;
}