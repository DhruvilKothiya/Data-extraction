// components/CompanyTableControls.jsx
import React from 'react';
import { 
  Stack, 
  TextField, 
  MenuItem, 
  Button, 
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
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        mb: 2,
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between'
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

      <TextField
        select
        label="Filter by Approval"
        size="small"
        value={approvalFilter}
        onChange={onApprovalFilterChange}
        sx={{
          width: { xs: '100%', sm: 200 },
          order: { xs: 2, sm: 2 }
        }}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="approved">Approved</MenuItem>
        <MenuItem value="unapproved">Unapproved</MenuItem>
      </TextField>

      <Stack
        direction="row"
        spacing={1}
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
        >
          Export Data
        </Button>
        <IconButton size={isSmall ? "small" : "medium"}>
          <FilterIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default CompanyTableControls;
