import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setReturningFromDetail } from '../store/slices/companySearchSlice';

export const useNavigationHelper = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigateToHomepage = () => {
    // Set flag to indicate we're returning from a detail page
    dispatch(setReturningFromDetail(true));
    navigate('/');
  };

  return {
    navigateToHomepage,
    navigate, // Also return the original navigate for other uses
  };
};
