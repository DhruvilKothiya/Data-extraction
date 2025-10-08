// components/SummaryDialog.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import axiosInstance from "../utils/axiosConfig";
import { toast } from "react-toastify";

const SummaryDialog = ({ open, onClose, company, isSmall = false }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");

  useEffect(() => {
    if (open && company) {
      fetchSummary();
    }
  }, [open, company]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(`/summary-notes/${company.id}`);

      setSummary(response.data.summary || "No summary available");
      setEditedSummary(response.data.summary || "");
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError("Failed to load summary notes");
      setSummary("Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      await axiosInstance.post(
        `/summary-notes/${company.id}`,
        { summary: editedSummary }
      );

      setSummary(editedSummary);
      setIsEditing(false);
      toast.success("Summary updated successfully");
    } catch (err) {
      console.error("Error saving summary:", err);
      toast.error("Failed to save summary");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedSummary(summary);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedSummary(summary);
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditedSummary("");
    setSummary("");
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isSmall}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h6" component="div">
              Summary Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {company?.company_name}
            </Typography>
            {company?.registration_number && (
              <Typography variant="caption" color="text.secondary">
                Registration: {company.registration_number}
              </Typography>
            )}
          </Box>
          {!isEditing && !loading && (
            <IconButton onClick={handleEdit} color="primary">
              <EditIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={8}
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            placeholder="Enter summary notes for this company..."
            variant="outlined"
          />
        ) : (
          <Box sx={{ minHeight: 200 }}>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {summary}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {isEditing ? (
          <>
            <Button onClick={handleCancel} disabled={loading}>
              <CancelIcon sx={{ mr: 1 }} />
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={loading}>
              <SaveIcon sx={{ mr: 1 }} />
              Save
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SummaryDialog;
