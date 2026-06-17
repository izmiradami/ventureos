import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet to-cyan shadow-glow">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
          <path
            d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
            stroke="white"
            strokeWidth="1.6"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d="M12 7v10M8 9.5v5M16 9.5v5"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="font-display text-[1.05rem] font-semibold tracking-tight">
        Venture<span className="text-muted-foreground">OS</span>
      </span>
    </span>
  );
}
