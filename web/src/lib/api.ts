/**
 * GraphQL API client for DiaryVerse.
 * Communicates with the Django + Graphene backend.
 * Falls back to mock data when the backend is unreachable (dev mode).
 */

import { GraphQLClient } from "graphql-request";
import type {
  User,
  DiaryEntry,
  MediaItem,
  Mood,
} from "@/types";
import { MOCK_USERS, MOCK_ENTRIES } from "@/lib/mock-data";

// --- Configuration ---

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/graphql/";
const TOKEN_KEY = "diaryverse_token";
const USE_MOCK = !import.meta.env.VITE_API_URL;

// --- Token management ---

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// --- GraphQL client ---

function getClient(): GraphQLClient {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return new GraphQLClient(API_URL, { headers });
}

// --- Mock helpers ---

function mockUserToGraphQLUser(u: typeof MOCK_USERS[0]): GraphQLUser {
  return {
    id: u.id,
    username: u.email,
    email: u.email,
    firstName: u.name.split(" ")[0] || "",
    lastName: u.name.split(" ").slice(1).join(" ") || "",
    dateJoined: u.joinedDate,
    entriesCount: u.entriesCount,
    profile: {
      id: `profile-${u.id}`,
      avatar: u.avatar,
      role: u.role,
    },
  };
}

function mockEntryToGraphQLEntry(e: DiaryEntry): GraphQLEntry {
  return {
    id: e.id,
    title: e.title,
    content: e.content,
    mood: e.mood,
    tags: e.tags,
    typingStyleId: e.typingStyleId,
    isPrivate: e.isPrivate,
    wordCount: e.wordCount,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    authorName: e.authorName,
    authorAvatar: e.authorAvatar,
    media: e.media.map((m) => ({
      id: m.id,
      mediaType: m.type,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl || null,
      caption: m.caption || null,
      motionEffect: m.motionEffect,
      createdAt: e.createdAt,
    })),
  };
}

// --- Types (GraphQL response shapes) ---

export interface GraphQLUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateJoined: string;
  entriesCount: number;
  profile: {
    id: string;
    avatar: string;
    role: "admin" | "user";
  };
}

export interface GraphQLEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  typingStyleId: string;
  isPrivate: boolean;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorAvatar: string;
  media: {
    id: string;
    mediaType: "image" | "video";
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
    motionEffect: string;
    createdAt: string;
  }[];
}

export interface AuthResult {
  token: string | null;
  user: GraphQLUser | null;
  success: boolean;
  error: string | null;
}

// --- Transform helpers ---

function graphQLUserToUser(u: GraphQLUser): User {
  return {
    id: String(u.id),
    name: `${u.firstName} ${u.lastName}`.trim() || u.username,
    email: u.email,
    role: u.profile.role,
    avatar: u.profile.avatar,
    joinedDate: u.dateJoined,
    entriesCount: u.entriesCount,
  };
}

function graphQLEntryToDiaryEntry(e: GraphQLEntry): DiaryEntry {
  return {
    id: String(e.id),
    title: e.title,
    content: e.content,
    mood: e.mood as Mood,
    tags: e.tags,
    typingStyleId: e.typingStyleId,
    isPrivate: e.isPrivate,
    wordCount: e.wordCount,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    authorId: "",
    authorName: e.authorName,
    authorAvatar: e.authorAvatar,
    media: e.media.map((m): MediaItem => ({
      id: String(m.id),
      type: m.mediaType,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl || undefined,
      caption: m.caption || undefined,
      motionEffect: m.motionEffect as MediaItem["motionEffect"],
    })),
  };
}

// --- API functions ---

/** Login with email + password */
export async function apiLogin(email: string, password: string): Promise<{ user: User; token: string } | null> {
  if (USE_MOCK) {
    const found = MOCK_USERS.find((u) => u.email === email);
    if (found) {
      const token = `mock-token-${found.id}`;
      setToken(token);
      return { user: found, token };
    }
    return null;
  }

  try {
    const client = getClient();
    const data = await client.request<{
      login: AuthResult;
    }>(`
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          success
          error
          user {
            id
            username
            email
            firstName
            lastName
            dateJoined
            entriesCount
            profile {
              id
              avatar
              role
            }
          }
        }
      }
    `, { email, password });

    if (data.login.success && data.login.token && data.login.user) {
      setToken(data.login.token);
      return { user: graphQLUserToUser(data.login.user), token: data.login.token };
    }
    return null;
  } catch (err) {
    console.error("[API] Login failed:", err);
    return null;
  }
}

