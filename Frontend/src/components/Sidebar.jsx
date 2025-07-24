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
  useTheme,
  useMediaQuery,
  Drawer
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

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Responsive sidebar width
  const sidebarWidth = isMobile ? 260 : isTablet ? 240 : 280;

  const sidebarContent = (
    <Box 
      sx={{
        width: sidebarWidth,
        height: '100%',
        backgroundColor: theme.palette.grey[100],
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${theme.palette.divider}`,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', justifyContent: 'center' }}>
        <Box 
          sx={{
            width: { xs: 35, sm: 40 },
            height: { xs: 35, sm: 40 },
            borderRadius: 1.5,
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          M
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: { xs: 1.5, sm: 2 } }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={true}
            sx={{
              borderRadius: 1.5,
              py: { xs: 1, sm: 1.5 },
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
                minWidth: { xs: 35, sm: 40 },
                color: 'primary.main',
              }}
            >
              <DashboardIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              primaryTypographyProps={{
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                color: 'primary.main',
                fontWeight: 'medium',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: sidebarWidth,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Box 
      sx={{
        width: sidebarWidth,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1,
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default Sidebar;