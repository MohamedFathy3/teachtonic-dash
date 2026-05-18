import api from '@/lib/api';
import { TeacherResponse } from '@/types/teacherProfile.types';
import { BaseService } from './base.service';

class TeachersService extends BaseService<TeacherResponse> {
    constructor() {
        super('teacher');
    }

    async getTeacherById(teacherId: number): Promise<TeacherResponse> {
        const response = await api.get(`/teacher/${teacherId}`);
   console.log("teacherId", teacherId);
    console.log("API Response", response.data);

        return response.data.data;
    }
}

export default new TeachersService();