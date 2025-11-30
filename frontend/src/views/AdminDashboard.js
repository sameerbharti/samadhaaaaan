import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import {
  Assignment as ComplaintIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckIcon,
  ReportProblem as ReportIcon,
  Group as GroupIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const open = Boolean(anchorEl);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1,
            backgroundColor: 'white',
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="caption" fontWeight="600" color="text.primary">
            {payload[0].name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            : {payload[0].value} complaints
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all required data in parallel
        const [usersRes, complaintsRes, statsRes] = await Promise.all([
          axios.get('/api/admin/users'),
          axios.get('/api/admin/reports/complaints'),
          axios.get('/api/admin/dashboard/stats')
        ]);

        setUsers(usersRes.data.users);
        setComplaints(complaintsRes.data.complaints);
        setStats(statsRes.data.stats);

        // Process complaints by category
        const categoryMap = {};
        complaintsRes.data.complaints.forEach(complaint => {
          const category = complaint.category;
          if (categoryMap[category]) {
            categoryMap[category]++;
          } else {
            categoryMap[category] = 1;
          }
        });

        const categoryFormatted = Object.entries(categoryMap).map(([name, value]) => ({
          name: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          value
        }));

        setCategoryData(categoryFormatted);

        // Process complaints by priority
        const priorityMap = {};
        complaintsRes.data.complaints.forEach(complaint => {
          const priority = complaint.priority;
          if (priorityMap[priority]) {
            priorityMap[priority]++;
          } else {
            priorityMap[priority] = 1;
          }
        });

        const priorityFormatted = Object.entries(priorityMap).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }));

        setPriorityData(priorityFormatted);

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter complaints based on search term
  const filteredComplaints = complaints.filter(complaint =>
    complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in-progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'active':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get priority chip color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h6">Loading dashboard...</Typography>
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
        {/* Welcome message */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome, {user?.name}! Manage users and complaints.
          </Typography>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Users</Typography>
                  <Typography variant="h4">{stats.totalUsers || 0}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <GroupIcon />
                </Avatar>
              </Box>
              <Typography variant="caption" color="text.secondary">Manage registered users</Typography>
            </CardContent>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Complaints</Typography>
                  <Typography variant="h4">{stats.totalComplaints || 0}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <ComplaintIcon />
                </Avatar>
              </Box>
              <Typography variant="caption" color="text.secondary">All submitted complaints</Typography>
            </CardContent>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary">Resolved</Typography>
                  <Typography variant="h4">{stats.resolvedComplaints || 0}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckIcon />
                </Avatar>
              </Box>
              <Typography variant="caption" color="text.secondary">{stats.resolutionRate || 0}% resolution rate</Typography>
            </CardContent>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary">Pending</Typography>
                  <Typography variant="h4">{stats.pendingComplaints || 0}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <ReportIcon />
                </Avatar>
              </Box>
              <Typography variant="caption" color="text.secondary">Complaints awaiting action</Typography>
            </CardContent>
          </Paper>
        </Grid>

        {/* Complaints by Category Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <CardHeader
              title="Complaints by Category"
            />
            <CardContent sx={{ flex: 1 }}>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'][index % 6]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" color="text.secondary">No category data available</Typography>
                </Box>
              )}
            </CardContent>
          </Paper>
        </Grid>

        {/* Complaints by Priority Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <CardHeader
              title="Complaints by Priority"
            />
            <CardContent sx={{ flex: 1 }}>
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][index % 6]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" color="text.secondary">No priority data available</Typography>
                </Box>
              )}
            </CardContent>
          </Paper>
        </Grid>

        {/* Admin Action Cards */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Admin Actions</Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Button
                variant="contained"
                component={Link}
                to="/complaints"
                sx={{ minWidth: 200 }}
              >
                View All Complaints
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/admin/users"
                sx={{ minWidth: 200 }}
              >
                Manage Users
              </Button>
            </Box>
          </Paper>
        </Grid>


        {/* Search and Filter */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Search complaints..."
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

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Recent Users"
            />
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice(0, 5).map((user) => (
                    <TableRow key={user._id}>
                      <TableCell component="th" scope="row">
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === 'admin' ? 'secondary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={user.isActive ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Complaints */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Recent Complaints"
            />
            <Divider />
            <List>
              {filteredComplaints.slice(0, 5).map((complaint) => (
                <React.Fragment key={complaint._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={complaint.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {complaint.userId?.name || 'Unknown User'}
                          </Typography>
                          <br />
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Chip
                              label={complaint.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                              size="small"
                              color={getPriorityColor(complaint.priority)}
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={complaint.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              size="small"
                              color={getStatusColor(complaint.status)}
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                          </Box>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        component={Link}
                        to={`/complaint/${complaint._id}`}
                        variant="outlined"
                        size="small"
                      >
                        View
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;