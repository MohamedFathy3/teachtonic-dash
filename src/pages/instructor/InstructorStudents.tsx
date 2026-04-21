import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { Progress } from "@/components/ui/progress";
import { studentsProgress } from "@/lib/mockData";

export function InstructorStudents() {
  const { t } = useApp();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("students")} description="Track learner progress across your courses" />
      <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>{t("student")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("course")}</TableHead>
              <TableHead>{t("progress")}</TableHead>
              <TableHead className="hidden md:table-cell">Last active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentsProgress.map((s) => (
              <TableRow key={s.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <AvatarBadge initials={s.avatar} size="sm" />
                    <span className="font-medium">{s.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{s.course}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 max-w-[260px]">
                    <Progress value={s.progress} className="h-2" />
                    <span className="text-xs font-semibold w-9 text-end">{s.progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{s.lastActive}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
