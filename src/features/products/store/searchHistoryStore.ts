import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_HISTORY = 5;

interface SearchHistoryState {
  queries: string[]; // most recent first
  add: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      queries: [],

      add: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => ({
          queries: [trimmed, ...state.queries.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(
            0,
            MAX_HISTORY,
          ),
        }));
      },

      remove: (query) => {
        set((state) => ({ queries: state.queries.filter((q) => q !== query) }));
      },

      clear: () => set({ queries: [] }),
    }),
    { name: 'muhlatsavdo-search-history' },
  ),
);
