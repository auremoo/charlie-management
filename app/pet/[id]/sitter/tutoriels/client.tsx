"use client";

import { useEffect, useState } from "react";
import { usePetId } from "@/lib/hooks/use-pet-id";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Tutorial } from "@/lib/types";

export default function SitterTutorielsPage() {
  const petId = usePetId();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(
        query(collection(db, "tutorials"), where("pet_id", "==", petId))
      );
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Tutorial));
      data.sort((a, b) => a.sort_order - b.sort_order);
      setTutorials(data);
    }
    load();
  }, [petId]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
          Guides
        </h1>
        <p className="text-charlie-400 text-sm font-light mt-1">
          Tout savoir sur Charlie
        </p>
      </div>

      <div className="space-y-4">
        {tutorials.map((tuto) => (
          <div
            key={tuto.id}
            className="bg-white rounded-2xl shadow-sm shadow-charlie-100 overflow-hidden"
          >
            {tuto.video_url ? (
              <div className="aspect-video">
                <iframe
                  src={tuto.video_url.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                  title={tuto.title}
                />
              </div>
            ) : (
              <div className="aspect-video bg-charlie-100/50 flex items-center justify-center">
                <span className="text-charlie-200 text-sm font-light">
                  Vidéo à venir
                </span>
              </div>
            )}
            <div className="p-5 space-y-1">
              <h2 className="font-medium text-sm text-charlie-900">
                {tuto.title}
              </h2>
              {tuto.description && (
                <p className="text-charlie-400 text-sm font-light leading-relaxed">
                  {tuto.description}
                </p>
              )}
            </div>
          </div>
        ))}

        {tutorials.length === 0 && (
          <p className="text-center text-charlie-300 py-16 text-sm font-light">
            Aucun guide pour le moment
          </p>
        )}
      </div>
    </div>
  );
}
