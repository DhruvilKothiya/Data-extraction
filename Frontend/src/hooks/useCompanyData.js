// hooks/useCompanyData.js

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import {
  setSearchTerm,
  setCurrentPage,
  setSortOrder,
  setShowInactive,
  setPagination,
  clearSearchState,
  setReturningFromDetail,
} from '../store/slices/companySearchSlice';

export const useCompanyData = () => {
  // Redux state and dispatch
  const dispatch = useDispatch();
  const {
    searchTerm,
    currentPage,
    sortOrder,
    showInactive,
    pagination,
    isReturningFromDetail
  } = useSelector((state) => state.companySearch);

  // Local component state
  const [companyData, setCompanyData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [rerunLoading, setRerunLoading] = useState({});
  const [editedRegistrations, setEditedRegistrations] = useState({});
  const registrationTimersRef = useRef({});
  const searchTimerRef = useRef(null);

  const fetchCompanyData = async (page = 1, search = null, order='asc', show_inactive=false, approval_filter='all') => {
    try {
      setDataLoaded(false);
      
      // Use passed search param or current searchTerm state
      const searchQuery = search !== null ? search : searchTerm;
      
      const params = {
        page: page,
        per_page: 100,
        sort_by: order,
        show_inactive: show_inactive,
        approval_filter: approval_filter
      };
      
      // Only add search param if there's a search term
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await axiosInstance.get('/company-data', { params });
   
      setCompanyData(
        response.data.data.map((company) => ({
          ...company,
          selected: false,
        }))
      );
      dispatch(setPagination(response?.data?.pagination));
      dispatch(setCurrentPage(page));
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Failed to fetch company data");
    } finally {
      setDataLoaded(true);
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    dispatch(setSearchTerm(value));
    
    // Clear existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    // Set new timer for debounced search
    searchTimerRef.current = setTimeout(() => {
      dispatch(setCurrentPage(1)); 
      fetchCompanyData(1, value, sortOrder, showInactive === 'yes', 'all');
    }, 500); // 500ms debounce
  };

  const handlePageChange = (newPage, approvalFilter = 'all') => {
    fetchCompanyData(newPage, null, sortOrder, showInactive === 'yes', approvalFilter);
  };

  const handleShowInactiveChange = (event) => {
    const value = event.target.value;
    console.log(value, "value");

    // if value is "yes" → pass false, otherwise true
    const showInactive = value === "yes" ? true : false;
    console.log(showInactive,"Show ina")
    fetchCompanyData(currentPage, null, sortOrder, showInactive, 'all')
    dispatch(setShowInactive(value));
    console.log("fetchdata",fetchCompanyData)

  };

  const handleApprovalFilterChange = (approvalFilter) => {
    const showInactiveValue = showInactive === 'yes';
    fetchCompanyData(1, null, sortOrder, showInactiveValue, approvalFilter);
  };

  const handleClearSearch = () => {
    dispatch(clearSearchState());
    fetchCompanyData(1, '', 'asc', false, 'all');
  };

  const handleRerunAI = async (companyId) => {
    try {
      setRerunLoading((prev) => ({ ...prev, [companyId]: true }));
      
      // Immediately update status to "Not Started" in UI
      setCompanyData((prev) =>
        prev.map((company) =>
          company.id === companyId
            ? { ...company, status: "Not Started" }
            : company
        )
      );
      
      const response = await axiosInstance.post(
        `/reprocess-company/${companyId}`,
        {} // Empty body since registration number is retrieved from DB
      );

      // Update with the final status from backend
      setCompanyData((prev) =>
        prev.map((company) =>
          company.id === companyId
            ? { ...company, status: response.data.new_status || "Processing" }
            : company
        )
      );

      toast.success("Re-run started successfully");
    } catch (err) {
      console.error(err);
      toast.error("Re-run failed");
      // Reset status on error
      setCompanyData((prev) =>
        prev.map((company) =>
          company.id === companyId
            ? { ...company, status: "Not Started" }
            : company
        )
      );
    } finally {
      setRerunLoading((prev) => ({ ...prev, [companyId]: false }));
    }
  };

  const handleRegistrationUpdate = async (companyId, newNumber) => {
    try {
      const response = await axiosInstance.put(
        `/update-registration-number/${companyId}`,
        { registration_number: newNumber }
      );
  
      setCompanyData((prev) =>
        prev.map((company) =>
          company.id === companyId
            ? {
                ...company,
                registration_number: response.data.new_registration_number,
                company_status: newNumber ? "Active" : "Inactive",
                // Keep existing key_financial_data instead of replacing with empty object
                key_financial_data: company.key_financial_data || {},
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
      const response = await axiosInstance.put(
        `/update-approval-stage/${companyId}`,
        { approval_stage: newStage }
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

  const handleDeleteCompanies = async () => {
  const selectedIds = companyData.filter(c => c.selected).map(c => c.id);
  
  if (selectedIds.length === 0) {
    toast.warning("No companies selected for deletion");
    return;
  }

  try {
    const response = await axiosInstance.delete('/delete-companies', {
      data: { ids: selectedIds }
    });
    
    toast.success(response.data.message);
    
    // Refresh the data after deletion
    fetchCompanyData(currentPage, searchTerm, sortOrder, showInactive === 'yes', 'all');
  } catch (error) {
    console.error("Error deleting companies:", error);
    toast.error(error.response?.data?.detail || "Failed to delete companies");
  }
};

  // Cleanup function for timers
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      Object.values(registrationTimersRef.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);

  const handleSortOrderChange = (newSortOrder) => {
    dispatch(setSortOrder(newSortOrder));
    fetchCompanyData(currentPage, searchTerm, newSortOrder, showInactive === 'yes', 'all');
  };

  // Load data with persisted search state on component mount
  useEffect(() => {
    // If returning from detail page, use persisted search state
    if (isReturningFromDetail || searchTerm) {
      fetchCompanyData(currentPage, searchTerm, sortOrder, showInactive === 'yes', 'all');
      // Reset the returning flag after loading
      if (isReturningFromDetail) {
        dispatch(setReturningFromDetail(false));
      }
    } else {
      // Fresh load
      fetchCompanyData(1, null, 'asc', false, 'all');
    }
  }, []); // Empty dependency array - only run on mount

  return {
    companyData,
    dataLoaded,
    rerunLoading,
    editedRegistrations,
    searchTerm,
    fetchCompanyData,
    handleRerunAI,
    handleRegistrationChange,
    handleApprovalChange,
    handleSearchChange,
    handlePageChange,
    toggleSelectAll,
    toggleSelectOne,
    handleCustomSelect,
    pagination,
    currentPage,
    showInactive,
    handleShowInactiveChange,
    handleApprovalFilterChange,
    handleSortOrderChange,
    handleClearSearch,
    handleDeleteCompanies,
    sortOrder
  };
};