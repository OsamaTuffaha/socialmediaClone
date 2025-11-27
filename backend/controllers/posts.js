const pool = require("../models/db");

const getAllPosts = (req, res) => {
  pool
    .query(
      `
      SELECT *
      FROM posts
      WHERE is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 20 OFFSET 0
      `
    )
    .then((result) => {
      res.status(200).json({
        success: true,
        message: `Fetching all posts`,
        data: result.rows,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `error while getting posts`,
        error: err.message,
      });
    });
};

const createPost = (req, res) => {
  try {
    const user_id = req.token.id;
    const { caption } = req.body;

    const query = `
      INSERT INTO posts (user_id, caption)
      VALUES ($1, $2)
      RETURNING *
    `;
    const data = [user_id, caption];

    pool
      .query(query, data)
      .then((result) => {
        return res.status(201).json({
          success: true,
          message: "post created successfully",
          post: result.rows[0],
        });
      })
      .catch((err) => {
        return res.status(500).json({
          success: false,
          message: "error while creating post",
          error: err.message,
        });
      });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error: err.message,
    });
  }
};

const getPostById = (req, res) => {
  const id = req.params.id;

  const postQuery = `
    SELECT 
      p.*,
      u.username,
      u.full_name,
      u.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1
      AND p.is_deleted = 0
  `;

  const commentsQuery = `
    SELECT 
      c.id,
      c.content,
      c.created_at,
      c.updated_at,
      c.parent_comment_id,
      u.id AS user_id,
      u.username,
      u.full_name,
      u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
  `;

  pool
    .query(postQuery, [id])
    .then((postResult) => {
      if (!postResult.rows.length) {
        return res.status(404).json({
          success: false,
          message: `there is no post with id: ${id}`,
        });
      }

      const post = postResult.rows[0];

      return pool.query(commentsQuery, [id]).then((commentsResult) => {
        return res.status(200).json({
          success: true,
          message: `post with id: ${id}`,
          post,
          comments: commentsResult.rows,
        });
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "server error",
        error: err.message,
      });
    });
};

const deletePostById = async (req, res) => {
  try {
    const post_id = req.params.id;
    const user_id = req.token.id;

    const checkQuery = `
      SELECT * FROM posts 
      WHERE id = $1 AND is_deleted = 0
    `;
    const postResult = await pool.query(checkQuery, [post_id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const post = postResult.rows[0];

    if (post.user_id != user_id) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete a post you do not own",
      });
    }

    const deleteQuery = `
      UPDATE posts 
      SET is_deleted = 1 
      WHERE id = $1
      RETURNING *
    `;
    const deleteResult = await pool.query(deleteQuery, [post_id]);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      post: deleteResult.rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting post",
      error: err.message,
    });
  }
};

const updatePosts = async (req, res) => {
  try {
    const user_id = req.token.id;
    const post_id = req.params.id;
    const { caption } = req.body;

    const checkQuery = `
      SELECT * FROM posts 
      WHERE id = $1 AND user_id = $2 AND is_deleted = 0
    `;
    const checkData = [post_id, user_id];

    const checkResult = await pool.query(checkQuery, checkData);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You cannot edit a post you do not own or it does not exist",
      });
    }

    const updateQuery = `
      UPDATE posts
      SET caption = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    const updateData = [caption, post_id, user_id];

    const updateResult = await pool.query(updateQuery, updateData);

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updateResult.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating post",
      error: err.message,
    });
  }
};

module.exports = {
  getAllPosts,
  createPost,
  getPostById,
  deletePostById,
  updatePosts,
};
