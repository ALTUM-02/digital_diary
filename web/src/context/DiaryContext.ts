import { useState, useCallback, useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";
import type { DiaryEntry, MediaItem, Mood } from "@/types";
import { useAuth } from "./AuthContext";
import {
  apiMyEntries,
  apiAllEntries,
  apiCreateEntry,
  apiUpdateEntry,
  apiDeleteEntry,
  apiGetEntry,
  USE_MOCK,
} from "@/lib/api";
import { MOCK_ENTRIES } from "@/lib/mock-data";

function DiaryProviderImpl() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch entries when user changes
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function fetchEntries() {
      setIsLoading(true);
      try {
        if (USE_MOCK) {
          // In mock mode, assign entries to the current user
          const userEntries = MOCK_ENTRIES.map((e) => ({
            ...e,
            authorId: user!.id,
            authorName: user!.name,
            authorAvatar: user!.avatar,
          }));
          if (mounted) setEntries(userEntries);
        } else {
          const data = await apiMyEntries();
          if (mounted) setEntries(data);
        }
      } catch (err) {
        console.error("[DiaryContext] Failed to fetch entries:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchEntries();

    return () => { mounted = false; };
  }, [user]);

  const userEntries = entries;

  const allEntries = useCallback(async (): Promise<DiaryEntry[]> => {
    if (USE_MOCK) return entries;
    return apiAllEntries();
  }, [entries]);

  const addEntry = useCallback(async (entry: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt" | "authorId" | "authorName" | "authorAvatar" | "wordCount">): Promise<DiaryEntry | null> => {
    if (!user) return null;

    const mediaInput = entry.media.map((m) => ({
      mediaType: m.type,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl || null,
      caption: m.caption || null,
      motionEffect: m.motionEffect,
    }));

    const result = await apiCreateEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
      typingStyleId: entry.typingStyleId,
      isPrivate: entry.isPrivate,
      media: mediaInput,
    });

    if (result) {
      // Ensure author info is set from current user
      const fullEntry: DiaryEntry = {
        ...result,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
      };
      setEntries((prev) => [fullEntry, ...prev]);
      return fullEntry;
    }
    return null;
  }, [user]);

  const updateEntry = useCallback(async (id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry | null> => {
    if (!user) return null;

    const mediaInput = updates.media?.map((m) => ({
      mediaType: m.type,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl || null,
      caption: m.caption || null,
      motionEffect: m.motionEffect,
    }));

    const result = await apiUpdateEntry(id, {
      title: updates.title,
      content: updates.content,
      mood: updates.mood,
      tags: updates.tags,
      typingStyleId: updates.typingStyleId,
      isPrivate: updates.isPrivate,
      media: mediaInput,
    });

    if (result) {
      const updated = {
        ...result,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
      };
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updated, updatedAt: new Date().toISOString() } : e)),
      );
      return updated;
    }
    return null;
  }, [user]);

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    const success = await apiDeleteEntry(id);
    if (success) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    return success;
  }, []);

  const getEntry = useCallback(async (id: string): Promise<DiaryEntry | null> => {
    // Check local state first
    const local = entries.find((e) => e.id === id);
    if (local) return local;

    // Fetch from API
    return apiGetEntry(id);
  }, [entries]);

  return {
    entries,
    userEntries,
    isLoading,
    allEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
  };
}

const [DiaryProvider, useDiary] = createContextHook(DiaryProviderImpl);

export { DiaryProvider, useDiary };
