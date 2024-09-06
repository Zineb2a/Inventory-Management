

// /src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBH4dz_f0cDU0bDxe_o2eCR2Tfho02XSvg",
  authDomain: "management-2f908.firebaseapp.com",
  projectId: "management-2f908",
  storageBucket: "management-2f908.appspot.com",
  messagingSenderId: "31945057627",
  appId: "1:31945057627:web:7dc35bc9b4d6f6b5f3e67e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
