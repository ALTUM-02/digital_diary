import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, PenLine, BookOpen, Heart, Calendar, Filter, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MotionGallery } from "@/components/media/MotionGallery";
import { useDiary } from "@/context/DiaryContext";
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

export function DiaryListPage() {
  const { userEntries, isLoading } = useDiary();
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [view, setView] = useState("grid");

  const filtered = useMemo(() => {
    return userEntries.filter((entry) => {
      const matchesSearch =
        !search ||
        entry.title.toLowerCase().includes(search.toLowerCase()) ||
        entry.content.toLowerCase().includes(search.toLowerCase()) ||
        entry.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesMood = moodFilter === "all" || entry.mood === moodFilter;
      return matchesSearch && matchesMood;
    });
  }, [userEntries, search, moodFilter]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">My Diary</h1>
          <p className="text-muted-foreground mt-1">{userEntries.length} entries captured</p>
        </div>
        <Link to="/editor">
          <Button className="shadow-lg shadow-primary/20">
            <PenLine className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search entries, tags, content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={moodFilter} onValueChange={setMoodFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by mood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Moods</SelectItem>
              <SelectItem value="happy">😊 Happy</SelectItem>
              <SelectItem value="excited">🤩 Excited</SelectItem>
              <SelectItem value="calm">😌 Calm</SelectItem>
              <SelectItem value="thoughtful">🤔 Thoughtful</SelectItem>
              <SelectItem value="grateful">🙏 Grateful</SelectItem>
              <SelectItem value="sad">😢 Sad</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Entries */}
      {filtered.length === 0 ? (
        <Card className="p-16 text-center">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">No entries found</h3>
          <p className="text-muted-foreground mb-4">
            {search ? "Try a different search term" : "Start writing your first diary entry!"}
          </p>
          <Link to="/editor">
            <Button>
              <PenLine className="mr-2 h-4 w-4" />
              Write Entry
            </Button>
          </Link>
        </Card>
      ) : (
        <div
          className={cn(
            view === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-3",
          )}
        >
          {filtered.map((entry, idx) => {
            const typingStyle = TYPING_STYLES.find((s) => s.id === entry.typingStyleId);
            return (
              <Link
                key={entry.id}
                to={`/entry/${entry.id}`}
                className={cn(
                  "animate-slide-up",
                  view === "grid" ? "block" : "flex",
                )}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
              <Card
                className={cn(
                  "overflow-hidden border-border cursor-pointer hover:shadow-lg transition-all group h-full",
                  view === "list" && "flex",
                )}
              >
                {entry.media.length > 0 && (
                  <div className={cn(view === "list" ? "h-32 w-48 shrink-0" : "h-48")}>
                    <MotionGallery
                      media={entry.media.slice(0, 4)}
                      interval={2000}
                      showControls={false}
                      className="h-full"
                    />
                  </div>
                )}
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{MOOD_EMOJI[entry.mood]}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {timeAgo(entry.createdAt)}
                    </span>
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
                  <p className={cn("text-sm text-muted-foreground", view === "grid" ? "line-clamp-2" : "line-clamp-3")}>
                    {entry.content}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
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
  );
}
