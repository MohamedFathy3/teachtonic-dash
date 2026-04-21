import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/lms/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { assignmentsData } from "@/lib/mockData";

export function InstructorAssignments() {
  const { t } = useApp();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("assignments")} description="Review and grade student submissions" />
      <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Title</TableHead>
              <TableHead>{t("student")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("course")}</TableHead>
              <TableHead className="hidden sm:table-cell">Submitted</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="text-end">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignmentsData.map((a) => (
              <TableRow key={a.id} className="border-border">
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell>{a.student}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{a.course}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{a.submitted}</TableCell>
                <TableCell><StatusBadge status={a.status} /></TableCell>
                <TableCell>{a.grade !== null ? <span className="font-semibold">{a.grade}/100</span> : <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell className="text-end">
                  <Button variant="outline" size="sm" className="rounded-lg">Review</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
