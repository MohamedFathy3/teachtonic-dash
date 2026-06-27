/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import api from "@/lib/api";

export function useTeacherMeta(teacherId?: number) {
    const [stages, setStages] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!teacherId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // ✅ جلب بيانات المعلم كاملة
                const response = await api.get(`/teacher/${teacherId}`);
                console.log('📚 Full Teacher Response:', response.data);
                
                const teacherData = response.data?.data;
                
                // ✅ استخراج البيانات من المكان الصحيح
                const stagesData = teacherData?.website?.stages || [];
                const subjectsData = teacherData?.website?.subjects || [];
                
                console.log('📚 Stages from API:', stagesData);
                console.log('📚 Subjects from API:', subjectsData);
                
                setStages(stagesData);
                setSubjects(subjectsData);
                
                // ✅ جلب العروض
                try {
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
                    
                    console.log('🎁 Offers from API:', offersResponse.data);
                    const offersData = offersResponse.data?.data || [];
                    setOffers(offersData);
                } catch (offerError) {
                    console.error('Error fetching offers:', offerError);
                    setOffers([]);
                }
                
            } catch (error) {
                console.error('Error fetching teacher meta:', error);
                setError('Failed to load teacher data');
                setStages([]);
                setSubjects([]);
                setOffers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [teacherId]);

    return { 
        stages, 
        subjects, 
        offers, 
        loading,
        error
    };
}