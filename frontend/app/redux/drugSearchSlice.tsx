import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DrugSearchResult } from '../../api/types';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day
const MAX_CACHE_ENTRIES = 10;

interface CacheEntry {
  results: DrugSearchResult[];
  timestamp: number;
}

interface DrugSearchState {
  resultsByPrice: Record<string, CacheEntry>;
  resultsByDistance: Record<string, CacheEntry>;
}

const initialState: DrugSearchState = {
  resultsByPrice: {},
  resultsByDistance: {},
};

const drugSearchSlice = createSlice({
  name: 'drugSearch',
  initialState,
  reducers: {
    setCacheEntry: (
      state,
      action: PayloadAction<{
        key: string;
        results: DrugSearchResult[];
        by: 'price' | 'distance';
      }>
    ) => {
      const { key, results, by } = action.payload;
      const cache = by === 'price' ? state.resultsByPrice : state.resultsByDistance;

      cache[key] = {
        results,
        timestamp: Date.now(),
      };

      if (Date.now() - cache[key].timestamp > CACHE_TTL_MS) {
        delete cache[key];
      }

      const keys = Object.keys(cache);
      if (keys.length > MAX_CACHE_ENTRIES) {
        // evict the oldest entry
        const oldestKey = keys.reduce((a, b) => (cache[a].timestamp < cache[b].timestamp ? a : b));
        delete cache[oldestKey];
      }
    },
    clearCache: (state) => {
      state.resultsByPrice = {};
      state.resultsByDistance = {};
    },
  },
});

export const { setCacheEntry, clearCache } = drugSearchSlice.actions;
export default drugSearchSlice.reducer;
