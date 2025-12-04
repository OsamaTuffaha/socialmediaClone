import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reducers/auth/authSlicer";
import postReducer from "../reducers/post/postSlicer";
import profileReducer from "../reducers/profile/profileSlicer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
    profile: profileReducer,
  },
});

export default store;
