import api from '@/lib/api';
import { TeacherResponse } from '@/types/teacherProfile.types';
import { BaseService } from './base.service';

class TeachersService extends BaseService<TeacherResponse> {
    constructor() {
        super('teacher');
    }

    async getTeacherById(teacherId: number): Promise<TeacherResponse> {
        // ✅ استخدم نفس pattern الـ course/index
        const body = {
            filters: { id: teacherId },
            orderBy: 'id',
            orderByDirection: 'asc',
            perPage: 1,
            paginate: true,
            delete: false,
        };

        const response = await api.get(`/teacher/${teacherId}`);
        console.log("teacherId", teacherId);
        console.log("API Response", response.data);

        return response.data.data;
    }

    // ✅ جلب كورسات المدرس (online + center)
    async getTeacherCourses(teacherId: number, type?: 'online' | 'center'): Promise<any[]> {
        const body = {
            filters: {
                teacher_id: teacherId,
                ...(type && { type: type }),
            },
            orderBy: 'id',
            orderByDirection: 'desc',
            perPage: 50,
            paginate: true,
            delete: false,
        };

        const response = await api.post(`/course/index`, body);
        console.log("teacherId", teacherId);
        console.log("type", type);
        console.log("API Response", response.data);

        // ✅ رجع الـ data
        if (response.data?.data) {
            return response.data.data;
        }

        return [];
    }


    async getCourseDetails(courseId: number) {
        const body = {
            filters: {
                course_id: courseId,
            },
            orderBy: "id",
            orderByDirection: "asc",
            perPage: 100,
            paginate: true,
            delete: false,
        };

        const response = await api.post(
            "/course-detail/index",
            body
        );

        return response.data?.data ?? [];
    }
    async getStudents() {
    const body = {
        orderBy: "id",
        orderByDirection: "desc",
        perPage: 100,
        paginate: true,
        delete: false,
    };

    const response = await api.post(
        "/student/index",
        body
    );

    return response.data?.data ?? [];
}
}


export default new TeachersService();