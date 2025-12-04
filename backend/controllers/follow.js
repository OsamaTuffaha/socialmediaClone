const pool = require("../models/db");

const followUser = async (req, res) => {
  try {
    const follower_id = req.token.id;
    const followed_id = req.params.id;

    if (followed_id == follower_id) {
      return res.status(400).json({ message: "you cant follow your self" });
    }

    const userCheck = await pool.query(
      `select id from users where id = $1 and is_deleted = 0`,
      [followed_id]
    );

    if (!userCheck.rows.length) {
      return res.status(404).json({ message: "user not found" });
    }

    const existsCheck = await pool.query(
      `select 1 from follows
        where follower_user_id = $1 and followed_user_id = $2
        `,
      [follower_id, followed_id]
    );

    if (existsCheck.rows.length) {
      return res.status(400).json({ message: "you already follo this user" });
    }

    const insertQuery = `insert into follows (follower_user_id , followed_user_id)
     VALUES ($1 , $2)`;
    const data = [follower_id, followed_id];

    const result = await pool.query(insertQuery, data);

    return res.status(201).json({
      success: true,
      message: "user followed successfully",
      follow: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "server error while following user",
      error: err.message,
    });
  }
};

const unFollowUser = async (req, res) => {
  try {
    const follower_id = req.token.id;
    const followed_id = req.params.id;

    const deleteQuery = `delete from follows 
    where follower_user_id = $1 and followed_user_id = $2
    returning *
    `;

    const result = await pool.query(deleteQuery, [follower_id, followed_id]);

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "you are not following this user",
      });
    }
    return res.status(200).json({
      success: true,
      message: "user unfollowed successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `server error while unfollowing user`,
      error: err.message,
    });
  }
};

const getFollowers = async (req, res) => {
  try {
    const user_id = req.params.id; // صاحب البروفايل

    const query = `
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.avatar_url
      FROM follows f
      JOIN users u ON f.follower_user_id = u.id
      WHERE f.followed_user_id = $1
    `;

    const result = await pool.query(query, [user_id]);

    return res.status(200).json({
      success: true,
      followers: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching followers",
      error: err.message,
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const user_id = req.params.id;

    const query = `
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.avatar_url
      FROM follows f
      JOIN users u ON f.followed_user_id = u.id
      WHERE f.follower_user_id = $1
    `;

    const result = await pool.query(query, [user_id]);

    return res.status(200).json({
      success: true,
      following: result.rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "server error while fetching followinf",
      error: err.message,
    });
  }
};

module.exports = { followUser, unFollowUser, getFollowers, getFollowing };
