import type {
  User,
  DiaryEntry,
  Notification,
  TypingStyle,
  ActivityLog,
} from "@/types";

export const TYPING_STYLES: TypingStyle[] = [
  {
    id: "modern-clean",
    name: "Modern Clean",
    fontFamily: "'Inter', sans-serif",
    color: "#1a1a2e",
    fontWeight: 400,
    italic: false,
    letterSpacing: "0px",
    lineHeight: 1.7,
    preview: "A bright new day",
  },
  {
    id: "elegant-serif",
    name: "Elegant Serif",
    fontFamily: "'Playfair Display', serif",
    color: "#2c1810",
    fontWeight: 500,
    italic: false,
    letterSpacing: "0.01em",
    lineHeight: 1.8,
    preview: "A bright new day",
  },
  {
    id: "handwriting-casual",
    name: "Handwriting Casual",
    fontFamily: "'Caveat', cursive",
    color: "#3730a3",
    fontWeight: 500,
    italic: false,
    letterSpacing: "0.02em",
    lineHeight: 1.6,
    preview: "A bright new day",
  },
  {
    id: "script-flow",
    name: "Script Flow",
    fontFamily: "'Dancing Script', cursive",
    color: "#9d174d",
    fontWeight: 600,
    italic: false,
    letterSpacing: "0.01em",
    lineHeight: 1.6,
    preview: "A bright new day",
  },
  {
    id: "pacifico-wave",
    name: "Pacifico Wave",
    fontFamily: "'Pacifico', cursive",
    color: "#0f766e",
    fontWeight: 400,
    italic: false,
    letterSpacing: "0px",
    lineHeight: 1.5,
    preview: "A bright new day",
  },
  {
    id: "lora-classic",
    name: "Lora Classic",
    fontFamily: "'Lora', serif",
    color: "#1e3a5f",
    fontWeight: 400,
    italic: true,
    letterSpacing: "0.01em",
    lineHeight: 1.75,
    preview: "A bright new day",
  },
  {
    id: "mono-tech",
    name: "Mono Tech",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#059669",
    fontWeight: 500,
    italic: false,
    letterSpacing: "0px",
    lineHeight: 1.6,
    preview: "A bright new day",
  },
  {
    id: "fraunces-bold",
    name: "Fraunces Bold",
    fontFamily: "'Fraunces', serif",
    color: "#7c2d12",
    fontWeight: 700,
    italic: false,
    letterSpacing: "-0.01em",
    lineHeight: 1.65,
    preview: "A bright new day",
  },
];

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    email: "sarah@diaryverse.app",
    role: "user",
    avatar: "https://i.pravatar.cc/150?img=1",
    joinedDate: "2024-01-15",
    entriesCount: 42,
  },
  {
    id: "u2",
    name: "Marcus Johnson",
    email: "marcus@diaryverse.app",
    role: "user",
    avatar: "https://i.pravatar.cc/150?img=12",
    joinedDate: "2024-02-20",
    entriesCount: 28,
  },
  {
    id: "u3",
    name: "Aisha Patel",
    email: "aisha@diaryverse.app",
    role: "user",
    avatar: "https://i.pravatar.cc/150?img=5",
    joinedDate: "2024-03-10",
    entriesCount: 67,
  },
  {
    id: "u4",
    name: "Diego Ramirez",
    email: "diego@diaryverse.app",
    role: "user",
    avatar: "https://i.pravatar.cc/150?img=15",
    joinedDate: "2024-04-05",
    entriesCount: 19,
  },
  {
    id: "u5",
    name: "Yuki Tanaka",
    email: "yuki@diaryverse.app",
    role: "user",
    avatar: "https://i.pravatar.cc/150?img=8",
    joinedDate: "2024-05-12",
    entriesCount: 53,
  },
  {
    id: "admin1",
    name: "Admin Root",
    email: "admin@diaryverse.app",
    role: "admin",
    avatar: "https://i.pravatar.cc/150?img=68",
    joinedDate: "2023-12-01",
    entriesCount: 5,
  },
];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
  "https://images.unsplash.com/photo-1490644924195-9d6d9d2d2f3b?w=800",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800",
  "https://images.unsplash.com/photo-1546547634-d95c58c2d5f5?w=800",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
  "https://images.unsplash.com/photo-1518494016688-71fd93272958?w=800",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
];

