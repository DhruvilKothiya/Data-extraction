import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { PictureAsPdf as PDFIcon } from '@mui/icons-material';

const PDFLinksCell = ({ pdfLinks, disabled }) => {
  const handlePDFClick = (pdfUrl) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  if (!pdfLinks || pdfLinks.length === 0) {
    return (
      <Box sx={{ minWidth: 80 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: "0.75rem", 
            color: "text.disabled",
            fontStyle: "italic"
          }}
        >
          No PDFs
        </Typography>
      </Box>
    );
  }

  if (pdfLinks.length === 1) {
    return (
      <Button
        size="small"
        variant="outlined"
        startIcon={<PDFIcon sx={{ fontSize: "0.9rem" }} />}
        onClick={() => handlePDFClick(pdfLinks[0])}
        disabled={disabled}
        sx={{ 
          fontSize: { xs: "0.7rem", sm: "0.8rem" },
          minWidth: 'auto',
          px: 1
        }}
      >
        View PDF
      </Button>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 100 }}>
      {pdfLinks.map((pdfUrl, index) => (
        <Button
          key={index}
          size="small"
          variant="outlined"
          startIcon={<PDFIcon sx={{ fontSize: "0.8rem" }} />}
          onClick={() => handlePDFClick(pdfUrl)}
          disabled={disabled}
          sx={{ 
            fontSize: "0.65rem",
            minWidth: 'auto',
            px: 1,
            py: 0.25
          }}
        >
          PDF {index + 1}
        </Button>
      ))}
    </Box>
  );
};

export default PDFLinksCell;