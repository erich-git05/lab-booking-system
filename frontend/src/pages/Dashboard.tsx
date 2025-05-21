import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardActionArea, CardContent, Typography, useTheme } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotificationsIcon from '@mui/icons-material/Notifications';

const features = [
  {
    title: 'Lab Items',
    description: 'Browse, add, or book lab equipment, tools, and chemicals.',
    icon: <ScienceIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    path: '/equipment',
  },
  {
    title: 'Bookings',
    description: 'View and manage your bookings. See other reserved items booked in the calendar.',
    icon: <CalendarTodayIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    path: '/bookings',
  },
  {
    title: 'Notifications',
    description: 'See updates about returns, approvals, and reminders.',
    icon: <NotificationsIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    path: '/notifications',
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.background.default,
      }}
    >
      <Typography variant="h3" fontWeight={700} color="primary" mb={4}>
        Lab Portal Dashboard
      </Typography>
      <Grid container spacing={4} justifyContent="center" maxWidth={800}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: 3,
                background: 'white',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.03)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea onClick={() => navigate(feature.path)} sx={{ p: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  {feature.icon}
                  <Typography variant="h6" fontWeight={600} mt={2} mb={1} color="primary">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {feature.description}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard; 