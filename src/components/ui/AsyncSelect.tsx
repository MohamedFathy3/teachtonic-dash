/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ui/AsyncSelect.tsx

import { useState, useEffect, useCallback, useRef, forwardRef, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  ChevronDown, 
  Search, 
  Loader2, 
  X,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { selectFactory } from '@/services/select-factory.service';
import { SELECT_CONFIGS } from '@/config/select-configs';

export interface AsyncSelectOption {
  id: number;
  name: string;
  name_ar?: string | null;
  [key: string]: any;
}

// 🔥修正: إضافة extraFilters إلى الـ params
interface FetchParams {
  page: number;
  perPage: number;
  search?: string;
  extraFilters?: Record<string, any>; // 🔥 أضفنا هذا
}

interface AsyncSelectProps {
  value?: number | null;
  onChange: (value: number | null, item?: any) => void; // 🔥 خليها تستقبل item اختياري
  configKey?: keyof typeof SELECT_CONFIGS;
  fetchFn?: (params: FetchParams) => Promise<{ data: AsyncSelectOption[]; meta: any }>; // 🔥 استخدم FetchParams
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  required?: boolean;
  extraFilters?: Record<string, any>;
  disabled?: boolean;
  className?: string;
  perPageOptions?: number[];
  defaultPerPage?: number;
  showPagination?: boolean;
  showPerPageSelector?: boolean;
  enableInfiniteScroll?: boolean;
  clearable?: boolean;
  autoFocus?: boolean;
  closeOnSelect?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  noResultsMessage?: string;
  debounceDelay?: number;
  cacheData?: boolean;
  initialSearch?: string;
}

export const AsyncSelect = forwardRef<HTMLButtonElement, AsyncSelectProps>(
  (
    {
      value,
      onChange,
      configKey,
      fetchFn: customFetchFn,
      placeholder = 'Select...',
      searchPlaceholder = 'Search...',
      label,
      required = false,
      disabled = false,
      className = '',
      perPageOptions = [10, 25, 50, 100],
      defaultPerPage = 25,
      showPagination = true,
      showPerPageSelector = true,
      enableInfiniteScroll = false,
      clearable = true,
      autoFocus = false,
      extraFilters,
      closeOnSelect = true,
      emptyMessage = 'No options available',
      loadingMessage = 'Loading...',
      noResultsMessage = 'No results found',
      debounceDelay = 500,
      cacheData = true,
      initialSearch = '',
    },
    ref
  ) => {
    const { dir, lang } = useApp();
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<AsyncSelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState(initialSearch);
    const [searchDebounced, setSearchDebounced] = useState(initialSearch);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(defaultPerPage);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);
    
    const cacheRef = useRef<Map<string, { data: AsyncSelectOption[]; meta: any }>>(new Map());
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const scrollRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const isFirstOpenRef = useRef(true);

    const fetchFn = configKey 
      ? selectFactory.createSelectFetcher(configKey)
      : customFetchFn;

    if (!fetchFn && !configKey) {
      throw new Error('AsyncSelect requires either configKey or fetchFn prop');
    }

    const getCacheKey = useCallback((pageNum: number, perPageNum: number, searchTerm: string, filters: any) => {
      return `${configKey || 'custom'}:${pageNum}:${perPageNum}:${searchTerm}:${JSON.stringify(filters)}`;
    }, [configKey]);

    const fetchOptions = useCallback(async (
      pageNum: number,
      perPageNum: number,
      searchTerm: string,
      append = false
    ) => {
      if (!fetchFn) return;
      
      const cacheKey = getCacheKey(pageNum, perPageNum, searchTerm, extraFilters);
      
      if (cacheData && cacheRef.current.has(cacheKey) && !append) {
        const cached = cacheRef.current.get(cacheKey)!;
        setOptions(cached.data);
        if (cached.meta) {
          setTotal(cached.meta.total);
          setLastPage(cached.meta.lastPage);
        }
        setInitialLoaded(true);
        return;
      }
      
      if (append) {
        setFetchingMore(true);
      } else {
        setLoading(true);
      }

      try {
        // 🔥 تمرير extraFilters
        const response = await fetchFn({
          page: pageNum,
          perPage: perPageNum,
          search: searchTerm || undefined,
          extraFilters, // 🔥 هذا مهم!
        });

        const newOptions = response.data || [];
        const meta = response.meta;

        if (append) {
          setOptions(prev => [...prev, ...newOptions]);
        } else {
          setOptions(newOptions);
          if (cacheData) {
            cacheRef.current.set(cacheKey, { data: newOptions, meta });
          }
        }

        if (meta) {
          setTotal(meta.total);
          setLastPage(meta.lastPage);
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
      } finally {
        setLoading(false);
        setFetchingMore(false);
        setInitialLoaded(true);
      }
    }, [fetchFn, cacheData, getCacheKey, extraFilters]);

    // ... باقي الـ useEffect نفس ما هي ...

    useEffect(() => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (searchDebounced !== search) {
          setSearchDebounced(search);
          setPage(1);
        }
      }, debounceDelay);

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, [search, debounceDelay]);


useEffect(() => {
  if (open) {
    if (!initialLoaded || page > 1 || searchDebounced !== initialSearch) {
      if (enableInfiniteScroll && page > 1) {
        fetchOptions(page, perPage, searchDebounced, true);
      } else {
        fetchOptions(page, perPage, searchDebounced, false);
      }
    }
  }
}, [open, page, perPage, searchDebounced, fetchOptions, enableInfiniteScroll, initialLoaded, extraFilters]);



useEffect(() => {
      if (configKey && isFirstOpenRef.current) {
        fetchOptions(1, perPage, '', false);
      }
    }, [configKey]);


useEffect(() => {
  if (open) {
    setInitialLoaded(false);
    setPage(1);
    setOptions([]);
    // Optional: clear cache for this extraFilters? We rely on re-fetch.
    fetchOptions(1, perPage, searchDebounced, false);
  }
}, [extraFilters]); // eslint-disable-line react-hooks/exhaustive-deps

// Also ensure fetchOptions depends on extraFilters (already does)

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      if (!enableInfiniteScroll) return;
      
      const target = e.target as HTMLDivElement;
      const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
      
      if (bottom && !loading && !fetchingMore && page < lastPage) {
        setPage(prev => prev + 1);
      }
    }, [enableInfiniteScroll, loading, fetchingMore, page, lastPage]);

    const handlePerPageChange = (newPerPage: number) => {
      setPerPage(newPerPage);
      setPage(1);
      setInitialLoaded(false);
    };

    const getOptionName = (option: AsyncSelectOption) => {
      if (lang === 'ar' && option.name_ar) return option.name_ar;
      return option.name;
    };

    const selectedOption = useMemo(() => {
      return options.find(opt => opt.id === value);
    }, [options, value]);

    const clearSearch = () => {
      setSearch('');
      setSearchDebounced('');
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    };

    const handleSelect = (option: AsyncSelectOption) => {
      onChange(option.id, option); // 🔥 تمرير الـ option كمان
      if (closeOnSelect) {
        setOpen(false);
        setSearch('');
        setSearchDebounced('');
      }
    };

    const handleOpenChange = (newOpen: boolean) => {
      if (!disabled) {
        setOpen(newOpen);
        if (!newOpen) {
          setSearch('');
          setSearchDebounced('');
        }
      }
    };

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button
              ref={ref || triggerRef}
              type="button"
              disabled={disabled}
              className={cn(
                'flex h-10 w-full items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className
              )}
            >
              <span className={cn('truncate', !selectedOption && 'text-gray-500')}>
                {selectedOption ? getOptionName(selectedOption) : placeholder}
              </span>
              <div className="flex items-center gap-1">
                {clearable && selectedOption && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-full p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </div>
            </button>
          </PopoverTrigger>

          <PopoverContent 
            className="w-[--radix-popover-trigger-width] p-0" 
            align="start"
            sideOffset={4}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2 border-b p-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-8 pl-8 pr-8 text-sm"
                    autoFocus={autoFocus}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                
                {showPerPageSelector && showPagination && !enableInfiniteScroll && (
                  <select
                    value={perPage}
                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
                    className="h-8 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 text-sm"
                  >
                    {perPageOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>

              <ScrollArea 
                className="max-h-64 overflow-y-auto" 
                onScrollCapture={enableInfiniteScroll ? handleScroll : undefined}
                ref={scrollRef}
              >
                {!initialLoaded && loading && options.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                    <span className="ml-2 text-sm text-gray-500">{loadingMessage}</span>
                  </div>
                ) : options.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                    {search ? noResultsMessage : emptyMessage}
                  </div>
                ) : (
                  <>
                    {options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={cn(
                          'relative w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
                          value === option.id && 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                        )}
                      >
                        <span className="block truncate pr-6">
                          {getOptionName(option)}
                        </span>
                        {value === option.id && (
                          <Check className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-600" />
                        )}
                      </button>
                    ))}
                    
                    {enableInfiniteScroll && fetchingMore && (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                        <span className="ml-2 text-xs text-gray-400">Loading more...</span>
                      </div>
                    )}

                    {showPagination && !enableInfiniteScroll && !fetchingMore && lastPage > 1 && (
                      <div className="flex items-center justify-between border-t p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="h-7 px-2 text-xs"
                        >
                          <ChevronLeft className={cn('h-3 w-3', dir === 'rtl' && 'rotate-180')} />
                          Previous
                        </Button>
                        <span className="text-xs text-gray-500">
                          {page} / {lastPage} ({total})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                          disabled={page === lastPage}
                          className="h-7 px-2 text-xs"
                        >
                          Next
                          <ChevronRight className={cn('h-3 w-3', dir === 'rtl' && 'rotate-180')} />
                        </Button>
                      </div>
                    )}
                    
                    {showPagination && !enableInfiniteScroll && total > perPage && (
                      <div className="border-t px-3 py-1.5 text-center text-xs text-gray-400">
                        {total} total items
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

AsyncSelect.displayName = 'AsyncSelect';