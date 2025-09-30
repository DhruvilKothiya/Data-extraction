import { configureStore } from '@reduxjs/toolkit';
import companySearchReducer from './slices/companySearchSlice';

export const store = configureStore({
  reducer: {
    companySearch: companySearchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

