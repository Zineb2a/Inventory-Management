'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, FormControl, Grid } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, getDocs, setDoc, deleteDoc, getDoc, doc, query, where } from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filter, setFilter] = useState('all');

  // Fetch and update the inventory from Firestore
  const updateInventory = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'inventory'));
      const inventoryList = [];
      snapshot.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error('Error fetching inventory:', error.message);
    }
  };

  // Sorting function
  const sortInventory = (inventory) => {
    switch (sortBy) {
      case 'name':
        return [...inventory].sort((a, b) => a.name.localeCompare(b.name));
      case 'quantity':
        return [...inventory].sort((a, b) => a.quantity - b.quantity); // Ascending by quantity
      case 'date':
        return [...inventory].sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded)); // Ascending by date
      default:
        return inventory;
    }
  };

  // Filtering function
  const filterInventory = (inventory) => {
    switch (filter) {
      case 'lowStock':
        return inventory.filter((item) => item.quantity < 5); // Filter by low stock
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Get date one week ago
        return inventory.filter((item) => new Date(item.dateAdded) >= oneWeekAgo); // Items added in last week
      case 'all':
      default:
        return inventory;
    }
  };

  // Search function
  const searchInventory = async (searchTerm) => {
    const q = query(
      collection(firestore, 'inventory'),
      where('name', '>=', searchTerm.toLowerCase()),
      where('name', '<=', searchTerm.toLowerCase() + '\uf8ff')
    );
    const docs = await getDocs(q);
    const searchResults = [];
    docs.forEach((doc) => {
      searchResults.push({ name: doc.id, ...doc.data() });
    });
    setInventory(searchResults);
  };

  // Add new item to Firestore
  const addItem = async (item) => {
    try {
      const lowercaseItem = item.toLowerCase();
      const docRef = doc(collection(firestore, 'inventory'), lowercaseItem);
      const docSnap = await getDoc(docRef);
      const currentTime = new Date();

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
      } else {
        await setDoc(docRef, { quantity: 1, dateAdded: currentTime });
      }
      await updateInventory();
    } catch (error) {
      console.error('Error adding item:', error.message);
    }
  };

  // Remove item from Firestore
  const removeItem = async (item) => {
    try {
      const lowercaseItem = item.toLowerCase();
      const docRef = doc(collection(firestore, 'inventory'), lowercaseItem);
      await deleteDoc(docRef);
      await updateInventory();
    } catch (error) {
      console.error('Error removing item:', error.message);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Main content should take all available space */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '20px' }}>
        {/* Title with more space from the top */}
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

        {/* Search bar */}
        <TextField
          label="Search Inventory"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              searchInventory(searchTerm);
            }
          }}
          sx={{
            width: '600px',
            marginBottom: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
          }}
        />

        {/* Input for adding new items with button next to it */}
        <FormControl sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Add Item"
            variant="outlined"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addItem(itemName);
                setItemName('');
              }
            }}
            sx={{ width: '400px', backgroundColor: '#fff', borderRadius: '8px' }}
          />
          <Button
            variant="contained"
            onClick={() => {
              addItem(itemName);
              setItemName('');
            }}
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
        <Box className="ctas" sx={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px' }}>
          {/* Sorting Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => setSortBy('name')}>
              Sort by Name
            </Button>
            <Button variant="outlined" onClick={() => setSortBy('quantity')}>
              Sort by Quantity
            </Button>
            <Button variant="outlined" onClick={() => setSortBy('date')}>
              Sort by Date Added
            </Button>
          </Box>

          {/* Filter Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => setFilter('lowStock')}>
              Filter by Low Stock
            </Button>
            <Button variant="outlined" onClick={() => setFilter('recent')}>
              Filter Recently Added
            </Button>
            <Button variant="outlined" onClick={() => setFilter('all')}>
              Show All
            </Button>
          </Box>
        </Box>

        {/* Inventory Grid Display */}
        <Grid container spacing={2} sx={{ marginTop: '20px', justifyContent: 'center', maxWidth: '1200px' }}>
          {sortInventory(filterInventory(inventory)).map(({ name, quantity, dateAdded }) => (
            <Grid item xs={12} sm={6} md={3} key={name}>
              <Box sx={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center', borderRadius: '8px' }}>
                <Typography variant="h6">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                <Typography>Quantity: {quantity}</Typography>
                <Typography>Date Added: {new Date(dateAdded.seconds * 1000).toLocaleString()}</Typography>
                <Button variant="contained" color="primary" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Footer at the bottom of the screen */}
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
