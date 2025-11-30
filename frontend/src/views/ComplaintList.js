import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Pagination,
  Grid,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Assignment } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ComplaintList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch complaints from API
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('/api/complaints');
        setComplaints(res.data.complaints);
        setFilteredComplaints(res.data.complaints);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch complaints');
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Filter complaints based on search term
  useEffect(() => {
    const filtered = complaints.filter(complaint =>
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredComplaints(filtered);
    setPage(1); // Reset to first page when searching
  }, [searchTerm, complaints]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    try {
      await axios.delete(`/api/complaints/${id}`);
      // Remove the deleted complaint from the state
      setComplaints(complaints.filter(complaint => complaint._id !== id));
      setFilteredComplaints(filteredComplaints.filter(complaint => complaint._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete complaint');
    }
  };

  // Get current complaints for pagination
  const indexOfLastComplaint = page * rowsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - rowsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirstComplaint, indexOfLastComplaint);

  // Change page
  const paginate = (event, value) => {
    setPage(value);
  };

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
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3} sx={{ py: 3 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="700" color="text.primary">
                My Complaints
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Track and manage your submitted complaints
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/complaint/new"
              variant="contained"
              startIcon={<Assignment />}
              sx={{
                borderRadius: '12px',
                fontWeight: '600',
                px: 3
              }}
            >
              New Complaint
            </Button>
          </Box>
        </Grid>

        {/* Search and Filter */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
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
                sx: { borderRadius: '8px' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
            />
          </Paper>
        </Grid>

        {/* Complaints Table */}
        <Grid item xs={12}>
          <Paper
            sx={{
              width: '100%',
              overflow: 'hidden',
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <TableContainer>
              <Table stickyHeader aria-label="complaints table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: '600', color: 'text.secondary' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: 'text.secondary' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: 'text.secondary' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: 'text.secondary' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: 'text.secondary' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: 'text.secondary' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: 'text.secondary' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentComplaints.length > 0 ? (
                    currentComplaints.map((complaint) => (
                      <TableRow
                        key={complaint._id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {complaint._id.substring(0, 8)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600" color="text.primary">
                            {complaint.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={complaint.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: '8px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                            size="small"
                            color={getPriorityColor(complaint.priority)}
                            variant="outlined"
                            sx={{ borderRadius: '8px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={complaint.status.replace('-', ' ')}
                            size="small"
                            color={getStatusColor(complaint.status)}
                            variant="outlined"
                            sx={{ borderRadius: '8px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            component={Link}
                            to={`/complaint/${complaint._id}`}
                            variant="contained"
                            size="small"
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              mr: 1
                            }}
                          >
                            View
                          </Button>
                          {user?.role === 'admin' && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleDelete(complaint._id)}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none'
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Assignment sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" mb={1}>
                            No complaints found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm ? 'Try adjusting your search' : 'Create your first complaint to get started'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {indexOfFirstComplaint + 1}-{Math.min(indexOfLastComplaint, filteredComplaints.length)} of {filteredComplaints.length} complaints
              </Typography>
              <Pagination
                count={Math.ceil(filteredComplaints.length / rowsPerPage)}
                page={page}
                onChange={paginate}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ComplaintList;