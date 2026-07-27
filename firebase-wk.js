import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const config = {
  apiKey: "AIzaSyDf_QGGsncAlU14h_CCw6mryT0Ya-6tuNE",
  authDomain: "workout-b4db3.firebaseapp.com",
  projectId: "workout-b4db3",
  storageBucket: "workout-b4db3.firebasestorage.app",
  messagingSenderId: "886467650153",
  appId: "1:886467650153:web:e8a1b8b685de32bb7bb8f8"
};

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

setPersistence(auth, browserLocalPersistence).catch(() => {});

const WK = {
  _cbs: [], _last: undefined,
  onAuth(cb) { this._cbs.push(cb); if (this._last !== undefined) cb(this._last); },
  async signInGoogle() {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      const c = (e && e.code) || "";
      if (c.includes("popup-blocked") || c.includes("popup-closed") || c.includes("cancelled-popup") ||
          c.includes("operation-not-supported") || c.includes("argument-error") || c.includes("internal-error")) {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw e;
    }
  },
  signOut() { return signOut(auth); },
  _ref(uid) { return doc(db, "workouts", uid); },
  getDoc(uid) { return getDoc(this._ref(uid)); },
  setDoc(uid, data) { return setDoc(this._ref(uid), data, { merge: true }); },
  onDoc(uid, cb, err) { return onSnapshot(this._ref(uid), cb, err); }
};
window.WK = WK;

getRedirectResult(auth).catch((e) => { try { console.error("redirect", e); } catch (_) {} });
onAuthStateChanged(auth, (u) => { WK._last = u; WK._cbs.slice().forEach((cb) => cb(u)); });
window.dispatchEvent(new Event("wk-ready"));
