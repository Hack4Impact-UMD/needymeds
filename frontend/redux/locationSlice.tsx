import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CachedLocation {
  lat: string;
  lon: string;
  address: string;
  zipCode: string;
  timestamp: number;
}

interface LocationState {
  zipCode: string | null;
  address: string | null;
  cache: Record<string, CachedLocation>; // keyed by `${lat},${lon}`
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  zipCode: null,
  address: null,
  cache: {},
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setZipCode: (state, action: PayloadAction<string>) => {
      state.zipCode = action.payload;
    },
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    cacheLocation: (state, action: PayloadAction<CachedLocation>) => {
      const key = `${action.payload.lat},${action.payload.lon}`;
      state.cache[key] = action.payload;
    },
  },
});

export const { setZipCode, setAddress, setError, setLoading, cacheLocation } =
  locationSlice.actions;

export default locationSlice.reducer;
