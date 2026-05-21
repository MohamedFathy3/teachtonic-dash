import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportExcelButtonProps<T> {
    data: T[];
    fileName: string;
    label?: string;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
    onBeforeExport?: () => Promise<void>;
}

export function ExportExcelButton<T>({
    data,
    fileName,
    label = "Export",
    disabled,
    className,
    icon,
    onBeforeExport,
}: ExportExcelButtonProps<T>) {

    const handleExport = () => {
        if (!data || data.length === 0) return;

        // تحويل البيانات إلى Sheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // إنشاء Workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

        // تحويل إلى ملف
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, `${fileName}.xlsx`);
    };

    return (
        <Button onClick={handleExport} variant="default" className="gap-2">
            <Download className="w-4 h-4" />
            {label}
        </Button>
    );
}
