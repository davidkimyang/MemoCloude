"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createGuestNote, readGuestNotes, writeGuestNotes } from "@/lib/guestStorage";
import { supabase } from "@/lib/supabase/client";
import type { FolderFilter, Note } from "@/lib/types";

const baseFilters = ["all", "pinned", "recent", "trash"];

function filterGuestNotes(notes: Note[], selectedFilter: FolderFilter) {
  const visibleNotes = notes.filter((note) => (selectedFilter === "trash" ? note.is_deleted : !note.is_deleted));
  const filteredNotes = visibleNotes.filter((note) => {
    if (selectedFilter === "pinned") return note.is_pinned;
    if (baseFilters.includes(selectedFilter)) return true;
    return note.folder_id === selectedFilter;
  });

  return filteredNotes.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export function useNotes(user: User | null, selectedFilter: FolderFilter, search: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);

    if (!user) {
      setNotes(filterGuestNotes(readGuestNotes(), selectedFilter));
      setLoading(false);
      return;
    }

    let query = supabase.from("notes").select("*").order("is_pinned", { ascending: false }).order("updated_at", { ascending: false });

    if (selectedFilter === "trash") {
      query = query.eq("is_deleted", true);
    } else {
      query = query.eq("is_deleted", false);
      if (selectedFilter === "pinned") query = query.eq("is_pinned", true);
      if (!baseFilters.includes(selectedFilter)) query = query.eq("folder_id", selectedFilter);
    }

    const { data, error: queryError } = await query;
    setError(queryError?.message || null);
    setNotes(data || []);
    setLoading(false);
  }, [selectedFilter, user]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return notes;
    return notes.filter((note) => `${note.title} ${note.content || ""}`.toLowerCase().includes(term));
  }, [notes, search]);

  useEffect(() => {
    if (!filteredNotes.length) {
      setSelectedNoteId(null);
      return;
    }
    if (!selectedNoteId || !filteredNotes.some((note) => note.id === selectedNoteId)) {
      setSelectedNoteId(filteredNotes[0].id);
    }
  }, [filteredNotes, selectedNoteId]);

  async function createNote(folderId: string | null) {
    if (!user) {
      const note = createGuestNote(folderId);
      const nextNotes = [note, ...readGuestNotes()];
      writeGuestNotes(nextNotes);
      setNotes(filterGuestNotes(nextNotes, selectedFilter));
      setSelectedNoteId(note.id);
      return note;
    }

    const { data, error: insertError } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        folder_id: folderId,
        title: "새 메모",
        content: ""
      })
      .select("*")
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }

    await loadNotes();
    setSelectedNoteId(data.id);
    return data as Note;
  }

  async function updateNote(id: string, values: Partial<Pick<Note, "title" | "content" | "folder_id" | "is_pinned">>) {
    if (!user) {
      const now = new Date().toISOString();
      const nextNotes = readGuestNotes().map((note) => (note.id === id ? { ...note, ...values, updated_at: now } : note));
      writeGuestNotes(nextNotes);
      setNotes(filterGuestNotes(nextNotes, selectedFilter));
      return null;
    }

    const { error: updateError } = await supabase.from("notes").update(values).eq("id", id);
    if (updateError) setError(updateError.message);
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, ...values, updated_at: new Date().toISOString() } : note)));
    return updateError;
  }

  async function moveToTrash(id: string) {
    if (!user) {
      const now = new Date().toISOString();
      const nextNotes = readGuestNotes().map((note) => (note.id === id ? { ...note, is_deleted: true, deleted_at: now, updated_at: now } : note));
      writeGuestNotes(nextNotes);
      setNotes(filterGuestNotes(nextNotes, selectedFilter));
      return;
    }

    const { error: updateError } = await supabase
      .from("notes")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) setError(updateError.message);
    await loadNotes();
  }

  async function restoreNote(id: string) {
    if (!user) {
      const now = new Date().toISOString();
      const nextNotes = readGuestNotes().map((note) => (note.id === id ? { ...note, is_deleted: false, deleted_at: null, updated_at: now } : note));
      writeGuestNotes(nextNotes);
      setNotes(filterGuestNotes(nextNotes, selectedFilter));
      return;
    }

    const { error: updateError } = await supabase.from("notes").update({ is_deleted: false, deleted_at: null }).eq("id", id);
    if (updateError) setError(updateError.message);
    await loadNotes();
  }

  async function permanentlyDeleteNote(id: string) {
    if (!user) {
      const nextNotes = readGuestNotes().filter((note) => note.id !== id);
      writeGuestNotes(nextNotes);
      setNotes(filterGuestNotes(nextNotes, selectedFilter));
      return;
    }

    const { error: deleteError } = await supabase.from("notes").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    await loadNotes();
  }

  const selectedNote = filteredNotes.find((note) => note.id === selectedNoteId) || null;

  return {
    notes: filteredNotes,
    selectedNote,
    selectedNoteId,
    loading,
    error,
    setSelectedNoteId,
    createNote,
    updateNote,
    moveToTrash,
    restoreNote,
    permanentlyDeleteNote,
    reloadNotes: loadNotes
  };
}

