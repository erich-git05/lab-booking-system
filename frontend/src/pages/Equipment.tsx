import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Equipment } from '../types';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EquipmentPage = () => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    totalQuantity: 1,
    image: '',
    available: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEquipment();
      if (res.success && res.data) {
        setEquipmentList(res.data);
      } else {
        setError(res.error || 'Failed to fetch equipment');
      }
    } catch (err) {
      setError('An error occurred while fetching equipment');
      console.error('Error fetching equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (equipment?: Equipment) => {
    if (equipment) {
      setSelectedEquipment(equipment);
      setForm({
        name: equipment.name,
        category: equipment.category,
        description: equipment.description,
        totalQuantity: equipment.totalQuantity,
        image: equipment.image,
        available: equipment.available,
      });
    } else {
      setSelectedEquipment(null);
      setForm({ 
        name: '', 
        category: '', 
        description: '', 
        totalQuantity: 1, 
        image: '',
        available: 1,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedEquipment(null);
    setForm({ 
      name: '', 
      category: '', 
      description: '', 
      totalQuantity: 1, 
      image: '',
      available: 1,
    });
    setOpenDialog(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: name === 'totalQuantity' || name === 'available' ? Number(value) : value 
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (selectedEquipment) {
        res = await api.editEquipment(selectedEquipment.id, form);
      } else {
        res = await api.addEquipment(form);
      }
      if (res.success) {
        await fetchEquipment();
        handleCloseDialog();
      } else {
        setError(res.error || 'Failed to save equipment');
      }
    } catch (err) {
      setError('An error occurred while saving equipment');
      console.error('Error saving equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipmentList.filter(
    (equipment) =>
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLabAssistant = user?.role === 'lab_assistant';

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Equipment Management</Typography>
          {isLabAssistant && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Equipment
            </Button>
          )}
        </Stack>

        {/* Search Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search equipment by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : filteredEquipment.length === 0 ? (
          <Alert severity="info">No equipment found</Alert>
        ) : (
          <Stack spacing={3}>
            {filteredEquipment.map((equipment) => (
              <Card key={equipment.id}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        variant="rounded"
                        src={equipment.image}
                        alt={equipment.name}
                        sx={{ width: 64, height: 64 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{equipment.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {equipment.category}
                        </Typography>
                      </Box>
                      {isLabAssistant && (
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => handleOpenDialog(equipment)}>
                            <EditIcon />
                          </IconButton>
                        </Stack>
                      )}
                    </Box>
                    <Typography variant="body2">{equipment.description}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={`${equipment.available} available`}
                        color={equipment.available > 0 ? 'success' : 'error'}
                        size="small"
                      />
                      <Chip
                        label={`Total: ${equipment.totalQuantity}`}
                        variant="outlined"
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                name="name"
                label="Name"
                value={form.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                name="category"
                label="Category"
                value={form.category}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                name="description"
                label="Description"
                value={form.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={3}
                required
              />
              <TextField
                name="image"
                label="Image URL"
                value={form.image}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                name="totalQuantity"
                label="Total Quantity"
                type="number"
                value={form.totalQuantity}
                onChange={handleFormChange}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
              <TextField
                name="available"
                label="Available Quantity"
                type="number"
                value={form.available}
                onChange={handleFormChange}
                fullWidth
                required
                inputProps={{ min: 0, max: form.totalQuantity }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default EquipmentPage; 