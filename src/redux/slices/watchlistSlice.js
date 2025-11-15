import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

const initialState = { items: [] };

const slice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    setWatchlist(state, action) {
      state.items = action.payload;
    },
    addMovie(state, action) {
      const exists = state.items.find((m) => m.id === action.payload.id);
      if (!exists) state.items.push(action.payload);
    },
    removeMovie(state, action) {
      state.items = state.items.filter((m) => m.id !== action.payload);
    },
    clearAll(state) {
      state.items = [];
    },
  },
});

export const { setWatchlist, addMovie, removeMovie, clearAll } = slice.actions;

export default slice.reducer;


export async function persistWatchlist(items) {
  await AsyncStorage.setItem("watchlist", JSON.stringify(items || []));
}

export async function loadWatchlistFromStorage(dispatch) {
  try {
    const raw = await AsyncStorage.getItem("watchlist");
    const items = raw ? JSON.parse(raw) : [];
    dispatch(setWatchlist(items));
  } catch (e) {
    console.warn("loadWatchlist error", e);
  }
}
