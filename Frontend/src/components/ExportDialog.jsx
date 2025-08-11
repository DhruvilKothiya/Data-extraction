// components/ExportDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Typography
} from '@mui/material';

const ExportDialog = ({
  open,
  onClose,
  onExport,
  includeKeyData,
  setIncludeKeyData,
  includePeopleData,
  setIncludePeopleData,
  includeSummaryNotes,
  setIncludeSummaryNotes,
  isSmall
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mx: { xs: 2, sm: 4 },
          width: { xs: 'calc(100% - 32px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Export Options
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                size={isSmall ? "small" : "medium"}
                checked={includeKeyData}
                onChange={(e) => setIncludeKeyData(e.target.checked)}
              />
            }
            label={
              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                Include Key Financial Data
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                size={isSmall ? "small" : "medium"}
                checked={includePeopleData}
                onChange={(e) => setIncludePeopleData(e.target.checked)}
              />
            }
            label={
              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                Include People Data
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                size={isSmall ? "small" : "medium"}
                checked={includeSummaryNotes}
                onChange={(e) => setIncludeSummaryNotes(e.target.checked)}
              />
            }
            label={
              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                Include Summary Notes
              </Typography>
            }
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          size={isSmall ? "small" : "medium"}
        >
          Cancel
        </Button>
        <Button
          onClick={onExport}
          variant="contained"
          size={isSmall ? "small" : "medium"}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;