// components/AppHeader.jsx

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const AppHeader = ({
  isMobile,
  isSmall,
  onDrawerToggle,
  profileAnchorEl,
  onProfileMenuOpen,
  onProfileMenuClose,
  onLogout
}) => {
  return (
    <Box
      sx={{ 
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        p: { xs: 1.5, sm: 2 },
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "white",
        position: "sticky",
        top: 0,
        zIndex: 1100,
        width: '100%',
        boxSizing: 'border-box',
        
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0, flex: '1 1 auto' }}>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant={isSmall ? "h6" : "h5"}
          noWrap
          sx={{ fontWeight: "bold", maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          Corporate and Pensions Information
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, flexShrink: 0 }}>
        <IconButton onClick={onProfileMenuOpen} size={isSmall ? "small" : "medium"}>
          <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
            <PersonIcon />
          </Avatar>
        </IconButton>
      </Box>

      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={onProfileMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={onLogout}>
          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AppHeader;