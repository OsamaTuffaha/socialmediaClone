const express = require("express");
const auth = require("../middlewares/authentication");

const {
  getAllPosts,
  createPost,
  getPostById,
  deletePostById,
  updatePosts,
} = require("../controllers/posts");

const { likePost, unLikePost, getLikes } = require("../controllers/like");

const postRouter = express.Router();

//public
postRouter.get("/", getAllPosts);
postRouter.get("/:id", getPostById);

//private
postRouter.post("/", auth, createPost);
postRouter.delete("/:id", auth, deletePostById);
postRouter.put("/:id", auth, updatePosts);

//like and unlike posts
postRouter.post("/:id/like", auth, likePost);
postRouter.delete("/:id/unlike", auth, unLikePost);

//get post likes
postRouter.get("/:id/likes", getLikes);

module.exports = postRouter;
