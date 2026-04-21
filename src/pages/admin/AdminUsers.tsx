import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/lms/../ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { StatusBadge } from "@/components/lms/StatusBadge";
import { Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usersData } from "@/lib/mockData";
import { useState, useMemo } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminUsers() {
  const { t } = useApp();
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => usersData.filter(u => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={t("users")}
        description={`${usersData.length} total — ${usersData.filter(u => u.status === "active").length} active`}
        actions={
          <Button className="gap-2 rounded-xl gradient-primary shadow-glow border-0">
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        }
      />

      <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`${t("search")} ${t("users").toLowerCase()}...`}
              className="ps-10 rounded-xl bg-muted/50 border-transparent"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>{t("name")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AvatarBadge initials={u.avatar} size="sm" />
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{u.role}</span>
                  </TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{u.joined}</TableCell>
                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-border p-4 text-sm text-muted-foreground">
          <p>Showing 1–{filtered.length} of {usersData.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg"><ChevronLeft className="h-4 w-4 rtl:rotate-180" /></Button>
            <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg p-0">1</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0">2</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0">3</Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg"><ChevronRight className="h-4 w-4 rtl:rotate-180" /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
