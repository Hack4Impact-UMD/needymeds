import { configureStore } from '@reduxjs/toolkit';
import drugSearchReducer from './drugSearchSlice';
import locationReducer from './locationSlice';
import pharmacySearchReducer from './pharmacySearchSlice';

export const store = configureStore({
  reducer: {
    drugSearch: drugSearchReducer,
    location: locationReducer,
    pharmacySearch: pharmacySearchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
