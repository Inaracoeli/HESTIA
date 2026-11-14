import { useState, type ReactNode } from 'react';
import { IconBook, IconCar, IconChevronRight, IconHouse, IconLeaf, IconSearch } from '../components/Icons';
import { DOMAIN_COLOR, DOMAIN_LABEL, type Domain, type Task } from '../data/types';

const TINT: Record<Domain, [string, string]> = {
  maison: ['#F6E3D6', '#9A3608'],
  exterieur: ['#E0EADF', '#36543A'],
  vehicule: ['#E1E7EC', '#3E4E5E'],
};
const ICON: Record<Domain, ReactNode> = {
  maison: <IconHouse size={26} />,
  exterieur: <IconLeaf size={26} />,
  vehicule: <IconCar size={26} />,
};

type Props = { tasks: Task[]; onOpen: (t: Task) => void };

export function Guides({ tasks, onOpen }: Props) {
  const [filter, setFilter] = useState<Domain | 'all'>('all');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = tasks.filter((t) => (filter === 'all' || t.domain === filter) && (!q || t.title.toLowerCase().includes(q)));

  return (
    <div className="screen">
      <header className="header" style={{ paddingBottom: 62 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="title-icon" aria-hidden="true">
            <IconBook size={22} className="anim-wiggle" />
          </span>
          <h1 className="title-1">Guides</h1>
        </div>
        <span className="header__sub">Savoir quoi faire, et comment.</span>
      </header>

      <div className="content">
        <label className="card card--raised" style={{ height: 54, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 18 }}>
          <IconSearch size={20} />
          <input
            type="search"
            aria-label="Chercher un guide"
            placeholder="Chercher un guide, un geste, un produit"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flexGrow: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 15, color: 'var(--ink)' }}
          />
        </label>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {(['all', 'maison', 'exterieur', 'vehicule'] as const).map((d) => {
            const on = filter === d;
            return (
              <button
                key={d}
                aria-pressed={on}
                onClick={() => setFilter(d)}
                style={{
                  height: 44, padding: '0 14px', borderRadius: 999, flexShrink: 0,
                  border: on ? 0 : '1px solid var(--line)',
                  background: on ? 'var(--ink)' : 'var(--card)', color: on ? 'var(--bg)' : 'var(--ink)',
                  fontSize: 14, fontWeight: on ? 700 : 600, display: 'flex', alignItems: 'center', gap: 7,
                }}
              >
                {d !== 'all' && <span className="dot" style={{ width: 9, height: 9, background: DOMAIN_COLOR[d] }} />}
                {d === 'all' ? 'Tout' : DOMAIN_LABEL[d]}
              </button>
            );
          })}
        </div>

        <div className="card card--list" style={{ padding: '2px 14px' }}>
          {list.length === 0 && <p className="meta" style={{ padding: '16px 0' }}>Aucun guide ne correspond.</p>}
          {list.map((t) => (
            <button key={t.id} className="task-row" style={{ minHeight: 78 }} onClick={() => onOpen(t)}>
              <span style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 16, background: TINT[t.domain][0], color: TINT[t.domain][1], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {ICON[t.domain]}
              </span>
              <span className="task-row__text">
                <span className="task-row__title" style={{ fontSize: 15 }}>{t.title}</span>
                <span className="meta">{t.steps.intermediaire.length} étapes</span>
              </span>
              <IconChevronRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
