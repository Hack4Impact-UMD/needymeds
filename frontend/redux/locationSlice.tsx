import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  zipCode: string | null;
  address: string | null;
}

const initialState: LocationState = {
  zipCode: null,
  address: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setZipCode: (state, action: PayloadAction<string>) => {
      state.zipCode = action.payload;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
  },
});

export const { setZipCode, setAddress } = locationSlice.actions;
export default locationSlice.reducer;
