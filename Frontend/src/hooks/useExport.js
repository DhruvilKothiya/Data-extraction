// hooks/useExport.js
import { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';

export const useExport = () => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [includeKeyData, setIncludeKeyData] = useState(false);
  const [includePeopleData, setIncludePeopleData] = useState(false);
  const [includeSummaryNotes, setIncludeSummaryNotes] = useState(false);
  const [includeCompanyCharges, setIncludeCompanyCharges] = useState(false);

  const openExportDialog = () => setExportDialogOpen(true);
  const closeExportDialog = () => setExportDialogOpen(false);

  const handleExport = async (companyData) => {
    const selectedIds = companyData.filter((c) => c.selected).map((c) => c.id);
    if (selectedIds.length === 0) return;

    try {
      const response = await axiosInstance.post(
        '/export-company-data',
        {
          ids: selectedIds,
          key_financial: includeKeyData,
          people_data: includePeopleData,
          summary_notes: includeSummaryNotes,
          company_charges: includeCompanyCharges,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exported_companies.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Exported successfully");
    } catch (error) {
      toast.error("Export failed");
      console.error("Export error:", error);
    }
    closeExportDialog();
  };

  return {
    exportDialogOpen,
    includeKeyData,
    includePeopleData,
    includeSummaryNotes,
    includeCompanyCharges,
    setIncludeKeyData,
    setIncludePeopleData,
    setIncludeSummaryNotes,
    setIncludeCompanyCharges,
    openExportDialog,
    closeExportDialog,
    handleExport,
  };
};

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
