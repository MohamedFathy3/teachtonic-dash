import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/lms/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paymentsData } from "@/lib/mockData";
import { StatCard } from "@/components/lms/StatCard";
import { DollarSign, CreditCard, TrendingUp, Wallet } from "lucide-react";
import { ExportExcelButton } from "@/components/common/ExportExcelButton";
import { Download, Loader2 } from "lucide-react";
export function AdminPayments() {
  const { t } = useApp();
  const total = paymentsData.reduce((s, p) => s + p.amount, 0);
  return (
    
    <div className="mx-auto max-w-[1400px] space-y-6">
      
      <PageHeader title={t("payments")} description="All transactions across the platform"    />

    
      {/* 🔥 Export Button */}
      <ExportExcelButton
        data={paymentsData}
        fileName="payments-report"
        label="Export"
        icon={<Download className="h-4 w-4" />}
        className="
      h-10 rounded-xl
      border border-blue-200
      bg-blue-50
      text-blue-700
      hover:bg-blue-600
      hover:text-white
      dark:bg-blue-900/20
      dark:text-blue-400
      transition-all duration-300
      shadow-sm
    "
      />


      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total volume" value={`$${total}`} delta={18.2} icon={DollarSign} variant="warm" />
        <StatCard label="Transactions" value={String(paymentsData.length)} delta={5.4} icon={CreditCard} variant="primary" />
        <StatCard label="Avg order" value={`$${Math.round(total / paymentsData.length)}`} delta={2.1} icon={TrendingUp} variant="accent" />
        <StatCard label="Refunds" value="1.2%" delta={-0.3} icon={Wallet} variant="info" />
      </div>

      <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>{t("transaction")}</TableHead>
              <TableHead>{t("student")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("course")}</TableHead>
              <TableHead>{t("amount")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("method")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsData.map((p) => (
              <TableRow key={p.id} className="border-border">
                <TableCell className="font-mono text-xs">{p.id}</TableCell>
                <TableCell className="font-medium">{p.student}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{p.course}</TableCell>
                <TableCell className="font-semibold">${p.amount}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{p.method}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{p.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
