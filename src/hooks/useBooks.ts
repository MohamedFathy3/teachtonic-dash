// src/hooks/useBooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookService } from '@/services/book.service';
import { CreateBookRequest, GetAllBooksParams } from '@/types/book.types';
import { toast } from 'sonner';

export const useBooks = () => {
  const queryClient = useQueryClient();
  const queryKey = ['books'];

  // جلب الكتب
  const useGetAll = (params?: GetAllBooksParams) => {
    return useQuery({
      queryKey: [...queryKey, params],
      queryFn: () => bookService.getAll(params),
      // 🔥 تجنب إعادة الجلب التلقائي أثناء الكتابة
      staleTime: 1000,
    });
  };

  // جلب كتاب واحد
  const useGetById = (id: number) => {
    return useQuery({
      queryKey: [...queryKey, id],
      queryFn: () => bookService.getById(id),
      enabled: !!id,
    });
  };

  // إنشاء كتاب
  const useCreate = () => {
    return useMutation({
      mutationFn: (data: CreateBookRequest) => bookService.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    });
  };

  // تحديث كتاب
  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<CreateBookRequest> }) =>
        bookService.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    });
  };

  // حذف كتاب
  const useDelete = () => {
    return useMutation({
      mutationFn: (id: number) => bookService.deleteBook(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    });
  };

  // حذف جماعي
  const useBulkDelete = () => {
    return useMutation({
      mutationFn: (ids: number[]) => bookService.bulkDelete(ids),
      onSuccess: (_, ids) => {
        queryClient.invalidateQueries({ queryKey });
      },
    });
  };

  // تبديل الحالة
  const useToggleActive = () => {
    return useMutation({
      mutationFn: (id: number) => bookService.toggleActive(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    });
  };

  return {
    useGetAll,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
    useBulkDelete,
    useToggleActive,
  };
};