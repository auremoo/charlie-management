"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Profile } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/login");
        setLoading(false);
        return;
      }
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const profileData: Profile = {
          id: firebaseUser.uid,
          name: firebaseUser.email?.split("@")[0] ?? null,
          created_at: new Date().toISOString(),
        };
        await setDoc(userRef, profileData);
        setProfile(profileData);
      } else {
        setProfile(snap.data() as Profile);
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [router]);

  return { user, profile, loading };
}
