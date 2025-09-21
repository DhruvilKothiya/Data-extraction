// components/CompanyTableHeader.jsx
import React from 'react';
import { 
  TableHead, 
  TableRow, 
  TableCell, 
  Checkbox, 
  IconButton,
  Box,
  Menu,
  MenuItem
} from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';

const CompanyTableHeader = ({
  isSmall,
  selectAllChecked,
  selectAllIndeterminate,
  onSelectAllChange,
  menuAnchorEl,
  onMenuClick,
  onMenuClose,
  onCustomSelect,
  isMenuOpen
}) => {
  return (
    <TableHead>
      <TableRow>
        {/* Sticky Checkbox Column */}
        <TableCell
          padding="checkbox"
          sx={{
            position: "sticky",
            left: 0,
            zIndex: 2,
            backgroundColor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              size={isSmall ? "small" : "medium"}
              checked={selectAllChecked}
              indeterminate={selectAllIndeterminate}
              onChange={(e) => onSelectAllChange(e.target.checked)}
            />

            <IconButton
              size="small"
              onClick={onMenuClick}
              aria-label="More filter options"
            >
              <ArrowDropDownIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={menuAnchorEl}
            open={isMenuOpen}
            onClose={onMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <MenuItem onClick={() => onCustomSelect("all")}>
              Select All
            </MenuItem>
            <MenuItem onClick={() => onCustomSelect("approved")}>
              Select Reviewed & Approved
            </MenuItem>
            <MenuItem onClick={() => onCustomSelect("unapproved")}>
              Select Unapproved / Rejected
            </MenuItem>
            <MenuItem onClick={() => onCustomSelect("Not Started")}>
              Select Not Started
            </MenuItem>
            <MenuItem onClick={() => onCustomSelect("Processing")}>
              Select Processing
            </MenuItem>
            <MenuItem onClick={() => onCustomSelect("Done")}>
              Select Done
            </MenuItem>
          </Menu>
        </TableCell>

        {/* Sticky Company Name Column */}
        <TableCell
          sx={{
            position: "sticky",
            left: 80, // adjust this width if needed
            zIndex: 3,
            backgroundColor: "background.paper",
          }}
        >
          Company Name
        </TableCell>

        <TableCell>Company Status</TableCell>
        <TableCell>Registration Number</TableCell>
        <TableCell>Re-run AI</TableCell>
        <TableCell>Turnover</TableCell>
        <TableCell>Asset Value</TableCell>
        <TableCell>Key Financial Data</TableCell>
        {!isSmall && (
          <>
            <TableCell>PDFs</TableCell>
            <TableCell>People Page</TableCell>
            <TableCell>Summary Notes</TableCell>
            <TableCell>Scheme Type</TableCell>
            <TableCell>Last Modified</TableCell>
          </>
        )}
        <TableCell>Approval Stage</TableCell>
        <TableCell>Status</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default CompanyTableHeader;
