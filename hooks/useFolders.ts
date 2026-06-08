"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createGuestFolder, readGuestFolders, readGuestNotes, writeGuestFolders, writeGuestNotes } from "@/lib/guestStorage";
import { supabase } from "@/lib/supabase/client";
import type { Folder } from "@/lib/types";

export function useFolders(user: User | null) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFolders = useCallback(async () => {
    setLoading(true);

    if (!user) {
      const guestFolders = readGuestFolders().sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
      setFolders(guestFolders);
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("folders")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    setError(queryError?.message || null);
    setFolders(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  async function createFolder(name: string) {
    if (!name.trim()) return;

    if (!user) {
      const nextFolders = [...readGuestFolders(), createGuestFolder(name.trim(), folders.length)];
      writeGuestFolders(nextFolders);
      setFolders(nextFolders);
      return;
    }

    const { error: insertError } = await supabase.from("folders").insert({
      user_id: user.id,
      name: name.trim(),
      sort_order: folders.length
    });
    if (insertError) setError(insertError.message);
    await loadFolders();
  }

  async function renameFolder(id: string, name: string) {
    if (!name.trim()) return;

    if (!user) {
      const now = new Date().toISOString();
      const nextFolders = readGuestFolders().map((folder) => (folder.id === id ? { ...folder, name: name.trim(), updated_at: now } : folder));
      writeGuestFolders(nextFolders);
      setFolders(nextFolders);
      return;
    }

    const { error: updateError } = await supabase.from("folders").update({ name: name.trim() }).eq("id", id);
    if (updateError) setError(updateError.message);
    await loadFolders();
  }

  async function deleteFolder(id: string) {
    if (!user) {
      const now = new Date().toISOString();
      const nextFolders = readGuestFolders().filter((folder) => folder.id !== id);
      const nextNotes = readGuestNotes().map((note) => (note.folder_id === id ? { ...note, folder_id: null, updated_at: now } : note));
      writeGuestFolders(nextFolders);
      writeGuestNotes(nextNotes);
      setFolders(nextFolders);
      return;
    }

    const { error: notesError } = await supabase.from("notes").update({ folder_id: null }).eq("folder_id", id);
    const { error: folderError } = await supabase.from("folders").delete().eq("id", id);
    setError(notesError?.message || folderError?.message || null);
    await loadFolders();
  }

  return { folders, loading, error, createFolder, renameFolder, deleteFolder, reloadFolders: loadFolders };
}

