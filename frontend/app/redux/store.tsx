import { configureStore } from '@reduxjs/toolkit';
import drugSearchReducer from './drugSearchSlice';
import locationReducer from './locationSlice';

export const store = configureStore({
  reducer: {
    drugSearch: drugSearchReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
