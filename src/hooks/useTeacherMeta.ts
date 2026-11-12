/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import api from "@/lib/api";

const TEACHER_META_TTL = 5 * 60 * 1000;
const teacherMetaCacheKey = (teacherId: number, includeOffers: boolean) =>
    `teacher-meta:${teacherId}:${includeOffers ? "with-offers" : "basic"}`;

interface TeacherMetaCache {
    stages: any[];
    subjects: any[];
    offers: any[];
    savedAt: number;
}

export function useTeacherMeta(
    teacherId?: number,
    options: { includeOffers?: boolean } = {},
) {
    const { includeOffers = true } = options;
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

        const cacheKey = teacherMetaCacheKey(teacherId, includeOffers);
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached) as TeacherMetaCache;
                if (Date.now() - parsed.savedAt < TEACHER_META_TTL) {
                    setStages(parsed.stages || []);
                    setSubjects(parsed.subjects || []);
                    setOffers(parsed.offers || []);
                    setLoading(false);
                    return;
                }
                sessionStorage.removeItem(cacheKey);
            }
        } catch {
            sessionStorage.removeItem(cacheKey);
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // ✅ جلب بيانات المعلم كاملة
                const response = await api.get(`/teacher/${teacherId}`);
                const teacherData = response.data?.data;
                
                // ✅ استخراج البيانات من المكان الصحيح
                const stagesData = teacherData?.website?.stages || [];
                const subjectsData = teacherData?.website?.subjects || [];
                
                setStages(stagesData);
                setSubjects(subjectsData);

                let offersData: any[] = [];
                
                if (includeOffers) {
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

                        offersData = offersResponse.data?.data || [];
                        setOffers(offersData);
                    } catch (offerError) {
                        console.error('Error fetching offers:', offerError);
                        setOffers([]);
                    }
                } else {
                    setOffers([]);
                }

                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify({
                        stages: stagesData,
                        subjects: subjectsData,
                        offers: offersData,
                        savedAt: Date.now(),
                    } satisfies TeacherMetaCache));
                } catch {
                    // Storage can be unavailable or full; the API response is still valid.
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
    }, [teacherId, includeOffers]);

    return { 
        stages, 
        subjects, 
        offers, 
        loading,
        error
    };
}
