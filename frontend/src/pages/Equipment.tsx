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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Equipment } from '../types';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const EquipmentPage = () => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [form, setForm] = useState<Omit<Equipment, 'id' | 'isAvailable' | 'createdAt' | 'updatedAt'>>({
    name: '',
    category: '',
    description: '',
    totalQuantity: 1,
    image: '',
    available: 1,
    itemType: 'Equipment',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        setError(res.error || 'Failed to fetch lab items');
      }
    } catch (err) {
      setError('An error occurred while fetching lab items');
      console.error('Error fetching lab items:', err);
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
        itemType: equipment.itemType,
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
        itemType: 'Equipment',
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
      itemType: 'Equipment',
    });
    setOpenDialog(false);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name as string]: name === 'totalQuantity' || name === 'available' ? Number(value) : value 
    }));
  };

  const handleSubmit = async () => {
    // Frontend validation
    if (!form.name || !form.category || !form.description || !form.image) {
      setFormError('All fields are required. Please fill in all fields.');
      return;
    }
    setFormError(null);
    try {
      setLoading(true);
      setError(null);
      let res;
      
      // Create a temporary ID for optimistic update
      const tempId = selectedEquipment ? selectedEquipment.id : `temp-${Date.now()}`;
      const newItem: Equipment = {
        id: tempId,
        name: form.name,
        type: form.category,
        quantity: form.available,
        available: form.available,
        isAvailable: form.available > 0,
        description: form.description,
        image: form.image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (selectedEquipment) {
        // Optimistically update the UI
        setEquipmentList(prev => 
          prev.map(item => item.id === selectedEquipment.id ? { ...item, ...newItem } : item)
        );
        res = await api.editEquipment(selectedEquipment.id, form);
      } else {
        // Optimistically add to the UI
        setEquipmentList(prev => [...prev, newItem]);
        res = await api.addEquipment(form);
      }

      if (res.success) {
        // Update with the real data from the server
        await fetchEquipment();
        handleCloseDialog();
      } else {
        // Revert the optimistic update if the API call failed
        await fetchEquipment();
        setError(res.error || 'Failed to save lab item');
      }
    } catch (err) {
      // Revert the optimistic update if there was an error
      await fetchEquipment();
      setError('An error occurred while saving lab item');
      console.error('Error saving lab item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (equipment: Equipment) => {
    setEquipmentToDelete(equipment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!equipmentToDelete) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.deleteEquipment(equipmentToDelete.id);
      if (res.success) {
        await fetchEquipment();
        setDeleteDialogOpen(false);
        setEquipmentToDelete(null);
      } else {
        setError(res.error || 'Failed to delete lab item');
      }
    } catch (err) {
      setError('An error occurred while deleting lab item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEquipmentToDelete(null);
  };

  const filteredEquipment = equipmentList.filter(
    (equipment) =>
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedEquipment = filteredEquipment.reduce((acc, item) => {
    const type = item.itemType || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, Equipment[]>);

  const isLabAssistant = user?.role === 'lab_assistant';

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Lab Items Management</Typography>
          {isLabAssistant && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Item
            </Button>
          )}
        </Stack>

        {/* Search Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search items by name, category, or description..."
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
          <Alert severity="info">No items found</Alert>
        ) : (
          <Stack spacing={4}>
            {Object.entries(groupedEquipment).map(([type, items]) => (
              <Box key={type}>
                <Typography variant="h5" mb={2}>
                  {type}
                </Typography>
                <Grid container spacing={3}>
                  {items.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '& .MuiCardContent-root': {
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column'
                        }
                      }}>
                        <CardContent>
                          <Stack spacing={2} sx={{ height: '100%' }}>
                            {/* Image at the top */}
                            <Box display="flex" justifyContent="center" sx={{ minHeight: 100 }}>
                              {item.image ? (
                                <Avatar
                                  src={item.image}
                                  alt={item.name}
                                  sx={{ width: 80, height: 80, mb: 1, borderRadius: 2 }}
                                  variant="rounded"
                                />
                              ) : (
                                <Avatar sx={{ width: 80, height: 80, mb: 1, borderRadius: 2, bgcolor: 'grey.200', color: 'text.secondary', fontSize: 32 }} variant="rounded">
                                  {item.name[0]}
                                </Avatar>
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                minHeight: 40
                              }}
                            >
                              <Typography variant="h6" sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {item.name}
                              </Typography>
                              {isLabAssistant && (
                                <Stack direction="row" spacing={1}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(item)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteClick(item)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Stack>
                              )}
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                minHeight: 60
                              }}
                            >
                              {item.description}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                              <Chip
                                label={item.category}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={`Available: ${item.available}/${item.totalQuantity}`}
                                size="small"
                                color={item.available > 0 ? 'success' : 'error'}
                              />
                            </Stack>
                            {user?.role === 'student' && (
                              <Button
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => navigate(`/equipment/book?item=${item.id}`)}
                                disabled={item.available <= 0}
                              >
                                Book Item
                              </Button>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Stack>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedEquipment ? 'Edit Lab Item' : 'Add New Lab Item'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {formError && (
                <Alert severity="error">{formError}</Alert>
              )}
              <FormControl fullWidth>
                <InputLabel>Item Type</InputLabel>
                <Select
                  name="itemType"
                  value={form.itemType}
                  onChange={handleFormChange}
                  label="Item Type"
                >
                  <MenuItem value="Equipment">Equipment</MenuItem>
                  <MenuItem value="Tool">Tool</MenuItem>
                  <MenuItem value="Chemical">Chemical</MenuItem>
                </Select>
              </FormControl>
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

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete "{equipmentToDelete?.name}"?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default EquipmentPage; 