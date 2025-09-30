// components/CompanyTableControls.jsx
import React from "react";
import {
  Stack,
  TextField,
  MenuItem,
  Button,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

const CompanyTableControls = ({
  searchTerm,
  onSearchChange,
  approvalFilter,
  onApprovalFilterChange,
  onExportClick,
  hasSelectedCompanies,
  isSmall,
  showInactive,
  onShowInactiveChange,
  onClearSearch,
}) => {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 11,
        backgroundColor: "background.paper",
        pt: 2,
        pb: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, order: { xs: 1, sm: 1 } }}>
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
              width: { xs: "100%", sm: 300 },
            }}
          />
          {searchTerm && (
            <IconButton
              onClick={onClearSearch}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
              title="Clear search"
            >
              <ClearIcon />
            </IconButton>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            order: { xs: 2, sm: 2 },
            flexWrap: "wrap",
            position: "relative",
            zIndex: 12,
            backgroundColor: "background.paper",
            padding: 1,
            borderRadius: 1,
            minWidth: 150,
          }}
        >
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

          {/* Add this new TextField for Show Inactive filter */}
          <TextField
            select
            label="Show Inactive"
            size="small"
            value={showInactive}
            onChange={onShowInactiveChange}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </TextField>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            order: { xs: 3, sm: 3 },
            justifyContent: { xs: "center", sm: "flex-end" },
          }}
        >
          <Button
            variant="contained"
            onClick={onExportClick}
            disabled={!hasSelectedCompanies}
            size={isSmall ? "small" : "medium"}
            sx={{
              width: { xs: "100%", sm: "auto" },
              whiteSpace: "nowrap",
            }}
          >
            Export Data
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CompanyTableControls;
