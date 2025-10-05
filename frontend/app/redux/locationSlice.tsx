import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  zipCode: string | null;
}

const initialState: LocationState = {
  zipCode: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setZipCode: (state, action: PayloadAction<string>) => {
      state.zipCode = action.payload;
    },
  },
});

export const { setZipCode } = locationSlice.actions;
export default locationSlice.reducer;
