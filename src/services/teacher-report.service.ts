/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/teacher-report.service.ts
import api from '@/lib/api';

export const teacherReportService = {
  /**
   * Download teacher report as PDF
   * @param teacherId - ID of the teacher
   * @param fromDate - Start date (YYYY-MM-DD)
   * @param toDate - End date (YYYY-MM-DD)
   */
  async downloadReportPdf(teacherId: number, fromDate: string, toDate: string): Promise<void> {
    try {
      const response = await api.get(`/teachers/${teacherId}/report/pdf`, {
        params: {
          from: fromDate,
          to: toDate
        },
        responseType: 'blob'
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `teacher_report_${teacherId}_${fromDate}_to_${toDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('Failed to download report:', error);
      
      // Handle error response (maybe the backend returns error message in blob)
      if (error.response && error.response.data instanceof Blob) {
        const errorText = await error.response.data.text();
        console.error('Error details:', errorText);
      }
      throw new Error(error.response?.data?.message || 'Failed to download report');
    }
  }
};