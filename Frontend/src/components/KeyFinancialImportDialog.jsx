// components/KeyFinancialImportDialog.jsx
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

const KeyFinancialImportDialog = ({
  open,
  onClose,
  onImport,
  isUploading,
  uploadProgress,
  isSmall,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleImport = () => {
    console.log('Dialog handleImport called with selectedFile:', selectedFile);
    if (selectedFile) {
      onImport(selectedFile);
    } else {
      console.log('No file selected');
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      onClose();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          mx: { xs: 2, sm: 4 },
          width: { xs: 'calc(100% - 32px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle sx={{ 
        fontSize: { xs: '1rem', sm: '1.25rem' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        Import Key Financial Data
        {!isUploading && (
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Upload an Excel file (.xlsx or .xls) with a "Main Data" sheet containing updated key financial data.
            The system will match companies by name and update their financial information.
          </Alert>

          {/* File Upload Area */}
          <Paper
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: dragOver ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {selectedFile ? (
              <Box>
                <DescriptionIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  sx={{ mt: 1 }}
                >
                  Remove File
                </Button>
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Drop your Excel file here
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  or click to browse files
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supported formats: .xlsx, .xls
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Upload Progress */}
          {isUploading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Uploading and processing... {uploadProgress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isUploading}
          size={isSmall ? "small" : "medium"}
        >
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!selectedFile || isUploading}
          size={isSmall ? "small" : "medium"}
        >
          {isUploading ? 'Importing...' : 'Import Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyFinancialImportDialog;
