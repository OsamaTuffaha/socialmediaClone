import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [matchPassword, setMatchPassword] = useState("");

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false); // success or fail

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    // تحقق من تطابق الباسوورد
    if (password !== matchPassword) {
      setStatus(false);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/user/register",
        {
          username,
          fullName,
          email,
          password,
        }
      );

      if (response.data.success) {
        setStatus(true);
        setMessage("Account created successfully! Redirecting...");
        setTimeout(() => nav("/login"), 1500);
      } else {
        setStatus(false);
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        "Error while creating account. Try again.";
      setStatus(false);
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
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h5"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Create Your Account
          </Typography>

          {message && (
            <Alert severity={status ? "success" : "error"} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleRegister}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Username"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              required
              value={matchPassword}
              onChange={(e) => setMatchPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 1 }}
            >
              Register
            </Button>

            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, color: "text.secondary" }}
            >
              Already have an account?{" "}
              <span
                style={{
                  color: "#1976d2",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={() => nav("/login")}
              >
                Login
              </span>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
