// components/CompanyTableRow.jsx
import React, { useState } from "react";
import {
  TableRow,
  TableCell,
  Checkbox,
  Typography,
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Refresh as RefreshIcon, Info as InfoIcon } from "@mui/icons-material";
import SummaryDialog from "./SummaryDialog";
import PDFLinksCell from "./PDFLinksCell";

const CompanyTableRow = ({
  company,
  isSmall,
  onSelect,
  editedRegistrations,
  onRegistrationChange,
  rerunLoading,
  onRerunAI,
  onOpenDetail,
  onNavigate,
  onApprovalChange,
}) => {
  const [schemeDialogOpen, setSchemeDialogOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);

  const isInactive = company.company_status === "Inactive";

  const currentRegistrationValue =
    editedRegistrations[company.id] ?? company.registration_number ?? "";

  const formatYearData = (data, type) => {
    if (!data) return "-";

    const validYears = Object.keys(data)
      .filter((year) => {
        const value = data[year];
        return (
          value !== null &&
          value !== 0 &&
          (typeof value !== "object" ||
            (value !== null && Object.keys(value).length > 0))
        );
      })
      .sort()
      .reverse();

    if (validYears.length === 0) return "-";

    const latestYear = validYears[0];
    const latestValue = data[latestYear];
    let displayValue;

    if (latestValue !== null && typeof latestValue === "object") {
      // If the value is an object, create a string representation
      displayValue = Object.entries(latestValue)
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");
    } else {
      displayValue = latestValue;
    }

    return (
      <>
        <Typography
          variant="body2"
          sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
        >
          {latestYear}: {displayValue}
        </Typography>
        {validYears.length > 1 && (
          <Button
            size="small"
            onClick={() => onOpenDetail(company, type)}
            sx={{ fontSize: "0.7rem", p: 0.5 }}
          >
            More
          </Button>
        )}
      </>
    );
  };

  const getStatusStyles = (status) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    px: { xs: 1, sm: 2 },
    py: 0.4,
    borderRadius: "12px",
    fontSize: { xs: "0.65rem", sm: "0.75rem" },
    fontWeight: 500,
    letterSpacing: "0.5px",
    textTransform: "capitalize",
    color:
      status === "Done"
        ? "#1565c0"
        : status === "Processing"
        ? "#2e7d32"
        : "#c62828",
    backgroundColor:
      status === "Done"
        ? "rgba(21, 101, 192, 0.1)"
        : status === "Processing"
        ? "rgba(46, 125, 50, 0.1)"
        : "rgba(198, 40, 40, 0.1)",
    border: "1px solid",
    borderColor:
      status === "Done"
        ? "rgba(21, 101, 192, 0.3)"
        : status === "Processing"
        ? "rgba(46, 125, 50, 0.3)"
        : "rgba(198, 40, 40, 0.3)",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.02)",
    backdropFilter: "blur(2px)",
    minWidth: { xs: "60px", sm: "80px" },
    textAlign: "center",
  });

  // Extract scheme statuses from company data
  const getSchemeStatuses = () => {
    const statuses = [];

    if (company.key_financial_data) {
      const keyData = company.key_financial_data;

      if (keyData.Status_of_Defined_Benefit_Arrangement_1) {
        statuses.push({
          arrangement: keyData.Name_of_Defined_Benefit_Arrangement_1 || "Arrangement 1",
          status: keyData.Status_of_Defined_Benefit_Arrangement_1,
        });
      }

      if (keyData.Status_of_Defined_Benefit_Arrangement_2) {
        statuses.push({
          arrangement: keyData.Name_of_Defined_Benefit_Arrangement_2 || "Arrangement 2",
          status: keyData.Status_of_Defined_Benefit_Arrangement_2,
        });
      }

      if (keyData.Status_of_Defined_Benefit_Arrangement_3) {
        statuses.push({
          arrangement: keyData.Name_of_Defined_Benefit_Arrangement_3 || "Arrangement 3",
          status: keyData.Status_of_Defined_Benefit_Arrangement_3,
        });
      }
    }

    return statuses;
  };

  const schemeStatuses = getSchemeStatuses();
  const hasSchemeData = schemeStatuses.length > 0;

  const handleSchemeTypeClick = () => {
    if (hasSchemeData) {
      setSchemeDialogOpen(true);
    }
  };

  return (
    <>
      <TableRow
        key={company.id}
        sx={{
          opacity: isInactive ? 0.85 : 1,
          pointerEvents: "auto",
        }}
      >
        {/* Sticky Checkbox Column */}
        <TableCell
          padding="checkbox"
          sx={{
            position: "sticky",
            left: 0,
            zIndex: 1,
            backgroundColor: "background.paper",
          }}
        >
          <Checkbox
            size={isSmall ? "small" : "medium"}
            checked={company.selected}
            onChange={() => onSelect(company.id)}
            disabled={false}
          />
        </TableCell>

        {/* Sticky Company Name Column */}
        <TableCell
          sx={{
            position: "sticky",
            left: 80,
            zIndex: 3,
            backgroundColor: "background.paper",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              wordBreak: "break-word",
            }}
          >
            {company.company_name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              color: company.company_status === "Active" ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {company.company_status}
          </Typography>
        </TableCell>

        <TableCell>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 120,
            }}
          >
            <TextField
              size="small"
              value={currentRegistrationValue}
              onChange={(e) => onRegistrationChange(company.id, e.target.value)}
              variant="standard"
              disabled={company.approval_stage === 1}
              InputProps={{
                readOnly: company.approval_stage === 1,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  color: "text.primary",
                  fontWeight: company.approval_stage === 1 ? "bold" : "normal",
                },
                "& .MuiInput-root:before": {
                  borderBottom:
                    company.approval_stage === 1 ? "none" : "inherit",
                },
                "& .Mui-disabled": {
                  "-webkit-text-fill-color": "inherit",
                },
              }}
            />
          </Box>
        </TableCell>

        <TableCell>
          <IconButton
            color="primary"
            onClick={() => onRerunAI(company.id)}
            disabled={rerunLoading[company.id]}
            size={isSmall ? "small" : "medium"}
          >
            {rerunLoading[company.id] ? (
              <CircularProgress size={isSmall ? 15 : 20} />
            ) : (
              <RefreshIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
            )}
          </IconButton>
        </TableCell>

        <TableCell>
          <Box sx={{ minWidth: 100 }}>
            {formatYearData(company.turnover_data, "turnover")}
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ minWidth: 100 }}>
            {formatYearData(company.fair_value_assets, "assets")}
          </Box>
        </TableCell>

        <TableCell>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onNavigate(`/company/${company.id}/financial-data`)}
            sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
          >
            View
          </Button>
        </TableCell>
        {!isSmall && (
          <TableCell>
            <PDFLinksCell
              pdfLinks={company.pdf_links || []}
              disabled={false}
            />
          </TableCell>
        )}

        {!isSmall && (
          <>
            <TableCell>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  onNavigate(`/company/${company.id}/people`, {
                    state: {
                      companyName: company.company_name,
                      companyId: company.id,
                    },
                  })
                }
                sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
              >
                View
              </Button>
            </TableCell>
            <TableCell>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setSummaryDialogOpen(true)}
                sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
              >
                View Summary
              </Button>
            </TableCell>
            <SummaryDialog
              open={summaryDialogOpen}
              onClose={() => setSummaryDialogOpen(false)}
              company={company}
              isSmall={isSmall}
            />
            <TableCell>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {hasSchemeData ? (
                  <IconButton
                    size="small"
                    onClick={handleSchemeTypeClick}
                    sx={{
                      color: "#2e7d32",
                      backgroundColor: "rgba(46, 125, 50, 0.1)",
                      border: "1px solid rgba(46, 125, 50, 0.3)",
                      borderRadius: "8px",
                      padding: "4px",
                      "&:hover": {
                        backgroundColor: "#2e7d32",
                        color: "white",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                    title="View Defined Benefit Arrangements"
                  >
                    <InfoIcon sx={{ fontSize: "1.1rem" }} />
                  </IconButton>
                ) : (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(158, 158, 158, 0.1)",
                      border: "1px solid rgba(158, 158, 158, 0.3)",
                      color: "text.disabled",
                    }}
                    title="No scheme data available"
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem", fontWeight: "bold" }}
                    >
                      -
                    </Typography>
                  </Box>
                )}
              </Box>
            </TableCell>

            <TableCell>
              <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                {company.last_modified
                  ? new Date(company.last_modified).toLocaleDateString()
                  : "-"}
              </Typography>
            </TableCell>
          </>
        )}

        <TableCell>
          {company.status === "Done" ? (
            <TextField
              select
              size="small"
              value={company.approval_stage}
              onChange={(e) =>
                onApprovalChange(company.id, parseInt(e.target.value))
              }
              disabled={isInactive}
              variant="standard"
              sx={{
                minWidth: 100,
                "& .MuiInputBase-input": {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
              }}
            >
              <MenuItem value={0}>Unapproved</MenuItem>
              <MenuItem value={1}>Approved</MenuItem>
              <MenuItem value={2}>Rejected</MenuItem>
            </TextField>
          ) : (
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              {company.status === "Processing"
                ? "Processing..."
                : "Not started"}
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Box sx={getStatusStyles(company.status)}>{company.status}</Box>
        </TableCell>
      </TableRow>

      {/* Scheme Status Dialog */}
      <Dialog
        open={schemeDialogOpen}
        onClose={() => setSchemeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Defined Benefit Arrangements Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {company.company_name}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <List dense>
            {schemeStatuses.map((scheme, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="bold">
                        {scheme.arrangement}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary">
                          <strong>Status:</strong> {scheme.status}
                        </Typography>
                        {scheme.actuary && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Actuary:</strong> {scheme.actuary}
                          </Typography>
                        )}
                        {scheme.firm && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Firm:</strong> {scheme.firm}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < schemeStatuses.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSchemeDialogOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompanyTableRow;
