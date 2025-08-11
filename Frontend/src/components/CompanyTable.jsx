// components/CompanyTable.jsx
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableContainer, 
  Paper 
} from '@mui/material';
import CompanyTableHeader from './CompanyTableHeader';
import CompanyTableRow from './CompanyTableRow';

const CompanyTable = ({
  paginatedCompanies,
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
  const selectAllChecked = filteredCompanies.length > 0 && filteredCompanies.every(c => c.selected);
  const selectAllIndeterminate = filteredCompanies.some(c => c.selected) && !filteredCompanies.every(c => c.selected);

  const handleSelectAllChange = (checked) => {
    onSelectAll(filteredCompanies, checked);
  };

  const handleCustomSelectWithData = (option) => {
    onCustomSelect(option, paginatedCompanies);
    onMenuClose();
  };

  return (
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
  );
};

export default CompanyTable;