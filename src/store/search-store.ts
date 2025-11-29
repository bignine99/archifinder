'use client';

import { create } from 'zustand';
import type { Project } from '@/types/project';

interface SearchState {
  // DB Search State
  query: string;
  selectedProjectType: string;
  selectedAreaType: string;
  selectedTotalFloorArea: string;
  selectedDesignConcepts: string[];
  discoveryResults: Project[];
  isDiscovering: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  setSelectedProjectType: (value: string) => void;
  setSelectedAreaType: (value: string) => void;
  setSelectedTotalFloorArea: (value: string) => void;
  setSelectedDesignConcepts: (values: string[]) => void;
  setDiscoveryState: (state: Partial<Pick<SearchState, 'discoveryResults' | 'isDiscovering'>>) => void;
  
  resetSearch: () => void;
}

const initialState = {
  query: '',
  selectedProjectType: 'all',
  selectedAreaType: 'all',
  selectedTotalFloorArea: 'all',
  selectedDesignConcepts: [],
  discoveryResults: [],
  isDiscovering: false,
};

export const useSearchStore = create<SearchState>()(
  (set) => ({
    ...initialState,
    
    // DB Actions
    setQuery: (query) => set({ query }),
    setSelectedProjectType: (value) => set({ selectedProjectType: value }),
    setSelectedAreaType: (value) => set({ selectedAreaType: value }),
    setSelectedTotalFloorArea: (value) => set({ selectedTotalFloorArea: value }),
    setSelectedDesignConcepts: (values) => set({ selectedDesignConcepts: values }),
    setDiscoveryState: (newState) => set(newState),
    
    // Global Actions
    resetSearch: () => {
      set({
        ...initialState,
        discoveryResults: [], // Keep this to clear results on reset
      });
    },
  })
);
