// src/pages/KeyFinancialDataPage.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { toast } from "react-toastify";

const KeyFinancialDataPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKeyData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/key-financial-data/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load key financial data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeyData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Typography variant="h6">No data found.</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Key Financial Data
      </Typography>
      {Object.entries(data).map(([key, value]) => (
        <Box key={key} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}:
          </Typography>
          <Typography variant="body1">{value ?? "N/A"}</Typography>
        </Box>
      ))}
      <Button variant="contained" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </Box>
  );
};

export default KeyFinancialDataPage;
