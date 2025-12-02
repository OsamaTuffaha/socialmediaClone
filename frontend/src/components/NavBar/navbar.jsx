// src/components/NavBar/navbar.jsx

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

import { setLoggout } from "../../service/reducers/auth/authSlicer";
// import { addPost } from "../../service/reducers/post/postSlicer"; // لو حاب تحدث الريدكس بعد النشر

const pages = ["Home", "Explore", "About"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "background.paper",
  borderRadius: 8,
  boxShadow: 24,
  padding: 24,
};

// ========== Child Modal: اختيار الميديا (صور/فيديو) ==========
function MediaPickerModal({ open, onClose, onConfirm }) {
  const [tempMedia, setTempMedia] = React.useState([]);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);

    const mapped = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));

    setTempMedia((prev) => [...prev, ...mapped]);
  };

  const handleOk = () => {
    onConfirm(tempMedia);
    onClose();
  };

  const handleRemoveItem = (index) => {
    setTempMedia((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...modalStyle, width: 400 }}>
        <Typography variant="h6" mb={2}>
          Add media (images / videos)
        </Typography>

        <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
          Choose files
          <input
            type="file"
            hidden
            multiple
            accept="image/*,video/*"
            onChange={handleFilesChange}
          />
        </Button>

        <Box
          sx={{
            maxHeight: 200,
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: 1,
            p: 1,
          }}
        >
          {tempMedia.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No media selected yet.
            </Typography>
          )}

          <Stack spacing={1}>
            {tempMedia.map((m, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderBottom: "1px solid #eee",
                  pb: 1,
                }}
              >
                {m.type === "image" ? (
                  <img
                    src={m.previewUrl}
                    alt="preview"
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <video
                    src={m.previewUrl}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 4,
                      objectFit: "cover",
                    }}
                    muted
                  />
                )}
                <Typography sx={{ flexGrow: 1 }} noWrap>
                  {m.file.name}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveItem(idx)}
                >
                  X
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleOk}>
            OK
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

// ========== Parent Modal: إنشاء بوست جديد ==========
function AddPostModal({ open, onClose }) {
  const [caption, setCaption] = React.useState("");
  const [media, setMedia] = React.useState([]);
  const [openChild, setOpenChild] = React.useState(false);

  const token = localStorage.getItem("token");

  const handleAddMedia = (selectedMedia) => {
    setMedia((prev) => [...prev, ...selectedMedia]);
  };

  const handleRemoveMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!caption && media.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("caption", caption);

      media.forEach((m) => {
        formData.append("media", m.file); // 👈 لازم يكون الاسم "media"
      });

      const res = await axios.post("http://localhost:5000/post", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // لا تجبر Content-Type، axios بيضبطه لحاله مع الـ boundary
        },
      });

      console.log("POST CREATED:", res.data);

      // TODO: تقدر تحدث الريدكس هون: dispatch(addPost(res.data.post));

      setCaption("");
      setMedia([]);
      onClose();
    } catch (err) {
      console.error("Error while creating post:", err);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            Create new post
          </Typography>

          <TextField
            label="Caption"
            fullWidth
            multiline
            minRows={2}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => setOpenChild(true)}
          >
            Add media (images / videos)
          </Button>

          <Box
            sx={{
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: 1,
              p: 1,
            }}
          >
            {media.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No media added yet.
              </Typography>
            )}

            <Stack spacing={1}>
              {media.map((m, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderBottom: "1px solid #eee",
                    pb: 1,
                  }}
                >
                  {m.type === "image" ? (
                    <img
                      src={m.previewUrl}
                      alt="preview"
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <video
                      src={m.previewUrl}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 4,
                        objectFit: "cover",
                      }}
                      muted
                    />
                  )}
                  <Typography sx={{ flexGrow: 1 }} noWrap>
                    {m.file.name}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveMedia(idx)}
                  >
                    X
                  </Button>
                </Box>
              ))}
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handlePublish}>
              Publish
            </Button>
          </Stack>
        </Box>
      </Modal>

      <MediaPickerModal
        open={openChild}
        onClose={() => setOpenChild(false)}
        onConfirm={handleAddMedia}
      />
    </>
  );
}

// ========== NavBar الرئيسي ==========

function NavBar() {
  const dispatch = useDispatch();
  const nav = useNavigate();

  const auth = useSelector((state) => state.auth);
  const token = auth?.token || localStorage.getItem("token");
  const avatarUrl =
    auth?.avatar_url ||
    localStorage.getItem("avatarUrl") ||
    "/static/images/avatar/2.jpg";

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [openAddPostModal, setOpenAddPostModal] = React.useState(false);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatarUrl");

    dispatch(setLoggout());
    handleCloseUserMenu();
    nav("/login");
  };

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo Desktop */}
            <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              LOGO
            </Typography>

            {/* Mobile Menu Button */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Logo Mobile */}
            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              LOGO
            </Typography>

            {/* Pages Desktop */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page}
                </Button>
              ))}
            </Box>

            {/* زر Add Post (لما يكون عامل لوج إن) */}
            {token && (
              <Button
                color="inherit"
                variant="outlined"
                sx={{ mr: 2 }}
                onClick={() => setOpenAddPostModal(true)}
              >
                Add Post
              </Button>
            )}

            {/* يمين النافبار: Avatar أو Login */}
            <Box sx={{ flexGrow: 0 }}>
              {token ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt={auth?.username || "User"} src={avatarUrl} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: "45px" }}
                    anchorEl={anchorElUser}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {settings.map((setting) => {
                      if (setting === "Logout" && !token) return null;

                      const handleClick =
                        setting === "Logout"
                          ? handleLogout
                          : handleCloseUserMenu;

                      return (
                        <MenuItem key={setting} onClick={handleClick}>
                          <Typography textAlign="center">
                            {setting}
                          </Typography>
                        </MenuItem>
                      );
                    })}
                  </Menu>
                </>
              ) : (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => nav("/login")}
                  sx={{ ml: 2 }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Modal إضافة بوست */}
      <AddPostModal
        open={openAddPostModal}
        onClose={() => setOpenAddPostModal(false)}
      />
    </>
  );
}

export default NavBar;
