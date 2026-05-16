/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useCenterHours.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { centerHourService } from '@/services/center-hour.service';
import { CreateCenterHourRequest, GetAllCenterHoursParams } from '@/types/center-hour.types';
import { toast } from 'react-hot-toast';

export const useCenterHours = () => {
  const queryClient = useQueryClient();
  const queryKey = ['center-hours'];

  // جلب المواعيد
  const useGetAll = (params?: GetAllCenterHoursParams) => {
    return useQuery({
      queryKey: [...queryKey, params],
      queryFn: () => centerHourService.getAll(params),
    });
  };

  // إحصائيات
  const useGetStatistics = () => {
    return useQuery({
      queryKey: [...queryKey, 'statistics'],
      queryFn: () => centerHourService.getStatistics(),
    });
  };

  // إنشاء موعد
  const useCreate = () => {
    return useMutation({
      mutationFn: (data: CreateCenterHourRequest) => centerHourService.create(data),
      onSuccess: () => {
        toast.success('تم إضافة الموعد بنجاح');
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: [...queryKey, 'statistics'] });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'فشل في إضافة الموعد');
      },
    });
  };

  // تحديث موعد
  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<CreateCenterHourRequest> }) =>
        centerHourService.update(id, data),
      onSuccess: () => {
        toast.success('تم تحديث الموعد بنجاح');
        queryClient.invalidateQueries({ queryKey });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'فشل في تحديث الموعد');
      },
    });
  };

  // حذف موعد
  const useDelete = () => {
    return useMutation({
      mutationFn: (id: number) => centerHourService.deleteHour(id),
      onSuccess: () => {
        toast.success('تم حذف الموعد بنجاح');
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: [...queryKey, 'statistics'] });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'فشل في حذف الموعد');
      },
    });
  };

  // حذف جماعي
  const useBulkDelete = () => {
    return useMutation({
      mutationFn: (ids: number[]) => centerHourService.bulkDelete(ids),
      onSuccess: (_, ids) => {
        toast.success(`تم حذف ${ids.length} موعد بنجاح`);
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: [...queryKey, 'statistics'] });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'فشل في حذف المواعيد');
      },
    });
  };

  return {
    useGetAll,
    useGetStatistics,
    useCreate,
    useUpdate,
    useDelete,
    useBulkDelete,
  };
};