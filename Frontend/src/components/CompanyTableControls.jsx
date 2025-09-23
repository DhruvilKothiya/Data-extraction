// components/CompanyTableControls.jsx
import React from 'react';
import { 
  Stack, 
  TextField, 
  MenuItem, 
  Button, 
  Box,
  IconButton,
  InputAdornment 
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';

const CompanyTableControls = ({
  searchTerm,
  onSearchChange,
  approvalFilter,
  onApprovalFilterChange,
  onExportClick,
  hasSelectedCompanies,
  isSmall
}) => {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 11,
        backgroundColor: 'background.paper',
        pt: 2,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <TextField
          placeholder="Search company..."
          value={searchTerm}
          onChange={onSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: '100%', sm: 300 },
            order: { xs: 1, sm: 1 }
          }}
        />

        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          order: { xs: 2, sm: 2 },
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 12,  
          backgroundColor: 'background.paper', 
          padding: 1, 
          borderRadius: 1, 
          minWidth: 150
        }}>
          <TextField
            select
            label="Filter by Approval"
            size="small"  
            value={approvalFilter}
            onChange={onApprovalFilterChange}
            sx={{ minWidth: 150 }}
          >
        <MenuItem value="all">All</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
        <MenuItem value="unapproved">Unapproved</MenuItem>
          </TextField>
        </Box>

        <Stack direction="row" spacing={1} 
          sx={{
            order: { xs: 3, sm: 3 },
            justifyContent: { xs: 'center', sm: 'flex-end' }
          }}
        >
          <Button
            variant="contained"
            onClick={onExportClick}
            disabled={!hasSelectedCompanies}
            size={isSmall ? "small" : "medium"}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap',
            }}
          >
            Export Data
          </Button>
          <IconButton size={isSmall ? "small" : "medium"}>
            <FilterIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CompanyTableControls;