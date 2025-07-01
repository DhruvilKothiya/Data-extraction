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
import axios from "axios";
import { toast } from "react-toastify"; // ✅ Toast import

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/forgot-password`,
        { email }
      );
      toast.success("Reset link sent! Check your email."); 
    } catch (error) {
      toast.error("Failed to send reset link.");  
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
        sx={{ maxWidth: 400, width: "100%", borderRadius: 2 }}
        elevation={3}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
          >
            Forgot Password
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Enter your email"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ py: 1.5, mb: 2 }}
            >
              Send Reset Link
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;
