/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/select-factory.service.ts

import api from '@/lib/api';
import { SELECT_CONFIGS, type SelectConfig } from '@/config/select-configs';
import type { AsyncSelectOption } from '@/components/ui/AsyncSelect';

class SelectFactoryService {
  private buildFilters(config: SelectConfig, search?: string, extraFilters?: Record<string, any>): Record<string, any> {
    const filters: Record<string, any> = { ...extraFilters }; // 🔥 نبدأ بالـ extraFilters
    
    if (search && search.trim()) {
      if (config.searchField) {
        filters[config.searchField] = search;
      } else if (config.searchFields && config.searchFields.length > 0) {
        const primarySearchField = config.searchFields[0];
        filters[primarySearchField] = search;
      } else {
        filters.name = search;
      }
    }
    
    return filters;
  }

  createSelectFetcher(configKey: keyof typeof SELECT_CONFIGS) {
    const config = SELECT_CONFIGS[configKey];
    
    if (!config) {
      throw new Error(`Select config not found for key: ${configKey}`);
    }

    // 🔥 إذا كان في customFetcher استخدمه
    if (config.customFetcher) {
      return async (params: {
        page: number;
        perPage: number;
        search?: string;
        extraFilters?: Record<string, any>; // 🔥 أضفنا extraFilters
      }): Promise<{ data: AsyncSelectOption[]; meta: any }> => {
        console.log('🔍 Using custom fetcher for:', configKey, params.extraFilters);
        return config.customFetcher!(params);
      };
    }

    // 🔥 الـ fetcher العادي
    return async (params: {
      page: number;
      perPage: number;
      search?: string;
      extraFilters?: Record<string, any>; // 🔥 أضفنا extraFilters
    }): Promise<{ data: AsyncSelectOption[]; meta: any }> => {
      const filters = this.buildFilters(config, params.search, params.extraFilters);

      const payload: Record<string, any> = {
        filters,
        orderBy: config.orderBy,
        orderByDirection: config.orderByDirection || 'asc',
        perPage: params.perPage,
        page: params.page,
        paginate: true,
        delete: false,
      };

      console.log('🔍 SelectFactory Request:', {
        endpoint: config.endpoint,
        payload
      });

      const response = await api.post(config.endpoint, payload);

      let data = response.data.data || [];
      
      if (config.transformData) {
        data = data.map(config.transformData);
      } else {
        const labelField = config.labelField || 'name';
        const labelFieldAr = config.labelFieldAr || 'name_ar';
        const idField = config.idField || 'id';
        
        data = data.map((item: any) => ({
          id: item[idField],
          name: item[labelField],
          name_ar: item[labelFieldAr] || null,
          original: item,
        }));
      }

      return {
        data,
        meta: response.data.meta,
      };
    };
  }

  async fetchSelectData(
    configKey: keyof typeof SELECT_CONFIGS,
    params: { page: number; perPage: number; search?: string; extraFilters?: Record<string, any> }
  ): Promise<{ data: AsyncSelectOption[]; meta: any }> {
    const fetcher = this.createSelectFetcher(configKey);
    return fetcher(params);
  }

  async fetchAllForSelect(configKey: keyof typeof SELECT_CONFIGS): Promise<AsyncSelectOption[]> {
    const fetcher = this.createSelectFetcher(configKey);
    const response = await fetcher({ page: 1, perPage: 1000 });
    return response.data;
  }
}

export const selectFactory = new SelectFactoryService();