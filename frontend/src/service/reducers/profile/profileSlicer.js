import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profile: null,
    loading: false,
    error: null,
    selectedProfileId: null,
  },
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload;
      state.error = null;
      state.loading = false;
    },
    clearProfile(state, action) {
      state.profile = null;
      state.error = null;
      state.selectedProfileId = null;
    },
    setSelectedProfileId(state, action) {
      state.selectedProfileId = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setProfile,
  clearProfile,
  setSelectedProfileId,
  setLoading,
  setError,
} = profileSlice.actions;

export default profileSlice.reducer;
