import { Drug } from '@/types';

interface DrugsByPriceState {
  data: Drug[];
  timestamp: Date;
}

interface AppState {
  drugPrices: {
    data: Drug[];
    timestamp: number;
  };
}

const initialState: AppState = {
  drugPrices: {
    data: [],
    timestamp: Date.now(),
  },
};
