import admin from 'firebase-admin';

if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin Initialized');
    } catch (error) {
      console.error('❌ Firebase Admin Initialization Error:', error.stack);
    }
  } else {
    console.warn('⚠️ Firebase Admin credentials missing. Skipping initialization during build phase.');
  }
}

export default admin;
