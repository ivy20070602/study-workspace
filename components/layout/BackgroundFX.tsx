export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-candy-100 via-cream to-sky-200 dark:from-night-900 dark:via-night-950 dark:to-night-800" />
      <div className="absolute -left-24 -top-24 h-80 w-80 animate-blob rounded-full bg-candy-200/60 blur-3xl dark:bg-night-600/40" />
      <div className="absolute -right-20 top-1/3 h-72 w-72 animate-blob rounded-full bg-sunny-200/60 blur-3xl [animation-delay:-4s] dark:bg-night-600/30" />
      <div className="absolute -bottom-28 left-1/4 h-80 w-80 animate-blob rounded-full bg-mint-200/50 blur-3xl [animation-delay:-8s] dark:bg-night-500/30" />
      <span className="absolute left-[8%] top-[16%] animate-float-slow text-3xl opacity-70">
        🌈
      </span>
      <span className="absolute right-[10%] top-[12%] animate-float-slower text-2xl opacity-60">
        ✨
      </span>
      <span className="absolute bottom-[18%] left-[6%] animate-float-slower text-2xl opacity-60">
        🐷
      </span>
      <span className="absolute bottom-[14%] right-[14%] animate-float-slow text-2xl opacity-60 [animation-delay:-3s]">
        ⭐
      </span>
    </div>
  );
}