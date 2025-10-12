import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/authSlice';
import cartReducer from './redux/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});