// src/components/admin/teachers/ReportsTab.tsx
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, FileQuestion, FileText, BookMarked, Ticket } from 'lucide-react';
import api from '@/lib/api';
import { toast  } from "@/hooks/use-toast";
import { motion } from 'framer-motion';

interface ReportsTabProps {
  teacherId: number;
}

export function ReportsTab({ teacherId }: ReportsTabProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/teachers/${teacherId}/report`);
        setReport(response.data?.data);
      } catch (error) {
        console.error('Error fetching report:', error);
        toast.error('Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No report data available</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Analytics Report</h3>
          <p className="text-muted-foreground">Your teaching performance overview</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
          <p className="text-sm text-muted-foreground">Total Students</p>
          <p className="text-3xl font-bold text-blue-600">{report.students_count}</p>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">${report.profits}</p>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
          <p className="text-sm text-muted-foreground">Active Courses</p>
          <p className="text-3xl font-bold text-purple-600">{report.online_courses + report.center_courses}</p>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30">
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <p className="text-3xl font-bold text-amber-600">68%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Course Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Online Courses</span>
                <span className="font-medium">{report.online_courses}</span>
              </div>
              <Progress value={(report.online_courses / (report.online_courses + report.center_courses)) * 100} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Center Courses</span>
                <span className="font-medium">{report.center_courses}</span>
              </div>
              <Progress value={(report.center_courses / (report.online_courses + report.center_courses)) * 100} className="h-3" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Activity Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <FileQuestion className="h-6 w-6 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold">{report.exams_count}</p>
              <p className="text-xs text-muted-foreground">Total Exams</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <FileText className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold">{report.assignments_count}</p>
              <p className="text-xs text-muted-foreground">Assignments</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <BookMarked className="h-6 w-6 mx-auto text-cyan-500 mb-2" />
              <p className="text-2xl font-bold">{report.books_count}</p>
              <p className="text-xs text-muted-foreground">Books</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Ticket className="h-6 w-6 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{report.used_coupons}</p>
              <p className="text-xs text-muted-foreground">Coupons Used</p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}