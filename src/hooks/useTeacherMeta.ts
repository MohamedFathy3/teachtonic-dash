import { useState, useEffect } from "react";
import api from "@/lib/api";

export function useTeacherMeta(teacherId?: number) {
    const [stages, setStages] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        if (!teacherId) return;

        api.get(`/teacher/${teacherId}`).then(res => {
            const teacher = res.data.data;
            setStages(teacher.website?.stages || []);
            setSubjects(teacher.website?.subjects || []);
        });
    }, [teacherId]);

    return { stages, subjects };
}