/** Register a new user */
export async function apiRegister(username: string, email: string, password: string, name?: string): Promise<{ user: User; token: string } | null> {
  if (USE_MOCK) {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name || username,
      email,
      role: "user",
      avatar: `https://i.pravatar.cc/150?u=${username}`,
      joinedDate: new Date().toISOString(),
      entriesCount: 0,
    };
    const token = `mock-token-${newUser.id}`;
    setToken(token);
    return { user: newUser, token };
  }

  try {
    const client = getClient();
    const data = await client.request<{
      register: AuthResult;
    }>(`
      mutation Register($username: String!, $email: String!, $password: String!, $name: String) {
        register(username: $username, email: $email, password: $password, name: $name) {
          token
          success
          error
          user {
            id
            username
            email
            firstName
            lastName
            dateJoined
            entriesCount
            profile {
              id
              avatar
              role
            }
          }
        }
      }
    `, { username, email, password, name });

    if (data.register.success && data.register.token && data.register.user) {
      setToken(data.register.token);
      return { user: graphQLUserToUser(data.register.user), token: data.register.token };
    }
    return null;
  } catch (err) {
    console.error("[API] Register failed:", err);
    return null;
  }
}

/** Fetch current user (me) */
export async function apiMe(): Promise<User | null> {
  if (USE_MOCK) {
    return null; // mock uses localStorage directly
  }

  try {
    const client = getClient();
    const data = await client.request<{
      me: GraphQLUser | null;
    }>(`
      query Me {
        me {
          id
          username
          email
          firstName
          lastName
          dateJoined
          entriesCount
          profile {
            id
            avatar
            role
          }
        }
      }
    `);

    return data.me ? graphQLUserToUser(data.me) : null;
  } catch (err) {
    console.error("[API] Me failed:", err);
    return null;
  }
}

/** Fetch current user's entries */
export async function apiMyEntries(): Promise<DiaryEntry[]> {
  if (USE_MOCK) {
    return MOCK_ENTRIES;
  }

  try {
    const client = getClient();
    const data = await client.request<{
      myEntries: GraphQLEntry[];
    }>(`
      query MyEntries {
        myEntries {
          id
          title
          content
          mood
          tags
          typingStyleId
          isPrivate
          wordCount
          createdAt
          updatedAt
          authorName
          authorAvatar
          media {
            id
            mediaType
            url
            thumbnailUrl
            caption
            motionEffect
            createdAt
          }
        }
      }
    `);

    return data.myEntries.map(graphQLEntryToDiaryEntry);
  } catch (err) {
    console.error("[API] MyEntries failed:", err);
    return [];
  }
}

/** Fetch all entries (admin) */
export async function apiAllEntries(): Promise<DiaryEntry[]> {
  if (USE_MOCK) {
    return MOCK_ENTRIES;
  }

  try {
    const client = getClient();
    const data = await client.request<{
      allEntries: GraphQLEntry[];
    }>(`
      query AllEntries {
        allEntries {
          id
          title
          content
          mood
          tags
          typingStyleId
          isPrivate
          wordCount
          createdAt
          updatedAt
          authorName
          authorAvatar
          media {
            id
            mediaType
            url
            thumbnailUrl
            caption
            motionEffect
            createdAt
          }
        }
      }
    `);

    return data.allEntries.map(graphQLEntryToDiaryEntry);
  } catch (err) {
    console.error("[API] AllEntries failed:", err);
    return [];
  }
}

/** Fetch a single entry by ID */
export async function apiGetEntry(id: string): Promise<DiaryEntry | null> {
  if (USE_MOCK) {
    return MOCK_ENTRIES.find((e) => e.id === id) || null;
  }

  try {
    const client = getClient();
    const data = await client.request<{
      entry: GraphQLEntry | null;
    }>(`
      query GetEntry($id: ID!) {
        entry(id: $id) {
          id
          title
          content
          mood
          tags
          typingStyleId
          isPrivate
          wordCount
          createdAt
          updatedAt
          authorName
          authorAvatar
          media {
            id
            mediaType
            url
            thumbnailUrl
            caption
            motionEffect
            createdAt
          }
        }
      }
    `, { id });

    return data.entry ? graphQLEntryToDiaryEntry(data.entry) : null;
  } catch (err) {
    console.error("[API] GetEntry failed:", err);
    return null;
  }
}

/** Create a new diary entry */
export async function apiCreateEntry(input: {
  title: string;
  content: string;
  mood: string;
  tags: string[];
  typingStyleId: string;
  isPrivate: boolean;
  media: {
    mediaType: string;
    url: string;
    thumbnailUrl?: string | null;
    caption?: string | null;
    motionEffect: string;
  }[];
}): Promise<DiaryEntry | null> {
  if (USE_MOCK) {
    const newEntry: DiaryEntry = {
      id: `entry-${Date.now()}`,
      title: input.title,
      content: input.content,
      mood: input.mood as Mood,
      tags: input.tags,
      typingStyleId: input.typingStyleId,
      isPrivate: input.isPrivate,
      wordCount: input.content.split(/\s+/).filter(Boolean).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "",
      authorName: "You",
      authorAvatar: "https://i.pravatar.cc/150?u=me",
      media: input.media.map((m, i): MediaItem => ({
        id: `media-${Date.now()}-${i}`,
        type: m.mediaType as MediaItem["type"],
        url: m.url,
        thumbnailUrl: m.thumbnailUrl || undefined,
        caption: m.caption || undefined,
        motionEffect: m.motionEffect as MediaItem["motionEffect"],
      })),
    };
    return newEntry;
  }

  try {
    const client = getClient();
    const data = await client.request<{
      createEntry: GraphQLEntry;
    }>(`
      mutation CreateEntry($input: CreateEntryInput!) {
        createEntry(input: $input) {
          id
          title
          content
          mood
          tags
          typingStyleId
          isPrivate
          wordCount
          createdAt
          updatedAt
          authorName
          authorAvatar
          media {
            id
            mediaType
            url
            thumbnailUrl
            caption
            motionEffect
            createdAt
          }
        }
      }
    `, { input });

    return data.createEntry ? graphQLEntryToDiaryEntry(data.createEntry) : null;
  } catch (err) {
    console.error("[API] CreateEntry failed:", err);
    return null;
  }
}

