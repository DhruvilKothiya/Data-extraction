// components/CompanyTableRow.jsx
import React from 'react';
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
  MenuItem
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

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
  onApprovalChange
}) => {
  const currentRegistrationValue =
    editedRegistrations[company.id] ?? company.registration_number ?? "";

  const formatYearData = (data, type) => {
    if (!data) return "-";
    const years = Object.keys(data).sort().reverse();
    const latestYear = years[0];
    return (
      <>
        <Typography
          variant="body2"
          sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
        >
          {latestYear}: {data[latestYear]}
        </Typography>
        {years.length > 1 && (
          <Button
            size="small"
            onClick={() => onOpenDetail(company, type)}
            sx={{ fontSize: '0.7rem', p: 0.5 }}
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
    fontSize: { xs: '0.65rem', sm: '0.75rem' },
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

  return (
    <TableRow key={company.id}>
      <TableCell padding="checkbox">
        <Checkbox
          size={isSmall ? "small" : "medium"}
          checked={company.selected}
          onChange={() => onSelect(company.id)}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 120 }}>
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
                borderBottom: company.approval_stage === 1 ? "none" : "inherit",
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
            <RefreshIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
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
          sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
        >
          View
        </Button>
      </TableCell>

      {!isSmall && (
        <>
            {/* <TableCell>
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
            </TableCell> */}

          <TableCell>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onNavigate(`/company/${company.id}/people`, {
                state: {
                  companyName: company.company_name,
                  companyId: company.id 
                }
              })}
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
            onChange={(e) => onApprovalChange(company.id, parseInt(e.target.value))}
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
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            {company.status === "Processing" ? "Processing..." : "Not started"}
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <Box sx={getStatusStyles(company.status)}>
          {company.status}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default CompanyTableRow;