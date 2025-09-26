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
  CircularProgress,
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
  pagination,
  onPageChange,
  dataLoaded
}) => {
  // 🔹 Frontend sorting state
  const [sortField, setSortField] = useState('company_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // 🔹 Server-side pagination - page state is managed by parent
  const page = pagination?.page || 1;
  const totalPages = pagination?.total_pages || 1;
  const total = pagination?.total || 0;
  const perPage = pagination?.per_page || 100;

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
    onCustomSelect(option, filteredCompanies);
    onMenuClose();
  };

  // 🔹 Frontend sorting logic
  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
  };

  // 🔹 Apply sorting to filtered companies
  const sortedCompanies = React.useMemo(() => {
    if (!sortField) return filteredCompanies;

    return [...filteredCompanies].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Convert to strings for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredCompanies, sortField, sortOrder]);

  // 🔹 Pagination handler - calls parent's onPageChange to trigger API call
  const handleChangePage = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  // 🔹 Calculate display range for current page
  const startIndex = (page - 1) * perPage + 1;
  const endIndex = Math.min(page * perPage, total);

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
          position: "relative",
        }}
        
      >
        {/* Loading overlay for table area only */}
        {!dataLoaded && (
          <Box
            sx={{
              position: "absolute",
              top: 120, // Start below the header (approximate header height)
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              zIndex: 5, // Lower than header z-index
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}
        
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
            // Frontend sorting props
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          <TableBody>
            {sortedCompanies.map((company) => (
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
            {total === 0 
              ? "No items" 
              : `${startIndex}-${endIndex} of ${total}`
            }
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
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
