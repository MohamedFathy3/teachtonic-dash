/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/usePaymentCodes.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentCodeService, GenerateCodesRequest, GetAllCodesParams } from '@/services/payment-code.service';
import { toast } from 'react-hot-toast';

export const usePaymentCodes = () => {
  const queryClient = useQueryClient();
  const queryKey = ['payment-codes'];

  // جلب الكودز
  const useGetAllCodes = (params?: GetAllCodesParams) => {
    return useQuery({
      queryKey: [...queryKey, params],
      queryFn: () => paymentCodeService.getAllCodes(params),
    });
  };

  // إحصائيات
  const useGetStatistics = () => {
    return useQuery({
      queryKey: [...queryKey, 'statistics'],
      queryFn: () => paymentCodeService.getStatistics(),
      staleTime: 2 * 60 * 1000,
    });
  };

  // توليد كودز
  const useGenerateCodes = () => {
    return useMutation({
      mutationFn: (data: GenerateCodesRequest) => paymentCodeService.generateCodes(data),
      onSuccess: (data) => {
        toast.success(data?.message || 'Codes generated successfully');
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: [...queryKey, 'statistics'] });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to generate codes');
      },
    });
  };

  // مسح كودز
  const useDeleteCodes = () => {
    return useMutation({
      mutationFn: (ids: number[]) => paymentCodeService.deleteCodes(ids),
      onSuccess: () => {
        toast.success('Codes deleted successfully');
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: [...queryKey, 'statistics'] });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete codes');
      },
    });
  };

  return {
    useGetAllCodes,
    useGetStatistics,
    useGenerateCodes,
    useDeleteCodes,
  };
};