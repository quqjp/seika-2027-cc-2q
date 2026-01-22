import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
  // 
};

const app = initializeApp(firebaseConfig);

// ローカル環境ではデフォルトDB、本番ではdatabase2を使用
let database;
if (location.hostname === 'localhost') {
  database = getFirestore(app);
} else {
  database = getFirestore(app, 'database2');
}

export const db = database;
export const auth = getAuth();
export const storage = getStorage(app);

// ローカル環境では、エミュレーターに接続
if (location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}
