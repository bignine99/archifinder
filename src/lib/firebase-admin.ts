
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// When deployed to App Hosting, the Admin SDK is automatically initialized.
// For local development, we check if it's already initialized.
if (!admin.apps.length) {
  console.log("Initializing Firebase Admin SDK for LOCAL development...");
  try {
    admin.initializeApp();
    console.log("Firebase Admin SDK initialized successfully for LOCAL development.");
  } catch (error) {
    console.error(
      'CRITICAL LOCAL FAILURE: Could not initialize Firebase Admin SDK.',
      'This might happen if running locally without the emulator or proper gcloud authentication.',
      'Error:', error
    );
    throw new Error('Could not initialize Firebase Admin SDK for local dev.');
  }
}

const db = getFirestore();

export { db, admin };
