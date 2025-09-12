// hooks/useCompanyData.js

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useCompanyData = () => {
  const [companyData, setCompanyData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [rerunLoading, setRerunLoading] = useState({});
  const [editedRegistrations, setEditedRegistrations] = useState({});
  const registrationTimersRef = useRef({});

  const fetchCompanyData = async () => {
    try {
      setDataLoaded(false);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/company-data`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCompanyData(
        response.data.map((company) => ({
          ...company,
          selected: false,
        }))
      );
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Failed to fetch company data");
    } finally {
      setDataLoaded(true);
    }
  };

  const handleRerunAI = async (companyId) => {
    try {
      setRerunLoading((prev) => ({ ...prev, [companyId]: true }));
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/reprocess-company/${companyId}`,
        {}, // Empty body since registration number is retrieved from DB
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
      setTimeout(fetchCompanyData, 2000);
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
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/update-registration-number/${companyId}`,
        { registration_number: newNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCompanyData((prev) =>
        prev.map((company) =>
          company.id === companyId
            ? {
                ...company,
                registration_number: response.data.new_registration_number,
                company_status: newNumber ? "Active" : "Inactive",
                key_financial_data: {}, 
              }
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
        { headers: { Authorization: `Bearer ${token}` } }
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

    if (company && (company.approval_stage === 0 || company.approval_stage === 2)) {
      if (registrationTimersRef.current[companyId]) {
        clearTimeout(registrationTimersRef.current[companyId]);
      }

      registrationTimersRef.current[companyId] = setTimeout(() => {
        handleRegistrationUpdate(companyId, value);
        delete registrationTimersRef.current[companyId];
      }, 500);
    }
  };

  const toggleSelectAll = (filteredCompanies, checked) => {
    setCompanyData((prevData) =>
      prevData.map((company) => {
        // Only change selection for active companies
        if (
          filteredCompanies.some((c) => c.id === company.id) &&
          company.company_status === "Active"
        ) {
          return { ...company, selected: checked };
        }
        return company;
      })
    );
  };


  const toggleSelectOne = (id) => {
    setCompanyData((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleCustomSelect = (option, paginatedCompanies) => {
    setCompanyData((prev) =>
      prev.map((company) => {
        // Only consider active companies
        if (
          company.company_status !== "Active" ||
          !paginatedCompanies.some((c) => c.id === company.id)
        ) {
          return company;
        }

        const isMatch =
          option === "all" ||
          (option === "approved" && company.approval_stage === 1) ||
          (option === "unapproved" &&
            (company.approval_stage === 0 || company.approval_stage === 2)) ||
          company.status === option;

        return { ...company, selected: isMatch };
      })
    );
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  return {
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
  };
};