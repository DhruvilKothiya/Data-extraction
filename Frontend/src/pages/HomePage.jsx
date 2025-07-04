import React, { useState, useRef, useEffect } from "react";
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
  Chip,
  Badge,
  Select,
  MenuItem,
  Menu,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  MoreVert as MoreVertIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

const users = [
  {
    id: 1,
    name: "John Doe",
    company: "Tech Corp",
    role: "Admin",
    verified: true,
    status: "In Process",
  },
  {
    id: 2,
    name: "Jane Smith",
    company: "Design Co",
    role: "User",
    verified: false,
    status: "Not started",
  },
  {
    id: 3,
    name: "Robert Johnson",
    company: "Finance Inc",
    role: "Manager",
    verified: true,
    status: "Done",
  },
  {
    id: 4,
    name: "Emily Davis",
    company: "Marketing Pro",
    role: "Editor",
    verified: true,
    status: "Done",
  },
  {
    id: 5,
    name: "Michael Wilson",
    company: "Tech Solutions",
    role: "Developer",
    verified: false,
    status: "Not started",
  },
];

const HomePage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [companyData, setCompanyData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAnchorEl(null);
        setSelectedUser(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEdit = (user) => {
    console.log("Edit user:", user);
    // Add your edit logic here
    handleMenuClose();
  };

  const handleDelete = (user) => {
    console.log("Delete user:", user);
    // Add your delete logic here
    handleMenuClose();
  };

  // Profile dropdown handlers
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    console.log("Logged out");
    localStorage.clear();
    handleProfileMenuClose();
    navigate("/signin");
  };

  const filteredUsers = users.filter((user) =>
    [user.name, user.company, user.role].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Menu component for actions dropdown
  const ActionMenu = ({ anchorEl, onClose, onEdit, onDelete }) => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        style: {
          width: 120,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          borderRadius: 8,
        },
      }}
    >
      <MenuItem
        onClick={onEdit}
        sx={{
          fontSize: "0.875rem",
          color: "text.primary",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        Edit
      </MenuItem>
      <MenuItem
        onClick={onDelete}
        sx={{
          fontSize: "0.875rem",
          color: "error.main",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        Delete
      </MenuItem>
    </Menu>
  );

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
        setCompanyData(response.data);
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
      setUploadedFileName("");
      setUploading(false);
      setUploadedFileName(response.data.filename);
      toast.success("Uploded Successfully");
    } catch (error) {
      setUploading(false);
      toast.error("File upload failed");
      console.error("Upload error:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: "280px",
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
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "white",
            position: "sticky",
            top: 0,
            zIndex: 1100,
          }}
        >
          <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
            Company
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, flex: 1 }}>
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
                  position: "relative",
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
                      setUploadedFileName(selectedFile.name); // Show name before upload
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

                {/* Progress Bar */}
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
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <TextField
                  placeholder="Search user..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300 }}
                />
                <IconButton>
                  <FilterIcon />
                </IconButton>
              </Box>

              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Key Financial Data</TableCell>
                      <TableCell>PDFs</TableCell>
                      <TableCell>Pension Summary</TableCell>
                      <TableCell>Director Info</TableCell>
                      <TableCell>Approval Stage</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {companyData
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((company) => (
                        <TableRow key={company.id}>
                          <TableCell>{company.company_name}</TableCell>
                          <TableCell>{company.rating}</TableCell>
                          <TableCell>
                            <a
                              href={company.key_financial_data}
                              target="_black"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          </TableCell>
                          <TableCell>
                            <a
                              href={company.downloaded_pdfs}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View PDF
                            </a>
                          </TableCell>
                          <TableCell>{company.pension_summary}</TableCell>
                          <TableCell>
                            {" "}
                            <a
                              href={company.director_info}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          </TableCell>
                          <TableCell>{company.approval_stage}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Rows per page:
                  </Typography>
                  <Select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    size="small"
                    sx={{ ml: 1, "& .MuiSelect-select": { py: 0.5 } }}
                    variant="standard"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                  </Select>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    {`${page * rowsPerPage + 1}-${Math.min(
                      (page + 1) * rowsPerPage,
                      filteredUsers.length
                    )} of ${filteredUsers.length}`}
                  </Typography>
                  <IconButton
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    size="small"
                  >
                    <ArrowBackIosIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      setPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(filteredUsers.length / rowsPerPage) - 1
                        )
                      )
                    }
                    disabled={
                      page >= Math.ceil(filteredUsers.length / rowsPerPage) - 1
                    }
                    size="small"
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>

        {/* Action Menu */}
        <div ref={menuRef}>
          <ActionMenu
            anchorEl={anchorEl}
            onClose={handleMenuClose}
            onEdit={() => handleEdit(selectedUser)}
            onDelete={() => handleDelete(selectedUser)}
          />
        </div>
      </Box>

      {/* Profile Dropdown */}
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
