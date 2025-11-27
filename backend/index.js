const express = require("express");
require("dotenv").config();
const cors = require("cors");
require("./models/db");

const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const commentRouter = require("./routes/comment");

const app = express();

app.use(express.json());

app.use(cors());

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/comments", commentRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
