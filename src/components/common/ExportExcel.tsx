/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/common/ExportExcel.tsx

import React from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ExportExcelProps {
  data: any[];
  fileName: string;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  sheets?: {
    name: string;
    data: any[];
  }[];
  columns?: {
    key: string;
    header: string;
  }[];
}

export const ExportExcel: React.FC<ExportExcelProps> = ({
  data,
  fileName,
  label,
  disabled = false,
  loading = false,
  sheets,
  columns,
}) => {
  const { lang } = useApp();
  const isRTL = lang === 'ar';

  const handleExport = () => {
    try {
      if (sheets && sheets.length > 0) {
        // ✅ تصدير عدة sheets
        const workbook = XLSX.utils.book_new();
        
        sheets.forEach((sheet) => {
          const worksheet = XLSX.utils.json_to_sheet(sheet.data);
          XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
        });
        
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
      } else if (columns && data.length > 0) {
        // ✅ تصدير بأعمدة مخصصة
        const mappedData = data.map((item) => {
          const row: any = {};
          columns.forEach((col) => {
            row[col.header] = item[col.key] || '';
          });
          return row;
        });
        
        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
      } else {
        // ✅ تصدير عادي
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || loading || data.length === 0}
      className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-4 w-4" />
      )}
      {label || (isRTL ? 'تصدير Excel' : 'Export Excel')}
      <Download className="h-4 w-4" />
    </Button>
  );
};

export default ExportExcel;