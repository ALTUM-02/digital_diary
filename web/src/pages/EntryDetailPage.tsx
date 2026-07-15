import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, Calendar, Heart, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotionGallery } from "@/components/media/MotionGallery";
import { useDiary } from "@/context/DiaryContext";
import { useNotifications } from "@/context/NotificationContext";
import { TYPING_STYLES } from "@/lib/mock-data";
import type { DiaryEntry } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", excited: "🤩", calm: "😌", neutral: "😐",
  thoughtful: "🤔", sad: "😢", angry: "😠", grateful: "🙏",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEntry, deleteEntry } = useDiary();
  const { addNotification } = useNotifications();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function load() {
      setIsLoading(true);
      const data = await getEntry(id!);
      if (mounted) {
        setEntry(data);
        setIsLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [id, getEntry]);

  const handleDelete = async () => {
    if (!id) return;
    const success = await deleteEntry(id);
    if (success) {
      addNotification({
        type: "warning",
        title: "Entry Deleted",
        message: `Entry "${entry?.title}" was deleted.`,
      });
      toast.success("Entry deleted");
      navigate("/diary");
    } else {
      toast.error("Failed to delete entry");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading entry...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="p-12 text-center max-w-md">
          <h2 className="font-display text-xl font-semibold mb-2">Entry not found</h2>
          <p className="text-muted-foreground mb-4">This entry may have been deleted or is not accessible.</p>
          <Link to="/diary">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Diary
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const typingStyle = TYPING_STYLES.find((s) => s.id === entry.typingStyleId);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Link to={`/editor/${entry.id}`}>
            <Button variant="outline" size="sm">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogHeader>Delete this entry?</AlertDialogHeader>
                <AlertDialogDescription>
                  This action cannot be undone. The entry "{entry.title}" and all its media will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Media gallery */}
      {entry.media.length > 0 && (
        <div className="h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl">
          <MotionGallery
            media={entry.media}
            interval={2000}
            showControls={true}
            className="h-full"
            typingStyle={typingStyle ? {
              fontFamily: typingStyle.fontFamily,
              color: typingStyle.color,
              fontWeight: typingStyle.fontWeight,
              italic: typingStyle.italic,
              letterSpacing: typingStyle.letterSpacing,
              lineHeight: typingStyle.lineHeight,
            } : undefined}
            caption={entry.title}
          />
        </div>
      )}

      {/* Entry content */}
      <Card className="p-6 lg:p-8 space-y-4">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="text-lg">{MOOD_EMOJI[entry.mood]}</span>
            <span className="capitalize">{entry.mood}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(entry.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            {entry.wordCount} words
          </span>
          {entry.isPrivate && (
            <Badge variant="secondary" className="text-[10px]">Private</Badge>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-3xl font-bold"
          style={typingStyle ? {
            fontFamily: typingStyle.fontFamily,
            color: typingStyle.color,
            fontWeight: typingStyle.fontWeight,
            fontStyle: typingStyle.italic ? "italic" : "normal",
          } : undefined}
        >
          {entry.title}
        </h1>

        {/* Content */}
        <div
          className="text-base whitespace-pre-wrap leading-relaxed"
          style={typingStyle ? {
            fontFamily: typingStyle.fontFamily,
            color: typingStyle.color,
            fontWeight: typingStyle.fontWeight,
            fontStyle: typingStyle.italic ? "italic" : "normal",
            letterSpacing: typingStyle.letterSpacing,
            lineHeight: typingStyle.lineHeight,
          } : undefined}
        >
          {entry.content}
        </div>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <img
            src={entry.authorAvatar}
            alt={entry.authorName}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/10"
          />
          <div>
            <p className="text-sm font-medium">{entry.authorName}</p>
            <p className="text-xs text-muted-foreground">
              {entry.updatedAt !== entry.createdAt ? `Updated ${formatDate(entry.updatedAt)}` : "Original entry"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
