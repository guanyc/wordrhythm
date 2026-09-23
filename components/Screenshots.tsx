import Image from "next/image";

interface ScreenshotsProps {
  /** Paths under /public, e.g. ["/apps/kjv/01.jpg"] */
  shots: string[];
  /** Used for alt text, e.g. "Word Rhythm: KJV Bible" */
  label: string;
  variant?: "grid" | "strip";
}

const frame =
  "relative aspect-[9/16] overflow-hidden rounded-[1.6rem] border border-black/5 bg-surface shadow-card";

export default function Screenshots({
  shots,
  label,
  variant = "grid",
}: ScreenshotsProps) {
  if (shots.length === 0) return null;

  return (
    <div
      className={
        variant === "strip"
          ? "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
          : "grid grid-cols-2 gap-4 sm:grid-cols-4"
      }
    >
      {shots.map((src, i) => (
        <div
          key={src}
          className={`${frame} ${
            variant === "strip" ? "w-40 shrink-0 snap-start sm:w-48" : ""
          }`}
        >
          <Image
            src={src}
            alt={`${label} — screenshot ${i + 1}`}
            fill
            sizes="(max-width: 640px) 45vw, 240px"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
