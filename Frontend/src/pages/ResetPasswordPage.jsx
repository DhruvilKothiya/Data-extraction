import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import { toast } from "react-toastify"; // ✅ Toast import

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match"); 
      return;
    }

    try {
      await axiosInstance.post('/reset-password', {
        token,
        new_password: newPassword,
      });
      toast.success("Password reset successful! Redirecting..."); // ✅ Success toast
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      toast.error("Invalid or expired link"); 
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        p: 2,
      }}
    >
      <Card
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              mb: 4,
              color: theme.palette.primary.main,
            }}
          >
            Reset Password
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                mb: 2,
                borderRadius: 1,
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPasswordPage;
