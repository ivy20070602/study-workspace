export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-candy-50 via-cream to-sky-100 dark:from-night-950 dark:via-night-950 dark:to-night-800" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(43,26,63,0.07)_1.5px,transparent_1.5px)] bg-[size:26px_26px] dark:bg-[radial-gradient(circle,rgba(217,199,240,0.05)_1.5px,transparent_1.5px)]" />

      <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] animate-blob rounded-full bg-candy-200/50 blur-3xl dark:bg-night-600/30" />
      <div className="absolute -right-28 top-1/4 h-[26rem] w-[26rem] animate-blob rounded-full bg-sunny-200/45 blur-3xl [animation-delay:-5s] dark:bg-night-600/25" />
      <div className="absolute -bottom-36 left-1/4 h-[30rem] w-[30rem] animate-blob rounded-full bg-mint-200/45 blur-3xl [animation-delay:-9s] dark:bg-night-500/25" />
      <div className="absolute bottom-1/4 right-1/4 h-[22rem] w-[22rem] animate-blob rounded-full bg-grape-200/40 blur-3xl [animation-delay:-2s] dark:bg-night-500/20" />

      <div className="absolute left-[6%] top-[16%] h-40 w-40 animate-float-slow rounded-full border-[24px] border-candy-300/40 dark:border-night-500/40" />
      <div className="absolute right-[10%] top-[30%] h-28 w-28 animate-float-slower rounded-full bg-sky-300/40 blur-[1px] dark:bg-night-500/40" />
      <div className="absolute bottom-[14%] left-[14%] h-24 w-24 animate-sparkle rounded-2xl bg-sunny-300/50 rotate-12 dark:bg-night-500/40" />
      <div className="absolute bottom-[26%] right-[8%] h-36 w-36 animate-float-slow rounded-full border-[20px] border-grape-300/40 [animation-delay:-3s] dark:border-night-500/35" />
      <div className="absolute left-[38%] top-[8%] h-20 w-20 animate-sparkle rounded-full bg-mint-300/45 [animation-delay:-1s] dark:bg-night-500/30" />

      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="absolute bottom-[30%] left-[2%] h-32 w-32 animate-sparkle text-grape-400/40 [animation-delay:-1.6s]"
      >
        <path d="M12 1.5l2.6 7.2L22 12l-7.4 3.3L12 22.5l-2.6-7.2L2 12l7.4-3.3L12 1.5z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        className="absolute right-[2%] bottom-[18%] h-28 w-28 animate-float-slower text-sunny-400/40"
      >
        <path d="M12 3v18M3 12h18M7 7l10 10M17 7L7 17" />
      </svg>
    </div>
  );
}