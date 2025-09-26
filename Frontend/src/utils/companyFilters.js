// utils/companyFilters.js

export const filterCompanies = (companies, searchTerm, approvalFilter) => {
  return companies.filter((company) => {
    // Search is now handled server-side, so we only filter by approval client-side
    const approvalMatch =
      approvalFilter === "all"
        ? true
        : approvalFilter === "approved"
        ? company.approval_stage === 1
        : company.approval_stage === 0 || company.approval_stage === 2;

    return approvalMatch;
  });
};

export const paginateCompanies = (companies, limit = 100) => {
  return companies.slice(0, limit);
};