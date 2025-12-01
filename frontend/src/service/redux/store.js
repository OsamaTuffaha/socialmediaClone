import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reducers/auth/authSlicer";
import postReducer from "../reducers/post/postSlicer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
  },
});

export default store;
