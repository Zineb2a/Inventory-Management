'use client';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, FormControl, Grid, Modal, Autocomplete } from '@mui/material';
import { signUp, logIn, logOut } from '../auth'; // Import auth functions
import { addItem, fetchInventory, removeItem } from '../inventory'; // Import inventory functions

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // Sorting
  const [filter, setFilter] = useState('all'); // Filtering
  const [productSuggestions, setProductSuggestions] = useState([]); // Product history for autocomplete

  // Modal states
  const [open, setOpen] = useState(false); // Controls modal visibility
  const [quantity, setQuantity] = useState(1); // Quantity input inside modal

  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  // Fetch all products for logged-in users
  const fetchAllProducts = async () => {
    const data = await fetchInventory();
    setInventory(data);
    setProductSuggestions(data.map(item => item.name)); // Set product suggestions for autocomplete
  };

  // Check if user is logged in
  useEffect(() => {
    if (user) {
      fetchAllProducts(); // Fetch products after login
    }
  }, [user]);

  // Handle opening/closing the modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Handle Sign Up
  const handleSignUp = async () => {
    try {
      const newUser = await signUp(email, password);
      setUser(newUser);
    } catch (error) {
      console.error('Sign up error:', error.message);
    }
  };

  // Handle Log In
  const handleLogIn = async () => {
    try {
      const loggedInUser = await logIn(email, password);
      setUser(loggedInUser);
      fetchAllProducts(); // Fetch inventory after login
    } catch (error) {
      console.error('Login error:', error.message);
    }
  };

  // Handle Log Out
  const handleLogOut = async () => {
    try {
      await logOut();
      setUser(null);
      setInventory([]); // Clear inventory on logout
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  // Add or Update Product with Quantity from Modal
  const handleAddItem = async () => {
    await addItem(itemName, quantity);
    handleClose();
    setItemName(''); // Clear the input field
    setQuantity(1); // Reset the quantity
    fetchAllProducts(); // Refresh the inventory
  };

  // Remove an item and refresh inventory
  const handleRemoveItem = async (name) => {
    await removeItem(name);
    fetchAllProducts(); // Refresh the inventory
  };

  // Search functionality
  const searchInventory = (searchTerm) => {
    const filteredInventory = inventory.filter(({ name }) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setInventory(filteredInventory);
  };

  // Sorting functionality
  const sortInventory = (inventory) => {
    switch (sortBy) {
      case 'name':
        return [...inventory].sort((a, b) => a.name.localeCompare(b.name));
      case 'quantity':
        return [...inventory].sort((a, b) => b.quantity - a.quantity); // Descending by quantity
      case 'date':
        return [...inventory].sort((a, b) => {
          const dateA = a.dateAdded?.seconds ? new Date(a.dateAdded.seconds * 1000) : new Date();
          const dateB = b.dateAdded?.seconds ? new Date(b.dateAdded.seconds * 1000) : new Date();
          return dateB - dateA; // Descending by date
        });
      default:
        return inventory;
    }
  };

  // Filtering functionality
  const filterInventory = (inventory) => {
    switch (filter) {
      case 'lowStock':
        return inventory.filter((item) => item.quantity < 5); // Filter by low stock
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Get date one week ago
        return inventory.filter((item) => new Date(item.dateAdded) >= oneWeekAgo); // Items added in last week
      case 'active':
        return inventory.filter((item) => item.status === 'active'); // Only show active products
      case 'all':
      default:
        return inventory;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '20px' }}>
        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: '#ff6f61',
            marginTop: '40px',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          My Small Bizz Inventory
        </Typography>

        {/* If no user is logged in, show login and signup forms */}
        {!user && (
          <>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ width: '400px', marginBottom: '20px' }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ width: '400px', marginBottom: '20px' }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleSignUp}>
                Sign Up
              </Button>
              <Button variant="contained" onClick={handleLogIn}>
                Log In
              </Button>
            </Box>
          </>
        )}

        {/* If user is logged in, show inventory management features */}
        {user && (
          <>
            <Button variant="contained" onClick={handleLogOut}>
              Log Out
            </Button>

            {/* Search bar */}
            <TextField
              label="Search Inventory"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchInventory(searchTerm); // Trigger search on Enter key press
                }
              }}
              sx={{
                width: '600px',
                marginBottom: '20px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
              }}
            />

            {/* Input for adding new items with product history suggestions */}
            <FormControl sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
              <Autocomplete
                freeSolo
                options={productSuggestions}
                value={itemName}
                onInputChange={(event, newInputValue) => setItemName(newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Add Item"
                    variant="outlined"
                    sx={{ width: '400px', backgroundColor: '#fff', borderRadius: '8px' }}
                  />
                )}
              />
              <Button
                variant="contained"
                onClick={handleOpen} // Open modal when clicking on Add New Item
                sx={{
                  backgroundColor: '#ff9aa2',
                  ':hover': { backgroundColor: '#ffc1c1' },
                  borderRadius: '8px',
                  padding: '8px 24px',
                }}
              >
                Add New Item
              </Button>
            </FormControl>

            {/* Sorting and Filtering Buttons */}
            <Box sx={{ display: 'flex', gap: 2, marginTop: '20px' }}>
              <Button variant="outlined" onClick={() => setSortBy('name')}>
                Sort by Name
              </Button>
              <Button variant="outlined" onClick={() => setSortBy('quantity')}>
                Sort by Quantity
              </Button>
              <Button variant="outlined" onClick={() => setSortBy('date')}>
                Sort by Date Added
              </Button>
              <Button variant="outlined" onClick={() => setFilter('lowStock')}>
                Filter by Low Stock
              </Button>
              <Button variant="outlined" onClick={() => setFilter('active')}>
                Show Active Products
              </Button>
            </Box>

            {/* Inventory Grid Display */}
            <Grid container spacing={2} sx={{ marginTop: '20px', justifyContent: 'center', maxWidth: '1200px' }}>
              {sortInventory(filterInventory(inventory)).map(({ name, quantity, dateAdded }) => (
                <Grid item xs={12} sm={6} md={3} key={name}>
                  <Box
                    sx={{
                      border: '1px solid #ccc',
                      padding: '10px',
                      textAlign: 'center',
                      borderRadius: '8px',
                      backgroundColor: quantity < 5 ? '#ffcccc' : '#fff', // Red background for low stock
                    }}
                  >
                    <Typography variant="h6">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                    <Typography>
                      Quantity: {quantity} {quantity < 5 && <span style={{ color: 'red' }}>Low Stock!</span>}
                    </Typography>
                    <Typography>Date Added: {new Date(dateAdded.seconds * 1000).toLocaleString()}</Typography>
                    <Button variant="contained" color="primary" onClick={() => handleRemoveItem(name)}>
                      Remove
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>

      {/* Custom Modal for Quantity Input */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: '8px',
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Enter Quantity for {itemName}
          </Typography>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            fullWidth
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            onClick={handleAddItem}
            sx={{
              backgroundColor: '#ff9aa2',
              ':hover': { backgroundColor: '#ffc1c1' },
              borderRadius: '8px',
              padding: '8px 24px',
              width: '100%',
            }}
          >
            Confirm
          </Button>
        </Box>
      </Modal>

      {/* Footer */}
      <Box className="footer" sx={{ padding: '20px 0', backgroundColor: '#f8f8f8', textAlign: 'center', marginTop: 'auto' }}>
        <a href="#" style={{ color: '#999', textDecoration: 'none', marginRight: '16px' }}>
          Terms & Conditions
        </a>
        <a href="#" style={{ color: '#999', textDecoration: 'none' }}>
          Privacy Policy
        </a>
      </Box>
    </Box>
  );
}
