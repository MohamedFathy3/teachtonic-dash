
export interface Student {
    name: string;
    id: number;

    email: string;

    phone?: string;

    avatar?: string;

    progress?: number;

    status?: 'active' | 'inactive';
    created_at: string;
    joined_at?: string;
    enrolledCourses?: number;

    completedCourses?: number;

    totalAssignments?: number;

    totalExams?: number;

    totalPoints?: number;

    teacher_id: number;
    lastActive?: string;
}