import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { API_BASE_URL } from './config.js';

// Firebase config for project: ecstatic-parsec-460011-q6
const firebaseConfig = {
    apiKey: "AIzaSyCSp0StrDJd-1Xbcqln0S3wgw5n3THXdNg",
    authDomain: "ecstatic-parsec-460011-q6.firebaseapp.com",
    projectId: "ecstatic-parsec-460011-q6",
    storageBucket: "ecstatic-parsec-460011-q6.firebasestorage.app",
    messagingSenderId: "349242512660",
    appId: "1:349242512660:web:9c16545750501847acde01"
};

let app, auth;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch (error) {
    console.warn("Firebase not properly configured yet. Using stub auth functions.");
}

export const registerUser = async (email, password, role) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send the role to our backend to persist in MongoDB
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firebaseUid: user.uid,
                email: user.email,
                role: role
            })
        });
        
        if (!response.ok) {
            console.error("Backend registration failed", await response.json());
        }
    } catch(err) {
        console.error("Failed to connect to backend:", err);
    }

    return user;
};

export const loginUser = async (email, password) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    return await signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
    if (!auth) return;
    return onAuthStateChanged(auth, callback);
};

export const getAuthToken = async () => {
    if (!auth || !auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
};
