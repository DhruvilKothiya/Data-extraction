// components/CustomPagination.jsx
import React from 'react';
import {
  Box,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Stack
} from '@mui/material';

const CustomPagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  showRowsPerPage = true,
  showInfo = true
}) => {
  const totalPages = Math.ceil(count / rowsPerPage);
  const startItem = count === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endItem = Math.min(page * rowsPerPage, count);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      {/* Left side - Rows per page */}
      {showRowsPerPage && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            Rows per page:
          </Typography>
          <FormControl size="small" variant="outlined">
            <Select
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
              sx={{
                fontSize: '0.875rem',
                minWidth: '70px',
                '& .MuiSelect-select': {
                  padding: '4px 8px',
                },
              }}
            >
              {rowsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      )}

      {/* Center - Pagination */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={(event, newPage) => onPageChange(event, newPage)}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
        sx={{
          '& .MuiPagination-ul': {
            justifyContent: 'center',
          },
        }}
      />

      {/* Right side - Info */}
      {showInfo && (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {count === 0 
            ? 'No items' 
            : `${startItem}-${endItem} of ${count}`
          }
        </Typography>
      )}
    </Box>
  );
};

export default CustomPagination;
