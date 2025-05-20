import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  ListItemButton,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Science as ScienceIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    {
      title: 'Active Bookings',
      value: '5',
      icon: <CalendarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/bookings/active',
    },
    {
      title: 'Available Equipment',
      value: '25',
      icon: <ScienceIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/equipment',
    },
    {
      title: 'Pending Returns',
      value: '3',
      icon: <NotificationsIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      path: '/bookings/pending',
    },
    {
      title: 'Completed Bookings',
      value: '12',
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      path: '/bookings/completed',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'booking',
      title: 'Microscope Booking Confirmed',
      time: '2 hours ago',
      status: 'success',
      path: '/bookings/1',
    },
    {
      id: 2,
      type: 'return',
      title: 'pH Meter Return Due',
      time: '1 day ago',
      status: 'warning',
      path: '/bookings/2',
    },
    {
      id: 3,
      type: 'booking',
      title: 'Centrifuge Booking Request',
      time: '3 days ago',
      status: 'info',
      path: '/bookings/3',
    },
  ];

  const quickActions = [
    {
      title: 'Book Equipment',
      icon: <ScienceIcon />,
      path: '/equipment',
    },
    {
      title: 'View Schedule',
      icon: <CalendarIcon />,
      path: '/schedule',
    },
    {
      title: 'Check Notifications',
      icon: <NotificationsIcon />,
      path: '/notifications',
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        
        {/* Stats */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            {stats.map((stat, index) => (
              <Tooltip key={index} title={`View ${stat.title}`}>
                <Paper
                  onClick={() => navigate(stat.path)}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flex: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[4],
                      backgroundColor: 'primary.light',
                      '& .MuiTypography-root': {
                        color: 'white',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  {stat.icon}
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {stat.title}
                    </Typography>
                  </Box>
                </Paper>
              </Tooltip>
            ))}
          </Stack>
        </Stack>

        {/* Recent Activity and Quick Actions */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Card sx={{ flex: { md: 2 } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Recent Activity
                <IconButton 
                  size="small" 
                  onClick={() => navigate('/activity')}
                  sx={{ color: 'primary.main' }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    {index > 0 && <Divider />}
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => navigate(activity.path)}>
                        <ListItemIcon>
                          {activity.type === 'booking' ? (
                            <CalendarIcon color={activity.status as any} />
                          ) : (
                            <NotificationsIcon color={activity.status as any} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={activity.time}
                        />
                        <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: { md: 1 } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                {quickActions.map((action, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton 
                      onClick={() => navigate(action.path)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          '& .MuiListItemIcon-root': {
                            color: 'white',
                          },
                          '& .MuiListItemText-primary': {
                            color: 'white',
                          },
                        },
                      }}
                    >
                      <ListItemIcon>
                        {action.icon}
                      </ListItemIcon>
                      <ListItemText primary={action.title} />
                      <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard; 