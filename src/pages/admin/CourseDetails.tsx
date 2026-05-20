import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useCourses } from "@/hooks/useCourses";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/lms/StatusBadge";
import { Users, Calendar, Clock } from "lucide-react";
import type { CourseDetail as Lesson } from "@/types/course-detail.types";

export function CourseDetails() {
    const { id } = useParams();
    const { fetchCourseById, selectedCourse, loading } = useCourses();

    useEffect(() => {
        if (!id) return;
        fetchCourseById(Number(id));
    }, [id, fetchCourseById]);

    if (loading || !selectedCourse) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
                Loading course...
            </div>
        );
    }

    const c = selectedCourse;

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">

            {/* HERO COMPACT */}
            <Card className="relative overflow-hidden rounded-2xl">
                <div className="h-[260px] relative">
                    <img src={c.imageUrl} className="w-full h-full object-cover" />

                    <div className="absolute inset-0 bg-black/60" />

                    <div className="absolute bottom-4 left-4 text-white">
                        <h1 className="text-2xl font-bold">{c.title}</h1>
                        <p className="text-sm opacity-80">{c.teacher.name}</p>
                    </div>

                    <div className="absolute top-3 right-3">
                        <StatusBadge status={c.active ? "active" : "inactive"} />
                    </div>
                </div>
            </Card>

            {/* MAIN INFO SINGLE CARD */}
            <Card className="p-6 rounded-2xl space-y-6">

                {/* TOP INFO */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-xl font-bold text-primary">${c.price}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{c.count_student} Students</span>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                            {c.start_date} → {c.end_date}
                        </span>
                    </div>
                </div>

                {/* META INFO */}
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                        📚 Stage: <span className="text-foreground">{c.stage.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {c.hour_time_course}
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                    <h2 className="font-semibold mb-2">Description</h2>
                    <div
                        className="text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: c.description }}
                    />
                </div>

                {/* ABOUT */}
                <div>
                    <h2 className="font-semibold mb-2">About</h2>
                    <div
                        className="text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: c.about }}
                    />
                </div>
            </Card>

            {/* LESSONS (CLEAN LIST) */}
            <Card className="p-6 rounded-2xl">
                <h2 className="font-semibold mb-4">Lessons</h2>

                {c.details.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No lessons yet</p>
                ) : (
                    <div className="space-y-3">
                        {c.details.map((d: Lesson) => (
                            <div
                                key={d.id}
                                className="flex justify-between items-center p-4 rounded-xl border hover:bg-muted/30 transition"
                            >
                                <div>
                                    <p className="font-medium">{d.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {d.description}
                                    </p>
                                </div>

                                <span className="font-semibold text-primary">
                                    ${d.price}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

        </div>
    );
}