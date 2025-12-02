const express = require("express");
const auth = require("../middlewares/authentication");
const path = require("path");
const multer = require("multer");

const {
  getAllPosts,
  createPost,
  getPostById,
  deletePostById,
  updatePosts,
  getFeed,
} = require("../controllers/posts");

const { likePost, unLikePost, getLikes } = require("../controllers/like");

const postRouter = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // نخزن داخل backend/uploads
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

//get feed
postRouter.get("/feed", auth, getFeed);

//public
postRouter.get("/", getAllPosts);
postRouter.get("/:id", getPostById);

//private
postRouter.post("/", auth, upload.array("media", 10), createPost);
postRouter.delete("/:id", auth, deletePostById);
postRouter.put("/:id", auth, updatePosts);

//like and unlike posts
postRouter.post("/:id/like", auth, likePost);
postRouter.delete("/:id/unlike", auth, unLikePost);

//get post likes
postRouter.get("/:id/likes", getLikes);

module.exports = postRouter;
