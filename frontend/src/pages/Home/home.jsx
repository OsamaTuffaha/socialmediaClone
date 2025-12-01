// src/pages/Home/home.jsx

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import {
  setPosts,
  setLoading,
  setError,
  toggleLikeLocal,
} from "../../service/reducers/post/postSlicer";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  marginLeft: "auto",
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

function RecipeReviewCard({ post }) {
  const [expanded, setExpanded] = React.useState(false);
  const dispatch = useDispatch();

  const handleExpandClick = () => {
    setExpanded((prev) => !prev);
  };

  const handleLikeClick = () => {
    dispatch(toggleLikeLocal(post.id));
  };

  const mainMedia = post.media && post.media.length > 0 ? post.media[0] : null;

  const avatarLetter = post.username
    ? post.username.charAt(0).toUpperCase()
    : "U";

  return (
    <Card sx={{ maxWidth: 500, width: "100%", mb: 3 }}>
      <CardHeader
        avatar={
          <Avatar
            src={post.avatar_url || undefined}
            sx={{ bgcolor: red[500] }}
            aria-label={post.username || "user"}
          >
            {!post.avatar_url && avatarLetter}
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={post.username || "Unknown user"}
        subheader={new Date(post.created_at).toLocaleString()}
      />

      {mainMedia && mainMedia.media_type === "image" && (
        <CardMedia
          component="img"
          height="350"
          image={mainMedia.media_url}
          alt={post.caption || "post image"}
        />
      )}

      {/* لو حاب تضيف فيديو بعدين: */}
      {/* {mainMedia && mainMedia.media_type === "video" && (
        <CardMedia component="video" controls src={mainMedia.media_url} />
      )} */}

      <CardContent>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {post.caption}
        </Typography>
      </CardContent>

      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites" onClick={handleLikeClick}>
          <FavoriteIcon
            color={post.isLiked ? "error" : "inherit"}
          />
        </IconButton>
        <Typography variant="body2" sx={{ mr: 2 }}>
          {post.likes_count ?? 0}
        </Typography>

        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>

        <Typography variant="body2" sx={{ ml: 1 }}>
          {post.comments_count ?? 0} comments
        </Typography>

        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography sx={{ marginBottom: 1, fontWeight: "bold" }}>
            Post details
          </Typography>
          <Typography sx={{ marginBottom: 1 }}>
            Post ID: {post.id}
          </Typography>
          <Typography sx={{ marginBottom: 1 }}>
            User ID: {post.user_id}
          </Typography>
          {/* هون بعدين ممكن تعرض الكومنتات */}
        </CardContent>
      </Collapse>
    </Card>
  );
}

// صفحة الهوم
const HomePage = () => {
  const token = localStorage.getItem("token") || null;
  const dispatch = useDispatch();
  const nav = useNavigate();

  // الحالة من الريدكس
  const { posts, loading, error } = useSelector((state) => state.post);

  React.useEffect(() => {
    const getData = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        let result;
        if (token == null) {
          result = await axios.get("http://localhost:5000/post/");
          console.log("ALL POSTS:", result.data);
        } else {
          result = await axios.get("http://localhost:5000/post/feed");
          console.log("FEED:", result.data);
        }

        const postsArray = result.data?.data || [];
        dispatch(setPosts(postsArray));
      } catch (err) {
        console.error(err);
        dispatch(setError(err.message || "Error fetching posts"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    getData();
  }, [token, dispatch]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Loading posts...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">No posts yet.</Typography>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        paddingTop: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 10px",
        }}
      >
        {posts.map((post) => (
          <RecipeReviewCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
