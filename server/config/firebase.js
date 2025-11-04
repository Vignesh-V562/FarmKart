const admin = require('firebase-admin');

// Try to load service account from file, then from env var. If neither is present,
// export a stub so the app can start and provide a clear runtime error when
// attempting to use Firebase uploads.
let serviceAccount;
let firebaseConfigured = true;

try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (err) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err2) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable contains invalid JSON.');
      firebaseConfigured = false;
    }
  } else {
    console.warn('⚠️ Firebase service account JSON not found at ./serviceAccountKey.json and FIREBASE_SERVICE_ACCOUNT env var is not set. Firebase uploads will be disabled.');
    firebaseConfigured = false;
  }
}

let bucket = null;

if (firebaseConfigured) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined, // Your Firebase Storage bucket URL
  });

  bucket = admin.storage().bucket();
} else {
  // Export a minimal stub that throws a helpful error when used.
  bucket = {
    file: () => {
      throw new Error('Firebase is not configured. Provide a serviceAccountKey.json in server/config or set FIREBASE_SERVICE_ACCOUNT env var.');
    },
    name: process.env.FIREBASE_STORAGE_BUCKET || 'UNCONFIGURED_FIREBASE_BUCKET',
  };
}

module.exports = { bucket, admin, firebaseConfigured };