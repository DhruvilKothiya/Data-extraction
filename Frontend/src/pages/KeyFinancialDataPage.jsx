import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import { useNavigationHelper } from "../hooks/useNavigationHelper";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Divider,
  Grid,
  Card,
} from "@mui/material";
import { toast } from "react-toastify";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "N/A";
const formatCurrency = (value) =>
  value !== null
    ? Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })
    : "N/A";

const renderJsonData = (json) => {
  if (!json || typeof json !== "object") return "N/A";
  return (
    <Box component="ul" sx={{ pl: 3 }}>
      {Object.entries(json).map(([year, val]) => (
        <li key={year}>
          <strong>{year}:</strong> {formatCurrency(val)}
        </li>
      ))}
    </Box>
  );
};

const KeyFinancialDataPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { navigateToHomepage } = useNavigationHelper();

  const fetchKeyData = async () => {
    try {
      const response = await axiosInstance.get(`/key-financial-data/${id}`);
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load key financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeyData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Typography variant="h6">No data found.</Typography>;
  }

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📊 Key Financial Data
      </Typography>

      <Grid container spacing={3}>
        {/* Company Info */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              🏢 Company Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Company Name:</strong> {data.company_name || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Registered Number:</strong>{" "}
                  {data.company_registered_number || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Status:</strong> {data.company_status || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Incorporation Date:</strong>{" "}
                  {formatDate(data.incorporation_date)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Latest Accounts Date:</strong>{" "}
                  {formatDate(data.latest_accounts_date)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Current Company Name:</strong>{" "}
                  {data.current_company_name || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>SIC Code 1:</strong> {data.sic1 || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>SIC Code 2:</strong> {data.sic2 || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Location:</strong> {data.location || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Nature of Business:</strong>{" "}
                  {data.nature_of_business || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Parent Company & Auditor Information */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              🏢 Parent Company & Auditor Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Parent Company:</strong> {data.parent_company || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Nationality of Parent:</strong>{" "}
                  {data.nationality_of_parent || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Auditor Name (Latest):</strong>{" "}
                  {data.auditor_name_latest || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Auditor Firm (Latest):</strong>{" "}
                  {data.auditor_firm_latest || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, backgroundColor: "#f9f9ff" }}
          >
            <Typography variant="h6" gutterBottom>
              📈 Financial Metrics
            </Typography>
            <Divider sx={{ mb: 4 }} />

            <Grid
              container
              spacing={0}
              sx={{ display: "flex", alignItems: "stretch" }}
            >
              <Grid item xs={12} sm={6} md={3} sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Turnover:</strong>
                </Typography>
                {renderJsonData(data.turnover_data)}
              </Grid>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", sm: "block" }, mx: 1 }}
              />

              <Grid item xs={12} sm={6} md={3} sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Profit:</strong>
                </Typography>
                {renderJsonData(data.profit_data)}
              </Grid>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", sm: "block" }, mx: 1 }}
              />

              <Grid item xs={12} sm={6} md={3} sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Fair Value Assets:</strong>
                </Typography>
                {renderJsonData(data.fair_value_assets)}
              </Grid>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", sm: "block" }, mx: 1 }}
              />

              <Grid item xs={12} sm={6} md={3} sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Surplus:</strong>
                </Typography>
                {renderJsonData(data.surplus_data)}
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Employer Contributions & Expenses */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              💰 Employer Contributions & Expenses
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Employer Contribution (Latest):</strong>{" "}
                  {formatCurrency(data.employer_contrib_latest_year)}
                </Typography>
                <Typography>
                  <strong>Employer Contribution (Previous):</strong>{" "}
                  {formatCurrency(data.employer_contrib_previous_year)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Benefits Paid:</strong>{" "}
                  {formatCurrency(data.benefits_paid)}
                </Typography>
                <Typography>
                  <strong>Defined Contributions Paid:</strong>{" "}
                  {formatCurrency(data.defined_contrib_paid)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Expenses Paid (Latest):</strong>{" "}
                  {formatCurrency(data.expenses_paid_latest_year)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Expenses Paid (Previous):</strong>{" "}
                  {formatCurrency(data.expenses_paid_previous_year)}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Assets */}
        <Grid item xs={12}>
          <Card
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, backgroundColor: "#f5fdf6" }}
          >
            <Typography variant="h6" gutterBottom>
              🏦 Assets
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>Equities:</strong>{" "}
                  {formatCurrency(data.assets_equities)}
                </Typography>
                <Typography>
                  <strong>Bonds:</strong> {formatCurrency(data.assets_bonds)}
                </Typography>
                <Typography>
                  <strong>Real Estate:</strong>{" "}
                  {formatCurrency(data.assets_real_estate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>LDI:</strong> {formatCurrency(data.assets_ldi)}
                </Typography>
                <Typography>
                  <strong>Cash:</strong> {formatCurrency(data.assets_cash)}
                </Typography>
                <Typography>
                  <strong>Other Assets:</strong>{" "}
                  {formatCurrency(data.assets_other)}
                </Typography>
                <Typography>
                  <strong>Diversified Growth:</strong>{" "}
                  {formatCurrency(data.assets_diversified_growth)}
                </Typography>
                <Typography>
                  <strong>Alternatives:</strong>{" "}
                  {formatCurrency(data.assets_alternatives)}
                </Typography>
                <Typography>
                  <strong>Insurance Contracts:</strong>{" "}
                  {formatCurrency(data.assets_insurance_contracts)}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Defined Benefit Arrangements */}
        <Grid item xs={12}>
          <Card
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, backgroundColor: "#fff8f0" }}
          >
            <Typography variant="h6" gutterBottom>
              📋 Defined Benefit Arrangements
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>
                  <strong>Number of UK Defined Benefit Arrangements:</strong>{" "}
                  {data.number_of_uk_defined_benefit_arrangements || "N/A"}
                </Typography>
              </Grid>
              
              {/* Arrangement 1 */}
              {data.Name_of_Defined_Benefit_Arrangement_1 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    Arrangement 1:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Name:</strong> {data.Name_of_Defined_Benefit_Arrangement_1}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Status:</strong> {data.Status_of_Defined_Benefit_Arrangement_1 || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Scheme Actuary:</strong> {data.scheme_actuary_1 || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Actuary Firm:</strong> {data.scheme_actuary_firm_1 || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              
              {/* Arrangement 2 */}
              {data.Name_of_Defined_Benefit_Arrangement_2 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    Arrangement 2:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Name:</strong> {data.Name_of_Defined_Benefit_Arrangement_2}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Status:</strong> {data.Status_of_Defined_Benefit_Arrangement_2 || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Scheme Actuary:</strong> {data.scheme_actuary_2 || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Actuary Firm:</strong> {data.scheme_actuary_firm_2 || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              
              {/* Arrangement 3 */}
              {data.Name_of_Defined_Benefit_Arrangement_3 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    Arrangement 3:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Name:</strong> {data.Name_of_Defined_Benefit_Arrangement_3}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Status:</strong> {data.Status_of_Defined_Benefit_Arrangement_3 || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Scheme Actuary:</strong> {data.scheme_actuary_3 || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Actuary Firm:</strong> {data.scheme_actuary_firm_3 || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>

        {/* Go Back Button */}
        <Grid item xs={12}>
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={navigateToHomepage}
            >
              🔙 Go Back
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KeyFinancialDataPage;
