const pool = require("../models/db");

const likePost = async (req, res) => {
  try {
    const post_id = req.params.id;
    const user_id = req.token.id;

    // 1) تأكد أن البوست موجود
    const postCheck = await pool.query(
      "SELECT id FROM posts WHERE id = $1 AND is_deleted = 0",
      [post_id]
    );

    if (!postCheck.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 2) تأكد أنه مش عامل Like من قبل
    const alreadyLiked = await pool.query(
      `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2`,
      [user_id, post_id]
    );

    if (alreadyLiked.rows.length) {
      return res.status(400).json({
        success: false,
        message: "You already liked this post",
      });
    }

    // 3) اعمل Like
    await pool.query(`INSERT INTO likes (user_id, post_id) VALUES ($1, $2)`, [
      user_id,
      post_id,
    ]);

    return res.status(201).json({
      success: true,
      message: "Post liked successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error while liking the post",
      error: err.message,
    });
  }
};

const unLikePost = async (req, res) => {
  try {
    const post_id = req.params.id;
    const user_id = req.token.id;

    // 1) Check if liked
    const likedResult = await pool.query(
      `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2`,
      [user_id, post_id]
    );

    if (!likedResult.rows.length) {
      return res.status(400).json({
        success: false,
        message: "You must like the post first",
      });
    }

    // 2) Delete the like
    await pool.query(`DELETE FROM likes WHERE user_id = $1 AND post_id = $2`, [
      user_id,
      post_id,
    ]);

    return res.status(200).json({
      success: true,
      message: "Post unliked successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error while unliking post",
      error: err.message,
    });
  }
};

const getLikes = async (req, res) => {
  try {
    const post_id = req.params.id;

    const query = `
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.avatar_url
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id = $1
      ORDER BY l.created_at ASC
    `;

    const result = await pool.query(query, [post_id]);

    return res.status(200).json({
      success: true,
      likes_count: result.rows.length,
      users: result.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "server error while getting likes",
      error: err.message,
    });
  }
};

module.exports = { likePost, unLikePost, getLikes };
