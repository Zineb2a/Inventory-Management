import { firestore } from './firebase';
import { auth } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore'; // Ensure deleteDoc is imported


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

export const removeItem = async (itemName, quantityToRemove) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is logged in.');
      return;
    }

    const uid = user.uid;
    const docRef = doc(firestore, `users/${uid}/inventory`, itemName.toLowerCase());

    // Fetch the document to check the current quantity
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentData = docSnap.data();
      const currentQuantity = currentData.quantity;

      if (currentQuantity >= quantityToRemove) {
        // Reduce the quantity or mark as inactive if it reaches 0
        const newQuantity = currentQuantity - quantityToRemove;
        if (newQuantity > 0) {
          await setDoc(docRef, { quantity: newQuantity }, { merge: true });
        } else {
          await setDoc(docRef, { quantity: 0, status: 'inactive' }, { merge: true });
        }
      } else {
        console.error('Not enough quantity to remove.');
        throw new Error('The quantity to remove exceeds the current stock.');
      }
    } else {
      console.error('Item not found.');
    }
  } catch (error) {
    console.error('Error removing item from Firestore:', error.message);
    throw error;
  }
};
