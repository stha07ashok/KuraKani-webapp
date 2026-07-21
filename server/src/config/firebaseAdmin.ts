import * as admin from 'firebase-admin';
import * as fs from 'fs';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

export function ensureFirebaseInitialized() {
  if (admin.getApps().length > 0) return;

  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    admin.initializeApp({
      credential: admin.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.applicationDefault() });
  } else {
    admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  }
}