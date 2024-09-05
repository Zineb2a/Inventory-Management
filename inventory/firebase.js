// Import the necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "", // You mentioned you don't have an API key, so leave this empty.
  authDomain: "management-2f908.firebaseapp.com",
  projectId: "management-2f908",
  storageBucket: "management-2f908.appspot.com",
  messagingSenderId: "31945057627",
  appId: "1:31945057627:web:7dc35bc9b4d6f6b5f3e67e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

// Export Firestore for use in other parts of your app
export { firestore };
