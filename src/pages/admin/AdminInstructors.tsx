import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { instructorsData } from "@/lib/mockData";
import { Star, BookOpen, Users, DollarSign, ArrowRight } from "lucide-react";

interface AdminInstructorsProps {
  onSelectInstructor: (id: number) => void;
}

export function AdminInstructors({ onSelectInstructor }: AdminInstructorsProps) {
  const { t } = useApp();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={t("instructors")}
        description={`${instructorsData.length} active instructors creating impact`}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {instructorsData.map((ins) => (
          <Card
            key={ins.id}
            className="group relative overflow-hidden rounded-2xl border-border p-6 shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-1 cursor-pointer"
            onClick={() => onSelectInstructor(ins.id)}
          >
            <div className="absolute -top-12 -end-12 h-32 w-32 rounded-full gradient-primary opacity-10 transition-smooth group-hover:scale-150 group-hover:opacity-20" />

            <div className="flex items-start gap-4">
              <AvatarBadge initials={ins.avatar} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{ins.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{ins.title}</p>
                <div className="mt-1.5 flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="font-semibold">{ins.rating}</span>
                  <span className="text-muted-foreground">rating</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground"><BookOpen className="h-3 w-3" /><span className="text-[10px] uppercase">{t("courses")}</span></div>
                <p className="mt-0.5 text-lg font-bold">{ins.courses}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" /><span className="text-[10px] uppercase">{t("students")}</span></div>
                <p className="mt-0.5 text-lg font-bold">{(ins.students / 1000).toFixed(1)}k</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-muted-foreground"><DollarSign className="h-3 w-3" /><span className="text-[10px] uppercase">{t("revenue")}</span></div>
                <p className="mt-0.5 text-lg font-bold">${(ins.revenue / 1000).toFixed(0)}k</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="mt-4 w-full justify-between rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
              View profile
              <ArrowRight className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
