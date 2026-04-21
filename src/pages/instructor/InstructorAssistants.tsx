import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { assistantsData } from "@/lib/mockData";
import { Plus, Mail, BookOpen } from "lucide-react";

export function InstructorAssistants() {
  const { t } = useApp();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={t("assistants")}
        description="Manage teaching assistants helping you run your courses"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl gradient-primary border-0 shadow-glow"><Plus className="h-4 w-4" />Add assistant</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Invite a teaching assistant</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>{t("name")}</Label>
                  <Input placeholder="Full name" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>{t("email")}</Label>
                  <Input type="email" placeholder="ta@example.com" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>{t("role")}</Label>
                  <Input placeholder="Teaching Assistant" className="rounded-xl" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl">{t("cancel")}</Button>
                <Button className="rounded-xl gradient-primary border-0">Send invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assistantsData.map((a) => (
          <Card key={a.id} className="group rounded-2xl border-border p-5 shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <AvatarBadge initials={a.avatar} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.role}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span className="truncate">{a.email}</span></div>
              <div className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /><span>{a.courses} assigned courses</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 rounded-xl">Manage</Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Remove</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
