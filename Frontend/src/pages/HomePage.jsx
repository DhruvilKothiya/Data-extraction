import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useTheme,
  useMediaQuery,
  Box,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

// Components
import AppHeader from "../components/AppHeader";
import FileUploadSection from "../components/FileUploadSection";
import CompanyTableControls from "../components/CompanyTableControls";
import CompanyTable from "../components/CompanyTable";
import ExportDialog from "../components/ExportDialog";
import KeyFinancialImportDialog from "../components/KeyFinancialImportDialog";
import DetailDialog from "../components/DetailDialog";

// Hooks
import { useCompanyData } from "../hooks/useCompanyData";
import { useFileUpload } from "../hooks/useFileUpload";
import { useExport } from "../hooks/useExport";
import { useKeyFinancialImport } from "../hooks/useKeyFinancialImport";

// Utils
import { filterCompanies } from "../utils/companyFilters";

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [detailType, setDetailType] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Custom hooks
  const {
    companyData,
    dataLoaded,
    rerunLoading,
    editedRegistrations,
    fetchCompanyData,
    handleRerunAI,
    handleRegistrationChange,
    handleApprovalChange,
    toggleSelectAll,
    toggleSelectOne,
    handleCustomSelect,
    pagination,
    currentPage,
    searchTerm,
    handleSearchChange,
    handlePageChange,
    showInactive,
    handleShowInactiveChange,
    handleApprovalFilterChange,
    sortOrder,
    handleSortOrderChange,
    handleClearSearch,
    handleDeleteCompanies,
  } = useCompanyData();

  const {
    uploadProgress,
    uploading,
    uploadedFileName,
    handleCSVUpload,
    setUploadedFileName,
  } = useFileUpload(fetchCompanyData);

  const {
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
  } = useExport();

  // Import hook
  const {
    importDialogOpen,
    isUploading,
    uploadProgress: importUploadProgress,
    openImportDialog,
    closeImportDialog,
    handleImport,
  } = useKeyFinancialImport();

  // Since filtering is now handled server-side, filteredCompanies is just companyData
  const filteredCompanies = companyData;
  const hasSelectedCompanies = companyData.some((c) => c.selected);
  const isMenuOpen = Boolean(dropdownAnchorEl);

  // Event handlers
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleApprovalFilterChangeLocal = (event) => {
    const value = event.target.value;
    setApprovalFilter(value);
    handleApprovalFilterChange(value);
  };
  const handleProfileMenuOpen = (event) =>
    setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);
  const handleMenuClick = (event) => setDropdownAnchorEl(event.currentTarget);
  const handleMenuClose = () => setDropdownAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    handleProfileMenuClose();
    navigate("/signin");
  };

  const handleOpenDetail = (company, type) => {
    setSelectedCompany(company);
    setDetailType(type);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedCompany(null);
    setDetailType("");
  };

  const handleNavigate = (path, options = {}) => {
    navigate(path, options);
  };

  const handleExportClick = () => {
    handleExport(companyData);
  };

  const handleImportSuccess = () => {
    // Refresh company data after successful import
    fetchCompanyData();
  };

  const handleImportClick = (file) => {
    handleImport(file, handleImportSuccess);
  };

  // Delete handlers
  const handleDeleteClick = () => {
    const selectedCount = companyData.filter(c => c.selected).length;
    if (selectedCount === 0) {
      return; // Button should be disabled, but just in case
    }
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    await handleDeleteCompanies();
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          ml: { xs: 0 },
          display: "flex",
          width: "100%",
          flexDirection: "column",
          minWidth: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <AppHeader
          isMobile={isMobile}
          isSmall={isSmall}
          onDrawerToggle={handleDrawerToggle}
          profileAnchorEl={profileAnchorEl}
          onProfileMenuOpen={handleProfileMenuOpen}
          onProfileMenuClose={handleProfileMenuClose}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              backgroundColor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              px: { xs: 2, sm: 3 },
              pt: 1.5,
              pb: 1,
              flexShrink: 0,
            }}
          >
            <FileUploadSection
              uploading={uploading}
              uploadProgress={uploadProgress}
              uploadedFileName={uploadedFileName}
              onFileUpload={handleCSVUpload}
              onFileNameChange={setUploadedFileName}
              isSmall={isSmall}
            />

            <Box sx={{ mt: 1 }}>
              <CompanyTableControls
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                approvalFilter={approvalFilter}
                onApprovalFilterChange={handleApprovalFilterChangeLocal}
                onExportClick={openExportDialog}
                onImportClick={openImportDialog}
                onDeleteClick={handleDeleteClick}
                hasSelectedCompanies={hasSelectedCompanies}
                showInactive={showInactive}
                onShowInactiveChange={handleShowInactiveChange}
                onClearSearch={handleClearSearch}
                isSmall={isSmall}
              />
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              px: { xs: 2, sm: 3 },
              py: 2,
              minHeight: 0,
            }}
          >
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                {/* Table Section */}
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "auto",
                  }}
                >
                  <CompanyTable
                    filteredCompanies={filteredCompanies}
                    isSmall={isSmall}
                    editedRegistrations={editedRegistrations}
                    rerunLoading={rerunLoading}
                    onSelectAll={toggleSelectAll}
                    onSelectOne={toggleSelectOne}
                    onRegistrationChange={handleRegistrationChange}
                    onRerunAI={handleRerunAI}
                    onOpenDetail={handleOpenDetail}
                    onNavigate={handleNavigate}
                    onApprovalChange={handleApprovalChange}
                    menuAnchorEl={dropdownAnchorEl}
                    onMenuClick={handleMenuClick}
                    onMenuClose={handleMenuClose}
                    onCustomSelect={handleCustomSelect}
                    isMenuOpen={isMenuOpen}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    dataLoaded={dataLoaded}
                    fetchCompanyData={fetchCompanyData}
                    currentPage={currentPage}
                    companyData={companyData}
                    sortOrder={sortOrder}
                    setSortOrder={handleSortOrderChange}
                    searchTerm={searchTerm}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Dialogs */}
          <DetailDialog
            open={openDetailDialog}
            onClose={handleCloseDetailDialog}
            company={selectedCompany}
            detailType={detailType}
            isSmall={isSmall}
          />

          <ExportDialog
            open={exportDialogOpen}
            onClose={closeExportDialog}
            onExport={handleExportClick}
            includeKeyData={includeKeyData}
            setIncludeKeyData={setIncludeKeyData}
            includePeopleData={includePeopleData}
            setIncludePeopleData={setIncludePeopleData}
            includeSummaryNotes={includeSummaryNotes}
            setIncludeSummaryNotes={setIncludeSummaryNotes}
            includeCompanyCharges={includeCompanyCharges}
            setIncludeCompanyCharges={setIncludeCompanyCharges}
            isSmall={isSmall}
          />

          <KeyFinancialImportDialog
            open={importDialogOpen}
            onClose={closeImportDialog}
            onImport={handleImportClick}
            isUploading={isUploading}
            uploadProgress={importUploadProgress}
            isSmall={isSmall}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to delete{" "}
                <strong>
                  {companyData.filter((c) => c.selected).length}
                </strong>{" "}
                selected{" "}
                {companyData.filter((c) => c.selected).length === 1
                  ? "company"
                  : "companies"}
                ?
              </Typography>
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 2, fontWeight: 500 }}
              >
                This action cannot be undone. The following data will be
                permanently deleted:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>
                  <Typography variant="body2">Company information</Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Key financial data
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">People data</Typography>
                </li>
                <li>
                  <Typography variant="body2">Summary notes</Typography>
                </li>
                <li>
                  <Typography variant="body2">PDF links</Typography>
                </li>
                <li>
                  <Typography variant="body2">Company charges</Typography>
                </li>
                <li>
                  <Typography variant="body2">CSV file data</Typography>
                </li>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => setDeleteDialogOpen(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;