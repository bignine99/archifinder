

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

type ServiceAccountJSON = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

const sanitizePrivateKey = (key?: string) =>
  key ? key.replace(/\\n/g, '\n') : undefined;

const parseServiceAccount = (raw?: string): ServiceAccountJSON | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServiceAccountJSON;
  } catch (error) {
    console.error('FIREBASE_ADMIN: 서비스 계정 JSON 파싱 실패', error);
    return null;
  }
};

const resolveServiceAccount = (): admin.ServiceAccount | null => {
  const directJson =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  const decoded =
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
      ? Buffer.from(
          process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
          'base64'
        ).toString('utf-8')
      : undefined;

  const jsonFromEnv =
    directJson ||
    decoded ||
    (process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim().startsWith('{')
      ? process.env.GOOGLE_APPLICATION_CREDENTIALS
      : undefined);

  const parsed = parseServiceAccount(jsonFromEnv);
  if (parsed?.project_id && parsed?.client_email && parsed?.private_key) {
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: sanitizePrivateKey(parsed.private_key),
    };
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    };
  }

  return null;
};

if (!admin.apps.length) {
  try {
    const serviceAccount = resolveServiceAccount();

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      console.info('FIREBASE_ADMIN: 서비스 계정으로 초기화 완료');
    } else if (process.env.NODE_ENV !== 'production') {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      console.info('FIREBASE_ADMIN: 로컬 기본 자격증명으로 초기화');
    } else {
      throw new Error(
        '프로덕션 환경에서 Firebase Admin 자격증명 변수를 찾을 수 없습니다.'
      );
    }
  } catch (error) {
    console.error('FIREBASE_ADMIN: 초기화 실패', error);
    throw new Error('Firebase Admin SDK 초기화에 실패했습니다.');
  }
}

const db = getFirestore();

export { db, admin };
