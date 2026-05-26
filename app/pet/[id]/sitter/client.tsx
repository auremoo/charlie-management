"use client";

import { useEffect, useState } from "react";
import { usePetId } from "@/lib/hooks/use-pet-id";
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Task } from "@/lib/types";

export default function SitterChecklistPage() {
  const petId = usePetId();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function load() {
      const snap = await getDocs(
        query(collection(db, "tasks"), where("pet_id", "==", petId))
      );
      const taskList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      taskList.sort((a, b) => a.sort_order - b.sort_order);

      const completionChecks = await Promise.all(
        taskList.map(async (task) => {
          const compDoc = await import("firebase/firestore").then(({ getDoc }) =>
            getDoc(doc(db, "task_completions", `${task.id}_${today}`))
          );
          return compDoc.exists() ? task.id : null;
        })
      );
      setCompletions(new Set(completionChecks.filter(Boolean) as string[]));
      setTasks(taskList);
      setLoading(false);
    }
    load();
  }, [petId, today]);

  async function toggle(taskId: string) {
    const isDone = completions.has(taskId);
    const compId = `${taskId}_${today}`;

    if (isDone) {
      await deleteDoc(doc(db, "task_completions", compId));
      setCompletions((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    } else {
      const uid = auth.currentUser?.uid ?? "";
      await setDoc(doc(db, "task_completions", compId), {
        task_id: taskId,
        completed_by: uid,
        completed_at: new Date().toISOString(),
        date: today,
      });
      setCompletions((prev) => new Set(prev).add(taskId));
    }
  }

  const doneCount = completions.size;
  const totalCount = tasks.length;
  const allDone = totalCount > 0 && doneCount === totalCount;
  const progress = totalCount ? (doneCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-5 h-5 rounded-full border-2 border-charlie-300 border-t-charlie-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
          Tâches du jour
        </h1>
        <p className="text-charlie-400 text-sm font-light mt-1">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-charlie-400 font-light uppercase tracking-widest">
            Progression
          </span>
          <span className="text-sm font-medium text-charlie-900 tabular-nums">
            {doneCount}/{totalCount}
          </span>
        </div>
        <div className="h-1 bg-charlie-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-charlie-900 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {allDone && (
          <p className="text-center text-charlie-500 text-sm font-light pt-2">
            Tout est fait, merci
          </p>
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {tasks.map((task) => {
          const done = completions.has(task.id);
          return (
            <button
              key={task.id}
              onClick={() => toggle(task.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left active:scale-[0.98] ${
                done
                  ? "bg-charlie-100/60"
                  : "bg-white shadow-sm shadow-charlie-100"
              }`}
            >
              <span className="text-xl">{task.emoji}</span>
              <span
                className={`flex-1 text-sm font-medium transition-colors ${
                  done ? "line-through text-charlie-300" : "text-charlie-900"
                }`}
              >
                {task.title}
              </span>
              <span
                className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all text-[10px] ${
                  done
                    ? "bg-charlie-900 border-charlie-900 text-white"
                    : "border-charlie-200"
                }`}
              >
                {done && "✓"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
