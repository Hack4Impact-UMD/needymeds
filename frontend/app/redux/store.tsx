import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './locationSlice';

export const store = configureStore({
  reducer: {
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
