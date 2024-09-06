'use client';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, FormControl, Grid, Modal } from '@mui/material';
import { signUp, logIn, logOut } from '../auth'; // Import Firebase auth functions
import { addItem, fetchInventory, removeItem } from '../inventory'; // Import Firestore inventory functions

export default function Home() {
  // Authentication state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null); // Track logged-in user
  const [errorMessage, setErrorMessage] = useState('');

  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // For search bar functionality
  const [sortBy, setSortBy] = useState('name'); // Sorting
  const [filter, setFilter] = useState('all'); // Filtering
  const [open, setOpen] = useState(false); // Control modal visibility

  // Fetch inventory for authenticated users
  const fetchAllProducts = async () => {
    try {
      const data = await fetchInventory();
      setInventory(data);
    } catch (error) {
      setErrorMessage('Error fetching inventory: ' + error.message);
    }
  };

  // Check user login status and fetch inventory if logged in
  useEffect(() => {
    if (user) {
      fetchAllProducts();
    }
  }, [user]);

  // Handle sign-up with email and password
  const handleSignUp = async () => {
    try {
      const newUser = await signUp(email, password);
      setUser(newUser);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Handle log-in with email and password
  const handleLogIn = async () => {
    try {
      const loggedInUser = await logIn(email, password);
      setUser(loggedInUser);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Handle log-out
  const handleLogOut = async () => {
    try {
      await logOut();
      setUser(null);
      setInventory([]); // Clear inventory when logged out
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Add or update an item with quantity in the modal
  const handleAddItem = async () => {
    if (itemName && quantity > 0) {
      try {
        await addItem(itemName, quantity);
        fetchAllProducts(); // Refresh the inventory
        setOpen(false); // Close modal after adding item
        setItemName(''); // Reset item name
        setQuantity(1); // Reset quantity
        setErrorMessage('');
      } catch (error) {
        setErrorMessage('Error adding item: ' + error.message);
      }
    } else {
      setErrorMessage('Please enter a valid item name and quantity.');
    }
  };

  // Remove an item
  const handleRemoveItem = async (item) => {
    try {
      await removeItem(item);
      fetchAllProducts(); // Refresh the inventory
    } catch (error) {
      setErrorMessage('Error removing item: ' + error.message);
    }
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

  // Handle opening/closing the modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', padding: '20px' }}>
      <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff6f61', marginBottom: '20px' }}>
        Inventory Management
      </Typography>

      {!user ? (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      padding: '40px',
      border: '1px solid #ddd',
      borderRadius: '12px',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      width: '400px',
      margin: '0 auto',
      backgroundColor: '#fff',
    }}
  >
    <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff6f61', marginBottom: '20px' }}>
      Sign In / Sign Up
    </Typography>

    <TextField
      label="Email"
      variant="outlined"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      sx={{
        width: '100%',
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        },
      }}
    />
    <TextField
      label="Password"
      type="password"
      variant="outlined"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      sx={{
        width: '100%',
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        },
      }}
    />
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: '20px' }}>
      <Button
        variant="contained"
        onClick={handleSignUp}
        sx={{
          backgroundColor: '#ff6f61',
          ':hover': {
            backgroundColor: '#ff8a75',
          },
          borderRadius: '24px',
          padding: '10px 20px',
        }}
      >
        Sign Up
      </Button>
      <Button
        variant="outlined"
        onClick={handleLogIn}
        sx={{
          color: '#ff6f61',
          borderColor: '#ff6f61',
          ':hover': {
            backgroundColor: '#ffebeb',
            borderColor: '#ff8a75',
          },
          borderRadius: '24px',
          padding: '10px 20px',
        }}
      >
        Log In
      </Button>
    </Box>
    {errorMessage && (
      <Typography color="error" sx={{ marginTop: '20px', textAlign: 'center' }}>
        {errorMessage}
      </Typography>
    )}
  </Box>
) : (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    <Typography>Welcome, {user.email}!</Typography>
    <Button
      variant="contained"
      onClick={handleLogOut}
      sx={{
        backgroundColor: '#ff6f61',
        ':hover': {
          backgroundColor: '#ff8a75',
        },
        borderRadius: '24px',
        padding: '10px 20px',
      }}
    >
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

          {/* Add New Item Button */}
          <Button
            variant="contained"
            onClick={handleOpen} // Open modal when clicking on Add New Item
            sx={{
              backgroundColor: '#ff9aa2',
              ':hover': { backgroundColor: '#ffc1c1' },
              borderRadius: '8px',
              padding: '8px 24px',
              marginBottom: '20px',
            }}
          >
            Add New Item
          </Button>

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
        </Box>
      )}

      {/* Custom Modal for Adding Item */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ ...modalStyles }}>
          <Typography variant="h6">Enter Item Name and Quantity</Typography>
          <TextField
            label="Item Name"
            variant="outlined"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
            sx={{ marginBottom: '20px' }}
          />
          <TextField
            label="Quantity"
            type="number"
            variant="outlined"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            fullWidth
            sx={{ marginBottom: '20px' }}
          />
          <Button variant="contained" onClick={handleAddItem}>Add Item</Button>
        </Box>
      </Modal>
    </Box>
  );
}

// Custom Modal Styles
const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};
