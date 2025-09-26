// utils/companyFilters.js

export const filterCompanies = (companies, searchTerm, approvalFilter, showInactive = 'no') => {
  return companies.filter((company) => {
    // Search is now handled server-side, so we only filter by approval and status client-side
    const approvalMatch =
      approvalFilter === "all"
        ? true
        : approvalFilter === "approved"
        ? company.approval_stage === 1
        : company.approval_stage === 0 || company.approval_stage === 2;

    // Filter by company status (Active/Inactive)
    const statusMatch = 
      showInactive === 'yes' 
        ? company.company_status === 'Inactive'  // Show only inactive companies
        : company.company_status === 'Active';   // Show only active companies

    return approvalMatch && statusMatch;
  });
};

export const paginateCompanies = (companies, limit = 100) => {
  return companies.slice(0, limit);
};