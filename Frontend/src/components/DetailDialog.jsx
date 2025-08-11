// components/DetailDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

const DetailDialog = ({
  open,
  onClose,
  company,
  detailType,
  isSmall
}) => {
  if (!company) return null;

  const data = detailType === "turnover" 
    ? company.turnover_data 
    : company.fair_value_assets;

  const title = detailType === "turnover" 
    ? "Turnover Details" 
    : "Asset Value Details";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          mx: { xs: 2, sm: 4 },
          width: { xs: 'calc(100% - 32px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        {title}
      </DialogTitle>
      <DialogContent dividers>
        {data && Object.entries(data)
          .sort(([a], [b]) => b - a)
          .map(([year, value]) => (
            <Box
              key={year}
              display="flex"
              justifyContent="space-between"
              py={0.5}
            >
              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                {year}
              </Typography>
              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                {value}
              </Typography>
            </Box>
          ))}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          size={isSmall ? "small" : "medium"}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailDialog;