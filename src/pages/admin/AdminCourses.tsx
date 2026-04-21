import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/lms/StatusBadge";
import { coursesData } from "@/lib/mockData";
import { BookOpen, Star, Users, Plus } from "lucide-react";

export function AdminCourses() {
  const { t } = useApp();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={t("courses")}
        description={`${coursesData.length} courses across the platform`}
        actions={
          <Button className="gap-2 rounded-xl gradient-primary shadow-glow border-0">
            <Plus className="h-4 w-4" /> Add course
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {coursesData.map((c) => (
          <Card key={c.id} className="group overflow-hidden rounded-2xl border-border shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-1">
            <div className="relative aspect-video gradient-primary">
              <div className="absolute inset-0 flex items-center justify-center text-white/90">
                <BookOpen className="h-12 w-12" />
              </div>
              <div className="absolute top-3 end-3"><StatusBadge status={c.status} /></div>
              <div className="absolute bottom-3 start-3 rounded-md bg-black/30 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                {c.category}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold leading-snug">{c.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.instructor}</p>

              <div className="mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /><span className="font-semibold text-foreground">{c.rating}</span></span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{c.students.toLocaleString()}</span>
                </div>
                <span className="text-base font-bold text-primary">${c.price}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
