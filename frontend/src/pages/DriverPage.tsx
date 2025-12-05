import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button, Card, Typography, Switch, Box, Alert } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import 'leaflet/dist/leaflet.css';

const DriverPage: React.FC = () => {
  const [location, setLocation] = useState<[number, number]>([9.032, 38.746]);
  const [sharing, setSharing] = useState(true);
  const [sos, setSos] = useState(false);

  useEffect(() => {
    if (sharing && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation([latitude, longitude]);
          
          // Send to backend
          fetch('http://localhost/api/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              truckId: 'TRK-001',
              latitude,
              longitude,
              speed: Math.random() * 80,
              battery: 85,
              status: sos ? 'EMERGENCY' : 'ACTIVE'
            })
          });
        },
        (error) => console.error(error)
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [sharing, sos]);

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', p: 2 }}>
      <Card sx={{ p: 2, mb: 2, textAlign: 'center' }}>
        <Typography variant="h5">🚚 ETHIO Safeguard Driver</Typography>
        <Typography>Truck ID: TRK-001</Typography>
      </Card>

      <Button
        fullWidth
        variant="contained"
        color={sos ? "error" : "warning"}
        startIcon={<WarningIcon />}
        onClick={() => setSos(!sos)}
        sx={{ mb: 2 }}
      >
        {sos ? 'SOS ACTIVE' : 'ACTIVATE SOS'}
      </Button>

      <Card sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ flexGrow: 1 }}>Location Sharing</Typography>
        <Switch checked={sharing} onChange={(e) => setSharing(e.target.checked)} />
      </Card>

      <div style={{ height: 300, width: '100%' }}>
        <MapContainer center={location} zoom={15} style={{ height: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Marker position={location}>
            <Popup>Your Location</Popup>
          </Marker>
        </MapContainer>
      </div>

      <Alert severity={sos ? "error" : sharing ? "success" : "warning"} sx={{ mt: 2 }}>
        {sos ? 'EMERGENCY ALERT ACTIVE' : sharing ? 'Location sharing active' : 'Location sharing paused'}
      </Alert>
    </Box>
  );
};

export default DriverPage;
