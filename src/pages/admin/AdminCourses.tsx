import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/lms/StatusBadge";
import { BookOpen, Star, Users, Plus } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";

export function AdminCourses() {
  const { t } = useApp();
  const { courses, loading } = useCourses();

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {/* HEADER */}
      <PageHeader
        title={t("courses")}
        description={`${courses.length} courses across the platform`}
        actions={
          <Button className="gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/70 shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4" /> Add course
          </Button>
        }
      />

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading courses...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card
              key={c.id}
              className="
                group relative overflow-hidden rounded-2xl
                border border-border/60
                bg-card/60 backdrop-blur-xl
                shadow-md hover:shadow-2xl
                transition-all duration-300
                hover:-translate-y-2
              "
            >
              {/* IMAGE SECTION */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={c.imageUrl}
                  className="
                    h-full w-full object-cover
                    transition-transform duration-500
                    group-hover:scale-110
                  "
                />

                {/* dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* STATUS */}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={c.active ? "active" : "inactive"} />
                </div>

                {/* TYPE BADGE */}
                <div className="absolute bottom-3 left-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md border border-white/20">
                    {c.type.toUpperCase()}
                  </span>
                </div>

                {/* ICON CENTER */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <div className="rounded-full bg-white/10 p-3 backdrop-blur-md border border-white/20">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-4">
                {/* TITLE */}
                <div>
                  <h3 className="text-lg font-bold leading-snug text-foreground group-hover:text-primary transition">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.teacher.name}
                  </p>
                </div>

                {/* STATS */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-500">
                      <Star className="h-3 w-3 fill-yellow-500" />
                      4.7
                    </span>

                    <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-500">
                      <Users className="h-3 w-3" />
                      {c.count_student}
                    </span>
                  </div>

                  {/* PRICE */}
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                    ${c.price}
                  </span>
                </div>

                {/* LESSONS */}
                {c.details.length > 0 && (
                  <div className="text-xs text-muted-foreground border-t pt-3 border-border/50">
                    <span className="font-medium text-foreground">
                      {c.details.length}
                    </span>{" "}
                    lessons available
                  </div>
                )}
              </div>

              {/* HOVER GLOW */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-primary/30 transition pointer-events-none" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 