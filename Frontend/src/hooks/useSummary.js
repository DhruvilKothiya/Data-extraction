// hooks/useSummary.js
import { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';

export const useSummary = () => {
  const [summaryData, setSummaryData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchSummary = async (companyId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/summary-notes/${companyId}`);
      
      setSummaryData(prev => ({
        ...prev,
        [companyId]: response.data
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Failed to fetch summary');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSummary = async (companyId, summary) => {
    try {
      setLoading(true);
      
      await axiosInstance.post(
        `/summary-notes/${companyId}`,
        { summary }
      );
      
      // Update local state
      setSummaryData(prev => ({
        ...prev,
        [companyId]: { ...prev[companyId], summary }
      }));
      
      toast.success('Summary updated successfully');
    } catch (error) {
      console.error('Error updating summary:', error);
      toast.error('Failed to update summary');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    summaryData,
    loading,
    fetchSummary,
    updateSummary
  };
};