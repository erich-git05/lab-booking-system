import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Booking, Equipment } from '../types';

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Microscope',
    description: 'High-power microscope for detailed specimen analysis',
    image: 'https://example.com/microscope.jpg',
    available: 5,
    category: 'Optical',
    totalQuantity: 5,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'pH Meter',
    description: 'Digital pH meter for accurate pH measurements',
    image: 'https://example.com/ph-meter.jpg',
    available: 3,
    category: 'Measurement',
    totalQuantity: 3,
    isAvailable: true,
  },
];

const mockBookings: Booking[] = [
  {
    id: '1',
    user: 'user1',
    equipment: '1',
    quantity: 1,
    date: '2024-05-20',
    startTime: '2024-05-20T09:00:00',
    endTime: '2024-05-20T11:00:00',
    status: 'confirmed',
  },
  {
    id: '2',
    user: 'user1',
    equipment: '2',
    quantity: 1,
    date: '2024-05-21',
    startTime: '2024-05-21T14:00:00',
    endTime: '2024-05-21T16:00:00',
    status: 'pending',
  },
];

const BookingsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEquipment('');
    setSelectedDate('');
    setSelectedStartTime('');
    setSelectedEndTime('');
    setQuantity(1);
  };

  const handleCreateBooking = () => {
    // TODO: Implement booking creation
    handleCloseDialog();
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEquipmentName = (equipmentId: string | Equipment) => {
    if (typeof equipmentId === 'string') {
      const equipment = mockEquipment.find(e => e.id === equipmentId);
      return equipment ? equipment.name : 'Unknown Equipment';
    }
    return equipmentId.name;
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4">My Bookings</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            New Booking
          </Button>
        </Stack>

        <Stack spacing={3}>
          {mockBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ScienceIcon />
                        <Typography variant="h6">
                          {getEquipmentName(booking.equipment)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {booking.quantity}
                      </Typography>
                    </Box>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </Box>

                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EventIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {format(new Date(booking.date), 'MMM d, yyyy')}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {format(new Date(booking.startTime), 'h:mm a')} -{' '}
                        {format(new Date(booking.endTime), 'h:mm a')}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                select
                label="Equipment"
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                fullWidth
              >
                {mockEquipment.map((equipment) => (
                  <MenuItem key={equipment.id} value={equipment.id}>
                    {equipment.name} - {equipment.category}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                type="time"
                label="Start Time"
                value={selectedStartTime}
                onChange={(e) => setSelectedStartTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                type="time"
                label="End Time"
                value={selectedEndTime}
                onChange={(e) => setSelectedEndTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateBooking}
              disabled={!selectedEquipment || !selectedDate || !selectedStartTime || !selectedEndTime}
            >
              Create Booking
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default BookingsPage; 