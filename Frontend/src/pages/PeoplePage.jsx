import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useNavigationHelper } from "../hooks/useNavigationHelper";
// import Sidebar from "../components/Sidebar";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Badge,
  MenuItem,
  Menu,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Alert,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

const PeoplePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const { registeredNumber: companyRegisteredNumber } = useParams();
  const location = useLocation();
  const { navigateToHomepage, navigate } = useNavigationHelper();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [peopleData, setPeopleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get company info from location state or set defaults
  const companyName = location.state?.companyName || "Unknown Company";

  // Responsive sidebar width
  // const sidebarWidth = isMobile ? 0 : isTablet ? 240 : 280;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

  const handleBackToCompanies = () => {
    navigateToHomepage();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

const fetchPeopleData = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/people/${companyRegisteredNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setPeopleData(response.data);
  } catch (error) {
    setError("Failed to fetch people data. Please try again.");
    toast.error("Failed to fetch people data");
    setPeopleData([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchPeopleData();
}, [companyRegisteredNumber, navigate]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* , md: `${sidebarWidth}px` */}
      {/* <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} /> */}

      <Box
        sx={{
          flexGrow: 1,
          ml: { xs: 0 },
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
            <IconButton
              onClick={handleBackToCompanies}
              size={isSmall ? "small" : "medium"}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant={isSmall ? "h6" : "h5"}
              sx={{ fontWeight: "bold" }}
            >
              People Data
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 } }}>
            <IconButton size={isSmall ? "small" : "medium"}>
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              onClick={handleProfileMenuOpen}
              size={isSmall ? "small" : "medium"}
            >
              <Avatar
                sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}
              >
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
            maxWidth: { xs: "100%", lg: "1430px" },
            mx: "auto",
          }}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              mb: 3,
              "& .MuiBreadcrumbs-separator": {
                fontSize: { xs: "0.8rem", sm: "1rem" },
              },
            }}
          >
            <Link
              underline="hover"
              color="inherit"
              href="#"
              onClick={handleBackToCompanies}
              sx={{
                display: "flex",
                alignItems: "center",
                fontSize: { xs: "0.8rem", sm: "1rem" },
              }}
            >
              <HomeIcon
                sx={{ mr: 0.5, fontSize: { xs: "1rem", sm: "1.2rem" } }}
              />
              Companies
            </Link>
            <Typography
              color="text.primary"
              sx={{
                fontSize: { xs: "0.8rem", sm: "1rem" },
                wordBreak: "break-word",
              }}
            >
              {companyName} - People
            </Typography>
          </Breadcrumbs>

          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Company Info Header */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant={isSmall ? "h6" : "h5"}
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    wordBreak: "break-word",
                  }}
                >
                  {companyName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Company RegisterNumber: {companyRegisteredNumber}
                </Typography>
              </Box>

              {/* Loading State */}
              {loading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 8,
                  }}
                >
                  <CircularProgress size={60} />
                </Box>
              )}

              {/* Error State */}
              {error && !loading && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    "& .MuiAlert-message": {
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Empty State */}
              {!loading && !error && peopleData.length === 0 && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                  }}
                >
                  <PersonIcon
                    sx={{
                      fontSize: { xs: 60, sm: 80 },
                      color: "text.secondary",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                    }}
                  >
                    No People Data Found
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                  >
                    There are no people records available for this company.
                  </Typography>
                </Box>
              )}

              {/* People Data Table */}
              {!loading && !error && peopleData.length > 0 && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      People Records
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      Found {peopleData.length} people record(s)
                    </Typography>
                  </Box>

                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      overflowX: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      "& .MuiTable-root": {
                        minWidth: { xs: 600, sm: 800 },
                      },
                    }}
                  >
                    <Table size={isSmall ? "small" : "medium"}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                              borderRight: "1px solid #e0e0e0",
                            }}
                          >
                            #
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                              borderRight: "1px solid #e0e0e0",
                            }}
                          >
                            Name
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                              borderRight: "1px solid #e0e0e0",
                            }}
                          >
                            Role
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                              borderRight: "1px solid #e0e0e0",
                            }}
                          >
                            Appointment Date
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            }}
                          >
                            Date of Birth
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {peopleData.map((person, index) => (
                          <TableRow
                            key={person.id || index}
                            sx={{
                              "&:nth-of-type(odd)": {
                                backgroundColor: "rgba(0, 0, 0, 0.02)",
                              },
                              "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                borderRight: "1px solid #e0e0e0",
                                fontWeight: 500,
                              }}
                            >
                              {index + 1}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                borderRight: "1px solid #e0e0e0",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  wordBreak: "break-word",
                                }}
                              >
                                {person.name || "-"}
                              </Typography>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                borderRight: "1px solid #e0e0e0",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  wordBreak: "break-word",
                                }}
                              >
                                {person.role || "-"}
                              </Typography>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                borderRight: "1px solid #e0e0e0",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                {formatDate(person.appointment_date)}
                              </Typography>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                {formatDate(person.date_of_birth)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      gap: 2,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleBackToCompanies}
                      size={isSmall ? "small" : "medium"}
                    >
                      Back to Companies
                    </Button>
                  </Box>
                </>
              )}
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
          <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PeoplePage;
