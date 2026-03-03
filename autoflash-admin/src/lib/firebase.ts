import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC1B8MJXhh6n_WeFzQdHASMC7YibI6NN0g",
  authDomain: "autoflash-23806.firebaseapp.com",
  projectId: "autoflash-23806",
  storageBucket: "autoflash-23806.firebasestorage.app",
  messagingSenderId: "999555092437",
  appId: "1:999555092437:web:76b7666913c3867dabb75c",
  measurementId: "G-CMDN8BRES8",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Analytics is only available in the browser and may be unsupported in some environments.
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

export default app;
