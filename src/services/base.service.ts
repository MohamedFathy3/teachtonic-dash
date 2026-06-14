/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/base.service.ts

import api from '@/lib/api';

export interface PaginationParams {
  filters?: Record<string, any>;
  orderBy?: string;
  orderByDirection?: 'asc' | 'desc';
  perPage?: number;
  page?: number;
  paginate?: boolean;
  search?: string;
  searchFields?: string[];
  delete?: boolean;
}

export class BaseService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(params?: PaginationParams): Promise<any> {
    const requestBody: Record<string, any> = {
      filters: params?.filters || {},
      orderBy: params?.orderBy || 'position',
      orderByDirection: params?.orderByDirection || 'asc',
      perPage: params?.perPage || 10,
      paginate: params?.paginate !== undefined ? params.paginate : true,
      delete: params?.delete || false,
    };

    if (params?.page) {
      requestBody.page = params.page;
    }

    if (params?.search) {
      requestBody.search = params.search;
      requestBody.searchFields = params.searchFields || ['name', 'name_ar'];
    }

    const response = await api.post(`/${this.endpoint}/index`, requestBody);
    return response.data;
  }

  async getById(id: number): Promise<T> {
    const response = await api.get(`/${this.endpoint}/${id}`);
    return response.data.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await api.post(`/${this.endpoint}`, data);
    return response.data.data;
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const response = await api.patch(`/${this.endpoint}/${id}`, data);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/${this.endpoint}/delete`, { data: { items: [id] } });
  }

  async forceDelete(id: number): Promise<void> {
    await api.delete(`/${this.endpoint}/forceDelete`, { data: { items: [id] } });
  }

  async restore(id: number): Promise<T> {
    const response = await api.post(`/${this.endpoint}/restore`, { items: [id] });
    return response.data.data;
  }

  async bulkDelete(ids: number[]): Promise<void> {
    await api.delete(`/${this.endpoint}/delete`, { data: { items: ids } });
  }

  async bulkForceDelete(ids: number[]): Promise<void> {
    await api.delete(`/${this.endpoint}/forceDelete`, { data: { items: ids } });
  }

  async bulkRestore(ids: number[]): Promise<void> {
    await api.post(`/${this.endpoint}/restore`, { items: ids });
  }

  async toggleActive(id: number): Promise<{ message: string }> {
    const response = await api.put(`/${this.endpoint}/${id}/active`);
    return response.data; 
  }
  async courseseActive(id: number): Promise<{ message: string }> {
    const response = await api.put(`/${this.endpoint}/${id}/star`);
    return response.data; 
  }
  async getDeleted(params?: PaginationParams): Promise<any> {
    return this.getAll({ ...params, delete: true });
  }
}