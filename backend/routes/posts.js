const express = require("express");
const auth = require("../middlewares/authentication");

const {
  getAllPosts,
  createPost,
  getPostById,
  deletePostById,
  updatePosts,
} = require("../controllers/posts");

const postRouter = express.Router();

//public
postRouter.get("/", getAllPosts);
postRouter.get("/:id", getPostById);

//private
postRouter.post("/", auth, createPost);
postRouter.delete("/:id", auth, deletePostById);
postRouter.put("/:id", auth, updatePosts);

module.exports = postRouter;
