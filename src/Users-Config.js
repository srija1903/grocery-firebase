import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA9ZzM5EwufjkdMBf3zoXrIa3XI7ZqucBA",
  authDomain: "grocery-adfa9.firebaseapp.com",
  projectId: "grocery-adfa9",
  storageBucket: "grocery-adfa9.appspot.com",
  messagingSenderId: "158584481632",
  appId: "1:158584481632:web:81a2b8da932dee53dc2005",
  measurementId: "G-FXDXKYH9RM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default firebaseConfig;