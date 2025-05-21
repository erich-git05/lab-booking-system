import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Stack,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { api } from '../utils/api';
import { Equipment, Booking } from '../types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const EquipmentBooking = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getEquipment();
      if (response.success && response.data) {
        setEquipmentList(response.data);
      } else {
        setError(response.error || 'Failed to fetch equipment');
      }
    } catch (err) {
      setError('An error occurred while fetching equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedEquipment || !selectedDate || !startTime || !endTime) {
      setBookingError('Please fill in all booking details');
      return;
    }

    try {
      setIsBooking(true);
      setBookingError(null);

      // Create Date objects for start and end times
      const startDate = new Date(selectedDate);
      startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

      // Validate times
      if (endDate <= startDate) {
        setBookingError('End time must be after start time');
        return;
      }

      const bookingData = {
        equipmentId: selectedEquipment.id,
        quantity,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      console.log('Sending booking data:', bookingData); // Debug log

      const response = await api.bookEquipment(bookingData);

      if (response.success) {
        setBookingDialog(false);
        // Show success message
        setError('Booking successful! Check your bookings in the Bookings tab.');
        // Refresh equipment list to update availability
        fetchEquipment();
        // Navigate to bookings page
        navigate('/bookings');
      } else {
        setBookingError(response.error || 'Failed to book equipment');
      }
    } catch (err) {
      console.error('Booking error:', err); // Debug log
      setBookingError('An error occurred while booking equipment');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="contained"
            onClick={fetchEquipment}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Book Equipment
        </Typography>

        <Grid container spacing={3}>
          {equipmentList.map((equipment) => (
            <Grid item xs={12} sm={6} md={4} key={equipment.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[4],
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={equipment.image}
                  alt={equipment.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" component="div">
                      {equipment.name}
                    </Typography>
                    <Chip
                      label={`${equipment.available} available`}
                      color={equipment.available > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {equipment.description}
                  </Typography>
                  <Chip
                    label={equipment.category}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setSelectedEquipment(equipment);
                      setBookingDialog(true);
                    }}
                    disabled={equipment.available <= 0}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={bookingDialog}
          onClose={() => setBookingDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Book {selectedEquipment?.name}
            <IconButton
              onClick={() => setBookingDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {bookingError && (
                <Alert severity="error" onClose={() => setBookingError(null)}>
                  {bookingError}
                </Alert>
              )}

              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="subtitle1">
                  Available: {selectedEquipment?.available} units
                </Typography>
              </Paper>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, max: selectedEquipment?.available || 1 }}
                  sx={{ width: 100 }}
                />
                <IconButton
                  onClick={() => setQuantity(Math.min(selectedEquipment?.available || 1, quantity + 1))}
                  disabled={quantity >= (selectedEquipment?.available || 1)}
                >
                  <AddIcon />
                </IconButton>
              </Box>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Booking Date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TimePicker
                    label="Start Time"
                    value={startTime}
                    onChange={(newValue) => setStartTime(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <TimePicker
                    label="End Time"
                    value={endTime}
                    onChange={(newValue) => setEndTime(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
              </LocalizationProvider>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleBooking}
              startIcon={isBooking ? <CircularProgress size={20} /> : <CalendarIcon />}
              disabled={isBooking}
            >
              {isBooking ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default EquipmentBooking; 