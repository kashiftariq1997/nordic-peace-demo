"use client";

import { useState } from "react";
import { BowIcon, PauseIcon, PlayIcon } from "@/icons";

type AnnouncementBarProps = {
  /** Marquee messages, built server-side (live threshold + store currency). */
  messages: readonly string[];
};

/**
 * Slow marquee announcement bar. The visible track is hidden from assistive
 * tech (duplicated for the loop) and a visually-hidden copy carries the
 * messages; the pause button satisfies WCAG 2.2.2 (pause/stop/hide).
 */
export function AnnouncementBar({ messages }: AnnouncementBarProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="bg-plum text-cream relative h-11 overflow-hidden">
      <div
        aria-hidden="true"
        className="np-marquee-track flex h-full w-max items-center"
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-10 pr-10">
            {messages.map((message) => (
              <span
                key={message}
                className="flex items-center gap-3 text-xs font-medium tracking-[0.18em] whitespace-nowrap uppercase sm:text-[13px]"
              >
                {message}
                <BowIcon className="text-rose h-3.5 w-3.5 shrink-0" />
              </span>
            ))}
          </div>
        ))}
      </div>

      <p className="sr-only">{messages.join(". ")}.</p>

      <button
        type="button"
        className="border-cream/20 text-cream/80 hover:text-cream absolute inset-y-0 right-0 flex h-11 w-11 items-center justify-center border-l transition-colors"
        aria-label={paused ? "Play announcement animation" : "Pause announcement animation"}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? <PlayIcon className="h-3.5 w-3.5" /> : <PauseIcon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
