import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  Box,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import CompanyTableHeader from "./CompanyTableHeader";
import CompanyTableRow from "./CompanyTableRow";
import CustomPagination from "./CustomPagination";

const CompanyTable = ({
  filteredCompanies,
  isSmall,
  editedRegistrations,
  rerunLoading,
  onSelectAll,
  onSelectOne,
  onRegistrationChange,
  onRerunAI,
  onOpenDetail,
  onNavigate,
  onApprovalChange,
  // Menu props
  menuAnchorEl,
  onMenuClick,
  onMenuClose,
  onCustomSelect,
  isMenuOpen,
}) => {
  // 🔹 Pagination states
  const [page, setPage] = useState(1); // Material-UI Pagination uses 1-indexed pages
  const rowsPerPage = 25; // Fixed at 25 rows per page

  // 🔹 Sorting states
  const [sortField, setSortField] = useState('company_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Only consider active companies for select-all states
  const activeFilteredCompanies = filteredCompanies.filter(
    (c) => c.company_status === "Active"
  );

  const selectAllChecked =
    activeFilteredCompanies.length > 0 &&
    activeFilteredCompanies.every((c) => c.selected);
  const selectAllIndeterminate =
    activeFilteredCompanies.some((c) => c.selected) &&
    !activeFilteredCompanies.every((c) => c.selected);

  const handleSelectAllChange = (checked) => {
    onSelectAll(activeFilteredCompanies, checked);
  };

  const handleCustomSelectWithData = (option) => {
    onCustomSelect(option, paginatedCompanies);
    onMenuClose();
  };

  // 🔹 Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    // Keep current page when sorting - don't reset to page 1
  };

  // 🔹 Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 🔹 Sort the filtered companies
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle null/undefined values
    if (aValue == null) aValue = '';
    if (bValue == null) bValue = '';

    // Convert to string for comparison
    aValue = aValue.toString().toLowerCase();
    bValue = bValue.toString().toLowerCase();

    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // 🔹 Calculate pagination values
  const totalPages = Math.ceil(sortedCompanies.length / rowsPerPage);
  
  // 🔹 Ensure current page is valid (adjust if beyond available pages)
  const validPage = Math.min(page, Math.max(1, totalPages));
  const startIndex = (validPage - 1) * rowsPerPage; // Convert to 0-indexed for slicing
  const endIndex = startIndex + rowsPerPage;
  
  // 🔹 Slice the sorted companies for current page
  const paginatedCompanies = sortedCompanies.slice(startIndex, endIndex);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          flex: 1,
          width: "100%",
          overflowX: "auto",
          overflowY: "auto",
          "& .MuiTable-root": {
            minWidth: { xs: 800, sm: 1000 },
          },
        }}
        
      >
        <Table stickyHeader size={isSmall ? "small" : "medium"}>
          <CompanyTableHeader
            filteredCompanies={filteredCompanies}
            isSmall={isSmall}
            selectAllChecked={selectAllChecked}
            selectAllIndeterminate={selectAllIndeterminate}
            onSelectAllChange={handleSelectAllChange}
            menuAnchorEl={menuAnchorEl}
            onMenuClick={onMenuClick}
            onMenuClose={onMenuClose}
            onCustomSelect={handleCustomSelectWithData}
            isMenuOpen={isMenuOpen}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          <TableBody>
            {paginatedCompanies.map((company) => (
              <CompanyTableRow
                key={company.id}
                company={company}
                isSmall={isSmall}
                onSelect={onSelectOne}
                editedRegistrations={editedRegistrations}
                onRegistrationChange={onRegistrationChange}
                rerunLoading={rerunLoading}
                onRerunAI={onRerunAI}
                onOpenDetail={onOpenDetail}
                onNavigate={onNavigate}
                onApprovalChange={onApprovalChange}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Material-UI Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: { xs: "6px 8px", sm: "8px 12px" },
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          position: "sticky",
          bottom: 0,
          zIndex: 5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" }, color: "text.secondary" }}>
            {sortedCompanies.length === 0 
              ? "No items" 
              : `${startIndex + 1}-${Math.min(endIndex, sortedCompanies.length)} of ${sortedCompanies.length}`
            }
          </Typography>
          <Pagination
            count={totalPages}
            page={validPage}
            onChange={handleChangePage}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            size="small"
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                minWidth: { xs: 24, sm: 28 },
                height: { xs: 24, sm: 28 },
                margin: '0 2px',
              },
            }}
          />
        </Stack>
      </Box>
      
    </Box>
  );
};

export default CompanyTable;
