const pool = require("../models/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { response } = require("express");
const saltRounds = parseInt(process.env.SALT);

const register = async (req, res) => {
  try {
    const { username, email, password_hash } = req.body;

    const encryptedPassword = await bcrypt.hash(password_hash, saltRounds);

    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email
    `;

    const data = [username, email, encryptedPassword];

    const result = await pool.query(query, data);

    res.status(201).json({
      success: true,
      message: "user created successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(409).json({
      success: false,
      message: "Email already exists or DB error",
      error: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password_hash } = req.body;

    const query = `
      SELECT *
      FROM users
      WHERE email = $1 AND is_deleted = 0
    `;
    const data = [email.toLowerCase()];

    const result = await pool.query(query, data);

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "The email doesn’t exist or the password you’ve entered is incorrect",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password_hash, user.password_hash);

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        message:
          "The email doesn’t exist or the password you’ve entered is incorrect",
      });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const secret = process.env.SECRET;
    const options = { expiresIn: "1d" };

    const token = jwt.sign(payload, secret, options);

    return res.status(200).json({
      success: true,
      message: "valid login",
      token,
      username: user.username,
      email: user.email,
      id: user.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const getAllUsers = (req, res) => {
  const query = `select * from users where is_deleted = 0`;
  pool
    .query(query)
    .then((result) => {
      res.status(200).json({
        success: true,
        message: "all users",
        users: result.rows,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "server error",
        error: err.message,
      });
    });
};

const getUserById = async (req, res) => {
  try {
    const id = req.params.id;

    const userQuery = `
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.bio,
        u.avatar_url,
        u.created_at,

        COUNT(DISTINCT f1.follower_user_id) AS followers,
        COUNT(DISTINCT f2.followed_user_id) AS following,
        COUNT(DISTINCT p.id)               AS posts_count

      FROM users u
      LEFT JOIN follows f1 ON u.id = f1.followed_user_id   -- الناس اللي عاملين له follow
      LEFT JOIN follows f2 ON u.id = f2.follower_user_id   -- الناس اللي هو عاملهم follow
      LEFT JOIN posts   p ON u.id = p.user_id              -- بوستاته

      WHERE u.id = $1
        AND u.is_deleted = 0

      GROUP BY u.id
    `;

    const userResult = await pool.query(userQuery, [id]);

    if (!userResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: `there is no user with id: ${id}`,
      });
    }

    const user = userResult.rows[0];

    const postsQuery = `
      SELECT 
        id,
        caption,
        user_id,
        created_at,
        updated_at,
        is_deleted
      FROM posts
      WHERE user_id = $1
        AND is_deleted = 0
      ORDER BY created_at DESC
    `;

    const postsResult = await pool.query(postsQuery, [id]);

    user.posts = postsResult.rows;

    return res.status(200).json({
      success: true,
      message: `the user with id ${id}`,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "server error",
      error: err.message,
    });
  }
};

const deleteUserById = (req, res) => {
  const id = req.params.id;
  const query = `update users set is_deleted = 1 where id = $1`;
  if (req.token.id != id) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to modify this account",
    });
  }
  const data = [id];

  pool
    .query(query, data)
    .then((result) => {
      res.status(204).json({
        success: true,
        message: `user with id : ${id} deleted successfully`,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    });
};

const updateUserById = (req, res) => {
  const id = req.params.id;
  const { full_name, bio, avatar_url } = req.body;
  const query = `update users set  full_name = $1 , bio = $2 , avatar_url = $3 where id = ${id}`;
  if (req.token.id != id) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to modify this account",
    });
  }
  const data = [full_name, bio, avatar_url];

  pool
    .query(query, data)
    .then((result) => {
      res.status(209).json({
        success: true,
        message: `user updated`,
        data: result.rows[0],
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `server error`,
        error: err.message,
      });
    });
};

const userSearch = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "username query is required ?username=",
      });
    }

    const userQuery = `
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.bio,
        u.avatar_url,

        COUNT(DISTINCT f1.follower_user_id) AS followers,
        COUNT(DISTINCT f2.followed_user_id) AS following,
        COUNT(DISTINCT p.id) AS posts_count

      FROM users u

      LEFT JOIN follows f1 ON u.id = f1.followed_user_id    -- followers
      LEFT JOIN follows f2 ON u.id = f2.follower_user_id    -- following
      LEFT JOIN posts p   ON u.id = p.user_id               -- posts

      WHERE u.username ILIKE $1
        AND u.is_deleted = 0

      GROUP BY u.id
    `;

    const userResult = await pool.query(userQuery, [`%${username}%`]);

    if (!userResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }

    const user = userResult.rows;

    const postsQuery = `
      SELECT 
        id,
        caption,
        created_at,
        updated_at,
        is_deleted
      FROM posts
      WHERE user_id = $1 AND is_deleted = 0
      ORDER BY created_at DESC
    `;

    const postsResult = await pool.query(postsQuery, [user.id]);

    user.posts = postsResult.rows;

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "server error",
      error: err.message,
    });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
  userSearch,
};
