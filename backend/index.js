const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
require("./models/db");

const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const commentRouter = require("./routes/comment");

const app = express();

app.use(express.json());

app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/comments", commentRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
