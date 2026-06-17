export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-1/4 top-[-20%] h-[60vh] w-[60vh] rounded-full bg-violet/20 blur-[120px] animate-aurora" />
      <div className="absolute right-[-15%] top-[10%] h-[55vh] w-[55vh] rounded-full bg-cyan/15 blur-[120px] animate-aurora [animation-delay:-7s]" />
      <div className="absolute bottom-[-25%] left-[30%] h-[50vh] w-[50vh] rounded-full bg-emerald/10 blur-[130px] animate-aurora [animation-delay:-14s]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,hsl(var(--background))_70%)]" />
    </div>
  );
}