const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

function getRandomImage(): string {
  return SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
}

function getRandomVideo(): string {
  return SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
}

const MOODS = ["happy", "excited", "calm", "neutral", "thoughtful", "sad", "grateful"] as const;
const TAGS_POOL = ["travel", "family", "work", "nature", "friends", "food", "music", "art", "fitness", "reading", "reflection", "adventure"];
const MOTION_EFFECTS = ["kenburns", "slide", "fade", "zoom"] as const;

function generateMockEntries(): DiaryEntry[] {
  const entries: DiaryEntry[] = [];
  const titles = [
    "Morning Coffee Rituals",
    "A Walk in the Park",
    "Sunset Over the Mountains",
    "First Day at the New Job",
    "Baking with Grandma's Recipe",
    "The Concert That Changed Me",
    "Quiet Moments by the Sea",
    "Finding Peace in Chaos",
    "A Letter to Future Self",
    "Weekend Trip to the Coast",
    "The Book That Moved Me",
    "Rainy Day Reflections",
    "Garden in Full Bloom",
    "City Lights at Midnight",
    "Reconnecting with Old Friends",
  ];

  const contents = [
    "Today started with the most perfect cup of coffee. The aroma filled the kitchen and for a moment, everything felt right in the world. I sat by the window watching the sunrise paint the sky in shades of amber and coral.",
    "I took a long walk through the old oak park today. The leaves were turning golden and the air had that crisp autumn bite. I thought about how much has changed since last year, and how much hasn't.",
    "The mountains never fail to take my breath away. We hiked for three hours to reach the summit, and the sunset from up there was something I'll carry with me forever. Colors I didn't know existed.",
    "New beginnings are always a mix of excitement and nerves. Today was my first day and everyone was so welcoming. I think this is going to be a good chapter.",
    "I found Grandma's handwritten recipe card tucked inside an old cookbook. The flour dust, the careful measurements in her looping handwriting — it felt like she was right there with me in the kitchen.",
    "The music moved through me like a current. I've never felt so seen by a performance. The way the violin soared in the final movement left me in tears, and I wasn't the only one.",
    "There's something about the sea that puts everything in perspective. The rhythmic waves, the salt air, the vast horizon. I sat on the rocks for hours just breathing.",
    "Life has been overwhelming lately, but today I found a quiet corner in the library and just existed for a while. No phone, no deadlines. Just me and a good book.",
    "Dear future me: I hope you're braver than I am now. I hope you took the risks I was too scared to take. I hope you're laughing more and worrying less.",
    "We drove two hours to reach the coast and it was worth every minute. The cliffs were dramatic, the water impossibly blue, and the fish tacos were the best I've ever had.",
    "I finished the book at 2 AM and couldn't sleep afterwards. Some stories leave a mark on your soul. This one made me rethink how I've been living.",
    "The rain came down in sheets today and I loved every minute of it. I made tea, wrapped myself in a blanket, and wrote three pages without stopping. Productive rainy days are the best.",
    "The garden has exploded with color. The roses I planted last spring are finally blooming, and the bees have returned. It feels like a small miracle.",
    "I walked through downtown at midnight and the city felt like it belonged to me. The neon reflections on wet pavement, the distant hum of traffic — a strange beautiful solitude.",
    "We hadn't spoken in five years, but tonight felt like no time had passed. We laughed about old mistakes and dreamed about new adventures. Friendship is a remarkable thing.",
  ];

  for (let i = 0; i < 15; i++) {
    const daysAgo = i;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const mediaCount = Math.floor(Math.random() * 4);
    const media = [];
    for (let j = 0; j < mediaCount; j++) {
      const isVideo = Math.random() > 0.7;
      media.push({
        id: `media-${i}-${j}`,
        type: isVideo ? "video" : "image",
        url: isVideo ? getRandomVideo() : getRandomImage(),
        thumbnailUrl: isVideo ? getRandomImage() : undefined,
        caption: Math.random() > 0.5 ? "A moment worth remembering" : undefined,
        motionEffect: MOTION_EFFECTS[Math.floor(Math.random() * MOTION_EFFECTS.length)],
      });
    }

    const wordCount = contents[i % contents.length].split(/\s+/).length;
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const tags: string[] = [];
    for (let t = 0; t < tagCount; t++) {
      const tag = TAGS_POOL[Math.floor(Math.random() * TAGS_POOL.length)];
      if (!tags.includes(tag)) tags.push(tag);
    }

    const authorIdx = i % 5;
    const author = MOCK_USERS[authorIdx];

    entries.push({
      id: `entry-${i}`,
      title: titles[i % titles.length],
      content: contents[i % contents.length],
      mood: MOODS[Math.floor(Math.random() * MOODS.length)],
      tags,
      media,
      typingStyleId: TYPING_STYLES[Math.floor(Math.random() * TYPING_STYLES.length)].id,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      wordCount,
      isPrivate: Math.random() > 0.7,
    });
  }

  return entries;
}

