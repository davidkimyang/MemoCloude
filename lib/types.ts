export type Folder = {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  content: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FolderFilter = "all" | "pinned" | "recent" | "trash" | string;

