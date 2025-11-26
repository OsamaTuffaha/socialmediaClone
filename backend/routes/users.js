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

const auth = require("../middlewares/authentication");

const userRouter = express.Router();

// Public
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/search", userSearch);

userRouter.get("/", getAllUsers);

// Protected
userRouter.get("/:id", auth, getUserById);
userRouter.put("/:id", auth, updateUserById);
userRouter.delete("/:id", auth, deleteUserById);

module.exports = userRouter;
