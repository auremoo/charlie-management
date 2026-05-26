import { doc, getDoc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

const QUOTA_LIMIT = 4.5 * 1024 * 1024 * 1024; // 4.5 GB — bloque avant d'atteindre les 5 Go gratuits

export async function checkStorageQuota(): Promise<boolean> {
  const snap = await getDoc(doc(db, "storage_stats", "global"));
  if (!snap.exists()) return true;
  return (snap.data().bytes_used ?? 0) < QUOTA_LIMIT;
}

export async function addStorageUsage(bytes: number): Promise<void> {
  await setDoc(
    doc(db, "storage_stats", "global"),
    { bytes_used: increment(bytes) },
    { merge: true }
  );
}
