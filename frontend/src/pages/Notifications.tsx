import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Chip,
  Stack,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Booking Confirmed',
      message: 'Your microscope booking for March 15th has been confirmed.',
      type: 'success',
      timestamp: new Date(2024, 2, 14, 10, 30),
      read: false,
    },
    {
      id: 2,
      title: 'Return Reminder',
      message: 'Please return the pH meter by the end of today.',
      type: 'warning',
      timestamp: new Date(2024, 2, 14, 9, 15),
      read: false,
    },
    {
      id: 3,
      title: 'New Equipment Available',
      message: 'A new centrifuge has been added to the lab inventory.',
      type: 'info',
      timestamp: new Date(2024, 2, 13, 15, 45),
      read: true,
    },
  ]);

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    if (!notification.read) {
      setNotifications(notifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      ));
    }
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    setDialogOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Notifications</Typography>
          <Button
            variant="outlined"
            startIcon={<DoneIcon />}
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.read)}
          >
            Mark All as Read
          </Button>
        </Stack>

        <Paper>
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(notification.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                    }}
                  >
                    <ListItemIcon>
                      {getIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1">
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            ))}
            {notifications.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  secondary="You're all caught up!"
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            )}
          </List>
        </Paper>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedNotification && (
            <>
              <DialogTitle>
                <Stack direction="row" spacing={1} alignItems="center">
                  {getIcon(selectedNotification.type)}
                  <Typography variant="h6">
                    {selectedNotification.title}
                  </Typography>
                </Stack>
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" paragraph>
                  {selectedNotification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(selectedNotification.timestamp)}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Close</Button>
                <Button
                  onClick={() => handleDelete(selectedNotification.id)}
                  color="error"
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default Notifications; 