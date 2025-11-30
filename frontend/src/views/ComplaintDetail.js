import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Rating,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  AccessTime,
  Person,
  Assignment,
  PriorityHigh,
  CheckCircle,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';

// Mock complaint data
const mockComplaint = {
  id: '1',
  title: 'Pothole on Main Street',
  description: 'There is a large pothole on Main Street near the intersection with Oak Avenue. It is causing significant damage to vehicles and poses a safety hazard to drivers. The pothole has been there for over a month now and needs immediate attention.',
  category: 'road-reconstruction',
  priority: 'high',
  status: 'in-progress',
  createdAt: '2023-05-15T10:30:00Z',
  updatedAt: '2023-05-18T14:20:00Z',
  location: {
    address: '123 Main Street, City, State 12345',
    coordinates: [-74.0059, 40.7128]
  },
  images: [
    'https://via.placeholder.com/600x400/4a90e2/ffffff?text=Complaint+Image+1',
    'https://via.placeholder.com/600x400/4a90e2/ffffff?text=Complaint+Image+2'
  ],
  userId: {
    id: 'user1',
    name: 'John Doe',
    email: 'john.doe@example.com'
  },
  resolutionDate: null,
  estimatedResolutionDate: '2023-06-01T00:00:00Z',
  comments: [
    {
      id: 'comment1',
      userId: { name: 'John Doe' },
      text: 'This issue has been ongoing for quite some time. Please prioritize it.',
      date: '2023-05-16T09:15:00Z'
    },
    {
      id: 'comment2',
      userId: { name: 'Jane Smith' },
      text: 'The issue has been acknowledged and is being worked on.',
      date: '2023-05-18T10:30:00Z'
    }
  ],
  feedback: {
    rating: 4,
    comment: 'Issue resolved quickly after I reported it.',
    date: '2023-06-02T11:20:00Z'
  },
  likes: 5,
  dislikes: 1,
  proofOfWork: [
    'https://via.placeholder.com/600x400/4a90e2/ffffff?text=Proof+OfWork+1',
    'https://via.placeholder.com/600x400/4a90e2/ffffff?text=Proof+OfWork+2'
  ]
};

