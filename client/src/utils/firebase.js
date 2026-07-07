// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewai-54925.firebaseapp.com",
  projectId: "interviewai-54925",
  storageBucket: "interviewai-54925.firebasestorage.app",
  messagingSenderId: "947382795643",
  appId: "1:947382795643:web:4c52bac68a851bf22711de",
  measurementId: "G-0GJKYDK66M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
const provider=new GoogleAuthProvider()
provider.setCustomParameters({ prompt: "select_account" })
export{auth,provider}