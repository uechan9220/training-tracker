// Firebase (Google認証 + Firestore) 連携レイヤー。
// app.js からは window.cloudSync 経由でのみ利用します。
// このファイルが読み込めない/失敗しても、アプリはローカル保存のみで動作を続けます。

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPVVAW5cJKSHPPR2pOBJqqD34pnLGPzkg",
  authDomain: "training-tracker-29919.firebaseapp.com",
  projectId: "training-tracker-29919",
  storageBucket: "training-tracker-29919.firebasestorage.app",
  messagingSenderId: "757875326173",
  appId: "1:757875326173:web:7123c97ed7cfb21fc86f34"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let authResolved = false;
let unsubscribeSnapshot = null;
const authChangeListeners = [];

function userDocRef(uid) {
  return doc(db, "users", uid);
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  authResolved = true;
  authChangeListeners.forEach((cb) => cb(user));
});

getRedirectResult(auth).catch((err) => {
  console.error("google sign-in redirect error", err);
});

window.cloudSync = {
  isSignedIn() {
    return !!currentUser;
  },
  getUser() {
    return currentUser;
  },
  onAuthChange(cb) {
    authChangeListeners.push(cb);
    if (authResolved) cb(currentUser);
  },
  signIn() {
    return signInWithRedirect(auth, provider);
  },
  signOutUser() {
    if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = null; }
    return signOut(auth);
  },
  async loadState() {
    if (!currentUser) return null;
    const snap = await getDoc(userDocRef(currentUser.uid));
    return snap.exists() ? snap.data() : null;
  },
  async saveState(data) {
    if (!currentUser) return;
    await setDoc(userDocRef(currentUser.uid), { ...data, updatedAt: Date.now() });
  },
  subscribeState(cb) {
    if (!currentUser) return;
    if (unsubscribeSnapshot) unsubscribeSnapshot();
    unsubscribeSnapshot = onSnapshot(userDocRef(currentUser.uid), (snap) => {
      if (snap.exists()) cb(snap.data());
    });
  }
};

window.dispatchEvent(new Event("cloudsync-ready"));