const ComplaintDetail = () => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(mockComplaint);
  const [comment, setComment] = useState('');
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [userVote, setUserVote] = useState(null); // 'like', 'dislike', or null
  const [imageURL, setImageURL] = useState('');
  const [users, setUsers] = useState([]); // For assignment dropdown
  const [selectedUser, setSelectedUser] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const complaintRes = await axios.get(`/api/complaints/${id}`);
        setComplaint(complaintRes.data.complaint);

        // If user is admin, also fetch users for assignment
        if (user?.role === 'admin') {
          const usersRes = await axios.get('/api/admin/users');
          // Filter out the current complaint's user and admin
          const filteredUsers = usersRes.data.users.filter(u =>
            u._id !== complaintRes.data.complaint.userId._id
          );
          setUsers(filteredUsers);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load complaint');
      }
    };

    fetchData();
  }, [id, user?.role]);

  const addComment = () => {
    if (comment.trim() === '') return;

    const newComment = {
      id: `comment${complaint.comments.length + 1}`,
      userId: { name: 'Current User' }, // This would be the logged in user
      text: comment,
      date: new Date().toISOString()
    };

    setComplaint({
      ...complaint,
      comments: [...complaint.comments, newComment]
    });

    setComment('');
  };

  const submitFeedback = () => {
    if (feedback.rating === 0) return;

    setComplaint({
      ...complaint,
      feedback: {
        rating: feedback.rating,
        comment: feedback.comment,
        date: new Date().toISOString()
      }
    });

    setShowFeedbackForm(false);
  };

  // Admin functionality
  const handleAssignDialogOpen = () => {
    setAssignDialogOpen(true);
    // Set the currently assigned user if any
    setSelectedUser(complaint?.assignedUser?._id || '');
  };

  const handleAssignDialogClose = () => {
    setAssignDialogOpen(false);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleAssignUser = async () => {
    try {
      const res = await axios.put(`/api/complaints/${id}/assign`, {
        assignedUserId: selectedUser || null
      });

      // Update the complaint with new assigned user
      setComplaint(res.data.complaint);
      setAssignDialogOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign user');
    }
  };

  const handleDeleteComplaint = async () => {
    try {
      await axios.delete(`/api/complaints/${id}`);
      setDeleteDialogOpen(false);
      navigate('/complaints'); // Redirect to complaints list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete complaint');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await axios.put(`/api/complaints/${id}`, { status: newStatus });
      setComplaint(res.data.complaint);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/complaints/${complaint._id}/like`);

      // Update the complaint data with new like/dislike counts
      setComplaint({
        ...complaint,
        likes: response.data.likes,
        dislikes: response.data.dislikes
      });

      if (userVote === 'like') {
        // User is unliking
        setUserVote(null);
      } else {
        // User is liking (and removing dislike if it exists)
        setUserVote('like');
      }
    } catch (error) {
      console.error('Error liking complaint:', error);
      // Show error message to user
    }
  };

  const handleDislike = async () => {
    try {
      const response = await axios.post(`/api/complaints/${complaint._id}/dislike`);

      // Update the complaint data with new like/dislike counts
      setComplaint({
        ...complaint,
        likes: response.data.likes,
        dislikes: response.data.dislikes
      });

      if (userVote === 'dislike') {
        // User is undisliking
        setUserVote(null);
      } else {
        // User is disliking (and removing like if it exists)
        setUserVote('dislike');
      }
    } catch (error) {
      console.error('Error disliking complaint:', error);
      // Show error message to user
    }
  };

  const addProofOfWork = async () => {
    if (!imageURL.trim()) return;

    try {
      await axios.post(`/api/complaints/${complaint._id}/proof-of-work`, {
        proofOfWork: imageURL
      });

      // Update the complaint data with new proof of work
      setComplaint({
        ...complaint,
        proofOfWork: [...complaint.proofOfWork, imageURL]
      });

      // Clear the input
      setImageURL('');
    } catch (error) {
      console.error('Error adding proof of work:', error);
      // Show error message to user
    }
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
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Back button */}
        <Grid item xs={12}>
          <Button
            component={Link}
            to="/complaints"
            variant="outlined"
            startIcon={<Assignment />}
          >
            Back to Complaints
          </Button>
        </Grid>

        {/* Main complaint info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" gutterBottom>
                {complaint.title}
              </Typography>
              <Chip
                label={complaint.status.replace('-', ' ')}
                size="large"
                color={getStatusColor(complaint.status)}
                variant="outlined"
              />
            </Box>

            <Box sx={{ mt: 2, mb: 3 }}>
              <Chip
                label={complaint.category.replace('-', ' ')}
                size="small"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                label={complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                size="small"
                color={getPriorityColor(complaint.priority)}
                variant="outlined"
              />
            </Box>

            <Typography variant="body1" paragraph>
              {complaint.description}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(complaint.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {complaint.location?.address || 'Address not specified'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Images */}
        {complaint.images && complaint.images.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Supporting Images
              </Typography>
              <Grid container spacing={2}>
                {complaint.images.map((image, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box
                      component="img"
                      src={image}
                      alt={`Complaint image ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 300,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}


        {/* Resolution Info */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resolution Details
            </Typography>
            <Grid container spacing={2}>
              {complaint.estimatedResolutionDate && (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Estimated Resolution: {new Date(complaint.estimatedResolutionDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {complaint.resolutionDate && (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Resolved: {new Date(complaint.resolutionDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <PriorityHigh sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Priority: <Chip
                      label={complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                      size="small"
                      color={getPriorityColor(complaint.priority)}
                      variant="outlined"
                    />
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Like/Dislike Buttons */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Was this complaint helpful?
            </Typography>
            <IconButton
              color={userVote === 'like' ? 'primary' : 'default'}
              onClick={handleLike}
            >
              <ThumbUpIcon
                color={userVote === 'like' ? 'primary' : 'inherit'}
              />
            </IconButton>
            <Typography variant="body2" sx={{ mx: 1 }}>
              {complaint.likes}
            </Typography>
            <IconButton
              color={userVote === 'dislike' ? 'error' : 'default'}
              onClick={handleDislike}
            >
              <ThumbDownIcon
                color={userVote === 'dislike' ? 'error' : 'inherit'}
              />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {complaint.dislikes}
            </Typography>
          </Paper>
        </Grid>

        {/* Comments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            
            <List>
              {complaint.comments.map((comment) => (
                <React.Fragment key={comment.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={comment.userId?.name || 'Unknown User'}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {comment.text || 'No comment text'}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {comment.date ? new Date(comment.date).toLocaleString() : 'No date'}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
            
            <Box sx={{ mt: 2, display: 'flex' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button 
                variant="contained" 
                sx={{ ml: 1, height: 'fit-content' }} 
                onClick={addComment}
              >
                Post
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Feedback */}
        {complaint.status === 'resolved' || complaint.status === 'rejected' ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Feedback
              </Typography>

              {complaint.feedback ? (
                <Box>
                  <Rating
                    value={complaint.feedback.rating}
                    readOnly
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    {complaint.feedback.comment || 'No feedback comment provided.'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(complaint.feedback.date).toLocaleString()}
                  </Typography>
                </Box>
              ) : !showFeedbackForm ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Please provide feedback for this complaint resolution.
                  </Alert>
                  <Button
                    variant="outlined"
                    onClick={() => setShowFeedbackForm(true)}
                  >
                    Provide Feedback
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Rate your experience:
                  </Typography>
                  <Rating
                    value={feedback.rating}
                    onChange={(event, newValue) => setFeedback({ ...feedback, rating: newValue })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    label="Additional feedback"
                    value={feedback.comment}
                    onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      onClick={submitFeedback}
                      disabled={feedback.rating === 0}
                      sx={{ mr: 1 }}
                    >
                      Submit Feedback
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setShowFeedbackForm(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        ) : null}

        {/* Proof of Work Section for Admin */}
        {user?.role === 'admin' ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Proof of Work
              </Typography>

              {complaint.proofOfWork && complaint.proofOfWork.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Completed work evidence:
                  </Typography>
                  <Grid container spacing={2}>
                    {complaint.proofOfWork.map((image, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box
                          component="img"
                          src={image}
                          alt={`Proof of work ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: 200,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No proof of work submitted yet for this complaint.
                </Alert>
              )}

            </Paper>
          </Grid>
        ) : null}

        {/* Admin Controls */}
        {user?.role === 'admin' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Admin Controls
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={complaint?.status || ''}
                    label="Status"
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  onClick={handleAssignDialogOpen}
                >
                  {complaint?.assignedUser ? 'Reassign' : 'Assign User'}
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteDialogOpen}
                >
                  Delete Complaint
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Assign User Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleAssignDialogClose}>
        <DialogTitle>Assign Complaint to User</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="assign-user-select-label">Select User</InputLabel>
            <Select
              labelId="assign-user-select-label"
              value={selectedUser}
              label="Select User"
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <MenuItem value="">
                <em>Unassign</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignDialogClose}>Cancel</Button>
          <Button onClick={handleAssignUser} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this complaint? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteComplaint} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ComplaintDetail;