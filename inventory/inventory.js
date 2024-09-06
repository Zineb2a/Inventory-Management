// /src/firebase/inventory.js
import { firestore } from './firebase';
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { auth } from './firebase';

// Add a new item to the inventory
export const addItem = async (itemName, quantity) => {
  const user = auth.currentUser;
  if (user) {
    const uid = user.uid;
    const docRef = doc(collection(firestore, `inventory_${uid}`), itemName.toLowerCase());
    const docSnap = await getDoc(docRef);
    const currentTime = new Date();

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      await setDoc(docRef, { quantity: existingData.quantity + quantity }, { merge: true });
    } else {
      await setDoc(docRef, { quantity, dateAdded: currentTime }, { merge: true });
    }
  } else {
    console.error('No user is logged in.');
  }
};

// Fetch inventory data for the current user
export const fetchInventory = async () => {
  const user = auth.currentUser;
  if (user) {
    const uid = user.uid;
    const inventoryRef = collection(firestore, `inventory_${uid}`);
    const snapshot = await getDocs(inventoryRef);
    return snapshot.docs.map((doc) => ({ ...doc.data(), name: doc.id }));
  } else {
    console.error('No user is logged in.');
  }
};
