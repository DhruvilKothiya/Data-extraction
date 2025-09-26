import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useTheme,
  useMediaQuery,
  Box,
  Container,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";

// Components
// import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";
import FileUploadSection from "../components/FileUploadSection";
import CompanyTableControls from "../components/CompanyTableControls";
import CompanyTable from "../components/CompanyTable";
import ExportDialog from "../components/ExportDialog";
import DetailDialog from "../components/DetailDialog";

// Hooks
import { useCompanyData } from "../hooks/useCompanyData";
import { useFileUpload } from "../hooks/useFileUpload";
import { useExport } from "../hooks/useExport";

// Utils
import { filterCompanies } from "../utils/companyFilters";
// import { RESPONSIVE_BREAKPOINTS } from "../utils/constants";

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [detailType, setDetailType] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

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
    currentPage
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

  // Computed values
  // const sidebarWidth = isMobile
  //   ? RESPONSIVE_BREAKPOINTS.SIDEBAR_WIDTH_MOBILE
  //   : isTablet
  //   ? RESPONSIVE_BREAKPOINTS.SIDEBAR_WIDTH_TABLET
  //   : RESPONSIVE_BREAKPOINTS.SIDEBAR_WIDTH_DESKTOP;

  const filteredCompanies = filterCompanies(
    companyData,
    searchTerm,
    approvalFilter
  );
  const hasSelectedCompanies = companyData.some((c) => c.selected);
  const isMenuOpen = Boolean(dropdownAnchorEl);

  // Event handlers
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSearch = (event) => setSearchTerm(event.target.value);
  const handleApprovalFilterChange = (event) =>
    setApprovalFilter(event.target.value);
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

  const handlePageChange = (newPage) => {
    fetchCompanyData(newPage);
  };

  // Show loading state until data is loaded
  if (!dataLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
        }}
      >
         {/* md: `${sidebarWidth}px` */}
        {/* <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} /> */}
        <Box
          sx={{
            flexGrow: 1,
            ml: { xs: 0},
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", width: "100%", height: '100vh', overflow: 'hidden' }}>
      <Box
        sx={{
          flexGrow: 1,
          ml: { xs: 0 },
          display: "flex",
          width: "100%",
          flexDirection: "column",
          minWidth: 0,
          height: '100vh',
          overflow: 'hidden',
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
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
        }}>
          <Box sx={{ 
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: { xs: 2, sm: 3 },
            pt: 1.5,
            pb: 1,
            flexShrink: 0,
          }}>
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
                onSearchChange={handleSearch}
                approvalFilter={approvalFilter}
                onApprovalFilterChange={handleApprovalFilterChange}
                onExportClick={openExportDialog}
                hasSelectedCompanies={hasSelectedCompanies}
                isSmall={isSmall}
              />
            </Box>
          </Box>

          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            px: { xs: 2, sm: 3 },
            py: 2,
            minHeight: 0,
          }}>
            <Card sx={{ 
              borderRadius: 2, 
              boxShadow: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <CardContent sx={{ 
                p: { xs: 2, sm: 3 },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
              }}>
                {/* Table Section */}
                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                  <CompanyTable
                    filteredCompanies={companyData}
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
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
