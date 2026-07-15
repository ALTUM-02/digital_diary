import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PenLine, BookOpen, ImageIcon, Video, TrendingUp, ArrowRight, Heart, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MotionGallery } from "@/components/media/MotionGallery";
import { AreaChartCard, DonutChartCard } from "@/components/charts/Charts";
import { useDiary } from "@/context/DiaryContext";
import { useAuth } from "@/context/AuthContext";
import { TYPING_STYLES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", excited: "🤩", calm: "😌", neutral: "😐",
  thoughtful: "🤔", sad: "😢", angry: "😠", grateful: "🙏",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DashboardPage() {
  const { userEntries, isLoading } = useDiary();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const totalWords = userEntries.reduce((sum, e) => sum + e.wordCount, 0);
    const totalImages = userEntries.reduce((sum, e) => sum + e.media.filter(m => m.type === "image").length, 0);
    const totalVideos = userEntries.reduce((sum, e) => sum + e.media.filter(m => m.type === "video").length, 0);
    return {
      entries: userEntries.length,
      words: totalWords,
      images: totalImages,
      videos: totalVideos,
    };
  }, [userEntries]);

  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((name) => ({
      name,
      value: Math.floor(Math.random() * 5) + 1,
    }));
  }, []);

  const moodData = useMemo(() => {
    const moodColors: Record<string, string> = {
      happy: "#f59e0b", excited: "#f97316", calm: "#0d9488",
      neutral: "#94a3b8", thoughtful: "#6366f1", sad: "#64748b",
      grateful: "#ec4899",
    };
    const counts: Record<string, number> = {};
    userEntries.forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: moodColors[name] || "#94a3b8",
    }));
  }, [userEntries]);

  const recentEntries = userEntries.slice(0, 5);

  const statCards = [
    { label: "Total Entries", value: stats.entries, icon: BookOpen, color: "from-rose-500 to-pink-500" },
    { label: "Words Written", value: stats.words.toLocaleString(), icon: PenLine, color: "from-amber-500 to-orange-500" },
    { label: "Photos", value: stats.images, icon: ImageIcon, color: "from-teal-500 to-cyan-500" },
    { label: "Videos", value: stats.videos, icon: Video, color: "from-violet-500 to-purple-500" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your diary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link to="/editor">
          <Button className="h-11 shadow-lg shadow-primary/20">
            <PenLine className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden border-border p-5 animate-slide-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className={cn("absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-10 blur-xl", stat.color)} />
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md mb-3", stat.color)}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold font-display">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Weekly Activity</h3>
              <p className="text-xs text-muted-foreground">Entries per day this week</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="h-[240px]">
            <AreaChartCard data={weeklyData} color="hsl(346 77% 50%)" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-display text-lg font-semibold">Mood Distribution</h3>
            <p className="text-xs text-muted-foreground">Your emotional journey</p>
          </div>
          <div className="h-[240px]">
            {moodData.length > 0 ? (
              <DonutChartCard data={moodData} />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No mood data yet
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">Recent Entries</h2>
          <Link to="/diary">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {recentEntries.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No entries yet. Start writing your first diary entry!</p>
            <Link to="/editor" className="inline-block mt-4">
              <Button>
                <PenLine className="mr-2 h-4 w-4" />
                Write Now
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentEntries.map((entry, idx) => {
              const typingStyle = TYPING_STYLES.find((s) => s.id === entry.typingStyleId);
              return (
                <Link
                  key={entry.id}
                  to={`/entry/${entry.id}`}
                  className="block animate-slide-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                <Card
                  className="overflow-hidden border-border cursor-pointer hover:shadow-lg transition-shadow group h-full"
                >
                  {entry.media.length > 0 && (
                    <div className="h-48">
                      <MotionGallery
                        media={entry.media.slice(0, 4)}
                        interval={2000}
                        showControls={false}
                        className="h-full"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{MOOD_EMOJI[entry.mood]}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(entry.createdAt)}</span>
                      {entry.isPrivate && (
                        <Badge variant="secondary" className="text-[10px] ml-auto">Private</Badge>
                      )}
                    </div>
                    <h3
                      className="text-lg font-semibold mb-1"
                      style={typingStyle ? {
                        fontFamily: typingStyle.fontFamily,
                        color: typingStyle.color,
                        fontWeight: typingStyle.fontWeight,
                        fontStyle: typingStyle.italic ? "italic" : "normal",
                      } : undefined}
                    >
                      {entry.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                      <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {entry.wordCount} words
                      </span>
                    </div>
                  </div>
                </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
