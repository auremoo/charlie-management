import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Profile } from "@/lib/types";

export async function ensureProfile(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        resolve(null);
        return;
      }
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const profileData: Profile = {
          id: user.uid,
          name: user.email?.split("@")[0] ?? null,
          created_at: new Date().toISOString(),
        };
        await setDoc(userRef, profileData);
      }
      resolve(user);
    });
  });
}
