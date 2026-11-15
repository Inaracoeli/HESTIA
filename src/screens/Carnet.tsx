import { useEffect, useState } from 'react';
import { IconChevronLeft } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { useSwipeBack } from '../components/useSwipeBack';
import { DOMAIN_COLOR } from '../data/types';
import { deleteJournalEntry, loadJournal, type JournalEntry, type Member } from '../lib/api';

const MONTH_FMT = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const DAY_FMT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const EURO = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

type Props = { foyerId: string; members: Member[]; onBack: () => void; onChanged: () => void };

export function Carnet({ foyerId, members, onBack, onChanged }: Props) {
  const swipe = useSwipeBack(onBack);
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    loadJournal(foyerId).then(setEntries).catch((err) => setError((err as Error).message));
  }, [foyerId]);

  const spent = (entries ?? []).filter((e) => e.date.startsWith(String(year))).reduce((s, e) => s + (e.cost ?? 0), 0);
  const groups: { label: string; items: JournalEntry[] }[] = [];
  for (const e of entries ?? []) {
    const label = MONTH_FMT.format(new Date(e.date + 'T12:00:00'));
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(e);
    else groups.push({ label, items: [e] });
  }
  const who = (id: string | null) => members.find((m) => m.userId === id)?.email?.split('@')[0] ?? null;

  const remove = async (e: JournalEntry) => {
    try {
      await deleteJournalEntry(e.id);
      setEntries((list) => (list ?? []).filter((x) => x.id !== e.id));
      setSelected(null);
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar>
        <button className="icon-btn" aria-label="Retour au foyer" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 22 }}>Carnet d'entretien</h1>
        <span style={{ width: 44 }} />
      </Topbar>
      <div className="screen">
        <header className="header" style={{ paddingBottom: 62 }}>
          <span className="header__sub">Tout ce qui a été fait, avec le coût réel.</span>
        </header>

        <div className="content" style={{ gap: 18 }}>
          <div className="card card--raised" style={{ padding: '14px 6px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, borderRight: '1px solid var(--divider)' }}>
              <span className="num" style={{ fontSize: 22, fontWeight: 700 }}>{(entries ?? []).filter((e) => e.date.startsWith(String(year))).length}</span>
              <span className="meta">entretiens en {year}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span className="num" style={{ fontSize: 22, fontWeight: 700 }}>{EURO.format(spent)}</span>
              <span className="meta">dépensés en {year}</span>
            </div>
          </div>

          {error && <div className="notice notice--error" role="alert">{error}</div>}
          {entries === null && !error && <p className="meta">Chargement…</p>}
          {entries?.length === 0 && (
            <p className="meta" style={{ textAlign: 'center', lineHeight: 1.45 }}>Le carnet est vide pour l'instant. Chaque « C'est fait » viendra s'y inscrire.</p>
          )}

          {groups.map((g) => (
            <section key={g.label} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2 className="title-2" style={{ textTransform: 'capitalize' }}>{g.label}</h2>
              <div className="card card--list">
                {g.items.map((e) => (
                  <button key={e.id} className="task-row" style={{ minHeight: 62 }} onClick={() => setSelected(e)}>
                    <span className="dot" style={{ background: DOMAIN_COLOR[e.domain] }} />
                    <span className="task-row__text">
                      <span className="task-row__title" style={{ fontSize: 15 }}>{e.title}</span>
                      <span className="meta num">
                        {DAY_FMT.format(new Date(e.date + 'T12:00:00'))}
                        {who(e.userId) ? ` · ${who(e.userId)}` : ''}
                        {e.note ? ` · ${e.note}` : ''}
                      </span>
                    </span>
                    {e.cost !== null && e.cost > 0 && <span className="num" style={{ fontSize: 14, fontWeight: 700 }}>{EURO.format(e.cost)}</span>}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {selected && (
        <div className="sheet-backdrop" onClick={() => setSelected(null)}>
          <div className="sheet" role="dialog" aria-label={selected.title} onClick={(ev) => ev.stopPropagation()}>
            <span className="sheet__grip" aria-hidden="true" />
            <h2 className="title-2">{selected.title}</h2>
            <span style={{ fontSize: 15 }}>
              Fait le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(selected.date + 'T12:00:00'))}
              {who(selected.userId) ? ` par ${who(selected.userId)}` : ''}.
            </span>
            {selected.cost !== null && <span style={{ fontSize: 15 }}>Coût : {EURO.format(selected.cost)}</span>}
            {selected.note && <span style={{ fontSize: 15, lineHeight: 1.4 }}>Note : {selected.note}</span>}
            <button className="btn-secondary" style={{ color: '#9B2C1F' }} onClick={() => remove(selected)}>Retirer du carnet (erreur de saisie)</button>
            <button className="btn-link" onClick={() => setSelected(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
