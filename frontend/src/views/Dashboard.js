import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CardContent,
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
  Alert
} from '@mui/material';
import {
  Assignment as ComplaintIcon,
  Dashboard as DashboardIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusDistribution from '../components/StatusDistribution';

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Fetch user's complaints from API
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('/api/complaints/mine');
        setComplaints(res.data.complaints);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch complaints');
        setLoading(false);
      }
    };

    if (user) {
      fetchComplaints();
    }
  }, [user]);

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
    <Container maxWidth="xl">
      <Grid container spacing={3} sx={{ py: 3 }}>
        {/* Welcome message */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="700" color="text.primary" gutterBottom>
                Welcome back, {user?.name}!
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Track and manage your complaints efficiently
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '16px',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -6px rgba(0,0,0,0.05)',
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  TOTAL COMPLAINTS
                </Typography>
                <Typography variant="h4" fontWeight="700" color="text.primary" mt={0.5}>
                  {complaints.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <ComplaintIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
            <Typography variant="caption" color="text.secondary" mt="auto">
              All your complaints
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '16px',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -6px rgba(0,0,0,0.05)',
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  RESOLVED
                </Typography>
                <Typography variant="h4" fontWeight="700" color="text.primary" mt={0.5}>
                  {complaints.filter(c => c.status === 'resolved').length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                <DashboardIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
            <Typography variant="caption" color="text.secondary" mt="auto">
              {complaints.length ? Math.round((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100) : 0}% success rate
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '16px',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -6px rgba(0,0,0,0.05)',
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  PENDING
                </Typography>
                <Typography variant="h4" fontWeight="700" color="text.primary" mt={0.5}>
                  {complaints.filter(c => c.status === 'pending').length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                <ComplaintIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
            <Typography variant="caption" color="text.secondary" mt="auto">
              Awaiting action
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '16px',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -6px rgba(0,0,0,0.05)',
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  IN PROGRESS
                </Typography>
                <Typography variant="h4" fontWeight="700" color="text.primary" mt={0.5}>
                  {complaints.filter(c => c.status === 'in-progress').length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                <DashboardIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
            <Typography variant="caption" color="text.secondary" mt="auto">
              Active complaints
            </Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '16px'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="600">
                Your Complaints Overview
              </Typography>
              <IconButton onClick={handleClick}>
                <MoreIcon />
              </IconButton>
            </Box>
            <Menu
              id="dashboard-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Last 7 days</MenuItem>
              <MenuItem onClick={handleClose}>Last 30 days</MenuItem>
              <MenuItem onClick={handleClose}>Last year</MenuItem>
            </Menu>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">Your complaints chart</Typography>
              </Box>
            </CardContent>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <StatusDistribution
            data={[
              { name: 'Pending', value: complaints.filter(c => c.status === 'pending').length },
              { name: 'In Progress', value: complaints.filter(c => c.status === 'in-progress').length },
              { name: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length },
              { name: 'Rejected', value: complaints.filter(c => c.status === 'rejected').length }
            ].filter(item => item.value > 0)} // Only include items with count > 0
            title="Status Distribution"
            height={350}
          />
        </Grid>

        {/* Recent complaints */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '16px'
            }}
          >
            <Box p={3}>
              <Typography variant="h6" fontWeight="600">
                Recent Complaints
              </Typography>
            </Box>
            <Divider />
            <List>
              {complaints.slice(0, 5).map((complaint) => (
                <React.Fragment key={complaint._id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="600" color="text.primary">
                          {complaint.title}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline', mt: 1 }}
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {complaint.description.substring(0, 120)}...
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, gap: 1 }}>
                            <Chip
                              label={complaint.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: '8px' }}
                            />
                            <Chip
                              label={complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                              size="small"
                              color={getPriorityColor(complaint.priority)}
                              variant="outlined"
                              sx={{ borderRadius: '8px' }}
                            />
                            <Chip
                              label={complaint.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              size="small"
                              color={getStatusColor(complaint.status)}
                              variant="outlined"
                              sx={{ borderRadius: '8px' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        component={Link}
                        to={`/complaint/${complaint._id}`}
                        variant="contained"
                        size="small"
                        sx={{ borderRadius: '8px' }}
                      >
                        View
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="middle" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;