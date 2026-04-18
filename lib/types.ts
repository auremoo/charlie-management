// === Profiles ===

export type Profile = {
  id: string;
  name: string | null;
  created_at: string;
};

// === Pets ===

export type Pet = {
  id: string;
  name: string;
  photo_url: string | null;
  owner_id: string;
  created_at: string;
};

export type PetWithRole = Pet & {
  role: "owner" | "sitter";
};

// === Pet Sitters ===

export type PetSitter = {
  id: string;
  pet_id: string;
  sitter_id: string;
  role: "sitter" | "owner";
  invited_at: string;
  profiles?: Profile;
};

// === Invite Codes ===

export type InviteCode = {
  id: string;
  pet_id: string;
  code: string;
  role: "sitter" | "owner";
  used_by: string | null;
  created_at: string;
};

// === Tasks ===

export type Task = {
  id: string;
  pet_id: string;
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

// === Vigilance ===

export type VigilancePoint = {
  id: string;
  pet_id: string;
  title: string;
  description: string | null;
  severity: "info" | "warning" | "danger";
  sort_order: number;
  created_at: string;
};

// === Tutorials ===

export type Tutorial = {
  id: string;
  pet_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  sort_order: number;
  created_at: string;
};

// === News ===

export type NewsItem = {
  id: string;
  pet_id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles?: Profile;
};

// === Photos ===

export type Photo = {
  id: string;
  pet_id: string;
  url: string;
  caption: string | null;
  author_id: string;
  created_at: string;
  profiles?: Profile;
};
