/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/api';
import { BaseService } from './base.service';

class TeachersService extends BaseService<any> {
    constructor() {
        super('teacher');
    }

    async getTeacherById(teacherId: number): Promise<any> {
        const response = await api.get(`/teacher/${teacherId}`);
        return response.data?.data;
    }

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

        const response = await api.post('/course/index', body);
        return response.data?.data ?? [];
    }

    async getCourseDetails(courseId: number): Promise<any[]> {
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

        const response = await api.post("/course-detail/index", body);
        
        if (response.data?.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        
        return [];
    }

    // ✅ جلب الامتحانات لدرس معين
    async getExamsByLessonId(lessonId: number): Promise<any[]> {
        const body = {
            filters: {
                course_detail_id: lessonId,
            },
            orderBy: "id",
            orderByDirection: "asc",
            perPage: 100,
            paginate: true,
            delete: false,
        };

        const response = await api.post("/exam/index", body);
        console.log(`📝 Exams for lesson ${lessonId}:`, response.data);
        
        return response.data?.data ?? [];
    }

    // ✅ جلب الواجبات لدرس معين
    async getAssignmentsByLessonId(lessonId: number): Promise<any[]> {
        const body = {
            filters: {
                course_detail_id: lessonId,
                type: "assignment",
            },
            orderBy: "id",
            orderByDirection: "asc",
            perPage: 100,
            paginate: true,
            delete: false,
        };

        const response = await api.post("/exam/index", body);
        console.log(`📋 Assignments for lesson ${lessonId}:`, response.data);
        
        return response.data?.data ?? [];
    }


// أضف هذه الدالة في TeachersService class

async getTeacherSemesters(teacherId: number): Promise<any[]> {
    const body = {
        filters: {
            teacher_id: teacherId,
        },
        orderBy: "id",
        orderByDirection: "desc",
        perPage: 100,
        paginate: true,
        delete: false,
    };

    const response = await api.post("/semesters/index", body);
    console.log("📚 Semesters response:", response.data);
    
    return response.data?.data ?? [];
}




// أضف هذه الدوال في TeachersService class

// ✅ جلب تفاصيل الترم مع الطلاب والكورسات
async getSemesterById(semesterId: number): Promise<any> {
    const response = await api.get(`/semesters/${semesterId}`);
    console.log(`📚 Semester ${semesterId} details:`, response.data);
    return response.data?.data;
}

// ✅ جلب تفاصيل الكورس مع الطلاب والتفاصيل
async getCourseById(courseId: number): Promise<any> {
    const response = await api.get(`/course/${courseId}`);
    console.log(`📚 Course ${courseId} details:`, response.data);
    return response.data?.data;
}

// ✅ جلب تفاصيل الدرس مع الامتحانات والواجبات والطلاب
async getCourseDetailById(courseDetailId: number): Promise<any> {
    const response = await api.get(`/course-detail/${courseDetailId}`);
    console.log(`📚 Course Detail ${courseDetailId}:`, response.data);
    return response.data?.data;
}

// ✅ جلب جميع الطلاب في ترم معين
async getStudentsBySemesterId(semesterId: number): Promise<any[]> {
    const response = await api.get(`/semesters/${semesterId}/students`);
    // لو مش موجود endpoint مخصص، استخدم الـ data من semester show
    const semester = await this.getSemesterById(semesterId);
    return semester?.students || [];
}

// ✅ جلب جميع الطلاب في كورس معين
async getStudentsByCourseId(courseId: number): Promise<any[]> {
    const response = await api.get(`/course/${courseId}/students`);
    // لو مش موجود endpoint مخصص، استخدم الـ data من course show
    const course = await this.getCourseById(courseId);
    return course?.students || [];
}

// ✅ جلب جميع الطلاب في درس معين
async getStudentsByCourseDetailId(courseDetailId: number): Promise<any[]> {
    const response = await api.get(`/course-detail/${courseDetailId}/students`);
    const courseDetail = await this.getCourseDetailById(courseDetailId);
    return courseDetail?.students || [];
}

async getTeacherBooks(teacherId: number): Promise<any[]> {
    const body = {
        filters: {
            teacher_id: teacherId,
        },
        orderBy: "id",
        orderByDirection: "asc",
        perPage: 100,
        paginate: true,
        delete: false,
    };

    const response = await api.post("/book/index", body);
    console.log("📚 Books response:", response.data);
    
    return response.data?.data ?? [];
}
    // ✅ جلب جميع الامتحانات للمدرس (مع فلتر الكورس)
   async getAllExamsByTeacher(teacherId: number): Promise<any[]> {
    const body = {
        filters: { teacher_id: teacherId },
        orderBy: "id",
        orderByDirection: "desc",
        perPage: 1000,
        paginate: true,
        delete: false,
    };
    const response = await api.post("/exam/index", body);
    console.log("📝 All Exams fetched:", response.data?.data?.length);
    return response.data?.data ?? [];
}
    // ✅ جلب جميع الواجبات للمدرس
    async getAllAssignmentsByTeacher(teacherId: number, courseId?: number): Promise<any[]> {
        const filters: any = { 
            teacher_id: teacherId,
            type: "assignment",
        };
        if (courseId) {
            filters.course_id = courseId;
        }
        
        const body = {
            filters: filters,
            orderBy: "id",
            orderByDirection: "desc",
            perPage: 100,
            paginate: true,
            delete: false,
        };

        const response = await api.post("/exam/index", body);
        return response.data?.data ?? [];
    }

    async getStudents(): Promise<any[]> {
        const body = {
            orderBy: "id",
            orderByDirection: "desc",
            perPage: 100,
            paginate: true,
            delete: false,
        };

        const response = await api.post("/student/index", body);
        return response.data?.data ?? [];
    }
}

export default new TeachersService();