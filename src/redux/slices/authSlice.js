// src/redux/slices/authSlice.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Load user from storage
export const loadUserFromStorage = createAsyncThunk(
  "auth/loadUserFromStorage",
  async () => {
    try {
      const userData = await AsyncStorage.getItem("logged_in_user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error loading user from storage:", error);
      return null;
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserFromStorage.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.loading = false;
        state.user = null;
      });
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer;