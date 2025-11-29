

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // 배포 환경: 환경 변수에서 서비스 계정 키 사용
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized with service account from env.');
    } else {
      // 로컬 개발: 기본 인증 방식 사용
      admin.initializeApp();
      console.log('Firebase Admin SDK initialized with default credentials.');
    }
  } catch (error) {
    console.error(
      'CRITICAL FAILURE: Could not initialize Firebase Admin SDK.',
      'Error:', error
    );
    throw new Error('Could not initialize Firebase Admin SDK.');
  }
}

const db = getFirestore();

export { db, admin };
