/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/exams/ExamResults.tsx

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Medal, Award, Star, Users, TrendingUp, 
  BarChart3, PieChart, Download, Eye
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { examService } from '@/services/exam.service';
import { motion } from 'framer-motion';

interface ExamResultsProps {
  examId: number;
}

export const ExamResults: React.FC<ExamResultsProps> = ({ examId }) => {
  const { t, lang } = useApp();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    passRate: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await examService.getExamResults(examId);
      setResults(response.data || []);
      calculateStatistics(response.data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data: any[]) => {
    if (data.length === 0) return;
    
    const scores = data.map(r => r.score);
    const passed = data.filter(r => r.passed).length;
    
    setStatistics({
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: (passed / data.length) * 100,
      totalStudents: data.length,
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{statistics.totalStudents}</p>
          <p className="text-xs text-muted-foreground">{t('students')}</p>
        </Card>
        <Card className="p-3 text-center">
          <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{statistics.highestScore}</p>
          <p className="text-xs text-muted-foreground">{t('highestScore')}</p>
        </Card>
        <Card className="p-3 text-center">
          <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{statistics.averageScore.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">{t('averageScore')}</p>
        </Card>
        <Card className="p-3 text-center">
          <Award className="h-5 w-5 text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{statistics.passRate.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">{t('passRate')}</p>
        </Card>
        <Card className="p-3 text-center">
          <BarChart3 className="h-5 w-5 text-purple-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{statistics.lowestScore}</p>
          <p className="text-xs text-muted-foreground">{t('lowestScore')}</p>
        </Card>
      </div>

      {/* Students Results Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">{t('studentResults')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left text-sm font-medium">{t('studentName')}</th>
                <th className="p-3 text-center text-sm font-medium">{t('score')}</th>
                <th className="p-3 text-center text-sm font-medium">{t('percentage')}</th>
                <th className="p-3 text-center text-sm font-medium">{t('status')}</th>
                <th className="p-3 text-center text-sm font-medium">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <motion.tr
                  key={result.student_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b hover:bg-muted/30"
                >
                  <td className="p-3 font-medium">{result.student_name}</td>
                  <td className="p-3 text-center">
                    <span className="font-bold">{result.score}</span> / {result.total_marks}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {result.percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={result.passed ? "success" : "destructive"} className="gap-1">
                      {result.passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {result.passed ? t('passed') : t('failed')}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="sm" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};