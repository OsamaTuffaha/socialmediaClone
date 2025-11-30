// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { setLogin, setUserId } from "../../service/reducers/auth/authSlicer";

const Login = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (auth.isLoggedIn) {
      nav("/home");
    }
  }, [auth.isLoggedIn, nav]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const result = await axios.post("http://localhost:5000/user/login", {
        email,
        password,
      });

      const { token, id } = result.data; 

      dispatch(setLogin(token));
      dispatch(setUserId(id));

      nav("/home");
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message || "Login failed, please try again";
      setMessage(msg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, bgcolor: "white" }}>
          <Typography
            variant="h5"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Sign in to your account
          </Typography>

          {message && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 1 }}
            >
              Sign in
            </Button>

            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, color: "text.secondary" }}
            >
              Not a member?{" "}
              <span style={{ color: "#1976d2", cursor: "pointer" }}>
                Create an account
              </span>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
