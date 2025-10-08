// hooks/useFileUpload.js
import { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';

export const useFileUpload = (onUploadSuccess) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const handleCSVUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await axiosInstance.post(
        '/upload-file',
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );

      setUploadProgress(0);
      setUploadedFileName(response.data.filename);
      toast.success("File uploaded successfully! Companies are now processing...");
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      toast.error("File upload failed");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadProgress,
    uploading,
    uploadedFileName,
    handleCSVUpload,
    setUploadedFileName,
  };
};
