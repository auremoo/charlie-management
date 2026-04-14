"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";

export default function ChecklistPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: t }, { data: c }] = await Promise.all([
        supabase.from("tasks").select("*").order("sort_order"),
        supabase.from("task_completions").select("task_id").eq("date", today),
      ]);
      setTasks(t ?? []);
      setCompletions(new Set((c ?? []).map((x: { task_id: string }) => x.task_id)));
      setLoading(false);
    }
    load();
  }, [today]);

  async function toggle(taskId: string) {
    const supabase = createClient();
    const isDone = completions.has(taskId);

    if (isDone) {
      await supabase
        .from("task_completions")
        .delete()
        .eq("task_id", taskId)
        .eq("date", today);
      setCompletions((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("task_completions").insert({
        task_id: taskId,
        completed_by: user!.id,
        date: today,
      });
      setCompletions((prev) => new Set(prev).add(taskId));
    }
  }

  const doneCount = completions.size;
  const totalCount = tasks.length;
  const allDone = totalCount > 0 && doneCount === totalCount;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-charlie-400 text-4xl animate-pulse">🐱</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-charlie-800">
          Tâches du jour
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Barre de progression */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progression</span>
          <span className="font-semibold text-charlie-700">
            {doneCount}/{totalCount}
          </span>
        </div>
        <div className="h-3 bg-charlie-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-charlie-500 rounded-full transition-all duration-500"
            style={{ width: `${totalCount ? (doneCount / totalCount) * 100 : 0}%` }}
          />
        </div>
        {allDone && (
          <p className="text-center text-charlie-600 font-medium text-sm pt-1">
            Tout est fait ! Merci 🎉
          </p>
        )}
      </div>

      {/* Liste des tâches */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const done = completions.has(task.id);
          return (
            <button
              key={task.id}
              onClick={() => toggle(task.id)}
              className={`w-full flex items-center gap-3 sm:gap-4 p-4 rounded-2xl border-2 transition-all text-left active:scale-[0.98] ${
                done
                  ? "bg-charlie-50 border-charlie-300"
                  : "bg-white border-gray-100 hover:border-charlie-200"
              }`}
            >
              <span className="text-2xl sm:text-3xl">{task.emoji}</span>
              <span
                className={`flex-1 font-medium text-base sm:text-lg ${
                  done ? "line-through text-charlie-400" : "text-gray-800"
                }`}
              >
                {task.title}
              </span>
              <span
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  done
                    ? "bg-charlie-500 border-charlie-500 text-white"
                    : "border-gray-300"
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
