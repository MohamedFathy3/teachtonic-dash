import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/lms/StatusBadge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { coursesData } from "@/lib/mockData";
import { BookOpen, Plus, Star, Users, MoreHorizontal } from "lucide-react";

export function InstructorCourses() {
  const { t } = useApp();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={t("myCourses")}
        description="Manage and create your courses"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl gradient-primary border-0 shadow-glow">
                <Plus className="h-4 w-4" />Create course
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Create a new course</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Course title</Label>
                  <Input placeholder="e.g. Advanced TypeScript" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Short description</Label>
                  <Textarea placeholder="What will students learn?" className="rounded-xl min-h-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("category")}</Label>
                    <Input placeholder="Development" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("price")} (USD)</Label>
                    <Input placeholder="89" className="rounded-xl" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl">{t("cancel")}</Button>
                <Button className="rounded-xl gradient-primary border-0">{t("create")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <button className="absolute top-3 start-3 rounded-lg bg-black/30 p-1.5 text-white backdrop-blur hover:bg-black/50">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{c.category}</div>
              <h3 className="mt-1 font-semibold leading-snug">{c.title}</h3>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /><span className="font-semibold text-foreground">{c.rating}</span></span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{c.students.toLocaleString()}</span>
                <span className="font-bold text-foreground">${c.price}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
