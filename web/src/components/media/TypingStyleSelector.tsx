import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPING_STYLES } from "@/lib/mock-data";
import type { TypingStyle } from "@/types";

type Props = {
  selectedId: string;
  onSelect: (style: TypingStyle) => void;
};

export function TypingStyleSelector({ selectedId, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Typing Style</label>
        <span className="text-xs text-muted-foreground">{TYPING_STYLES.length} styles</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TYPING_STYLES.map((style) => {
          const isSelected = style.id === selectedId;
          return (
            <button
              key={style.id}
              onClick={() => onSelect(style)}
              className={cn(
                "relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/30 hover:bg-muted/50",
              )}
            >
              <div
                className="typing-style-preview"
                style={{
                  fontFamily: style.fontFamily,
                  color: style.color,
                  fontWeight: style.fontWeight,
                  fontStyle: style.italic ? "italic" : "normal",
                  letterSpacing: style.letterSpacing,
                  lineHeight: style.lineHeight,
                }}
              >
                <span className="text-base">{style.preview}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{style.name}</span>
                {isSelected && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
