import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LocationMap from '../components/LocationMap';
import ImageUpload from '../components/ImageUpload';

const ComplaintForm = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road-maintenance',
    priority: 'medium',
    location: {
      address: '',
      coordinates: []
    },
    images: []
  });

  const [selectedLocation, setSelectedLocation] = useState({
    address: '',
    coordinates: []
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { title, description, category, priority } = formData;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (locationData) => {
    setSelectedLocation(locationData);
    setFormData({
      ...formData,
      location: {
        address: locationData.address,
        coordinates: locationData.coordinates
      }
    });
  };

  const handleImagesChange = (images) => {
    setFormData({
      ...formData,
      images: images
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const complaintData = {
        title,
        description,
        category,
        priority,
        location: {
          type: 'Point',
          coordinates: selectedLocation.coordinates.length > 0 ? selectedLocation.coordinates : [0, 0],
          address: selectedLocation.address
        },
        images: formData.images // Include uploaded images
      };

      await axios.post('/api/complaints', complaintData);

      setSuccess(true);

      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        category: 'road-maintenance',
        priority: 'medium',
        location: {
          address: '',
          coordinates: []
        },
        images: []
      });
      setSelectedLocation({
        address: '',
        coordinates: []
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/complaints');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight="700" color="text.primary" gutterBottom>
              Register a New Complaint
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Fill in the details below to submit your complaint
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
              Complaint submitted successfully! Our team will review it shortly.
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Complaint Title"
                  name="title"
                  value={title}
                  onChange={onChange}
                  placeholder="Briefly describe your complaint"
                  disabled={loading}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: '12px' }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" fontWeight="600" color="text.primary" mb={1}>
                  Description *
                </Typography>
                <TextField
                  fullWidth
                  required
                  name="description"
                  value={description}
                  onChange={onChange}
                  multiline
                  rows={4}
                  placeholder="Provide detailed information about your complaint"
                  disabled={loading}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: '12px' }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="600" color="text.primary" mb={1}>
                  Category *
                </Typography>
                <FormControl fullWidth required variant="outlined">
                  <Select
                    name="category"
                    value={category}
                    onChange={onChange}
                    disabled={loading}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="street-light">Street Light</MenuItem>
                    <MenuItem value="water-pipe">Water Pipe</MenuItem>
                    <MenuItem value="rain-drainage">Rain Drainage</MenuItem>
                    <MenuItem value="road-reconstruction">Road Reconstruction</MenuItem>
                    <MenuItem value="garbage-system">Garbage System</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="600" color="text.primary" mb={1}>
                  Priority
                </Typography>
                <FormControl fullWidth variant="outlined">
                  <Select
                    name="priority"
                    value={priority}
                    onChange={onChange}
                    disabled={loading}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" fontWeight="600" color="text.primary" mb={1}>
                  Location
                </Typography>
                <LocationMap
                  selectedLocation={selectedLocation}
                  onLocationChange={handleLocationChange}
                />
              </Grid>

              <Grid item xs={12}>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontWeight: '600',
                    fontSize: '1rem',
                    textTransform: 'none',
                    borderRadius: '12px'
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ComplaintForm;