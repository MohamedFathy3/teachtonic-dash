// src/services/base.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/api';

export interface PaginationParams {
  filters?: Record<string, any>;
  search?: string;
  searchFields?: string[];
  orderBy?: string;
  orderByDirection?: 'asc' | 'desc';
  perPage?: number;
  page?: number;
  paginate?: boolean;
  delete?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: any[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export class BaseService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * 🔹 Get all items with pagination and filters using POST
   */
  async getAll(params: PaginationParams = {}): Promise<PaginatedResponse<T>> {
    try {
      // 🔥 بناء الـ Payload زي ما انت عايز بالضبط
      const payload = {
        filters: params.filters || {},
        orderBy: params.orderBy || 'id',
        orderByDirection: params.orderByDirection || 'asc',
        perPage: params.perPage || 10,
        paginate: params.paginate !== undefined ? params.paginate : true,
        delete: params.delete || false,
      };

      // 🔥 إضافة search لو موجود
      if (params.search) {
        payload['search'] = params.search;
        if (params.searchFields) {
          payload['searchFields'] = params.searchFields;
        }
      }

      // 🔥 إضافة page لو موجود
      if (params.page) {
        payload['page'] = params.page;
      }

      console.log('📤 Sending POST to /teacher/index:', payload);

      const response = await api.post(`/${this.endpoint}/index`, payload);

      console.log('📥 Response:', response.data);

      return {
        data: response.data.data || [],
        total: response.data.meta?.total || 0,
        per_page: response.data.meta?.per_page || 10,
        current_page: response.data.meta?.current_page || 1,
        last_page: response.data.meta?.last_page || 1,
        links: response.data.links || { first: '', last: '', prev: null, next: null },
        meta: response.data.meta || {
          current_page: 1,
          from: 1,
          last_page: 1,
          links: [],
          path: '',
          per_page: 10,
          to: 0,
          total: 0,
        },
      };
    } catch (error) {
      console.error(`Error in ${this.endpoint}/index:`, error);
      throw error;
    }
  }

  /**
   * 🔹 Get single item by ID
   */
  async get(id: number): Promise<T> {
    try {
      const response = await api.get(`/${this.endpoint}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error in ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * 🔹 Create new item
   */
  async create(data: any): Promise<T> {
    try {
      const response = await api.post(`/${this.endpoint}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error in ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * 🔹 Update existing item
   */
  async update(id: number, data: any): Promise<T> {
    try {
      const response = await api.patch(`/${this.endpoint}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error in ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * 🔹 Soft delete item (move to trash)
   */
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/${this.endpoint}/delete`,{
        data:{items:[id]}
      });
    } catch (error) {
      console.error(`Error deleting ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * 🔹 Force delete item (permanent)
   */
  async forceDelete(id: number): Promise<void> {
    try {
      await api.delete(`/${this.endpoint}/force/${id}`);
    } catch (error) {
      console.error(`Error force deleting ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * 🔹 Restore item from trash
   */
  async restore(id: number): Promise<T> {
    try {
      const response = await api.patch(`/${this.endpoint}/restore/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error restoring ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * 🔹 Toggle active status
   */
  async toggleActive(id: number): Promise<{ message: string }> {
    try {
      const response = await api.put(`/${this.endpoint}/${id}/active`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * 🔹 Bulk soft delete
   */
  async bulkDelete(ids: number[]): Promise<void> {
    try {
      await api.delete(`/${this.endpoint}/bulk`, { data: { ids } });
    } catch (error) {
      console.error(`Error bulk deleting ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * 🔹 Bulk force delete
   */
  async bulkForceDelete(ids: number[]): Promise<void> {
    try {
      await api.delete(`/${this.endpoint}/bulk/force`, { data: { ids } });
    } catch (error) {
      console.error(`Error bulk force deleting ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * 🔹 Bulk restore
   */
  async bulkRestore(ids: number[]): Promise<void> {
    try {
      await api.patch(`/${this.endpoint}/bulk/restore`, { ids });
    } catch (error) {
      console.error(`Error bulk restoring ${this.endpoint}:`, error);
      throw error;
    }
  }
}