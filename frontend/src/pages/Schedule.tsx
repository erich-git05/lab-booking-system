import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Button,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface Booking {
  id: number;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  equipment: string;
  status: 'confirmed' | 'pending' | 'completed';
}

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const bookings: Booking[] = [
    {
      id: 1,
      title: 'Microscope Booking',
      date: new Date(2024, 2, 15),
      startTime: '09:00',
      endTime: '11:00',
      equipment: 'Microscope',
      status: 'confirmed',
    },
    {
      id: 2,
      title: 'Centrifuge Session',
      date: new Date(2024, 2, 15),
      startTime: '13:00',
      endTime: '15:00',
      equipment: 'Centrifuge',
      status: 'pending',
    },
    {
      id: 3,
      title: 'pH Meter Usage',
      date: new Date(2024, 2, 16),
      startTime: '10:00',
      endTime: '12:00',
      equipment: 'pH Meter',
      status: 'completed',
    },
  ];

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      booking.date.toDateString() === date.toDateString()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Schedule</Typography>
          <Button
            variant="contained"
            startIcon={<EventIcon />}
            onClick={() => {/* Handle new booking */}}
          >
            New Booking
          </Button>
        </Stack>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <IconButton onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6">
              {format(currentDate, 'MMMM yyyy')}
            </Typography>
            <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          <Grid container spacing={1}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Grid item xs={12/7} key={day}>
                <Typography
                  variant="subtitle2"
                  align="center"
                  sx={{ fontWeight: 'bold', mb: 1 }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
            {days.map((day, index) => (
              <Grid item xs={12/7} key={index}>
                <Paper
                  onClick={() => setSelectedDate(day)}
                  sx={{
                    p: 1,
                    height: 100,
                    cursor: 'pointer',
                    bgcolor: isToday(day) ? 'primary.light' : 'background.paper',
                    color: isToday(day) ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white',
                    },
                  }}
                >
                  <Typography variant="body2" align="center">
                    {format(day, 'd')}
                  </Typography>
                  <Stack spacing={0.5}>
                    {getBookingsForDate(day).map((booking) => (
                      <Chip
                        key={booking.id}
                        label={booking.startTime}
                        size="small"
                        color={getStatusColor(booking.status) as any}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {selectedDate && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bookings for {format(selectedDate, 'MMMM d, yyyy')}
              </Typography>
              <Stack spacing={2}>
                {getBookingsForDate(selectedDate).map((booking) => (
                  <Paper
                    key={booking.id}
                    sx={{
                      p: 2,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1">{booking.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {booking.equipment} • {booking.startTime} - {booking.endTime}
                        </Typography>
                      </Box>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </Stack>
                  </Paper>
                ))}
                {getBookingsForDate(selectedDate).length === 0 && (
                  <Typography color="text.secondary" align="center">
                    No bookings for this date
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Schedule; 