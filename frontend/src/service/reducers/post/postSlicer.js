import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    loading: false,
    error: null,
    selectedPostId: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },

    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },

    updatePost: (state, action) => {
      const updatedPost = action.payload;
      const index = state.posts.findIndex((post) => post.id === updatedPost.id);
      if (index !== -1) {
        state.posts[index] = updatedPost;
      }
    },

    deletePost: (state, action) => {
      const postId = action.payload;
      state.posts = state.posts.filter((post) => post.id !== postId);
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    setSelectedPostId: (state, action) => {
      state.selectedPostId = action.payload;
    },

    toggleLikeLocal: (state, action) => {
      const postId = action.payload;
      const post = state.posts.find((p) => p.id === postId);
      if (post) {
        if (post.isLiked) {
          post.isLiked = false;
          post.likesCount -= 1;
        } else {
          post.isLiked = true;
          post.likesCount += 1;
        }
      }
    },
  },
});

export const {
  setPosts,
  addPost,
  updatePost,
  deletePost,
  setLoading,
  setError,
  setSelectedPostId,
  toggleLikeLocal,
} = postSlice.actions;

export default postSlice.reducer;
