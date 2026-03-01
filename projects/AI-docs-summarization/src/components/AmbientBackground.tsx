export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-purple-500/20 blur-[140px]" />
      <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-sky-400/10 blur-[140px]" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[160px]" />
    </div>
  );
}
