const pool = require("../models/db");

const createComment = async (req, res) => {
  try {
    // لازم يكون فيه auth قبله، بس بنعمل تشيك احتياط
    if (!req.token) {
      return res.status(401).json({
        success: false,
        message: "forbidden, no token provided",
      });
    }

    const user_id = req.token.id; // صاحب الكومنت
    const post_id = req.params.id; // البوست اللي بنعلّق عليه

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

module.exports = { createComment };
