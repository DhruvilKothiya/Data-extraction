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
        p: { xs: 1.5, sm: 2 },
        textAlign: "center",
        backgroundColor: "#f5f5f5",
        mb: { xs: 1, sm: 1.5 },
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
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <UploadIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
          <Button
            variant="outlined"
            component="span"
            size="small"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Choose CSV File to Upload
          </Button>
          <Typography variant="body2" fontSize={{ xs: '0.7rem', sm: '0.8rem' }} sx={{ color: 'text.secondary' }}>
            or drag and drop your CSV here
          </Typography>
          {uploadedFileName && (
            <Typography
              variant="body2"
              sx={{ color: "green", fontWeight: 500 }}
              fontSize={{ xs: '0.7rem', sm: '0.8rem' }}
            >
              Uploaded: {uploadedFileName}
            </Typography>
          )}
        </Box>
      </label>
      {uploading && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" fontSize={{ xs: '0.7rem', sm: '0.8rem' }}>
            {uploadProgress}% uploaded
          </Typography>
          <Box
            sx={{
              height: 6,
              backgroundColor: "#ddd",
              borderRadius: 3,
              overflow: "hidden",
              mt: 0.5,
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