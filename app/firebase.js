import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC2bXY514gP2FbinddsU071ySma8V_8PeY",
  authDomain: "inventory-management-app-ca45e.firebaseapp.com",
  projectId: "inventory-management-app-ca45e",
  storageBucket: "inventory-management-app-ca45e.appspot.com",
  messagingSenderId: "1080894091719",
  appId: "1:1080894091719:web:1732d2015d33cb5b33a9e2",
  measurementId: "G-ZX85XQX0ED"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export const auth = getAuth(app);

export { firestore };