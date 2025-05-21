import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Booking, Equipment } from '../types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { EventContentArg } from '@fullcalendar/core';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
    fetchEquipment();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setBookings(response.data.data || []);
      } else {
        setError(response.data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/equipment');
      setEquipment(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch equipment');
      console.error('Error fetching equipment:', err);
    }
  };

  const getEquipmentName = (equipmentId: string) => {
    const item = equipment.find(e => e.id === equipmentId);
    return item ? item.name : 'Unknown Equipment';
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

  const handleRefresh = () => {
    setLoading(true);
    fetchBookings();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography>Loading...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {user?.role === 'student' && (
          <>
            <Typography variant="h4" mb={3}>
              My Bookings
            </Typography>
            <Grid container spacing={3} mb={6}>
              {bookings.map((booking) => (
                <Grid item xs={12} md={6} key={booking.id}>
                  <Card>
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
                                {getEquipmentName(booking.equipmentId)}
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
                              {format(new Date(booking.startDate), 'MMM d, yyyy')}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {format(new Date(booking.startDate), 'h:mm a')} -{' '}
                              {format(new Date(booking.endDate), 'h:mm a')}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {bookings.length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    You haven't made any bookings yet. Book items from the Lab Items page.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </>
        )}
        
        <Typography variant="h4" mb={3}>
          Bookings Calendar
        </Typography>

        <div className="purple-calendar">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height={500}
            events={bookings.map((booking) => ({
              title: `${getEquipmentName(booking.equipmentId)} (${booking.quantity})`,
              start: booking.startDate,
              end: booking.endDate,
              color: booking.status === 'confirmed' ? '#4caf50' : 
                     booking.status === 'pending' ? '#ff9800' : 
                     booking.status === 'cancelled' ? '#f44336' : '#2196f3',
              textColor: '#fff',
              extendedProps: {
                status: booking.status,
                quantity: booking.quantity
              }
            }))}
            eventContent={(eventInfo: EventContentArg) => (
              <div style={{ padding: '2px 4px' }}>
                <div style={{ fontWeight: 'bold' }}>{eventInfo.event.title}</div>
                <div style={{ fontSize: '0.8em' }}>{eventInfo.event.extendedProps.status}</div>
              </div>
            )}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,dayGridDay'
            }}
            dayMaxEventRows={true}
            eventDisplay="block"
            eventBackgroundColor="#8e24aa"
            eventBorderColor="#6a1b9a"
            eventTextColor="#fff"
            selectable={true}
            selectMirror={true}
            themeSystem="standard"
            contentHeight={500}
            eventClassNames={() => 'purple-event'}
          />
        </div>
      </Box>
    </DashboardLayout>
  );
};

export default BookingsPage; 