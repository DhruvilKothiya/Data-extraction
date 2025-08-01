import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UploadIcon from "@mui/icons-material/CloudUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Avatar,
  Badge,
  MenuItem,
  Menu,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [companyData, setCompanyData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [dropdow, setDropdownValue] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [includeKeyData, setIncludeKeyData] = useState(true);
  const [includePeopleData, setIncludePeopleData] = useState(false);
  const [includeSummaryNotes, setIncludeSummaryNotes] = useState(false);
  const isMenuOpen = Boolean(dropdow);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [detailType, setDetailType] = useState(""); // 'turnover' or 'assets'
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editedRegistrations, setEditedRegistrations] = useState({});
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [rerunLoading, setRerunLoading] = useState({});
  
  const registrationTimersRef = useRef({});

  const navigate = useNavigate();

  // Responsive sidebar width
  const sidebarWidth = isMobile ? 0 : isTablet ? 240 : 280;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

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

  // Navigate to People Page
  const handleNavigateToPeoplePage = (company) => {
    navigate(`/company/${company.id}/people`, { 
      state: { 
        companyName: company.company_name,
        companyId: company.id 
      } 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const handleExport = async () => {
    const selectedIds = companyData.filter((c) => c.selected).map((c) => c.id);
    if (selectedIds.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/export-company-data`,
        {
          ids: selectedIds,
          key_financial: includeKeyData,
          people_data: includePeopleData,
          summary_notes: includeSummaryNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
    setExportDialogOpen(false);
  };

  const openExportDialog = () => setExportDialogOpen(true);
  const closeExportDialog = () => setExportDialogOpen(false);

  const filteredCompanies = companyData.filter((company) => {
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

  const paginatedCompanies = filteredCompanies.slice(0, 100);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setDataLoaded(false);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/company-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCompanyData(
          response.data.map((company) => ({
            ...company,
            selected: false,
          }))
        );
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching company data:", error);
        setDataLoaded(true);
        toast.error("Failed to fetch company data");
      }
    };
    fetchCompanyData();
  }, []);

  const handleCSVUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      setUploading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );

      setUploadProgress(0);
      setUploadedFileName(response.data.filename);
      setUploading(false);
      toast.success("Uploaded Successfully");

      // Refresh data after upload
      const dataResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/company-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCompanyData(
        dataResponse.data.map((company) => ({
          ...company,
          selected: false,
        }))
      );
    } catch (error) {
      setUploading(false);
      toast.error("File upload failed");
      console.error("Upload error:", error);
    }
  };

  const toggleSelectAll = (checked) => {
    setCompanyData((prevData) =>
      prevData.map((company) =>
        filteredCompanies.some((c) => c.id === company.id)
          ? { ...company, selected: checked }
          : company
      )
    );
  };

  const toggleSelectOne = (id) => {
    setCompanyData((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleMenuClick = (event) => {
    setDropdownValue(event.currentTarget);
  };

  const handleMenuClose = () => {
    setDropdownValue(null);
  };

  const handleCustomSelect = (option) => {
    setCompanyData((prev) =>
      prev.map((company) => {
        if (!paginatedCompanies.some((c) => c.id === company.id))
          return company;

        const isMatch =
          option === "all" ||
          (option === "approved" && company.approval_stage === 1) ||
          (option === "unapproved" &&
            (company.approval_stage === 0 || company.approval_stage === 2)) ||
          company.status === option;

        return { ...company, selected: isMatch };
      })
    );
    handleMenuClose();
  };

  const handleRerunAI = async (companyId) => {
    try {
      setRerunLoading((prev) => ({ ...prev, [companyId]: true }));
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/reprocess-company/${companyId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCompanyData((prev) =>
        prev.map((company) =>
          company.id === companyId
            ? { ...company, status: response.data.new_status || "Processing" }
            : company
        )
      );

      toast.success("Re-run started successfully");

      setTimeout(async () => {
        try {
          const dataResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/company-data`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setCompanyData(
            dataResponse.data.map((company) => ({
              ...company,
              selected:
                companyData.find((c) => c.id === company.id)?.selected || false,
            }))
          );
        } catch (refreshError) {
          console.error("Error refreshing data:", refreshError);
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Re-run failed");
    } finally {
      setRerunLoading((prev) => ({ ...prev, [companyId]: false }));
    }
  };

  const handleRegistrationUpdate = async (companyId, newNumber) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/update-registration-number/${companyId}`,
        { registration_number: newNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCompanyData((prev) =>
        prev.map((company) =>
          company.id === companyId
            ? { ...company, registration_number: newNumber }
            : company
        )
      );

      setEditedRegistrations((prev) => {
        const newState = { ...prev };
        delete newState[companyId];
        return newState;
      });

      toast.success("Registration number updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update registration number");
    }
  };

  const handleApprovalChange = async (companyId, newStage) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/update-approval-stage/${companyId}`,
        { approval_stage: newStage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const shouldSetNotStarted = newStage === 0 || newStage === 2;

      setCompanyData((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? {
                ...c,
                approval_stage: newStage,
                status: shouldSetNotStarted
                  ? "Not Started"
                  : response.data.new_status || c.status,
              }
            : c
        )
      );

      toast.success("Approval stage updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update approval stage");
    }
  };

  const handleRegistrationChange = (companyId, value) => {
    const company = companyData.find((c) => c.id === companyId);

    setEditedRegistrations((prev) => ({
      ...prev,
      [companyId]: value,
    }));

    if (
      company &&
      (company.approval_stage === 0 || company.approval_stage === 2)
    ) {
      if (registrationTimersRef.current[companyId]) {
        clearTimeout(registrationTimersRef.current[companyId]);
      }

      registrationTimersRef.current[companyId] = setTimeout(() => {
        handleRegistrationUpdate(companyId, value);
        delete registrationTimersRef.current[companyId];
      }, 500);
    }
  };

  // Show loading state until data is loaded
  if (!dataLoaded) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
        <Box
          sx={{
            flexGrow: 1,
            ml: { xs: 0, md: `${sidebarWidth}px` },
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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />

      <Box
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: `${sidebarWidth}px` },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: { xs: 1.5, sm: 2 },
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "white",
            position: "sticky",
            top: 0,
            zIndex: 1100,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography 
              variant={isSmall ? "h6" : "h5"} 
              sx={{ fontWeight: "bold" }}
            >
              Company
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 } }}>
            <IconButton size={isSmall ? "small" : "medium"}>
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={handleProfileMenuOpen} size={isSmall ? "small" : "medium"}>
              <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Box>

        {/* Main Content */}
        <Container
          maxWidth={false}
          sx={{
            mt: { xs: 2, sm: 4 },
            flex: 1,
            px: { xs: 1, sm: 2, md: 3 },
            maxWidth: { xs: '100%', lg: '1430px' },
            mx: "auto",
          }}
        >
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Upload Section */}
              <Box
                sx={{
                  border: "2px dashed #aaa",
                  borderRadius: 2,
                  p: { xs: 2, sm: 4 },
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  mb: { xs: 2, sm: 4 },
                }}
              >
                <input
                  type="file"
                  id="csv-upload"
                  accept=".csv,text/csv"
                  hidden
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile) {
                      setUploadedFileName(selectedFile.name);
                      handleCSVUpload(selectedFile);
                    }
                  }}
                />
                <label htmlFor="csv-upload" style={{ cursor: "pointer" }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <UploadIcon sx={{ fontSize: { xs: 30, sm: 40 }, mb: 1 }} />
                  </Box>
                  <Button 
                    variant="outlined" 
                    component="span"
                    size={isSmall ? "small" : "medium"}
                  >
                    Choose CSV File to Upload
                  </Button>
                  <Typography variant="body2" mt={1} fontSize={{ xs: '0.75rem', sm: '0.875rem' }}>
                    or drag and drop your CSV here
                  </Typography>
                  {uploadedFileName && (
                    <Typography
                      variant="body2"
                      mt={1}
                      sx={{ color: "green", fontWeight: 500 }}
                      fontSize={{ xs: '0.75rem', sm: '0.875rem' }}
                    >
                      Uploaded File: {uploadedFileName}
                    </Typography>
                  )}
                </label>
                {uploading && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontSize={{ xs: '0.75rem', sm: '0.875rem' }}>
                      {uploadProgress}% uploaded
                    </Typography>
                    <Box
                      sx={{
                        height: 8,
                        backgroundColor: "#ddd",
                        borderRadius: 4,
                        overflow: "hidden",
                        mt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${uploadProgress}%`,
                          backgroundColor: "#1976d2",
                          transition: "width 0.3s",
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Controls Section */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  mb: 2,
                  alignItems: { xs: 'stretch', sm: 'center' },
                  justifyContent: 'space-between'
                }}
              >
                <TextField
                  placeholder="Search company..."
                  value={searchTerm}
                  onChange={handleSearch}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    width: { xs: '100%', sm: 300 },
                    order: { xs: 1, sm: 1 }
                  }}
                />
                
                <TextField
                  select
                  label="Filter by Approval"
                  size="small"
                  value={approvalFilter}
                  onChange={(e) => setApprovalFilter(e.target.value)}
                  sx={{ 
                    width: { xs: '100%', sm: 200 },
                    order: { xs: 2, sm: 2 }
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="unapproved">Unapproved</MenuItem>
                </TextField>

                <Stack 
                  direction="row" 
                  spacing={1}
                  sx={{ 
                    order: { xs: 3, sm: 3 },
                    justifyContent: { xs: 'center', sm: 'flex-end' }
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={openExportDialog}
                    disabled={companyData.every((c) => !c.selected)}
                    size={isSmall ? "small" : "medium"}
                  >
                    Export Data
                  </Button>
                  <IconButton size={isSmall ? "small" : "medium"}>
                    <FilterIcon />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Table Section */}
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
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Checkbox
                            size={isSmall ? "small" : "medium"}
                            checked={
                              filteredCompanies.length > 0 &&
                              filteredCompanies.every((c) => c.selected)
                            }
                            indeterminate={
                              filteredCompanies.some((c) => c.selected) &&
                              !filteredCompanies.every((c) => c.selected)
                            }
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                          />

                          <IconButton
                            size="small"
                            onClick={handleMenuClick}
                            aria-label="More filter options"
                          >
                            <ArrowDropDownIcon />
                          </IconButton>
                        </Box>

                        <Menu
                          anchorEl={dropdow}
                          open={isMenuOpen}
                          onClose={handleMenuClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          <MenuItem onClick={() => handleCustomSelect("all")}>
                            Select All
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleCustomSelect("approved")}
                          >
                            Select Reviewed & Approved
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleCustomSelect("unapproved")}
                          >
                            Select Unapproved / Rejected
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleCustomSelect("Not Started")}
                          >
                            Select Not Started
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleCustomSelect("Processing")}
                          >
                            Select Processing
                          </MenuItem>
                          <MenuItem onClick={() => handleCustomSelect("Done")}>
                            Select Done
                          </MenuItem>
                        </Menu>
                      </TableCell>

                      <TableCell>Company Name</TableCell>
                      <TableCell>Registration Number</TableCell>
                      <TableCell>Re-run AI</TableCell>
                      <TableCell>Turnover</TableCell>
                      <TableCell>Asset Value</TableCell>
                      <TableCell>Key Financial Data</TableCell>
                      {!isSmall && (
                        <>
                          <TableCell>PDFs</TableCell>
                          <TableCell>People Page</TableCell>
                          <TableCell>Summary Notes</TableCell>
                          <TableCell>Scheme Type</TableCell>
                          <TableCell>Last Modified</TableCell>
                        </>
                      )}
                      <TableCell>Approval Stage</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCompanies.map((company) => {
                      const isRejectedOrUnapproved =
                        company.approval_stage === 0 ||
                        company.approval_stage === 2;
                      const currentRegistrationValue =
                        editedRegistrations[company.id] ??
                        company.registration_number ??
                        "";
                      const hasRegistrationChanged =
                        editedRegistrations[company.id] !== undefined &&
                        editedRegistrations[company.id] !==
                          company.registration_number;

                      return (
                        <TableRow key={company.id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              size={isSmall ? "small" : "medium"}
                              checked={company.selected}
                              onChange={() => toggleSelectOne(company.id)}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                wordBreak: 'break-word'
                              }}
                            >
                              {company.company_name}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                minWidth: 120
                              }}
                            >
                              <TextField
                                size="small"
                                value={currentRegistrationValue}
                                onChange={(e) =>
                                  handleRegistrationChange(
                                    company.id,
                                    e.target.value
                                  )
                                }
                                variant="standard"
                                disabled={
                                  !isRejectedOrUnapproved &&
                                  !hasRegistrationChanged
                                }
                                sx={{
                                  '& .MuiInputBase-input': {
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                  }
                                }}
                              />
                              {!isRejectedOrUnapproved &&
                                hasRegistrationChanged && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      handleRegistrationUpdate(
                                        company.id,
                                        editedRegistrations[company.id]
                                      )
                                    }
                                    sx={{ fontSize: '0.75rem' }}
                                  >
                                    Save
                                  </Button>
                                )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleRerunAI(company.id)}
                              disabled={rerunLoading[company.id]}
                              size={isSmall ? "small" : "medium"}
                            >
                              {rerunLoading[company.id] ? (
                                <CircularProgress size={isSmall ? 15 : 20} />
                              ) : (
                                <RefreshIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                              )}
                            </IconButton>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ minWidth: 100 }}>
                              {company.turnover_data
                                ? (() => {
                                    const years = Object.keys(
                                      company.turnover_data
                                    )
                                      .sort()
                                      .reverse();
                                    const latestYear = years[0];
                                    return (
                                      <>
                                        <Typography 
                                          variant="body2"
                                          sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                                        >
                                          {latestYear}:{" "}
                                          {company.turnover_data[latestYear]}
                                        </Typography>
                                        {years.length > 1 && (
                                          <Button
                                            size="small"
                                            onClick={() =>
                                              handleOpenDetail(
                                                company,
                                                "turnover"
                                              )
                                            }
                                            sx={{ fontSize: '0.7rem', p: 0.5 }}
                                          >
                                            More
                                          </Button>
                                        )}
                                      </>
                                    );
                                  })()
                                : "-"}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ minWidth: 100 }}>
                              {company.fair_value_assets
                                ? (() => {
                                    const years = Object.keys(
                                      company.fair_value_assets
                                    )
                                      .sort()
                                      .reverse();
                                    const latestYear = years[0];
                                    return (
                                      <>
                                        <Typography 
                                          variant="body2"
                                          sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                                        >
                                          {latestYear}:{" "}
                                          {company.fair_value_assets[latestYear]}
                                        </Typography>
                                        {years.length > 1 && (
                                          <Button
                                            size="small"
                                            onClick={() =>
                                              handleOpenDetail(company, "assets")
                                            }
                                            sx={{ fontSize: '0.7rem', p: 0.5 }}
                                          >
                                            More
                                          </Button>
                                        )}
                                      </>
                                    );
                                  })()
                                : "-"}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                navigate(
                                  `/company/${company.id}/financial-data`
                                )
                              }
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                            >
                              View
                            </Button>
                          </TableCell>

                          {!isSmall && (
                            <>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                  {company.downloaded_pdfs ? (
                                    <a
                                      href={company.downloaded_pdfs}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ textDecoration: 'none', color: 'primary.main' }}
                                    >
                                      View PDF
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleNavigateToPeoplePage(company)}
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                                >
                                  View
                                </Button>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                  {company.summary_notes_link ? (
                                    <a
                                      href={company.summary_notes_link}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ textDecoration: 'none', color: 'primary.main' }}
                                    >
                                      View Summary
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                  {company.type_of_scheme || "-"}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                  {company.last_modified
                                    ? new Date(
                                        company.last_modified
                                      ).toLocaleDateString()
                                    : "-"}
                                </Typography>
                              </TableCell>
                            </>
                          )}

                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={company.approval_stage}
                              onChange={(e) =>
                                handleApprovalChange(
                                  company.id,
                                  parseInt(e.target.value)
                                )
                              }
                              variant="standard"
                              sx={{
                                minWidth: 100,
                                '& .MuiInputBase-input': {
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }
                              }}
                            >
                              <MenuItem value={0}>Unapproved</MenuItem>
                              <MenuItem value={1}>Approved</MenuItem>
                              <MenuItem value={2}>Rejected</MenuItem>
                            </TextField>
                          </TableCell>

                          <TableCell>
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                px: { xs: 1, sm: 2 },
                                py: 0.4,
                                borderRadius: "12px",
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                fontWeight: 500,
                                letterSpacing: "0.5px",
                                textTransform: "capitalize",
                                color:
                                  company.status === "Done"
                                    ? "#1565c0"
                                    : company.status === "Processing"
                                    ? "#2e7d32"
                                    : "#c62828",
                                backgroundColor:
                                  company.status === "Done"
                                    ? "rgba(21, 101, 192, 0.1)"
                                    : company.status === "Processing"
                                    ? "rgba(46, 125, 50, 0.1)"
                                    : "rgba(198, 40, 40, 0.1)",
                                border: "1px solid",
                                borderColor:
                                  company.status === "Done"
                                    ? "rgba(21, 101, 192, 0.3)"
                                    : company.status === "Processing"
                                    ? "rgba(46, 125, 50, 0.3)"
                                    : "rgba(198, 40, 40, 0.3)",
                                boxShadow: "0 0 0 1px rgba(0,0,0,0.02)",
                                backdropFilter: "blur(2px)",
                                minWidth: { xs: "60px", sm: "80px" },
                                textAlign: "center",
                              }}
                            >
                              {company.status}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Detail Dialog */}
                <Dialog
                  open={openDetailDialog}
                  onClose={handleCloseDetailDialog}
                  maxWidth="xs"
                  fullWidth
                  PaperProps={{
                    sx: {
                      mx: { xs: 2, sm: 4 },
                      width: { xs: 'calc(100% - 32px)', sm: 'auto' }
                    }
                  }}
                >
                  <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {detailType === "turnover"
                      ? "Turnover Details"
                      : "Asset Value Details"}
                  </DialogTitle>
                  <DialogContent dividers>
                    {selectedCompany &&
                      Object.entries(
                        detailType === "turnover"
                          ? selectedCompany.turnover_data
                          : selectedCompany.fair_value_assets
                      )
                        .sort(([a], [b]) => b - a)
                        .map(([year, value]) => (
                          <Box
                            key={year}
                            display="flex"
                            justifyContent="space-between"
                            py={0.5}
                          >
                            <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                              {year}
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                              {value}
                            </Typography>
                          </Box>
                        ))}
                  </DialogContent>
                  <DialogActions>
                    <Button 
                      onClick={handleCloseDetailDialog}
                      size={isSmall ? "small" : "medium"}
                    >
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* Export Dialog */}
                <Dialog 
                  open={exportDialogOpen} 
                  onClose={closeExportDialog}
                  PaperProps={{
                    sx: {
                      mx: { xs: 2, sm: 4 },
                      width: { xs: 'calc(100% - 32px)', sm: 'auto' }
                    }
                  }}
                >
                  <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Export Options
                  </DialogTitle>
                  <DialogContent>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size={isSmall ? "small" : "medium"}
                            checked={includeKeyData}
                            onChange={(e) =>
                              setIncludeKeyData(e.target.checked)
                            }
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                            Include Key Financial Data
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            size={isSmall ? "small" : "medium"}
                            checked={includePeopleData}
                            onChange={(e) =>
                              setIncludePeopleData(e.target.checked)
                            }
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                            Include People Data
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            size={isSmall ? "small" : "medium"}
                            checked={includeSummaryNotes}
                            onChange={(e) =>
                              setIncludeSummaryNotes(e.target.checked)
                            }
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                            Include Summary Notes
                          </Typography>
                        }
                      />
                    </FormGroup>
                  </DialogContent>
                  <DialogActions>
                    <Button 
                      onClick={closeExportDialog}
                      size={isSmall ? "small" : "medium"}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleExport} 
                      variant="contained"
                      size={isSmall ? "small" : "medium"}
                    >
                      Export
                    </Button>
                  </DialogActions>
                </Dialog>
              </TableContainer>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleLogout}>
          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default HomePage;