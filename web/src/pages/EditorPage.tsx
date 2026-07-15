import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Smile, Tag, Lock, Globe, PenLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MediaUploader } from "@/components/media/MediaUploader";
import { TypingStyleSelector } from "@/components/media/TypingStyleSelector";
import { useDiary } from "@/context/DiaryContext";
import { useNotifications } from "@/context/NotificationContext";
import { TYPING_STYLES } from "@/lib/mock-data";
import type { TypingStyle, MediaItem, Mood } from "@/types";
import { toast } from "sonner";

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "excited", emoji: "🤩", label: "Excited" },
  { value: "calm", emoji: "😌", label: "Calm" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "thoughtful", emoji: "🤔", label: "Thoughtful" },
  { value: "sad", emoji: "😢", label: "Sad" },
  { value: "angry", emoji: "😠", label: "Angry" },
  { value: "grateful", emoji: "🙏", label: "Grateful" },
];

export function EditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const { addEntry, updateEntry, getEntry } = useDiary();
  const { addNotification } = useNotifications();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("neutral");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [typingStyle, setTypingStyle] = useState<TypingStyle>(TYPING_STYLES[0]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingEntry, setIsLoadingEntry] = useState(isEditing);

  // Load existing entry for editing
  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function loadEntry() {
      setIsLoadingEntry(true);
      const entry = await getEntry(id!);
      if (entry && mounted) {
        setTitle(entry.title);
        setContent(entry.content);
        setMood(entry.mood);
        setTags(entry.tags);
        setIsPrivate(entry.isPrivate);
        const style = TYPING_STYLES.find((s) => s.id === entry.typingStyleId);
        if (style) setTypingStyle(style);
        setMedia(entry.media);
      }
      if (mounted) setIsLoadingEntry(false);
    }

    loadEntry();
    return () => { mounted = false; };
  }, [id, getEntry]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setMedia((prev) =>
        prev.map((m) =>
          m.id === detail.id ? { ...m, motionEffect: detail.effect } : m,
        ),
      );
    };
    window.addEventListener("update-motion", handler);
    return () => window.removeEventListener("update-motion", handler);
  }, []);

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 6) {
      setTags((prev) => [...prev, tag]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Please add a title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please write some content");
      return;
    }

    setIsSaving(true);

    const entryData = {
      title,
      content,
      mood,
      tags,
      media,
      typingStyleId: typingStyle.id,
      isPrivate,
    };

    if (isEditing && id) {
      const result = await updateEntry(id, entryData);
      if (result) {
        addNotification({
          type: "success",
          title: "Entry Updated",
          message: `Your diary entry "${title}" was updated successfully.`,
        });
        toast.success("Entry updated successfully!");
        navigate("/diary");
      } else {
        toast.error("Failed to update entry");
      }
    } else {
      const result = await addEntry(entryData);
      if (result) {
        addNotification({
          type: "success",
          title: "Entry Published",
          message: `Your diary entry "${title}" was saved successfully.`,
        });
        toast.success("Entry saved successfully!");
        navigate("/dashboard");
      } else {
        toast.error("Failed to save entry");
      }
    }
    setIsSaving(false);
  }, [title, content, mood, tags, media, typingStyle, isPrivate, isEditing, id, addEntry, updateEntry, addNotification, navigate]);

  if (isLoadingEntry) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading entry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {isEditing ? "Edit Entry" : "New Diary Entry"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Update your thoughts and memories" : "Capture your thoughts, photos, and memories"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="shadow-lg shadow-primary/20" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Update Entry" : "Save Entry"}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your entry a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg h-12"
              />
            </div>

            {/* Content with typing style */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Your Story</Label>
                <Badge variant="outline" className="text-[10px]">
                  {typingStyle.name}
                </Badge>
              </div>
              <Textarea
                id="content"
                placeholder="Start writing your diary entry..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] resize-y border-2"
                style={{
                  fontFamily: typingStyle.fontFamily,
                  color: typingStyle.color,
                  fontWeight: typingStyle.fontWeight,
                  fontStyle: typingStyle.italic ? "italic" : "normal",
                  letterSpacing: typingStyle.letterSpacing,
                  lineHeight: typingStyle.lineHeight,
                  fontSize: "1.05rem",
                }}
              />
              <p className="text-xs text-muted-foreground text-right">
                {content.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </Card>

          {/* Media upload */}
          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Photos & Videos</h3>
            <MediaUploader
              items={media}
              onUpload={(items) => setMedia((prev) => [...prev, ...items])}
              onRemove={(itemId) => setMedia((prev) => prev.filter((m) => m.id !== itemId))}
            />
          </Card>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          {/* Mood */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Smile className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Mood</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all ${
                    mood === m.value
                      ? "border-primary bg-primary/5 scale-105"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[9px] text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Typing style */}
          <Card className="p-5">
            <TypingStyleSelector
              selectedId={typingStyle.id}
              onSelect={setTypingStyle}
            />
          </Card>

          {/* Tags */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Tags</h3>
            </div>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="h-9 text-sm"
              />
              <Button size="sm" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Privacy */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPrivate ? <Lock className="h-4 w-4 text-primary" /> : <Globe className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <h3 className="text-sm font-semibold">Private Entry</h3>
                  <p className="text-xs text-muted-foreground">Only visible to you</p>
                </div>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
