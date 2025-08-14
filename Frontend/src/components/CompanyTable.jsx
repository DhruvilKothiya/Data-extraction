import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableContainer, 
  Paper,
  TablePagination
} from '@mui/material';
import CompanyTableHeader from './CompanyTableHeader';
import CompanyTableRow from './CompanyTableRow';

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
  isMenuOpen
}) => {
  // 🔹 Pagination states
  const [page, setPage] = useState(0);
  const rowsPerPage = 100; // fixed at 100 rows

  // Only consider active companies for select-all states
  const activeFilteredCompanies = filteredCompanies.filter(c => c.company_status === "Active");

  const selectAllChecked = activeFilteredCompanies.length > 0 && activeFilteredCompanies.every(c => c.selected);
  const selectAllIndeterminate = activeFilteredCompanies.some(c => c.selected) && !activeFilteredCompanies.every(c => c.selected);

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
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 800, sm: 1000 }
          }
        }}
      >
        <Table size={isSmall ? "small" : "medium"}>
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

      {/* 🔹 Pagination Control */}
      <TablePagination
        component="div"
        count={filteredCompanies.length}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[100]} // fixed 100 rows
      />
    </>
  );
};

export default CompanyTable;
