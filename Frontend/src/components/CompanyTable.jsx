import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  Box,
} from "@mui/material";
import CompanyTableHeader from "./CompanyTableHeader";
import CompanyTableRow from "./CompanyTableRow";

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
  const [page, setPage] = useState(0);
  const rowsPerPage = 100; // fixed at 100 rows

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

  // 🔹 Slice the companies for current page
  const paginatedCompanies = filteredCompanies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          width: "100%",
          overflowX: "auto",
          "& .MuiTable-root": {
            minWidth: { xs: 800, sm: 1000 },
          },
        }}
        // sx={{
        //   flex: 1,
        //   display: 'flex',
        //   flexDirection: 'column',
        //   maxHeight: 'calc(100vh - 200px)',
        //   overflow: 'auto',
        //   '& .MuiTable-root': {
        //     minWidth: 'max-content',
        //     tableLayout: 'fixed',
        //   },
        //   '& .MuiTableHead-root': {
        //     position: 'sticky',
        //     top: 0,
        //     zIndex: 10,
        //     backgroundColor: 'background.paper',
        //     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        //   },
        //   '& .MuiTableCell-head': {
        //     backgroundColor: 'background.paper',
        //     fontWeight: 'bold',
        //     borderBottom: '2px solid',
        //     borderColor: 'divider',
        //   },
        // }}
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
      <TablePagination
        rowsPerPageOptions={[]}
        component="div"
        count={filteredCompanies.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        sx={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          // zIndex: 5,
          "& .MuiTablePagination-toolbar": {
            padding: "8px",
            justifyContent: "flex-end",
          },
        }}
      />
    </Box>
  );
};

export default CompanyTable;
