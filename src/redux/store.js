import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import watchlistReducer from './slices/watchlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    watchlist: watchlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;