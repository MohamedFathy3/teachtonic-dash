// src/services/book.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import api from '@/lib/api';
import { Book, CreateBookRequest, GetAllBooksParams } from '@/types/book.types';
import { toast  } from "@/hooks/use-toast";

class BookService extends BaseService<Book> {
  constructor() {
    super('book');
  }

  // جلب كل الكتب
  async getAll(params?: GetAllBooksParams): Promise<any> {
    const filters: Record<string, any> = {};

    const addFilter = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== '') {
        filters[key] = value;
      }
    };

    // 🔹 Basic filters
    addFilter('teacher_id', params?.teacher_id);

    if (params?.active !== undefined) {
      filters.active = params.active ? 1 : 0;
    }

    // 🔹 Search
    if (params?.search?.trim()) {
      filters.title = params.search.trim();
    }

    // 🔹 Writer
    addFilter('writer', params?.writer);

    // 💰 PRICE (single value)
    addFilter('price', params?.price);

    // 🔹 Date range
    addFilter('from_date', params?.from_date);
    addFilter('to_date', params?.to_date);

    const requestBody = {
      filters,
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage: params?.perPage || 12,
      page: params?.page || 1,
      paginate: true,
      delete: false,
    };

    console.log('📚 Book Request:', requestBody);

    const response = await api.post(`/${this.endpoint}/index`, requestBody);

    console.log('📚 Book Response:', response.data);

    return response.data;
  }

  // جلب كتاب واحد
  async getById(id: number): Promise<Book> {
    const response = await api.get(`/${this.endpoint}/${id}`);
    return response.data.data;
  }

  // إنشاء كتاب جديد
  async create(data: CreateBookRequest): Promise<Book> {
    const response = await api.post(`/${this.endpoint}`, data);
    toast.success('تم إضافة الكتاب بنجاح');
    return response.data.data;
  }

  // تحديث كتاب
  async update(id: number, data: Partial<CreateBookRequest>): Promise<Book> {
    const response = await api.patch(`/${this.endpoint}/${id}`, data);
    toast.success('تم تحديث الكتاب بنجاح');
    return response.data.data;
  }

  // حذف كتاب (ناعم)
  async deleteBook(id: number): Promise<void> {
    await api.delete(`/${this.endpoint}/${id}`);
    toast.success('تم حذف الكتاب بنجاح');
  }

  // حذف جماعي
  async bulkDelete(ids: number[]): Promise<void> {
    await api.delete(`/${this.endpoint}/delete`, { data: { items: ids } });
    toast.success(`تم حذف ${ids.length} كتاب بنجاح`);
  }

  // استعادة كتاب
  async restore(id: number): Promise<Book> {
    const response = await api.post(`/${this.endpoint}/restore`, { items: [id] });
    toast.success('تم استعادة الكتاب بنجاح');
    return response.data.data;
  }

  // حذف نهائي
  async forceDelete(id: number): Promise<void> {
    await api.delete(`/${this.endpoint}/forceDelete`, { data: { items: [id] } });
    toast.success('تم حذف الكتاب نهائياً');
  }

  // تبديل حالة التفعيل
  async toggleActive(id: number): Promise<any> {
    const response = await api.put(`/${this.endpoint}/${id}/active`);
    toast.success('تم تغيير حالة الكتاب');
    return response.data;
  }
}

export const bookService = new BookService();