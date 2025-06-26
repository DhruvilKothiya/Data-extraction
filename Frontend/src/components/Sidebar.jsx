import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Chip,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Article as ArticleIcon,
  Lock as LockIcon,
  ErrorOutline as ErrorIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';

const Sidebar = () => {
  const theme = useTheme();

  return (
    <Box 
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: theme.palette.grey[100],
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${theme.palette.divider}`,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Box 
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
            }}
          >
            M
          </Box>
        </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 2 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={true}
            sx={{
              borderRadius: 1.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.lighter',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 'medium',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon 
              sx={{
                minWidth: 40,
                color: 'primary.main',
              }}
            >
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              primaryTypographyProps={{
                fontSize: '0.875rem',
                color: 'primary.main',
                fontWeight: 'medium',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
