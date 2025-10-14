// hooks/useKeyFinancialImport.js
import { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';

export const useKeyFinancialImport = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const openImportDialog = () => {
    console.log('Opening import dialog...');
    setImportDialogOpen(true);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
    setUploadProgress(0);
  };

  const handleImport = async (file, onSuccess) => {
    console.log('handleImport called with file:', file);
    
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Only Excel files (.xlsx, .xls) are supported');
      return;
    }

    console.log('Starting import process...');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/import-key-financial-data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      const { message, updated_count, errors } = response.data;

      // Show success message
      toast.success(`${message}. Updated ${updated_count} companies.`);

      // Show errors if any
      if (errors && errors.length > 0) {
        errors.forEach(error => {
          toast.warning(error);
        });
      }

      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }

      closeImportDialog();
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.detail || 'Import failed';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    importDialogOpen,
    isUploading,
    uploadProgress,
    openImportDialog,
    closeImportDialog,
    handleImport,
  };
};
