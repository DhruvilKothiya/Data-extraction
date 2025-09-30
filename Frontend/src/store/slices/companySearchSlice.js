import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchTerm: '',
  currentPage: 1,
  sortOrder: 'asc',
  showInactive: 'no',
  pagination: {
    page: 1,
    per_page: 100,
    total: 0,
    total_pages: 0
  },
  // Flag to track if we're returning from a detail page
  isReturningFromDetail: false,
};

const companySearchSlice = createSlice({
  name: 'companySearch',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      // Reset to first page when search changes
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setShowInactive: (state, action) => {
      state.showInactive = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    clearSearchState: (state) => {
      state.searchTerm = '';
      state.currentPage = 1;
      state.sortOrder = 'asc';
      state.showInactive = 'no';
      state.pagination = initialState.pagination;
      state.isReturningFromDetail = false;
    },
    setReturningFromDetail: (state, action) => {
      state.isReturningFromDetail = action.payload;
    },
    // Action to update multiple search parameters at once
    updateSearchState: (state, action) => {
      const { searchTerm, currentPage, sortOrder, showInactive, pagination } = action.payload;
      if (searchTerm !== undefined) state.searchTerm = searchTerm;
      if (currentPage !== undefined) state.currentPage = currentPage;
      if (sortOrder !== undefined) state.sortOrder = sortOrder;
      if (showInactive !== undefined) state.showInactive = showInactive;
      if (pagination !== undefined) state.pagination = pagination;
    },
  },
});

export const {
  setSearchTerm,
  setCurrentPage,
  setSortOrder,
  setShowInactive,
  setPagination,
  clearSearchState,
  setReturningFromDetail,
  updateSearchState,
} = companySearchSlice.actions;

export default companySearchSlice.reducer;
