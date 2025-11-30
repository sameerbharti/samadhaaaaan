import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Box,
  Button,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Pagination,
  Stack
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ThumbDown as ThumbDownIcon,
  ThumbDownOffAlt as ThumbDownOffAltIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const GeneralComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [userVotes, setUserVotes] = useState({}); // Track user's votes
  const rowsPerPage = 6;

  // Calculate total pages based on complaint count
  const totalComplaintsCount = complaints.length;
  const totalPages = Math.ceil(totalComplaintsCount / rowsPerPage);

  // Fetch complaints from API
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/general-complaints');
        setComplaints(res.data.complaints);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch complaints');
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

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
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle like action
  const handleLike = async (complaintId) => {
    try {
      const res = await axios.post(`/api/complaints/${complaintId}/like`);
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint => 
          complaint._id === complaintId
            ? { ...complaint, likes: res.data.likes, dislikes: res.data.dislikes }
            : complaint
        )
      );
      
      // Update user's vote status
      setUserVotes(prev => ({
        ...prev,
        [complaintId]: {
          ...prev[complaintId],
          liked: !prev[complaintId]?.liked,
          disliked: false // Remove dislike when liking
        }
      }));
    } catch (err) {
      console.error('Error liking complaint:', err);
    }
  };

  // Handle dislike action
  const handleDislike = async (complaintId) => {
    try {
      const res = await axios.post(`/api/complaints/${complaintId}/dislike`);
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint => 
          complaint._id === complaintId
            ? { ...complaint, likes: res.data.likes, dislikes: res.data.dislikes }
            : complaint
        )
      );
      
      // Update user's vote status
      setUserVotes(prev => ({
        ...prev,
        [complaintId]: {
          ...prev[complaintId],
          disliked: !prev[complaintId]?.disliked,
          liked: false // Remove like when disliking
        }
      }));
    } catch (err) {
      console.error('Error disliking complaint:', err);
    }
  };

  // Get current complaints for pagination
  const indexOfLastComplaint = page * rowsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - rowsPerPage;

  // Create a sorted copy of complaints by net likes (likes - dislikes)
  const sortedComplaints = [...complaints].sort((a, b) => {
    const netA = a.likes.length - a.dislikes.length;
    const netB = b.likes.length - b.dislikes.length;
    // Sort by net votes first, then by date
    if (netB !== netA) return netB - netA;
    return new Date(b.createdAt) - new Date(a.createdAt); // If net votes are equal, sort by newest first
  });

  const currentComplaints = sortedComplaints.slice(indexOfFirstComplaint, indexOfLastComplaint);

  // Change page
  const paginate = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ py: 3 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="700" color="text.primary">
                General Complaints
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                View and vote on all community complaints
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Complaints Grid */}
        {currentComplaints.length > 0 ? (
          <Grid container spacing={3}>
            {currentComplaints.map((complaint) => {
              const netVotes = complaint.likes.length - complaint.dislikes.length;
              const userVote = userVotes[complaint._id] || {};
              
              return (
                <Grid item xs={12} sm={6} md={4} key={complaint._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -6px rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    {/* Display first image if available */}
                    {complaint.images && complaint.images.length > 0 && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={`${process.env.REACT_APP_API_URL}/uploads/${complaint.images[0]}`}
                        alt={complaint.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight="600" 
                        color="text.primary" 
                        gutterBottom
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {complaint.title}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2
                        }}
                      >
                        {complaint.description}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
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
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title={userVote.liked ? 'Unlike' : 'Like'}>
                            <IconButton
                              size="small"
                              onClick={() => handleLike(complaint._id)}
                              color={userVote.liked ? 'error' : 'default'}
                              sx={{ p: 0.5 }}
                            >
                              {userVote.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </IconButton>
                          </Tooltip>
                          <Typography variant="caption" color="text.primary">
                            {complaint.likes.length}
                          </Typography>

                          <Tooltip title={userVote.disliked ? 'Undislike' : 'Dislike'}>
                            <IconButton
                              size="small"
                              onClick={() => handleDislike(complaint._id)}
                              color={userVote.disliked ? 'error' : 'default'}
                              sx={{ p: 0.5 }}
                            >
                              {userVote.disliked ? <ThumbDownIcon /> : <ThumbDownOffAltIcon />}
                            </IconButton>
                          </Tooltip>
                          <Typography variant="caption" color="text.primary">
                            {complaint.dislikes.length}
                          </Typography>
                        </Box>

                        <Chip
                          label={`Net: ${netVotes}`}
                          size="small"
                          color={netVotes > 0 ? 'success' : netVotes < 0 ? 'error' : 'default'}
                          variant="outlined"
                          sx={{ borderRadius: '8px', fontWeight: '600' }}
                        />
                      </Box>
                    </CardContent>

                    <Divider />

                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        component={Link}
                        to={`/complaint/${complaint._id}`}
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none'
                        }}
                      >
                        View Details
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <AssignmentIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={1}>
                No complaints found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are currently no complaints in the system
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Pagination */}
        {complaints.length > rowsPerPage && (
          <Grid item xs={12}>
            <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={paginate}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Stack>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default GeneralComplaints;