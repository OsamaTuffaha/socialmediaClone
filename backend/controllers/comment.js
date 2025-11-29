const pool = require("../models/db");

const createComment = async (req, res) => {
  try {
    if (!req.token) {
      return res.status(401).json({
        success: false,
        message: "forbidden, no token provided",
      });
    }

    const user_id = req.token.id;
    const post_id = req.params.id;

    const { content, parent_comment_id } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "comment content is required",
      });
    }

    const query = `
      INSERT INTO comments (post_id, user_id, content, parent_comment_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const data = [post_id, user_id, content, parent_comment_id || null];

    const result = await pool.query(query, data);

    return res.status(201).json({
      success: true,
      message: "comment created successfully",
      comment: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "error while creating comment",
      error: err.message,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    if (!req.token) {
      return res.status(401).json({
        success: false,
        message: "forbidden, no token provided",
      });
    }

    const user_id = req.token.id;
    const comment_id = req.params.id;

    const commentResult = await pool.query(
      `
      SELECT id, user_id, post_id
      FROM comments
      WHERE id = $1
      `,
      [comment_id]
    );

    if (!commentResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "comment not found",
      });
    }

    const comment = commentResult.rows[0];

    if (comment.user_id != user_id) {
      return res.status(403).json({
        success: false,
        message: "you cannot delete a comment that is not yours",
      });
    }

    await pool.query(
      `
      DELETE FROM comments
      WHERE id = $1
      `,
      [comment_id]
    );

    return res.status(200).json({
      success: true,
      message: "comment deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "server error",
      error: err.message,
    });
  }
};

const getCommentsByPostId = async (req, res) => {
  try {
    const post_id = req.params.id;

    const query = `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.parent_comment_id,
        u.id AS user_id,
        u.username,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `;

    const result = await pool.query(query, [post_id]);

    return res.status(200).json({
      success: true,
      message: `comments for post ${post_id}`,
      comments: result.rows,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "server error while getting comments",
      error: err.message,
    });
  }
};
module.exports = { createComment, deleteComment, getCommentsByPostId };
