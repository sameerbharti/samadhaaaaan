import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  Person,
  ExitToApp,
  LocalPolice,
  AdminPanelSettings,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import NotificationBadge from './NotificationBadge';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Navigation items based on user role
  const navItems = [
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ text: 'Admin Dashboard', icon: <AdminPanelSettings />, path: '/admin' });
  } else {
    // Add general user items for non-admin users
    const userNavItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/' },
      { text: 'My Complaints', icon: <Assignment />, path: '/complaints' },
      { text: 'General Complaints', icon: <Assignment />, path: '/general-complaints' },
      { text: 'New Complaint', icon: <Assignment />, path: '/complaint/new' }
    ];
    navItems.unshift(...userNavItems);
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        className="app-bar"
        sx={theme => ({
          zIndex: theme.zIndex.drawer + 1,
        })}
      >
        <Toolbar sx={{ px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            className="app-bar-title"
            fontWeight="700"
          >
            Samadhan
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <NotificationBadge />
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton color="inherit" sx={{ mr: 1 }} onClick={toggleTheme}>
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <Tooltip title={`Logged in as ${user?.name || 'User'}`}>
            <IconButton color="inherit" sx={{ ml: 0.5, mr: 0.5 }}>
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                variant="circular"
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Box sx={{ ml: 1 }}>
            <Typography variant="body2" fontWeight="600" color="common.white">
              {user?.name}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar/Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        className="app-drawer-paper"
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            borderRight: 'none',
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          },
        }}
      >
        <Toolbar sx={{ pl: 3, pr: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'grey.200',
            width: '100%'
          }}>
            <Avatar
              sx={{ width: 48, height: 48, bgcolor: 'primary.main', mr: 2 }}
              variant="circular"
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="600">
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
        <Box sx={{ overflow: 'auto', px: 2, pt: 1 }}>
          <List>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={toggleDrawer(false)}
                sx={{
                  mb: 1,
                  borderRadius: '12px',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? '600' : '500'
                  }}
                />
              </ListItem>
            ))}
            <ListItem button onClick={handleLogout} sx={{ mt: 2, borderRadius: '12px' }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: '500',
                  color: 'error.main'
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Toolbar /> {/* This accounts for the fixed AppBar */}
      <Box
        component="main"
        className="app-main-content"
        sx={{
          flexGrow: 1,
          backgroundColor: (theme) => theme.palette.background.default,
          minHeight: 'calc(100vh - 56px)',
          pb: 10,
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        className="app-footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          py: 2,
          backgroundColor: '#ffffff',
          borderTop: '1px solid',
          borderColor: 'grey.200',
          zIndex: 1000,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Samadhan - Complaint Management System
            </Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Version 1.0.0
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;