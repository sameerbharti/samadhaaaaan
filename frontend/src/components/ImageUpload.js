import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Alert
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const ImageUpload = ({ images, onImagesChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files (JPEG, PNG, etc.)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(`File ${file.name} exceeds 5MB size limit`);
        return;
      }
    }

    setUploading(true);
    setError('');

    // Process each file
    for (let file of files) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        // Upload the image
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          // Add uploaded file path to the images array
          const newImagePath = response.data.file.fileName; // Just the filename, backend will handle path
          onImagesChange([...images, newImagePath]);
        } else {
          setError(`Failed to upload ${file.name}`);
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError(err.response?.data?.message || `Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
  };

  // Remove an image
  const handleRemoveImage = (imagePath) => {
    const updatedImages = images.filter(img => img !== imagePath);
    onImagesChange(updatedImages);
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="body2" fontWeight="600" color="text.primary" mb={1}>
        Upload Images (Optional)
      </Typography>
      
      <Button
        variant="outlined"
        component="label"
        disabled={uploading}
        startIcon={<AddPhotoAlternateIcon />}
        sx={{
          mb: 2,
          borderRadius: '12px',
          borderColor: 'grey.300',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.lighter'
          }
        }}
      >
        {uploading ? 'Uploading...' : 'Select Images'}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={uploading || images.length >= 5} // Limit to 5 images
        />
      </Button>
      
      {images.length >= 5 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
          Maximum of 5 images allowed
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}
      
      {images.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Selected Images ({images.length}/5):
          </Typography>
          <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper' }}>
            {images.map((image, index) => (
              <ListItem
                key={index}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: '8px',
                  mb: 1,
                  alignItems: 'center'
                }}
              >
                <Avatar
                  src={`${process.env.REACT_APP_API_URL}/uploads/${image}`}  // Construct full URL for image display using env var
                  alt={`Complaint image ${index + 1}`}
                  variant="rounded"
                  sx={{ width: 50, height: 50, mr: 2 }}
                />
                <ListItemText
                  primary={`Image ${index + 1}`}
                  secondary={`${image.split('/').pop()}`}
                  primaryTypographyProps={{ fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleRemoveImage(image)}
                    disabled={uploading}
                    size="small"
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Maximum 5 images, each up to 5MB. Supported formats: JPG, PNG, GIF, etc.
      </Typography>
    </Box>
  );
};

export default ImageUpload;