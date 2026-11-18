import type { ReactNode } from 'react';

type IconProps = { size?: number; className?: string };

function Stroke({ size = 24, className, children, width = 2 }: IconProps & { children: ReactNode; width?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconFlame = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <path
      d="M32 6 C44 18 52 28 52 40 A20 20 0 0 1 12 40 C12 33 16 27 21 22 C22 27 25 30 28 30 C26 22 27 13 32 6 Z"
      fill="currentColor"
    />
  </svg>
);
export const IconCalendar = (p: IconProps) => (
  <Stroke {...p}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></Stroke>
);
export const IconBook = (p: IconProps) => (
  <Stroke {...p}><path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13" /></Stroke>
);
export const IconHouse = (p: IconProps) => (
  <Stroke {...p}><path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8zM10 20v-5h4v5" /></Stroke>
);
export const IconCar = (p: IconProps) => (
  <Stroke {...p}><path d="M5 16l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 16M4 16h16v3H4zM7.5 19v1.5M16.5 19v1.5" /></Stroke>
);
export const IconLeaf = (p: IconProps) => (
  <Stroke {...p}><path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19l8-8" /></Stroke>
);
export const IconChevronLeft = (p: IconProps) => (
  <Stroke {...p} width={2.2}><path d="M15 6l-6 6 6 6" /></Stroke>
);
export const IconChevronRight = (p: IconProps) => (
  <Stroke {...p}><path d="M9 6l6 6-6 6" /></Stroke>
);
export const IconPlus = (p: IconProps) => (
  <Stroke {...p} width={2.4}><path d="M12 5v14M5 12h14" /></Stroke>
);
export const IconMinus = (p: IconProps) => (
  <Stroke {...p} width={2.6}><path d="M5 12h14" /></Stroke>
);
export const IconCheck = (p: IconProps) => (
  <Stroke {...p} width={3.5}><path d="M5 12.5l4.5 4.5L19 7.5" /></Stroke>
);
export const IconSearch = (p: IconProps) => (
  <Stroke {...p} width={2.2}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></Stroke>
);
export const IconRepeat = (p: IconProps) => (
  <Stroke {...p} width={2.4}><path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" /></Stroke>
);
export const IconCalendarPlus = (p: IconProps) => (
  <Stroke {...p}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M9 3v4M15 3v4M12 11v6M9 14h6" /></Stroke>
);
export const IconStar = ({ size = 24, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
  </svg>
);
export const IconGear = (p: IconProps) => (
  <Stroke {...p} width={2}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Stroke>
);
export const IconHelp = (p: IconProps) => (
  <Stroke {...p} width={2.2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.4 9.3a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2.3-2.6 3.9" />
    <path d="M12 17.2v.1" />
  </Stroke>
);
