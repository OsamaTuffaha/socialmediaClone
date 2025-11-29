const express = require("express");

const {
  createComment,
  deleteComment,
  getCommentsByPostId,
} = require("../controllers/comment");

const auth = require("../middlewares/authentication");

const commentRouter = express.Router();

commentRouter.post("/:id", auth, createComment);
commentRouter.delete("/:id", auth, deleteComment);
commentRouter.get("/:id", getCommentsByPostId);

module.exports = commentRouter;
