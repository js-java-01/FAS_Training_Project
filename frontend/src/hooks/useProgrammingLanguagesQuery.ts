import { useCallback, useEffect, useRef, useState } from 'react';
import { programmingLanguageApi } from '../api/programmingLanguageApi';
import { toast } from '../lib/toast';
import type { ProgrammingLanguage, SearchParams } from '../types/programmingLanguage';

export const useProgrammingLanguagesQuery = () => {
    // Data state
    const [programmingLanguages, setProgrammingLanguages] = useState<ProgrammingLanguage[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    
    // Search and sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<string>('');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    
    // Use ref for timeout (not state - timeouts are mutable, not reactive)
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadData = useCallback(async (params?: SearchParams) => {
        try {
            setIsLoading(true);
            const searchParams: SearchParams = {
                page: params?.page ?? currentPage,
                size: params?.size ?? pageSize,
                search: params?.search ?? searchQuery,
                sortBy: params?.sortBy ?? sortBy,
                sortDir: params?.sortDir ?? sortDir,
            };
            
            const response = await programmingLanguageApi.getAll(searchParams);
            setProgrammingLanguages(response.content);
            setTotalElements(response.totalElements);
            setTotalPages(response.totalPages);
            setCurrentPage(response.number);
        } catch (error) {
            console.error('Error loading programming languages:', error);
            setProgrammingLanguages([]);
            toast.error('Error loading programming languages');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, sortBy, sortDir]);

    // BR-PL-08: Search debounce 500ms; "Enter" executes immediately
    const handleSearch = useCallback((query: string, immediate = false) => {
        setSearchQuery(query);
        setCurrentPage(0); // Reset to first page
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        if (immediate) {
            loadData({ search: query, page: 0 });
        } else {
            searchTimeoutRef.current = setTimeout(() => {
                loadData({ search: query, page: 0 });
            }, 500);
        }
    }, [loadData]);

    // BR-PL-07: Sort toggles field → none
    const handleSort = useCallback((field: string) => {
        let newSortBy = '';
        let newSortDir: 'asc' | 'desc' = 'asc';
        
        if (sortBy === field) {
            // Currently sorted by this field, toggle direction or clear
            if (sortDir === 'asc') {
                newSortDir = 'desc';
                newSortBy = field;
            } else {
                // Was desc, now clear sorting
                newSortBy = '';
            }
        } else {
            // New field, start with asc
            newSortBy = field;
            newSortDir = 'asc';
        }
        
        setSortBy(newSortBy);
        setSortDir(newSortDir);
        setCurrentPage(0);
        loadData({ sortBy: newSortBy, sortDir: newSortDir, page: 0 });
    }, [sortBy, sortDir, loadData]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        loadData({ page });
    }, [loadData]);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(0);
        loadData({ size, page: 0 });
    }, [loadData]);

    const reload = useCallback(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        loadData();
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return {
        // Data
        data: programmingLanguages,
        totalElements,
        totalPages,
        currentPage,
        pageSize,
        isLoading,
        
        // Search and sort state
        searchQuery,
        sortBy,
        sortDir,
        
        // Actions
        handleSearch,
        handleSort,
        handlePageChange,
        handlePageSizeChange,
        reload,
    };
};