/** Update an existing diary entry */
export async function apiUpdateEntry(id: string, input: {
  title?: string;
  content?: string;
  mood?: string;
  tags?: string[];
  typingStyleId?: string;
  isPrivate?: boolean;
  media?: {
    mediaType: string;
    url: string;
    thumbnailUrl?: string | null;
    caption?: string | null;
    motionEffect: string;
  }[];
}): Promise<DiaryEntry | null> {
  if (USE_MOCK) {
    const existing = MOCK_ENTRIES.find((e) => e.id === id);
    if (!existing) return null;
    const updated: DiaryEntry = {
      ...existing,
      title: input.title ?? existing.title,
      content: input.content ?? existing.content,
      mood: (input.mood as Mood) ?? existing.mood,
      tags: input.tags ?? existing.tags,
      typingStyleId: input.typingStyleId ?? existing.typingStyleId,
      isPrivate: input.isPrivate ?? existing.isPrivate,
      media: input.media ? input.media.map((m, i): MediaItem => ({
        id: `media-${Date.now()}-${i}`,
        type: m.mediaType as MediaItem["type"],
        url: m.url,
        thumbnailUrl: m.thumbnailUrl || undefined,
        caption: m.caption || undefined,
        motionEffect: m.motionEffect as MediaItem["motionEffect"],
      })) : existing.media,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  }

  try {
    const client = getClient();
    const data = await client.request<{
      updateEntry: GraphQLEntry;
    }>(`
      mutation UpdateEntry($id: ID!, $input: UpdateEntryInput!) {
        updateEntry(id: $id, input: $input) {
          id
          title
          content
          mood
          tags
          typingStyleId
          isPrivate
          wordCount
          createdAt
          updatedAt
          authorName
          authorAvatar
          media {
            id
            mediaType
            url
            thumbnailUrl
            caption
            motionEffect
            createdAt
          }
        }
      }
    `, { id, input });

    return data.updateEntry ? graphQLEntryToDiaryEntry(data.updateEntry) : null;
  } catch (err) {
    console.error("[API] UpdateEntry failed:", err);
    return null;
  }
}

/** Delete a diary entry */
export async function apiDeleteEntry(id: string): Promise<boolean> {
  if (USE_MOCK) {
    return true;
  }

  try {
    const client = getClient();
    await client.request(`
      mutation DeleteEntry($id: ID!) {
        deleteEntry(id: $id)
      }
    `, { id });
    return true;
  } catch (err) {
    console.error("[API] DeleteEntry failed:", err);
    return false;
  }
}

/** Fetch all users (admin) */
export async function apiAllUsers(): Promise<User[]> {
  if (USE_MOCK) {
    return MOCK_USERS.filter((u) => u.role === "user");
  }

  try {
    const client = getClient();
    const data = await client.request<{
      allUsers: GraphQLUser[];
    }>(`
      query AllUsers {
        allUsers {
          id
          username
          email
          firstName
          lastName
          dateJoined
          entriesCount
          profile {
            id
            avatar
            role
          }
        }
      }
    `);

    return data.allUsers.map(graphQLUserToUser);
  } catch (err) {
    console.error("[API] AllUsers failed:", err);
    return [];
  }
}

/** Fetch entry stats (for dashboards) */
export async function apiEntryStats(): Promise<{
  totalEntries: number;
  totalImages: number;
  totalVideos: number;
  totalWords: number;
  moodDistribution: { name: string; value: number }[];
  entriesByDay: { name: string; value: number }[];
  totalUsers: number;
} | null> {
  if (USE_MOCK) {
    return null;
  }

  try {
    const client = getClient();
    const data = await client.request<{
      entryStats: Record<string, unknown>;
    }>(`
      query EntryStats {
        entryStats
      }
    `);

    return data.entryStats as {
      totalEntries: number;
      totalImages: number;
      totalVideos: number;
      totalWords: number;
      moodDistribution: { name: string; value: number }[];
      entriesByDay: { name: string; value: number }[];
      totalUsers: number;
    };
  } catch (err) {
    console.error("[API] EntryStats failed:", err);
    return null;
  }
}

export { USE_MOCK };
