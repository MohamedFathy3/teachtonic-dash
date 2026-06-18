/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useOffers.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { offerService, CreateOfferRequest } from '@/services/offer.service';
import { useApp } from '@/contexts/AppContext';
import { toast  } from "@/hooks/use-toast";

export const useOffers = (params?: any) => {
  const { user } = useApp();
  const queryClient = useQueryClient();

  // جلب كل العروض
// eslint-disable-next-line react-hooks/rules-of-hooks
const getOffers = (type?: 'offer' | 'banner') => useQuery({
  queryKey: ['offers', params, type],
  queryFn: () => offerService.getAll({ ...params, teacher_id: user?.id, type }),
  enabled: !!user?.id,
});

  // جلب عرض بالمعرف
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getOfferById = (id: number) => useQuery({
    queryKey: ['offer', id],
    queryFn: () => offerService.getById(id),
    enabled: !!id,
  });

  // إنشاء عرض
  const createOffer = useMutation({
    mutationFn: (data: CreateOfferRequest) => offerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('تم إنشاء العرض بنجاح');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'حدث خطأ أثناء إنشاء العرض');
    },
  });

  // تحديث عرض
  const updateOffer = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateOfferRequest> }) =>
      offerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('تم تحديث العرض بنجاح');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'حدث خطأ أثناء تحديث العرض');
    },
  });

  // حذف عرض
  const deleteOffer = useMutation({
    mutationFn: (id: number) => offerService.deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('تم حذف العرض بنجاح');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'حدث خطأ أثناء حذف العرض');
    },
  });

  // حذف جماعي
  const bulkDeleteOffers = useMutation({
    mutationFn: (ids: number[]) => offerService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'حدث خطأ أثناء حذف العروض');
    },
  });

  // تبديل حالة التفعيل
  const toggleActive = useMutation({
    mutationFn: (id: number) => offerService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });

  return {
    // Queries
    getOffers,
    getOfferById,
    
    // Mutations
    createOffer,
    updateOffer,
    deleteOffer,
    bulkDeleteOffers,
    toggleActive,
  };
};