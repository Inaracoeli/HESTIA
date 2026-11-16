import { useState, type ReactNode } from 'react';
import { IconBook, IconCar, IconChevronRight, IconHouse, IconLeaf, IconSearch } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { DOMAIN_COLOR, DOMAIN_LABEL, type Domain, type Task } from '../data/types';

const TINT: Record<Domain, [string, string]> = {
  maison: ['#F6E3D6', '#9A3608'],
  exterieur: ['#E1EFD6', '#2C5A1B'],
  vehicule: ['#DFE6EF', '#2F4259'],
};
const ICON: Record<Domain, ReactNode> = {
  maison: <IconHouse size={26} />,
  exterieur: <IconLeaf size={26} />,
  vehicule: <IconCar size={26} />,
};

type Props = { tasks: Task[]; onOpen: (t: Task) => void; onOpenGuide: () => void };

export function Guides({ tasks, onOpen, onOpenGuide }: Props) {
  const [filter, setFilter] = useState<Domain | 'all'>('all');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = tasks.filter((t) => (filter === 'all' || t.domain === filter) && (!q || t.title.toLowerCase().includes(q)));

  return (
    <div className="screen">
      <Topbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="title-icon" aria-hidden="true">
            <IconBook size={22} className="anim-wiggle" />
          </span>
          <h1 className="title-1">Guides</h1>
        </div>
      </Topbar>
      <header className="header" style={{ paddingBottom: 62 }}>
        <span className="header__sub">Savoir quoi faire, et comment.</span>
      </header>

      <div className="content">
        {!q && (
          <button className="card" onClick={onOpenGuide} style={{ border: 0, textAlign: 'left', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink)', font: 'inherit', background: 'var(--card)' }}>
            <span style={{ flexShrink: 0, width: 38, height: 38, borderRadius: '50%', background: 'var(--gold)', color: 'var(--on-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconBook size={20} />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
              <strong style={{ fontSize: 16 }}>Bien utiliser Hestia</strong>
              <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>L'esprit de l'app, en 2 minutes.</span>
            </span>
            <IconChevronRight size={18} />
          </button>
        )}
        <label className="card card--raised" style={{ height: 54, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 18 }}>
          <IconSearch size={20} />
          <input
            type="search"
            aria-label="Chercher un guide"
            placeholder="Chercher un guide, un geste, un produit"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flexGrow: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 16, color: 'var(--ink)' }}
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
          {list.length === 0 && <p className="meta" style={{ padding: '16px 0', margin: 0 }}>Aucun guide ne correspond.</p>}
          {list.map((t) => (
            <button key={t.id} className="task-row" style={{ minHeight: 78 }} onClick={() => onOpen(t)}>
              <span style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 16, background: TINT[t.domain][0], color: TINT[t.domain][1], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {ICON[t.domain]}
              </span>
              <span className="task-row__text">
                <span className="task-row__title" style={{ fontSize: 15 }}>{t.title}</span>
                <span className="meta">
                  {t.questions.length > 0 ? 'S’adapte à votre cas' : `${t.steps.intermediaire.length} étapes`}
                </span>
              </span>
              <IconChevronRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
