/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useAssignments.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '@/services/assignment.service';
import { CreateAssignmentRequest, GetAllAssignmentsParams } from '@/types/assignment.types';
import { toast } from 'react-hot-toast';

export const useAssignments = () => {
  const queryClient = useQueryClient();
  const queryKey = ['assignments'];

  // جلب الواجبات
  const useGetAll = (params?: GetAllAssignmentsParams) => {
    return useQuery({
      queryKey: [...queryKey, params],
      queryFn: () => assignmentService.getAll(params),
    });
  };

  // جلب واجب واحد
  const useGetById = (id: number) => {
    return useQuery({
      queryKey: [...queryKey, id],
      queryFn: () => assignmentService.getById(id),
      enabled: !!id,
    });
  };

  // إحصائيات
  const useGetStatistics = () => {
    return useQuery({
      queryKey: [...queryKey, 'statistics'],
      queryFn: () => assignmentService.getStatistics(),
    });
  };

  // إنشاء واجب
  const useCreate = () => {
    return useMutation({
      mutationFn: (data: CreateAssignmentRequest) => assignmentService.create(data),
      onSuccess: () => {
        toast.success('تم إضافة الواجب بنجاح');
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: [...queryKey, 'statistics'] });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'فشل في إضافة الواجب');
      },
    });
  };

  // تحديث واجب
  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<CreateAssignmentRequest> }) =>
        assignmentService.update(id, data),
      onSuccess: () => {
        toast.success('تم تحديث الواجب بنجاح');
        queryClient.invalidateQueries({ queryKey });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'فشل في تحديث الواجب');
      },
    });
  };

  // حذف واجب
  const useDelete = () => {
    return useMutation({
      mutationFn: (id: number) => assignmentService.deleteAssignment(id),
      onSuccess: () => {
        toast.success('تم حذف الواجب بنجاح');
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: [...queryKey, 'statistics'] });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'فشل في حذف الواجب');
      },
    });
  };

  // حذف جماعي
  const useBulkDelete = () => {
    return useMutation({
      mutationFn: (ids: number[]) => assignmentService.bulkDelete(ids),
      onSuccess: (_, ids) => {
        toast.success(`تم حذف ${ids.length} واجب بنجاح`);
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: [...queryKey, 'statistics'] });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'فشل في حذف الواجبات');
      },
    });
  };

  // تبديل الحالة
  const useToggleActive = () => {
    return useMutation({
      mutationFn: (id: number) => assignmentService.toggleActive(id),
      onSuccess: () => {
        toast.success('تم تغيير حالة الواجب');
        queryClient.invalidateQueries({ queryKey });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'فشل في تغيير الحالة');
      },
    });
  };

  return {
    useGetAll,
    useGetById,
    useGetStatistics,
    useCreate,
    useUpdate,
    useDelete,
    useBulkDelete,
    useToggleActive,
  };
};