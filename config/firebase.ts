// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyCObb7t8-gYwW0eRfeCtLt9-ecpgRn2I-o",
  authDomain: "exercise-d501f.firebaseapp.com",
  projectId: "exercise-d501f",
  storageBucket: "exercise-d501f.appspot.com",
  messagingSenderId: "350594275780",
  appId: "1:350594275780:web:55180c31b80698a028ec91",
  measurementId: "G-8CW3JE3WM8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app);
