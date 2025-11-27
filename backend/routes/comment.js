const express = require("express");

const { createComment } = require("../controllers/comment");

const auth = require("../middlewares/authentication");

const commentRouter = express.Router();

commentRouter.post("/:id/comment", auth, createComment);

module.exports = commentRouter;
