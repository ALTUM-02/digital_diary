import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types";

type Props = {
  media: MediaItem[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  showControls?: boolean;
  typingStyle?: {
    fontFamily: string;
    color: string;
    fontWeight: number;
    italic: boolean;
    letterSpacing: string;
    lineHeight: number;
  };
  caption?: string;
};

export function MotionGallery({
  media,
  autoPlay = true,
  interval = 2000,
  className,
  showControls = true,
  typingStyle,
  caption,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  }, [media.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  useEffect(() => {
    if (isPlaying && media.length > 1) {
      timerRef.current = setInterval(next, interval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, media.length, interval, next]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [media.length]);

  useEffect(() => {
    if (videoRef.current) {
      if (currentIndex >= 0 && media[currentIndex]?.type === "video") {
        videoRef.current.currentTime = 0;
        if (isPlaying) videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, isPlaying, media]);

  if (media.length === 0) return null;

  const current = media[currentIndex];

  const motionClass = (effect: string) => {
    switch (effect) {
      case "kenburns": return "animate-kenburns";
      case "kenburns-alt": return "animate-kenburns-alt";
      case "slide": return "animate-slide-fade-in";
      case "fade": return "animate-fade-zoom-in";
      case "zoom": return "animate-fade-zoom-in";
      default: return "";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-black group",
        className,
      )}
    >
      {/* Media layers */}
      {media.map((item, idx) => (
        <div
          key={item.id}
          className={cn(
            "absolute inset-0 transition-all duration-700",
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0",
          )}
        >
          {item.type === "image" ? (
            <img
              src={item.url}
              alt={item.caption || ""}
              className={cn(
                "h-full w-full object-cover",
                idx === currentIndex && motionClass(item.motionEffect),
              )}
            />
          ) : (
            <video
              ref={idx === currentIndex ? videoRef : undefined}
              src={item.url}
              className="h-full w-full object-cover"
              muted={muted}
              loop
              playsInline
            />
          )}
        </div>
      ))}

      {/* Caption with typing style */}
      {(caption || current?.caption) && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16">
          <p
            style={typingStyle ? {
              fontFamily: typingStyle.fontFamily,
              color: typingStyle.color,
              fontWeight: typingStyle.fontWeight,
              fontStyle: typingStyle.italic ? "italic" : "normal",
              letterSpacing: typingStyle.letterSpacing,
              lineHeight: typingStyle.lineHeight,
            } : { color: "#ffffff" }}
            className="text-lg sm:text-xl drop-shadow-lg"
          >
            {caption || current?.caption}
          </p>
        </div>
      )}

      {/* Dots indicator */}
      {media.length > 1 && (
        <div className="absolute top-3 right-3 z-20 flex gap-1.5">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === currentIndex
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80",
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      {showControls && media.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Play/Pause */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
            {current?.type === "video" && (
              <button
                onClick={() => setMuted(!muted)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </>
      )}

      {/* Progress bar */}
      {isPlaying && media.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-black/30">
          <div
            key={currentIndex}
            className="h-full bg-white"
            style={{
              transformOrigin: "left",
              animation: `kenburns ${interval}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
