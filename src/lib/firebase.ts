import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query 
} from "firebase/firestore";
import { PathologyCase, NotificationLog } from "../types";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Firestore Collections
const CASES_COLLECTION = "cases";
const NOTIFS_COLLECTION = "notifications";

// Helper to remove 'undefined' fields because Firestore setDoc throws an error on undefined
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleanObj[key] = sanitizeForFirestore(value);
      } else {
        cleanObj[key] = value;
      }
    }
  }
  return cleanObj;
}

// Realtime Cases Listener
export function subscribeToCases(callback: (cases: PathologyCase[]) => void) {
  const q = query(collection(db, CASES_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const cases: PathologyCase[] = [];
    snapshot.forEach((docSnap) => {
      cases.push(docSnap.data() as PathologyCase);
    });
    // Sort descending by createdAt
    cases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(cases);
  }, (err) => {
    console.error("Firestore cases snapshot error:", err);
  });
}

// Realtime Notifications Listener
export function subscribeToNotifications(callback: (notifs: NotificationLog[]) => void) {
  const q = query(collection(db, NOTIFS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const notifs: NotificationLog[] = [];
    snapshot.forEach((docSnap) => {
      notifs.push(docSnap.data() as NotificationLog);
    });
    // Sort descending by timestamp
    notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(notifs);
  }, (err) => {
    console.error("Firestore notifications snapshot error:", err);
  });
}

// Save or Update Case to Firestore
export async function saveCaseToFirestore(pCase: PathologyCase) {
  try {
    const cleanCase = sanitizeForFirestore(pCase);
    const caseRef = doc(db, CASES_COLLECTION, pCase.id);
    await setDoc(caseRef, cleanCase, { merge: true });
    console.log("Successfully saved case to Firestore:", pCase.caseNumber);
  } catch (err) {
    console.error("Failed to save case to Firestore:", err);
  }
}

// Delete Case from Firestore
export async function deleteCaseFromFirestore(caseId: string) {
  try {
    const caseRef = doc(db, CASES_COLLECTION, caseId);
    await deleteDoc(caseRef);
    console.log("Successfully deleted case from Firestore:", caseId);
  } catch (err) {
    console.error("Failed to delete case from Firestore:", err);
  }
}

// Save Notification to Firestore
export async function saveNotificationToFirestore(notif: NotificationLog) {
  try {
    const cleanNotif = sanitizeForFirestore(notif);
    const notifRef = doc(db, NOTIFS_COLLECTION, notif.id);
    await setDoc(notifRef, cleanNotif, { merge: true });
    console.log("Successfully saved notification to Firestore:", notif.id);
  } catch (err) {
    console.error("Failed to save notification to Firestore:", err);
  }
}
