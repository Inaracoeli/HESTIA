import type { ReactNode } from 'react';
import { IconBook, IconCalendar, IconFlame, IconHouse } from './Icons';

export type Tab = 'home' | 'planning' | 'guides' | 'foyer';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'Ma semaine', icon: <IconFlame /> },
  { id: 'planning', label: 'Planning', icon: <IconCalendar /> },
  { id: 'guides', label: 'Guides', icon: <IconBook /> },
  { id: 'foyer', label: 'Mon foyer', icon: <IconHouse /> },
];

export function TabBar({ current, onChange }: { current: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {TABS.map((t) => (
        <button key={t.id} className="tab" aria-current={current === t.id ? 'page' : undefined} onClick={() => onChange(t.id)}>
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  );
}
