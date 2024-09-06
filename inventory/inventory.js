import { firestore } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore'; // Ensure deleteDoc is imported
import { auth } from './firebase';

// Function to add an item to the user's inventory
export const addItem = async (itemName, quantity) => {
  const user = auth.currentUser;
  if (user) {
    const uid = user.uid;
    
    // Reference to the user's inventory sub-collection
    const docRef = doc(collection(firestore, `users/${uid}/inventory`), itemName.toLowerCase());

    // Check if the document for the item already exists
    const docSnap = await getDoc(docRef);
    const currentTime = new Date();

    if (docSnap.exists()) {
      // If item exists, update the quantity
      const existingData = docSnap.data();
      await setDoc(docRef, { quantity: existingData.quantity + quantity }, { merge: true });
    } else {
      // If item does not exist, create a new document with initial quantity and date
      await setDoc(docRef, { quantity, dateAdded: currentTime, status: 'active' }, { merge: true });
    }
  } else {
    console.error('No user is logged in.');
  }
};

// Function to fetch the user's inventory
export const fetchInventory = async () => {
  const user = auth.currentUser;
  if (user) {
    const uid = user.uid;
    
    // Reference to the user's inventory sub-collection
    const inventoryRef = collection(firestore, `users/${uid}/inventory`);
    const snapshot = await getDocs(inventoryRef);

    // Return the inventory items
    return snapshot.docs.map(doc => ({ ...doc.data(), name: doc.id }));
  } else {
    console.error('No user is logged in.');
  }
};

// Function to remove an item from the user's inventory
export const removeItem = async (itemName) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is logged in.');
      return;
    }

    const uid = user.uid;
    // Update the path to match the correct inventory location
    const docRef = doc(firestore, `users/${uid}/inventory`, itemName.toLowerCase());

    await deleteDoc(docRef);
    console.log(`${itemName} removed from inventory.`);
  } catch (error) {
    console.error('Error removing item from Firestore:', error.message);
  }
};
