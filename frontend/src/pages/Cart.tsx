import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  IconButton,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { CartItem } from '../types';

const mockCartItems: CartItem[] = [
  {
    id: '1',
    type: 'equipment',
    name: 'Microscope',
    quantity: 1,
  },
  {
    id: '2',
    type: 'chemical',
    name: 'Hydrochloric Acid',
    quantity: 2,
  },
];

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [openDialog, setOpenDialog] = useState(false);
  const [notes, setNotes] = useState('');

  const handleQuantityChange = (itemId: string, change: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleCheckout = () => {
    setOpenDialog(true);
  };

  const handleConfirmCheckout = () => {
    // TODO: Implement checkout logic
    setOpenDialog(false);
    setNotes('');
    setCartItems([]);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNotes('');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Cart</Typography>
          <Button
            variant="contained"
            startIcon={<CartIcon />}
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            Checkout ({getTotalItems()} items)
          </Button>
        </Stack>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" textAlign="center" color="text.secondary">
                Your cart is empty
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {cartItems.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <Divider />}
                <Card>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Type: {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Typography>
                      </Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))}
          </Stack>
        )}

        {/* Checkout Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Confirm Checkout</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Typography variant="body1">
                You are about to check out {getTotalItems()} items.
              </Typography>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special requirements or notes..."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleConfirmCheckout}>
              Confirm Checkout
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default CartPage; 