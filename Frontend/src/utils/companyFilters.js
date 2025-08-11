// utils/companyFilters.js
export const filterCompanies = (companies, searchTerm, approvalFilter) => {
  return companies.filter((company) => {
    const nameMatch = company.company_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const approvalMatch =
      approvalFilter === "all"
        ? true
        : approvalFilter === "approved"
        ? company.approval_stage === 1
        : company.approval_stage === 0 || company.approval_stage === 2;

    return nameMatch && approvalMatch;
  });
};

export const paginateCompanies = (companies, limit = 100) => {
  return companies.slice(0, limit);
};