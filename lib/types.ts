export type Role = "owner" | "cat_sitter";

export type Profile = {
  id: string;
  role: Role;
  name: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  emoji: string;
  sort_order: number;
  created_at: string;
};

export type TaskCompletion = {
  id: string;
  task_id: string;
  completed_by: string;
  completed_at: string;
  date: string;
};

export type VigilancePoint = {
  id: string;
  title: string;
  description: string | null;
  severity: "info" | "warning" | "danger";
  sort_order: number;
  created_at: string;
};

export type Tutorial = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  sort_order: number;
  created_at: string;
};

export type NewsItem = {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles?: Profile;
};

export type Photo = {
  id: string;
  url: string;
  caption: string | null;
  author_id: string;
  created_at: string;
  profiles?: Profile;
};

// Type générique pour Supabase (simplifié, sans génération automatique)
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, "created_at">; Update: Partial<Profile> };
      tasks: { Row: Task; Insert: Omit<Task, "id" | "created_at">; Update: Partial<Task> };
      task_completions: { Row: TaskCompletion; Insert: Omit<TaskCompletion, "id" | "completed_at">; Update: Partial<TaskCompletion> };
      vigilance_points: { Row: VigilancePoint; Insert: Omit<VigilancePoint, "id" | "created_at">; Update: Partial<VigilancePoint> };
      tutorials: { Row: Tutorial; Insert: Omit<Tutorial, "id" | "created_at">; Update: Partial<Tutorial> };
      news: { Row: NewsItem; Insert: Omit<NewsItem, "id" | "created_at">; Update: Partial<NewsItem> };
      photos: { Row: Photo; Insert: Omit<Photo, "id" | "created_at">; Update: Partial<Photo> };
    };
  };
};
