import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AdminUserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [actionUserId, setActionUserId] = useState(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data.users);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle ban user
  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      await axios.put(`/api/admin/users/${selectedUser._id}/ban`);
      setUsers(prevUsers =>
        prevUsers.map(u => 
          u._id === selectedUser._id 
            ? { ...u, isActive: !u.isActive }
            : u
        )
      );
      setBanDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to ban/unban user');
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await axios.delete(`/api/admin/users/${selectedUser._id}`);
      setUsers(prevUsers => prevUsers.filter(u => u._id !== selectedUser._id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Get role chip color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'secondary';
      case 'user':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get status chip color
  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  // Open user actions menu
  const handleOpenMenu = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setActionUserId(userId);
  };

  // Close user actions menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActionUserId(null);
  };

  // Get user from ID for actions
  const getUserById = (userId) => {
    return users.find(u => u._id === userId);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h6">Loading users...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            User Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage registered users - View, ban, or delete accounts.
          </Typography>
        </Grid>

        {/* Search */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Search users..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>
        </Grid>

        {/* Users Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="All Users"
              subheader={`${filteredUsers.length} user(s) found`}
            />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Registration Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell component="th" scope="row">
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={getRoleColor(user.role)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Banned'}
                          size="small"
                          color={getStatusColor(user.isActive)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="User actions">
                          <IconButton onClick={(e) => handleOpenMenu(e, user._id)}>
                            <MoreIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const user = getUserById(actionUserId);
          setSelectedUser(user);
          setBanDialogOpen(true);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {getUserById(actionUserId)?.isActive ? 'Ban User' : 'Unban User'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const user = getUserById(actionUserId);
          setSelectedUser(user);
          setDeleteDialogOpen(true);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Ban/Unban Dialog */}
      <Dialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)}>
        <DialogTitle>
          {selectedUser?.isActive ? 'Ban User' : 'Unban User'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {selectedUser?.isActive ? 'ban' : 'unban'} {selectedUser?.name} (Email: {selectedUser?.email})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={selectedUser?.isActive ? 'warning' : 'success'}
            onClick={handleBanUser}
          >
            {selectedUser?.isActive ? 'Ban' : 'Unban'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.name} (Email: {selectedUser?.email})?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            Warning: This action cannot be undone. All user data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteUser}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUserManagement;