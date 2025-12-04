import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  setProfile,
  setSelectedProfileId,
  setLoading,
  setError,
  clearProfile,
} from "../../service/reducers/profile/profileSlicer";

// MUI
import {
  Box,
  Container,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const BASE_URL = "http://localhost:5000";

const Profile = () => {
  const token = localStorage.getItem("token") || null;
  const loggedUserId = localStorage.getItem("userId");
  const { id } = useParams();

  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.profile);

  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const isOwnProfile = loggedUserId && Number(loggedUserId) === Number(id);

  // 🧠 جلب بيانات البروفايل
  useEffect(() => {
    if (!id) return;

    dispatch(setLoading(true));
    dispatch(setSelectedProfileId(id));

    axios
      .get(`${BASE_URL}/user/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        dispatch(setProfile(res.data.user || res.data));
      })
      .catch((err) => {
        console.error(err);
        dispatch(setError("Error fetching profile"));
      });

    return () => {
      dispatch(clearProfile());
    };
  }, [id, token, dispatch]);

  // 🧠 جلب بوستات المستخدم
  useEffect(() => {
    if (!id) return;

    const fetchUserPosts = async () => {
      try {
        setPostsLoading(true);
        const res = await axios.get(`${BASE_URL}/post/user/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // هين ضمان إنها Array وما تكسر الصفحة
        setUserPosts(
          Array.isArray(res.data.posts)
            ? res.data.posts
            : Array.isArray(res.data)
            ? res.data
            : []
        );
      } catch (err) {
        console.error("Error fetching user posts:", err);
        setUserPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [id, token]);

  // 🧠 جلب followers / following للمودال
  const fetchList = async (type) => {
    try {
      setListLoading(true);

      const url =
        type === "followers"
          ? `${BASE_URL}/user/${id}/followers`
          : `${BASE_URL}/user/${id}/following`;

      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (type === "followers") {
        setFollowers(res.data.followers || res.data);
      } else {
        setFollowing(res.data.following || res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const handleOpenFollowers = () => {
    setFollowersOpen(true);
    fetchList("followers");
  };

  const handleOpenFollowing = () => {
    setFollowingOpen(true);
    fetchList("following");
  };

  const handleCloseFollowers = () => setFollowersOpen(false);
  const handleCloseFollowing = () => setFollowingOpen(false);

  // 🧠 ستايت اللودينغ والبروفايل
  if (loading)
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #111827, #020617)",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #111827, #020617)",
          color: "#f9fafb",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );

  if (!profile)
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #111827, #020617)",
          color: "#f9fafb",
        }}
      >
        <Typography>No profile found</Typography>
      </Box>
    );

  const avatarLetter = profile.username
    ? profile.username.charAt(0).toUpperCase()
    : "U";

  // 👉 دالة تساعدنا نجيب أول صورة من الميديا
  const getMainMedia = (post) => {
    if (!post.media || !post.media.length) return null;
    return post.media[0]; // أول صورة/فيديو
  };

  return (
    <>
      {/* الخلفية العامة */}
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #111827, #020617)",
          color: "#f9fafb",
          py: 6,
        }}
      >
        <Container maxWidth="md">
          {/* كارد البروفايل */}
          <Box
            sx={{
              background:
                "radial-gradient(circle at top left, rgba(56,189,248,0.15), transparent 50%), radial-gradient(circle at bottom right, rgba(167,139,250,0.18), transparent 55%)",
              borderRadius: 4,
              p: 4,
              boxShadow:
                "0 20px 45px rgba(15,23,42,0.9), 0 0 0 1px rgba(148,163,184,0.15)",
              border: "1px solid rgba(148,163,184,0.25)",
              mb: 4,
            }}
          >
            {/* أعلى البروفايل */}
            <Box
              sx={{
                display: "flex",
                gap: 3,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Avatar
                src={
                  profile.avatar_url ? `${BASE_URL}${profile.avatar_url}` : ""
                }
                sx={{
                  width: 96,
                  height: 96,
                  fontSize: 36,
                  bgcolor: "#38bdf8",
                  boxShadow: "0 10px 25px rgba(56,189,248,0.6)",
                }}
              >
                {!profile.avatar_url && avatarLetter}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, letterSpacing: 0.3 }}
                  >
                    {profile.username}
                  </Typography>

                  {profile.full_name && (
                    <Chip
                      label={profile.full_name}
                      size="small"
                      sx={{
                        bgcolor: "rgba(15,23,42,0.6)",
                        color: "#e5e7eb",
                        borderRadius: "999px",
                      }}
                    />
                  )}
                </Box>

                {profile.bio && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: "rgba(209,213,219,0.9)",
                      maxWidth: 420,
                    }}
                  >
                    {profile.bio}
                  </Typography>
                )}

                {profile.location && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, display: "block", color: "#9ca3af" }}
                  >
                    {profile.location}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {isOwnProfile ? (
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: "999px",
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: "#38bdf8",
                      "&:hover": { bgcolor: "#0ea5e9" },
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: "999px",
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: "#22c55e",
                      "&:hover": { bgcolor: "#16a34a" },
                    }}
                  >
                    Follow
                  </Button>
                )}
              </Box>
            </Box>

            {/* Stats */}
            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                rowGap: 2,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 120,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#f9fafb" }}
                >
                  {profile.posts_count ?? profile.posts?.length ?? 0}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(148,163,184,0.9)" }}
                >
                  Posts
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 120,
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={handleOpenFollowers}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#f9fafb" }}
                >
                  {profile.followers ?? 0}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(148,163,184,0.9)" }}
                >
                  Followers
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 120,
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={handleOpenFollowing}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#f9fafb" }}
                >
                  {profile.following ?? 0}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(148,163,184,0.9)" }}
                >
                  Following
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 📸 Grid البوستات */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                color: "#e5e7eb",
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Posts
            </Typography>

            {postsLoading ? (
              <Box
                sx={{
                  py: 4,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <CircularProgress size={24} />
              </Box>
            ) : userPosts.length === 0 ? (
              <Box
                sx={{
                  borderRadius: 3,
                  border: "1px dashed rgba(148,163,184,0.4)",
                  p: 3,
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 14,
                }}
              >
                لا يوجد بوستات لهذا المستخدم حتى الآن 💤
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2.5,
                }}
              >
                {userPosts.map((post) => {
                  const mainMedia = getMainMedia(post);

                  return (
                    <Card
                      key={post.id}
                      sx={{
                        bgcolor: "#020617",
                        borderRadius: 3,
                        border: "1px solid rgba(148,163,184,0.25)",
                        overflow: "hidden",
                        boxShadow:
                          "0 18px 40px rgba(15,23,42,0.9), 0 0 0 1px rgba(15,23,42,0.9)",
                        transform: "translateY(0)",
                        transition:
                          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          borderColor: "rgba(56,189,248,0.6)",
                          boxShadow: "0 22px 50px rgba(8,47,73,0.9)",
                        },
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Avatar
                            src={
                              post.avatar_url
                                ? `${BASE_URL}${post.avatar_url}`
                                : ""
                            }
                            sx={{ bgcolor: "#38bdf8" }}
                          >
                            {!post.avatar_url &&
                              (post.username || "U").charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        title={
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: "#e5e7eb",
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            {post.username || profile.username}
                          </Typography>
                        }
                        subheader={
                          <Typography
                            variant="caption"
                            sx={{ color: "#9ca3af", fontSize: 11 }}
                          >
                            {new Date(post.created_at).toLocaleDateString()}
                          </Typography>
                        }
                        sx={{
                          pb: 0.5,
                          "& .MuiCardHeader-content": { overflow: "hidden" },
                        }}
                      />

                      {mainMedia && mainMedia.media_type === "image" && (
                        <CardMedia
                          component="img"
                          image={`${BASE_URL}${mainMedia.media_url}`}
                          alt={post.caption || "post image"}
                          sx={{
                            height: 220,
                            objectFit: "cover",
                            mt: 1,
                          }}
                        />
                      )}

                      {/* لو بدك فيديو لاحقاً
                      {mainMedia && mainMedia.media_type === "video" && (
                        <CardMedia
                          component="video"
                          controls
                          src={`${BASE_URL}${mainMedia.media_url}`}
                          sx={{ width: "100%", maxHeight: 260, mt: 1 }}
                        />
                      )} */}

                      {post.caption && (
                        <CardContent sx={{ pb: 0.5, pt: 1.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#d1d5db",
                              fontSize: 13,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {post.caption}
                          </Typography>
                        </CardContent>
                      )}

                      <CardActions
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          px: 1.5,
                          pb: 1.5,
                          pt: 0.5,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton size="small">
                            <FavoriteIcon
                              fontSize="small"
                              sx={{ color: "#ef4444" }}
                            />
                          </IconButton>
                          <Typography
                            variant="caption"
                            sx={{ color: "#9ca3af" }}
                          >
                            {post.likes_count ?? 0}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton size="small">
                            <ChatBubbleOutlineIcon
                              fontSize="small"
                              sx={{ color: "#9ca3af" }}
                            />
                          </IconButton>
                          <Typography
                            variant="caption"
                            sx={{ color: "#9ca3af" }}
                          >
                            {post.comments_count ?? 0}
                          </Typography>
                        </Box>
                      </CardActions>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Followers Modal */}
      <Dialog
        open={followersOpen}
        onClose={handleCloseFollowers}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Followers</DialogTitle>
        <DialogContent dividers>
          {listLoading ? (
            <Box
              sx={{
                py: 3,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : followers.length === 0 ? (
            <Typography variant="body2">No followers yet.</Typography>
          ) : (
            <List dense>
              {followers.map((user) => (
                <React.Fragment key={user.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar
                        src={
                          user.avatar_url ? `${BASE_URL}${user.avatar_url}` : ""
                        }
                      >
                        {!user.avatar_url &&
                          (user.username || "U").charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.username}
                      secondary={user.full_name}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Following Modal */}
      <Dialog
        open={followingOpen}
        onClose={handleCloseFollowing}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Following</DialogTitle>
        <DialogContent dividers>
          {listLoading ? (
            <Box
              sx={{
                py: 3,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : following.length === 0 ? (
            <Typography variant="body2">Not following anyone yet.</Typography>
          ) : (
            <List dense>
              {following.map((user) => (
                <React.Fragment key={user.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar
                        src={
                          user.avatar_url ? `${BASE_URL}${user.avatar_url}` : ""
                        }
                      >
                        {!user.avatar_url &&
                          (user.username || "U").charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.username}
                      secondary={user.full_name}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;