export const MOCK_ENTRIES: DiaryEntry[] = generateMockEntries();

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "success",
    title: "Entry Published",
    message: "Your diary entry 'Morning Coffee Rituals' was saved successfully.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: "n2",
    type: "info",
    title: "Weekly Summary Ready",
    message: "Your weekly diary summary is ready to view.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: "n3",
    type: "warning",
    title: "Storage Reminder",
    message: "You've used 78% of your media storage. Consider cleaning up old entries.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: "n4",
    type: "info",
    title: "New Feature Available",
    message: "Try the new motion gallery with auto-rotating slideshows!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
  },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  { id: "a1", userId: "u1", userName: "Sarah Chen", action: "Created Entry", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), details: "Morning Coffee Rituals" },
  { id: "a2", userId: "u3", userName: "Aisha Patel", action: "Uploaded Media", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), details: "3 images, 1 video" },
  { id: "a3", userId: "u2", userName: "Marcus Johnson", action: "Updated Profile", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), details: "Changed avatar" },
  { id: "a4", userId: "u5", userName: "Yuki Tanaka", action: "Created Entry", timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), details: "The Book That Moved Me" },
  { id: "a5", userId: "u4", userName: "Diego Ramirez", action: "Logged In", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), details: "Web browser" },
  { id: "a6", userId: "u3", userName: "Aisha Patel", action: "Created Entry", timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), details: "City Lights at Midnight" },
  { id: "a7", userId: "u1", userName: "Sarah Chen", action: "Uploaded Media", timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), details: "2 images" },
  { id: "a8", userId: "u5", userName: "Yuki Tanaka", action: "Updated Entry", timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), details: "Rainy Day Reflections" },
];

export const ADMIN_CHARTS = {
  entriesByDay: [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 19 },
    { name: "Wed", value: 8 },
    { name: "Thu", value: 15 },
    { name: "Fri", value: 24 },
    { name: "Sat", value: 31 },
    { name: "Sun", value: 18 },
  ],
  moodDistribution: [
    { name: "Happy", value: 28, color: "#f59e0b" },
    { name: "Calm", value: 22, color: "#0d9488" },
    { name: "Thoughtful", value: 18, color: "#6366f1" },
    { name: "Grateful", value: 15, color: "#ec4899" },
    { name: "Excited", value: 10, color: "#f97316" },
    { name: "Neutral", value: 7, color: "#94a3b8" },
  ],
  userActivityTrend: [
    { name: "Week 1", entries: 45, uploads: 30 },
    { name: "Week 2", entries: 52, uploads: 38 },
    { name: "Week 3", entries: 38, uploads: 25 },
    { name: "Week 4", entries: 67, uploads: 45 },
    { name: "Week 5", entries: 73, uploads: 52 },
    { name: "Week 6", entries: 58, uploads: 41 },
  ],
  mediaTypeSplit: [
    { name: "Images", value: 68, color: "#0d9488" },
    { name: "Videos", value: 24, color: "#7c3aed" },
    { name: "Text Only", value: 8, color: "#f59e0b" },
  ],
};
