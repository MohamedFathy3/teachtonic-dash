// src/components/admin/teachers/dashboard/StudentsTable.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import { StatusBadge } from '@/components/lms/StatusBadge';
import { motion } from 'framer-motion';
import { Users, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  stage?: { name: string };
  type_of_attendance?: string;
  active: boolean;
  progress?: number;
}

interface StudentsTableProps {
  students: Student[];
  loading?: boolean;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({ students, loading }) => {
  // دالة تصدير البيانات إلى Excel
  const exportToExcel = () => {
    // تحويل البيانات إلى الصيغة المطلوبة للإكسل
    const exportData = students.map(student => ({
      'Student Name': student.name,
      'Stage': student.stage?.name || '-',
      'Attendance Type': student.type_of_attendance === 'online' ? 'Online' : 
                        student.type_of_attendance === 'center' ? 'Center' : '-',
      'Phone': student.phone || '-',
      'Status': student.active ? 'Active' : 'Inactive',
      'Progress (%)': student.progress || 0,
    }));

    // إنشاء ورقة عمل
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // تعيين عرض الأعمدة
    worksheet['!cols'] = [
      { wch: 25 }, // Student Name
      { wch: 20 }, // Stage
      { wch: 15 }, // Attendance Type
      { wch: 15 }, // Phone
      { wch: 10 }, // Status
      { wch: 12 }, // Progress
    ];

    // إنشاء مصنف
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    // إنشاء اسم الملف مع التاريخ
    const date = new Date();
    const fileName = `students_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.xlsx`;

    // تحميل الملف
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <Card className="rounded-2xl overflow-hidden">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-muted/50 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-lg">Enrolled Students</h3>
            <p className="text-sm text-muted-foreground">
              Showing {students.length} students
            </p>
          </div>
          {students.length > 0 && (
            <Button 
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          )}
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No students found matching your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left p-4 text-sm font-medium">Student</th>
                <th className="text-left p-4 text-sm font-medium">Stage</th>
                <th className="text-left p-4 text-sm font-medium">Type</th>
                <th className="text-left p-4 text-sm font-medium">Phone</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <motion.tr
                  key={student.id}
                  className="border-t hover:bg-muted/30 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <AvatarBadge initials={student.name?.charAt(0) || 'S'} size="md" />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{student.stage?.name || '-'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      student.type_of_attendance === 'online' 
                        ? 'bg-blue-100 text-blue-700' 
                        : student.type_of_attendance === 'center'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {student.type_of_attendance === 'online' ? '🖥️ Online' : 
                       student.type_of_attendance === 'center' ? '🏢 Center' : '-'}
                    </span>
                  </td>
                  <td className="p-4">{student.phone || '-'}</td>
                  <td className="p-4">
                    <StatusBadge status={student.active ? 'active' : 'inactive'} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={student.progress || 0} className="h-2 flex-1" />
                      <span className="text-xs font-medium">{student.progress || 0}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};