export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="ZS — Zaryab Shaukat"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="zsGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.13 190)" />
          <stop offset="100%" stopColor="oklch(0.48 0.12 215)" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#zsGrad)" />
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="13"
        fill="none"
        stroke="oklch(1 0 0 / 0.35)"
        strokeWidth="1.2"
      />
      <path
        d="M13 15h16.5l-13 18H33"
        fill="none"
        stroke="oklch(1 0 0)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M33 18.5c-1.6-2-4-2.9-6.2-2.2-2.6.8-3.3 3.8-1.2 5.3 1.9 1.4 5.4 1.2 6.8 3.1 1.6 2.2-.3 5.2-3.2 5.6-2.3.3-4.5-.7-5.8-2.6"
        fill="none"
        stroke="oklch(1 0 0 / 0.55)"
        strokeWidth="2.2"
        strokeLinecap="round"
        transform="translate(1 6) scale(0.72) translate(9 6)"
      />
    </svg>
  );
}

export function LogoWordmark() {
  return (
    <div className="flex items-center gap-3">
      <Logo size={34} />
      <div className="leading-tight">
        <div className="font-display text-[15px] font-bold tracking-tight text-sidebar-accent-foreground">
          ZS Books
        </div>
        <div className="text-[11px] text-sidebar-foreground/60">Zaryab Shaukat</div>
      </div>
    </div>
  );
}
