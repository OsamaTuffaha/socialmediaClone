const express = require("express");
const {
  register,
  login,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
  userSearch,
} = require("../controllers/users");

const {
  followUser,
  unFollowUser,
  getFollowers,
  getFollowing,
} = require("../controllers/follow");

const auth = require("../middlewares/authentication");

const userRouter = express.Router();

// Public
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/search", userSearch);

userRouter.get("/", getAllUsers);

// Protected
userRouter.get("/:id", getUserById);
userRouter.put("/:id", auth, updateUserById);
userRouter.delete("/:id", auth, deleteUserById);

//follow/unfollow router
userRouter.post("/:id/follow", auth, followUser);
userRouter.delete("/:id/follow", auth, unFollowUser);

//getfollowers and following
userRouter.get("/:id/followers", getFollowers);
userRouter.get("/:id/following", getFollowing);

module.exports = userRouter;
