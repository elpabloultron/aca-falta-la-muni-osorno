import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'aca-falta-la-muni-osorno',
  appId: '1:833044898630:web:4d5ec5b2039e1df4e07b47',
  storageBucket: 'aca-falta-la-muni-osorno.firebasestorage.app',
  apiKey: 'AIzaSyDjG0V8sw-s7RQRzUT3OmZH7j9bKL3SmQo',
  authDomain: 'aca-falta-la-muni-osorno.firebaseapp.com',
  messagingSenderId: '833044898630',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app);
