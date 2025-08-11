// components/FileUploadSection.jsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

const FileUploadSection = ({ 
  uploading, 
  uploadProgress, 
  uploadedFileName, 
  onFileUpload, 
  onFileNameChange,
  isSmall 
}) => {
  return (
    <Box
      sx={{
        border: "2px dashed #aaa",
        borderRadius: 2,
        p: { xs: 2, sm: 4 },
        textAlign: "center",
        backgroundColor: "#f5f5f5",
        mb: { xs: 2, sm: 4 },
      }}
    >
      <input
        type="file"
        id="csv-upload"
        accept=".csv,text/csv"
        hidden
        onChange={(e) => {
          const selectedFile = e.target.files[0];
          if (selectedFile) {
            onFileNameChange(selectedFile.name);
            onFileUpload(selectedFile);
          }
        }}
      />
      <label htmlFor="csv-upload" style={{ cursor: "pointer" }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <UploadIcon sx={{ fontSize: { xs: 30, sm: 40 }, mb: 1 }} />
        </Box>
        <Button
          variant="outlined"
          component="span"
          size={isSmall ? "small" : "medium"}
        >
          Choose CSV File to Upload
        </Button>
        <Typography variant="body2" mt={1} fontSize={{ xs: '0.75rem', sm: '0.875rem' }}>
          or drag and drop your CSV here
        </Typography>
        {uploadedFileName && (
          <Typography
            variant="body2"
            mt={1}
            sx={{ color: "green", fontWeight: 500 }}
            fontSize={{ xs: '0.75rem', sm: '0.875rem' }}
          >
            Uploaded File: {uploadedFileName}
          </Typography>
        )}
      </label>
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" fontSize={{ xs: '0.75rem', sm: '0.875rem' }}>
            {uploadProgress}% uploaded
          </Typography>
          <Box
            sx={{
              height: 8,
              backgroundColor: "#ddd",
              borderRadius: 4,
              overflow: "hidden",
              mt: 1,
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${uploadProgress}%`,
                backgroundColor: "#1976d2",
                transition: "width 0.3s",
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FileUploadSection;