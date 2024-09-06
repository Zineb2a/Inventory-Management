import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Papa from 'papaparse'; // CSV parsing library
import * as XLSX from 'xlsx'; // Excel parsing library
import { collection, doc, setDoc, getDoc, writeBatch } from 'firebase/firestore'; // Firestore batch operations
import { firestore } from './firebase';
import { auth } from './firebase';


export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload and parse CSV or Excel
  const handleFileUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file first.');
      return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension === 'csv') {
      parseCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parseExcel(file);
    } else {
      setErrorMessage('Invalid file format. Please upload a CSV or Excel file.');
    }
  };

  // Parse CSV file using PapaParse
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const data = result.data;
        batchUpdateInventory(data);
      },
      error: (error) => {
        setErrorMessage('Error parsing CSV file: ' + error.message);
      }
    });
  };

  // Parse Excel file using xlsx library
  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      batchUpdateInventory(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  
  const batchUpdateInventory = async (data) => {
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('No user is logged in.');
      return;
    }
  
    const uid = user.uid;
    let batch = writeBatch(firestore); // Initialize Firestore batch
    let batchCounter = 0; // Counter to track the number of operations in the batch
  
    for (const item of data) {
      const itemName = item.name.toLowerCase();
      const quantity = parseInt(item.quantity);
      const docRef = doc(collection(firestore, `users/${uid}/inventory`), itemName);
  
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // If item exists, update its quantity
        const existingData = docSnap.data();
        batch.update(docRef, { quantity: existingData.quantity + quantity });
      } else {
        // If item does not exist, create a new item
        batch.set(docRef, { name: itemName, quantity, dateAdded: new Date(), status: 'active' });
      }
  
      batchCounter++;
  
      // If batch has reached the Firestore limit of 500 writes, commit and create a new batch
      if (batchCounter >= 500) {
        await batch.commit(); // Commit the current batch
        batch = writeBatch(firestore); // Start a new batch
        batchCounter = 0; // Reset the batch counter
      }
    }
  
    // Commit any remaining writes in the batch
    if (batchCounter > 0) {
      await batch.commit();
    }
  
    setErrorMessage('Inventory updated successfully.');
  };
  

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>

      <input type="file" onChange={handleFileChange} accept=".csv, .xlsx, .xls" />
      <Button
        variant="contained"
        onClick={handleFileUpload}
        sx={{ marginTop: '20px', backgroundColor: '#4caf50', ':hover': { backgroundColor: '#66bb6a' } }}
      >
        Upload File
      </Button>
      {errorMessage && (
        <Typography color="error" sx={{ marginTop: '20px', textAlign: 'center' }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
}
