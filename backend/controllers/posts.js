const pool = require("../models/db");

const getAllPosts = async (req, res) => {
  try {
    const user_id = req.token ? req.token.id : null;

    const query = `
      SELECT 
        p.id,
        p.caption,
        p.user_id,
        p.created_at,
        p.updated_at,

        -- صاحب البوست
        u.username,
        u.full_name,
        u.avatar_url,

        -- عدد اللايكات
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,

        -- عدد الكومنتات
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count,

        -- هل أنا عامل لايك؟
        CASE 
          WHEN $1::INT IS NULL THEN false
          ELSE EXISTS (
            SELECT 1 
            FROM likes l2 
            WHERE l2.post_id = p.id AND l2.user_id = $1
          )
        END AS liked_by_me

      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.is_deleted = 0
      ORDER BY p.created_at DESC
      LIMIT 20 OFFSET 0
    `;

    const postsResult = await pool.query(query, [user_id]);

    const postIds = postsResult.rows.map((p) => p.id);

    // لو ما في بوستات، رجّع فاضي
    if (postIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "no posts yet",
        data: [],
      });
    }

    // الميديا لكل بوست
    const mediaQuery = `
      SELECT 
        post_id, media_url, media_type, sort_order
      FROM post_media
      WHERE post_id = ANY($1)
      ORDER BY sort_order ASC
    `;

    const mediaResult = await pool.query(mediaQuery, [postIds]);

    const mediaMap = {};

    mediaResult.rows.forEach((m) => {
      if (!mediaMap[m.post_id]) mediaMap[m.post_id] = [];
      mediaMap[m.post_id].push(m);
    });

    const finalPosts = postsResult.rows.map((p) => ({
      ...p,
      media: mediaMap[p.id] || [],
    }));

    return res.status(200).json({
      success: true,
      message: "Fetching all posts",
      data: finalPosts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error while getting posts",
      error: err.message,
    });
  }
};

const createPost = async (req, res) => {
  try {
    if (!req.token) {
      return res.status(401).json({
        success: false,
        message: "forbidden, no token provided",
      });
    }

    const user_id = req.token.id;
    const { caption } = req.body; // caption من body
    const files = req.files || []; // الميديا من multer

    // 1) إدخال البوست
    const postQuery = `
      INSERT INTO posts (user_id, caption)
      VALUES ($1, $2)
      RETURNING *
    `;
    const postResult = await pool.query(postQuery, [user_id, caption || null]);
    const post = postResult.rows[0];

    // 2) إدخال الميديا المرتبطة بالبوست
    let mediaRows = [];

    if (files.length > 0) {
      const mediaQuery = `
        INSERT INTO post_media (post_id, media_url, media_type, sort_order)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      let order = 0;

      for (const file of files) {
        const url = `/uploads/${file.filename}`;
        const type = file.mimetype.startsWith("video") ? "video" : "image";

        const result = await pool.query(mediaQuery, [
          post.id,
          url,
          type,
          order++,
        ]);

        mediaRows.push(result.rows[0]);
      }
    }

    post.media = mediaRows;

    return res.status(201).json({
      success: true,
      message: "post created successfully",
      post,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "server error while creating post",
      error: err.message,
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const id = req.params.id;

    const postQuery = `
      SELECT 
        p.*,
        u.username,
        u.full_name,
        u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.is_deleted = 0
    `;
    const postResult = await pool.query(postQuery, [id]);

    if (!postResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: `no post found with id: ${id}`,
      });
    }

    const post = postResult.rows[0];

    const mediaQuery = `
      SELECT id, media_url, media_type, sort_order
      FROM post_media
      WHERE post_id = $1
      ORDER BY sort_order ASC, id ASC
    `;
    const mediaResult = await pool.query(mediaQuery, [id]);

    post.media = mediaResult.rows;

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "server error while getting post",
      error: err.message,
    });
  }
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
const getFeed = async (req, res) => {
  try {
    const user_id = req.token.id;

    const query = `
      SELECT 
        p.id,
        p.caption,
        p.user_id,
        p.created_at,
        p.updated_at,

        u.username,
        u.full_name,
        u.avatar_url,

        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count,

        EXISTS (
          SELECT 1 
          FROM likes l2 
          WHERE l2.post_id = p.id AND l2.user_id = $1
        ) AS liked_by_me

      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.is_deleted = 0
        AND (
          p.user_id = $1
          OR p.user_id IN (
            SELECT followed_user_id
            FROM follows
            WHERE follower_user_id = $1
          )
        )
      ORDER BY p.created_at DESC
      LIMIT 20 OFFSET 0
    `;

    const postsResult = await pool.query(query, [user_id]);
    const posts = postsResult.rows;

    if (!posts.length) {
      return res.status(200).json({
        success: true,
        message: "no posts in feed yet",
        data: [],
      });
    }

    const postIds = posts.map((p) => p.id);

    const mediaQuery = `
      SELECT 
        post_id,
        media_url,
        media_type,
        sort_order
      FROM post_media
      WHERE post_id = ANY($1)
      ORDER BY sort_order ASC, id ASC
    `;

    const mediaResult = await pool.query(mediaQuery, [postIds]);

    const mediaMap = {};
    mediaResult.rows.forEach((m) => {
      if (!mediaMap[m.post_id]) mediaMap[m.post_id] = [];
      mediaMap[m.post_id].push(m);
    });

    const finalFeed = posts.map((p) => ({
      ...p,
      media: mediaMap[p.id] || [],
    }));

    return res.status(200).json({
      success: true,
      message: "feed fetched successfully",
      data: finalFeed,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "server error while getting feed",
      error: err.message,
    });
  }
};
const getPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1) جيب كل بوستات هذا المستخدم
    const postsQuery = `
      SELECT 
        p.*,
        u.username,
        u.full_name,
        u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
        AND p.is_deleted = 0
      ORDER BY p.created_at DESC
    `;

    const postsResult = await pool.query(postsQuery, [userId]);
    const posts = postsResult.rows;

    if (!posts.length) {
      return res.status(200).json({
        success: true,
        posts: [],
      });
    }

    // 2) جيب كل الميديا لكل البوستات مرة واحدة
    const postIds = posts.map((p) => p.id);

    const mediaQuery = `
      SELECT id, post_id, media_url, media_type, sort_order
      FROM post_media
      WHERE post_id = ANY($1::bigint[])
      ORDER BY sort_order ASC, id ASC
    `;

    const mediaResult = await pool.query(mediaQuery, [postIds]);

    // 3) وزّع الميديا على كل بوست
    const mediaByPostId = {};
    mediaResult.rows.forEach((m) => {
      if (!mediaByPostId[m.post_id]) mediaByPostId[m.post_id] = [];
      mediaByPostId[m.post_id].push(m);
    });

    const postsWithMedia = posts.map((p) => ({
      ...p,
      media: mediaByPostId[p.id] || [],
    }));

    return res.status(200).json({
      success: true,
      posts: postsWithMedia,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "server error while getting user posts",
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
  getFeed,
  getPostsByUserId,
};
