'use client';

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { firestore } from '@/firebase';
import {
  collection,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for search input

  // Function to fetch all inventory
  const updateInventory = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'inventory'));
      const inventoryList = [];
      snapshot.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() }); // Use the document ID as the item name
      });
      setInventory(inventoryList);
      console.log("Fetched Inventory:", inventoryList); // Log fetched data
    } catch (error) {
      console.error('Error fetching inventory:', error.message);
    }
  };

  // Function to search inventory by document ID (item name)
  const searchInventory = async (searchTerm) => {
    try {
      const lowercaseSearchTerm = searchTerm.toLowerCase(); // Normalize the search term to lowercase
      console.log("Searching for:", lowercaseSearchTerm); // Log the search term
      
      const snapshot = await getDocs(collection(firestore, 'inventory'));
      const searchResults = [];
      snapshot.forEach((doc) => {
        if (doc.id.toLowerCase().startsWith(lowercaseSearchTerm)) { // Match document ID (item name)
          searchResults.push({ name: doc.id, ...doc.data() });
        }
      });

      console.log("Search Results:", searchResults); // Log search results
      setInventory(searchResults);
    } catch (error) {
      console.error('Error searching inventory:', error.message);
    }
  };

  useEffect(() => {
    if (searchTerm === '') {
      // If search term is empty, load all inventory
      updateInventory();
    } else {
      // Perform search when there's a search term
      searchInventory(searchTerm);
    }
  }, [searchTerm]); // Re-run when search term changes

  const addItem = async (item) => {
    try {
      const lowercaseItem = item.toLowerCase(); // Store item names in lowercase
      const docRef = setDoc(doc(collection(firestore, 'inventory'), lowercaseItem), { quantity: 1 });
      await updateInventory();
    } catch (error) {
      console.error('Error adding item:', error.message);
    }
  };

  const removeItem = async (item) => {
    try {
      const lowercaseItem = item.toLowerCase(); // Match item names in lowercase
      const docRef = doc(collection(firestore, 'inventory'), lowercaseItem);
      await deleteDoc(docRef);
      await updateInventory();
    } catch (error) {
      console.error('Error removing item:', error.message);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>

      {/* Search bar */}
      <TextField
        label="Search Inventory"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Update search term state
        sx={{ marginBottom: '20px', width: '50%' }}
      />

      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {inventory.length > 0 ? (
            inventory.map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                minHeight="150px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#f0f0f0'}
                paddingX={5}
              >
                <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                  Quantity: {quantity}
                </Typography>
                <Button variant="contained" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Box>
            ))
          ) : (
            <Typography variant={'h6'} color={'#333'} textAlign={'center'}>
              No items found.
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
