import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAJj9_ScFtpmEW0T2tJyUfy1zLR2kaR0TY",
    authDomain: "iarecetas-4e7a5.firebaseapp.com",
    projectId: "iarecetas-4e7a5",
    storageBucket: "iarecetas-4e7a5.firebasestorage.app",
    messagingSenderId: "170220216145",
    appId: "1:170220216145:web:13138ecc7e602beb253d70",
    measurementId: "G-EHBS3JFN9B"
};

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()