/* =========================================================
   NEXT DIGITAL — FIREBASE INIT
   =========================================================

   Loads the Firebase SDK from the gstatic CDN as ES modules
   (no bundler / build step required) and initializes a single
   shared app + Firestore instance for the whole site.

   Pinned to 12.18.0 to match the version in package.json.
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import {
    getAnalytics,
    isSupported as analyticsIsSupported
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyCxEELXK4Xn4OXuYkg90GWBW9naAAkha3Q",
    authDomain: "next-digital-7e744.firebaseapp.com",
    projectId: "next-digital-7e744",
    storageBucket: "next-digital-7e744.firebasestorage.app",
    messagingSenderId: "380138014228",
    appId: "1:380138014228:web:75b27dc7b276feed4e4901",
    measurementId: "G-ETJQF9M64K"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Analytics only works in a secure browser context (https/localhost) with a
// supported environment — guard it so it never breaks the rest of the SDK.
export const analytics = analyticsIsSupported()
    .then(supported => (supported ? getAnalytics(app) : null))
    .catch(() => null);

/**
 * Writes a contact form submission to the `contactSubmissions`
 * collection in Cloud Firestore.
 *
 * @param {Record<string, unknown>} fields - Plain form fields.
 * @returns {Promise<string>} The new document ID.
 */
export async function addContactSubmission(fields) {
    const docRef = await addDoc(collection(db, "contactSubmissions"), {
        ...fields,
        userAgent: navigator.userAgent,
        page: window.location.pathname,
        submittedAt: serverTimestamp()
    });

    return docRef.id;
}

// Expose for classic (non-module) scripts that load before this module.
window.addContactSubmission = addContactSubmission;
