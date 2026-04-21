import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { StatCard } from "@/components/lms/StatCard";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { StatusBadge } from "@/components/lms/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, BookOpen, Users, DollarSign, Star, Mail, MapPin, Calendar,
  ClipboardList, FileEdit, UserCog
} from "lucide-react";
import { instructorsData, coursesData, studentsProgress, examsData, assignmentsData, assistantsData, monthlyRevenue } from "@/lib/mockData";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface InstructorProfileProps {
  instructorId: number;
  onBack: () => void;
}

export function InstructorProfile({ instructorId, onBack }: InstructorProfileProps) {
  const { t } = useApp();
  const ins = instructorsData.find((i) => i.id === instructorId) ?? instructorsData[0];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ms-2">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        Back to instructors
      </Button>

      {/* Hero */}
      <Card className="relative overflow-hidden rounded-3xl border-border shadow-soft">
        <div className="h-32 gradient-primary" />
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 -mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="rounded-full ring-4 ring-card">
                <AvatarBadge initials={ins.avatar} size="lg" className="h-24 w-24 text-2xl" />
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold">{ins.name}</h1>
                <p className="text-muted-foreground">{ins.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{ins.name.toLowerCase().replace(" ", ".")}@eduflow.app</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Dubai, UAE</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined Feb 2024</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Button variant="outline" className="rounded-xl">Message</Button>
              <Button className="rounded-xl gradient-primary border-0 shadow-glow">Edit profile</Button>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1 h-auto flex-nowrap">
          {[
            { v: "overview", l: t("overview") },
            { v: "courses", l: t("courses") },
            { v: "students", l: t("students") },
            { v: "exams", l: t("exams") },
            { v: "assignments", l: t("assignments") },
            { v: "assistants", l: t("assistants") },
            { v: "earnings", l: t("earnings") },
          ].map((tab) => (
            <TabsTrigger
              key={tab.v}
              value={tab.v}
              className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2"
            >
              {tab.l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t("courses")} value={String(ins.courses)} icon={BookOpen} variant="primary" />
            <StatCard label={t("students")} value={ins.students.toLocaleString()} icon={Users} variant="accent" />
            <StatCard label={t("revenue")} value={`$${(ins.revenue / 1000).toFixed(1)}k`} icon={DollarSign} variant="warm" />
            <StatCard label={t("rating")} value={ins.rating.toFixed(1)} icon={Star} variant="info" />
          </div>

          <Card className="rounded-2xl border-border p-6 shadow-soft">
            <h3 className="font-semibold">About</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Award-winning instructor with 8+ years of experience helping students master modern engineering. Passionate about clear, practical teaching and building production-grade software.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-6 animate-fade-in">
          <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>{t("course")}</TableHead>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead>{t("students")}</TableHead>
                  <TableHead>{t("rating")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coursesData.slice(0, 4).map((c) => (
                  <TableRow key={c.id} className="border-border">
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell><span className="rounded-md bg-muted px-2 py-1 text-xs">{c.category}</span></TableCell>
                    <TableCell>{c.students.toLocaleString()}</TableCell>
                    <TableCell><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{c.rating}</span></TableCell>
                    <TableCell className="font-semibold">${c.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6 animate-fade-in">
          <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>{t("student")}</TableHead>
                  <TableHead>{t("course")}</TableHead>
                  <TableHead>{t("progress")}</TableHead>
                  <TableHead>Last active</TableHead>
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
                    <TableCell className="text-muted-foreground">{s.course}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <Progress value={s.progress} className="h-2" />
                        <span className="text-xs font-medium w-9 text-end">{s.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.lastActive}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="mt-6 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2">
            {examsData.map((e) => (
              <Card key={e.id} className="rounded-2xl border-border p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{e.title}</h4>
                    <p className="text-xs text-muted-foreground">{e.course}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted/50 py-2">
                        <p className="text-lg font-bold">{e.questions}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">Questions</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 py-2">
                        <p className="text-lg font-bold">{e.attempts}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">Attempts</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 py-2">
                        <p className="text-lg font-bold text-accent">{e.avgScore}%</p>
                        <p className="text-[10px] uppercase text-muted-foreground">Avg score</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6 animate-fade-in">
          <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Title</TableHead>
                  <TableHead>{t("student")}</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentsData.map((a) => (
                  <TableRow key={a.id} className="border-border">
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground">{a.student}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{a.submitted}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell>{a.grade !== null ? <span className="font-semibold">{a.grade}/100</span> : <span className="text-muted-foreground">—</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="assistants" className="mt-6 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assistantsData.map((a) => (
              <Card key={a.id} className="rounded-2xl border-border p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <AvatarBadge initials={a.avatar} size="md" />
                  <div className="flex-1">
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.role}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{a.courses} courses</span>
                  <Button variant="ghost" size="sm">Manage</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="mt-6 animate-fade-in">
          <Card className="rounded-2xl border-border p-6 shadow-soft">
            <h3 className="font-semibold">{t("monthlyRevenue")}</h3>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#earn)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
