import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UploadIcon from "@mui/icons-material/CloudUpload";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  // ArrowBackIos as ArrowBackIosIcon,
  // ArrowForwardIos as ArrowForwardIosIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const HomePage = () => {
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

  const navigate = useNavigate();

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
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/company-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const staticStatusOptions = ["Not Started", "Processing", "Done"];
        setCompanyData(
          response.data.map((company, index) => ({
            ...company,
            selected: false,
            status: staticStatusOptions[index % staticStatusOptions.length],
          }))
        );
      } catch (error) {
        console.error("Error fetching company data:", error);
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
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/reprocess-company/${companyId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Re-run started");
    } catch (err) {
      console.error(err);
      toast.error("Re-run failed");
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
      toast.success("Registration number updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update registration number");
    }
  };

  const handleApprovalChange = async (companyId, newStage) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/update-approval-stage/${companyId}`,
        { approval_stage: newStage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCompanyData((prev) =>
        prev.map((c) =>
          c.id === companyId ? { ...c, approval_stage: newStage } : c
        )
      );

      toast.success("Approval stage updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update approval stage");
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          ml: "280px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "white",
            position: "sticky",
            top: 0,
            zIndex: 1100,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Company
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <IconButton>
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Box>

        <Container
          maxWidth={false}
          sx={{
            mt: 4,
            flex: 1,
            width: "1430px", // Or any value you prefer
            mx: "auto", // Center the container horizontally
          }}
        >
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box
                sx={{
                  border: "2px dashed #aaa",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  mb: 4,
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
                    <UploadIcon sx={{ fontSize: 40, mb: 1 }} />
                  </Box>
                  <Button variant="outlined" component="span">
                    Choose CSV File to Upload
                  </Button>
                  <Typography variant="body2" mt={1}>
                    or drag and drop your CSV here
                  </Typography>
                  {uploadedFileName && (
                    <Typography
                      variant="body2"
                      mt={1}
                      sx={{ color: "green", fontWeight: 500 }}
                    >
                      Uploaded File: {uploadedFileName}
                    </Typography>
                  )}
                </label>
                {uploading && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
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

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                  alignItems: "center",
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
                  sx={{ width: 300 }}
                />
                <TextField
                  select
                  label="Filter by Approval"
                  size="small"
                  value={approvalFilter}
                  onChange={(e) => setApprovalFilter(e.target.value)}
                  sx={{ width: 200 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="unapproved">Unapproved</MenuItem>
                </TextField>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={openExportDialog}
                    disabled={companyData.every((c) => !c.selected)}
                  >
                    Export Data
                  </Button>
                  <Dialog open={exportDialogOpen} onClose={closeExportDialog}>
                    <DialogTitle>Export Options</DialogTitle>
                    <DialogContent>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={includeKeyData}
                              onChange={(e) =>
                                setIncludeKeyData(e.target.checked)
                              }
                            />
                          }
                          label="Include Key Financial Data"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={includePeopleData}
                              onChange={(e) =>
                                setIncludePeopleData(e.target.checked)
                              }
                            />
                          }
                          label="Include People Data"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={includeSummaryNotes}
                              onChange={(e) =>
                                setIncludeSummaryNotes(e.target.checked)
                              }
                            />
                          }
                          label="Include Summary Notes"
                        />
                      </FormGroup>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={closeExportDialog}>Cancel</Button>
                      <Button onClick={handleExport} variant="contained">
                        Export
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <IconButton>
                    <FilterIcon />
                  </IconButton>
                </Box>
              </Box>

              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Checkbox
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
                      <TableCell>PDFs</TableCell>

                      <TableCell>People Page</TableCell>
                      <TableCell>Summary Notes</TableCell>
                      <TableCell>Scheme Type</TableCell>
                      <TableCell>Last Modified</TableCell>
                      <TableCell>Approval Stage</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={company.selected}
                            onChange={() => toggleSelectOne(company.id)}
                          />
                        </TableCell>

                        <TableCell>{company.company_name}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TextField
                              size="small"
                              value={
                                editedRegistrations[company.id] ??
                                company.registration_number ??
                                ""
                              }
                              onChange={(e) =>
                                setEditedRegistrations((prev) => ({
                                  ...prev,
                                  [company.id]: e.target.value,
                                }))
                              }
                              variant="standard"
                            />
                            {editedRegistrations[company.id] !== undefined &&
                              editedRegistrations[company.id] !==
                                company.registration_number && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    handleRegistrationUpdate(
                                      company.id,
                                      editedRegistrations[company.id]
                                    )
                                  }
                                >
                                  Save
                                </Button>
                              )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleRerunAI(company.id)}
                          >
                            Re-run AI
                          </Button>
                        </TableCell>
                        <TableCell>
                          {company.turnover_data ? (
                            <>
                              {(() => {
                                const years = Object.keys(company.turnover_data)
                                  .sort()
                                  .reverse();
                                const latestYear = years[0];
                                return (
                                  <>
                                    <span>
                                      {latestYear}:{" "}
                                      {company.turnover_data[latestYear]}
                                    </span>{" "}
                                    {years.length > 1 && (
                                      <Button
                                        size="small"
                                        onClick={() =>
                                          handleOpenDetail(company, "turnover")
                                        }
                                      >
                                        More
                                      </Button>
                                    )}
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          {company.fair_value_assets ? (
                            <>
                              {(() => {
                                const years = Object.keys(
                                  company.fair_value_assets
                                )
                                  .sort()
                                  .reverse();
                                const latestYear = years[0];
                                return (
                                  <>
                                    <span>
                                      {latestYear}:{" "}
                                      {company.fair_value_assets[latestYear]}
                                    </span>{" "}
                                    {years.length > 1 && (
                                      <Button
                                        size="small"
                                        onClick={() =>
                                          handleOpenDetail(company, "assets")
                                        }
                                      >
                                        More
                                      </Button>
                                    )}
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              navigate(`/company/${company.id}/financial-data`)
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                        <TableCell>
                          <a
                            href={company.downloaded_pdfs}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View PDF
                          </a>
                        </TableCell>

                        <TableCell>
                          {company.people_page_link ? (
                            <a
                              href={company.people_page_link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View People
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          {company.summary_notes_link ? (
                            <a
                              href={company.summary_notes_link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Summary
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>{company.type_of_scheme || "-"}</TableCell>

                        <TableCell>
                          {company.last_modified
                            ? new Date(
                                company.last_modified
                              ).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {company.status === "Done" ? (
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
                            >
                              <MenuItem value={0}>Unapproved</MenuItem>
                              <MenuItem value={1}>Approved</MenuItem>
                              <MenuItem value={2}>Rejected</MenuItem>
                            </TextField>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Approval allowed after completion
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              px: 2,
                              py: 0.4,
                              borderRadius: "12px",
                              fontSize: "0.75rem",
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
                              minWidth: "80px",
                              textAlign: "center",
                            }}
                          >
                            {company.status}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Dialog
                  open={openDetailDialog}
                  onClose={handleCloseDetailDialog}
                  maxWidth="xs"
                  fullWidth
                >
                  <DialogTitle>
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
                            <Typography>{year}</Typography>
                            <Typography>{value}</Typography>
                          </Box>
                        ))}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDetailDialog}>Close</Button>
                  </DialogActions>
                </Dialog>
              </TableContainer>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
};

export default HomePage;
