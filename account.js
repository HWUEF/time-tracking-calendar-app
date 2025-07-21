import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyD5b-_8royvsrVzDduOCDfI8_qPIXjBRDY",
        authDomain: "time-tracking-calendar-8c3b4.firebaseapp.com",
        projectId: "time-tracking-calendar-8c3b4",
        storageBucket: "time-tracking-calendar-8c3b4.firebasestorage.app",
        messagingSenderId: "1073442948302",
        appId: "1:1073442948302:web:6003964e85ae945a50bc9f",
        measurementId: "G-MS8TK0MG2K"
    };

    // 2. Initialize Firebase and get the services
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar');

    // 3. Get DOM elements
    const authButton = document.querySelector('.auth-button');
    const authContainer = authButton.parentElement;
    let authPopup = null; // To hold a reference to the popup element
    
    // 4. Define UI update functions

    /** Handles the sign-out process. */
    const handleSignOut = () => {
        signOut(auth).catch((error) => console.error("Sign out error:", error));
        // onAuthStateChanged will automatically handle the UI update.
    };

    /** Creates and toggles the visibility of the user profile popup. */
    const toggleUserProfilePopup = (user) => {
        // If popup exists, remove it and stop.
        if (authPopup) {
            authPopup.remove();
            authPopup = null;
            return;
        }

        // Create the popup element
        authPopup = document.createElement('div');
        authPopup.className = 'auth-popup';
        authPopup.innerHTML = `
            <div class="auth-popup-header">
                <img src="${user.photoURL}" alt="User avatar" class="auth-popup-avatar">
                <div class="auth-popup-user-info">
                    <span class="auth-popup-name">${user.displayName}</span>
                    <span class="auth-popup-email">${user.email}</span>
                </div>
            </div>
            <div class="auth-popup-actions">
                <button class="pill-button logout-button">
                    <span class="material-symbols-outlined">logout</span>
                    Sign Out
                </button>
            </div>
        `;

        authContainer.appendChild(authPopup);

        // Add event listener to the new sign-out button
        authPopup.querySelector('.logout-button').addEventListener('click', handleSignOut);
    };

    // 5. Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        if (authPopup) { // Close any open popup when auth state changes
            authPopup.remove();
            authPopup = null;
        }
        if (user) { // --- User is signed IN ---
            authButton.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}" class="auth-avatar">`;
            authButton.setAttribute('aria-label', `View profile for ${user.displayName}`);
            authButton.onclick = () => toggleUserProfilePopup(user);
        } else { // --- User is signed OUT ---
            authButton.innerHTML = `<span class="material-symbols-outlined">account_circle</span>`;
            authButton.setAttribute('aria-label', 'Log in with Google');
            authButton.onclick = () => {
                signInWithPopup(auth, provider).catch((error) => console.error("Authentication Error:", error.message));
            };
        }
    });