export default function Piggy({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="piggyBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9ab5" />
          <stop offset="100%" stopColor="#ff6b92" />
        </linearGradient>
        <linearGradient id="piggyWing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe0e8" />
        </linearGradient>
      </defs>

      <g stroke="#2b1a3f" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 34c9 4 15 12 17 22" strokeWidth="4" fill="none" opacity="0.5" />
        <path d="M8 50c11 2 19 9 23 19" strokeWidth="4" fill="none" opacity="0.35" />
        <path d="M14 66c9 1 15 7 18 15" strokeWidth="4" fill="none" opacity="0.25" />

        <path
          d="M104 34c6 6 6 14 2 20-3-3-8-4-12-3 3-5 3-11 5-16"
          fill="url(#piggyWing)"
          strokeWidth="3.5"
        />
        <path
          d="M20 38c-8 5-9 13-3 18 5-3 11-3 16 0-6-6-6-13-3-19"
          fill="url(#piggyWing)"
          strokeWidth="3.5"
        />

        <path
          d="M44 36c-2-8 2-15 9-17 3 6 2 12-1 17"
          fill="url(#piggyWing)"
          strokeWidth="3.5"
        />
        <path
          d="M70 36c2-8-2-15-9-17-3 6-2 12 1 17"
          fill="url(#piggyWing)"
          strokeWidth="3.5"
        />

        <ellipse cx="60" cy="62" rx="34" ry="30" fill="url(#piggyBody)" strokeWidth="4" />

        <path
          d="M92 74c8 4 12 11 11 18"
          fill="none"
          strokeWidth="4"
        />
        <path
          d="M94 92c-3 2-6 3-9 3"
          fill="none"
          strokeWidth="4"
        />

        <path d="M48 46c6 5 14 5 20 1" fill="none" strokeWidth="4" />
        <path d="M52 62c5 4 10 4 15 0" fill="none" strokeWidth="4" />

        <ellipse cx="60" cy="84" rx="17" ry="12" fill="#ffd1b3" strokeWidth="4" />
        <circle cx="55" cy="86" r="2.4" fill="#2b1a3f" stroke="none" />
        <circle cx="65" cy="86" r="2.4" fill="#2b1a3f" stroke="none" />

        <circle cx="39" cy="70" r="6" fill="#ff5c8a" opacity="0.55" stroke="none" />
        <circle cx="81" cy="70" r="6" fill="#ff5c8a" opacity="0.55" stroke="none" />
      </g>
    </svg>
  );
}