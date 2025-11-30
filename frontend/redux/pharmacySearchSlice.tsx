
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pharmacy } from '../api/types';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day
const MAX_CACHE_ENTRIES = 10;

interface CacheEntry {
  results: Pharmacy[];
  timestamp: number;
}

interface PharmacySearchState {
  cache: Record<string, CacheEntry>;
}

const initialState: PharmacySearchState = {
  cache: {},
};

const pharmacySearchSlice = createSlice({
  name: 'pharmacySearch',
  initialState,
  reducers: {
    setCacheEntry: (
      state,
      action: PayloadAction<{
        key: string;
        results: Pharmacy[];
      }>
    ) => {
      const { key, results } = action.payload;

      state.cache[key] = {
        results,
        timestamp: Date.now(),
      };

      // Clean up expired entries
      const now = Date.now();
      Object.keys(state.cache).forEach((cacheKey) => {
        if (now - state.cache[cacheKey].timestamp > CACHE_TTL_MS) {
          delete state.cache[cacheKey];
        }
      });

      // Evict oldest entry if cache is too large
      const keys = Object.keys(state.cache);
      if (keys.length > MAX_CACHE_ENTRIES) {
        const oldestKey = keys.reduce((a, b) =>
          state.cache[a].timestamp < state.cache[b].timestamp ? a : b
        );
        delete state.cache[oldestKey];
      }
    },
    clearCache: (state) => {
      state.cache = {};
    },
  },
});

export const { setCacheEntry, clearCache } = pharmacySearchSlice.actions;
export default pharmacySearchSlice.reducer;
