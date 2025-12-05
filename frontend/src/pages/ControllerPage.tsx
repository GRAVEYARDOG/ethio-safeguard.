import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Paper, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import 'leaflet/dist/leaflet.css';

const ControllerPage: React.FC = () => {
  const [trucks, setTrucks] = useState([
    { id: 'TRK-001', driver: 'Tut-Gatwech-Tut', lat: 9.032, lon: 38.746, status: 'active' },
    { id: 'TRK-002', driver: 'Driver 2', lat: 8.998, lon: 38.790, status: 'active' },
    { id: 'TRK-003', driver: 'Driver 3', lat: 9.045, lon: 38.820, status: 'inactive' },
  ]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Paper sx={{ width: 300, p: 2 }}>
        <Typography variant="h6" gutterBottom>Active Trucks</Typography>
        <List>
          {trucks.map(truck => (
            <ListItem key={truck.id}>
              <ListItemText primary={truck.id} secondary={truck.driver} />
              <Chip
                label={truck.status}
                color={truck.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <div style={{ height: '100%', width: '100%' }}>
          <MapContainer center={[9.032, 38.746]} zoom={13} style={{ height: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            {trucks.map(truck => (
              <Marker key={truck.id} position={[truck.lat, truck.lon]}>
                <Popup>{truck.id} - {truck.driver}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Box>
    </Box>
  );
};

export default ControllerPage;