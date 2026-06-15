/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import api from "@/lib/api";

export function useTeacherMeta(teacherId?: number) {
    const [stages, setStages] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [offers, setOffers] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!teacherId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/teacher/${teacherId}`);
                const teacher = response.data.data;
                setStages(teacher.website?.stages || []);
                setSubjects(teacher.website?.subjects || []);
                
                const offersResponse = await api.post('/offer/index', {
                    filters: {
                        teacher_id: teacherId,
                        type: 'offer',
                        active: true,
                    },
                    orderByDirection: 'desc',
                    perPage: 100,
                    paginate: false,
                });
                setOffers(offersResponse.data?.data || []);
            } catch (error) {
                console.error('Error fetching teacher meta:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [teacherId]);

    return { stages, subjects, offers, loading };
}