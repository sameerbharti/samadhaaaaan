import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map click events
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      // Reverse geocode to get address from coordinates
      fetchAddressFromCoordinates(lat, lng).then(address => {
        onLocationSelect({ coordinates: [lng, lat], address });
      }).catch(error => {
        console.error('Error getting address from coordinates:', error);
        // If reverse geocoding fails, still allow selection but with coordinates only
        onLocationSelect({ coordinates: [lng, lat], address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}` });
      });
    }
  });
  return null;
};

// Function to reverse geocode coordinates to get address
const fetchAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    return `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    throw error;
  }
};

// Function to geocode address to get coordinates
const fetchCoordinatesFromAddress = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return [parseFloat(lon), parseFloat(lat)];
    }
    return null;
  } catch (error) {
    console.error('Error in geocoding:', error);
    return null;
  }
};

const LocationMap = ({ selectedLocation, onLocationChange }) => {
  const [currentAddress, setCurrentAddress] = useState(selectedLocation?.address || '');
  const [error, setError] = useState('');
  const [initialPosition, setInitialPosition] = useState([20.5937, 78.9629]); // India center
  const [mapKey, setMapKey] = useState(0); // Key to force map remount when needed

  useEffect(() => {
    // Set initial position based on selected location if available
    if (selectedLocation && selectedLocation.coordinates && selectedLocation.coordinates.length === 2) {
      setInitialPosition([selectedLocation.coordinates[1], selectedLocation.coordinates[0]]); // [lat, lng]
      setCurrentAddress(selectedLocation.address || '');
    } else {
      // Try to get user's current position
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setInitialPosition([position.coords.latitude, position.coords.longitude]);
            setMapKey(prev => prev + 1); // Force map to re-render with new position
          },
          (error) => {
            console.error("Error getting location:", error);
            // Use default position if geolocation fails
          }
        );
      }
    }
  }, [selectedLocation]);

  const handleSearch = async () => {
    if (!currentAddress.trim()) {
      setError('Please enter an address to search');
      return;
    }
    
    const coordinates = await fetchCoordinatesFromAddress(currentAddress);
    if (coordinates) {
      onLocationChange({ coordinates, address: currentAddress });
      setInitialPosition([coordinates[1], coordinates[0]]); // [lat, lng]
      setError('');
    } else {
      setError('Unable to find location for the given address');
    }
  };

  const handleLocationSelect = (locationData) => {
    onLocationChange(locationData);
    setCurrentAddress(locationData.address);
    setError('');
  };

  return (
    <Box sx={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          value={currentAddress}
          onChange={(e) => setCurrentAddress(e.target.value)}
          placeholder="Enter address or location name"
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <LocationOnIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            ),
          }}
        />
        <Button
          variant="outlined"
          onClick={handleSearch}
          sx={{ height: '40px', alignSelf: 'flex-end' }}
        >
          Search
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      <Box sx={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          key={mapKey}
          center={initialPosition}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {selectedLocation && selectedLocation.coordinates && selectedLocation.coordinates.length === 2 && (
            <Marker position={[selectedLocation.coordinates[1], selectedLocation.coordinates[0]]}>
              <Popup>
                {selectedLocation.address || `Selected location: ${selectedLocation.coordinates[1].toFixed(6)}, ${selectedLocation.coordinates[0].toFixed(6)}`}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </Box>

      {selectedLocation && selectedLocation.coordinates && selectedLocation.coordinates.length === 2 && (
        <Typography variant="body2" sx={{ mt: 1, display: 'block' }}>
          Selected: {selectedLocation.address || `${selectedLocation.coordinates[1].toFixed(6)}, ${selectedLocation.coordinates[0].toFixed(6)}`}
        </Typography>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Click on the map to select a location or search for an address above
      </Typography>
    </Box>
  );
};

export default LocationMap;