import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  TextField,
  Avatar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    // TODO: Implement save changes logic
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Reset form data if canceling edit
      setFormData({
        username: user?.username || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement image upload logic
      console.log('Uploading file:', file);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>

        <Stack spacing={3}>
          {/* Profile Information */}
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box position="relative">
                      <Avatar
                        src={user?.avatar}
                        alt={user?.username}
                        sx={{ width: 80, height: 80 }}
                      />
                      <input
                        accept="image/*"
                        type="file"
                        id="icon-button-file"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="icon-button-file">
                        <IconButton
                          color="primary"
                          aria-label="upload picture"
                          component="span"
                          sx={{
                            position: 'absolute',
                            bottom: -8,
                            right: -8,
                            backgroundColor: 'background.paper',
                            '&:hover': { backgroundColor: 'background.paper' },
                          }}
                        >
                          <PhotoCameraIcon />
                        </IconButton>
                      </label>
                    </Box>
                    <Box>
                      <Typography variant="h6">{user?.username}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant={isEditing ? 'outlined' : 'contained'}
                    onClick={handleToggleEdit}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Stack>

                {isEditing && (
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    <Divider />
                    <Typography variant="h6">Change Password</Typography>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                    />
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSaveChanges}
                      sx={{ alignSelf: 'flex-end' }}
                    >
                      Save Changes
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive email updates about your bookings"
                  />
                  <Switch
                    edge="end"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive push notifications about your bookings"
                  />
                  <Switch edge="end" defaultChecked />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DarkModeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dark Mode"
                    secondary="Toggle dark mode theme"
                  />
                  <Switch
                    edge="end"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </DashboardLayout>
  );
};

export default ProfilePage; 