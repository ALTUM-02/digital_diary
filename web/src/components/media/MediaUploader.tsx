import { useRef, useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Video, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MediaItem, MotionEffect } from "@/types";

type Props = {
  onUpload: (items: MediaItem[]) => void;
  items: MediaItem[];
  onRemove: (id: string) => void;
};

const MOTION_OPTIONS: { value: MotionEffect; label: string }[] = [
  { value: "kenburns", label: "Ken Burns" },
  { value: "slide", label: "Slide" },
  { value: "fade", label: "Fade" },
  { value: "zoom", label: "Zoom" },
  { value: "none", label: "None" },
];

export function MediaUploader({ onUpload, items, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newItems: MediaItem[] = [];
    Array.from(files).forEach((file, idx) => {
      const isVideo = file.type.startsWith("video");
      const url = URL.createObjectURL(file);
      newItems.push({
        id: `upload-${Date.now()}-${idx}`,
        type: isVideo ? "video" : "image",
        url,
        thumbnailUrl: undefined,
        caption: undefined,
        motionEffect: "kenburns",
      });
    });
    if (newItems.length > 0) onUpload(newItems);
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const updateMotion = useCallback((id: string, effect: MotionEffect) => {
    // We'll handle this via parent through a custom event
    const event = new CustomEvent("update-motion", { detail: { id, effect } });
    window.dispatchEvent(event);
  }, []);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-300",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Drop images or videos here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse — supports photos & short videos</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-muted/30"
            >
              <div className="aspect-square relative">
                {item.type === "image" ? (
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="relative h-full w-full bg-black">
                    <video src={item.url} className="h-full w-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileVideo className="h-8 w-8 text-white/80" />
                    </div>
                  </div>
                )}
                {/* Remove button */}
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
                {/* Type badge */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  {item.type === "image" ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                  {item.type}
                </div>
              </div>
              {/* Motion selector */}
              <div className="p-2">
                <select
                  value={item.motionEffect}
                  onChange={(e) => updateMotion(item.id, e.target.value as MotionEffect)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  {MOTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
