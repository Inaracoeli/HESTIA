import { IconChevronLeft } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { useSwipeBack } from '../components/useSwipeBack';
import { DOMAIN_COLOR, DOMAIN_LABEL, type Domain, type Task } from '../data/types';

const DAY = 24 * 60 * 60 * 1000;
const MONTH_LETTER = new Intl.DateTimeFormat('fr-FR', { month: 'narrow' });
const MONTH_NAME = new Intl.DateTimeFormat('fr-FR', { month: 'long' });

/** Saison d'un mois (0 = janvier). */
function season(m: number): 'hiver' | 'printemps' | 'ete' | 'automne' {
  if (m === 11 || m <= 1) return 'hiver';
  if (m <= 4) return 'printemps';
  if (m <= 7) return 'ete';
  return 'automne';
}
const SEASON_LABEL = { hiver: 'En hiver', printemps: 'Au printemps', ete: 'En été', automne: 'En automne' } as const;

/** Mois (0 à 11, à partir du mois en cours) où la tâche revient dans les 12 prochains mois. */
export function dueMonths(task: Task, today: Date): Set<number> {
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 12, 1);
  const months = new Set<number>();
  let next = new Date(new Date(task.lastDone + 'T12:00:00').getTime() + task.intervalDays * DAY);
  // En retard : la première échéance est ce mois-ci.
  if (next < start) next = new Date(start.getTime() + 12 * 60 * 60 * 1000);
  for (let guard = 0; next < end && guard < 400; guard++) {
    months.add((next.getFullYear() - start.getFullYear()) * 12 + next.getMonth() - start.getMonth());
    next = new Date(next.getTime() + task.intervalDays * DAY);
  }
  return months;
}

type Props = { tasks: Task[]; today: Date; onBack: () => void; onOpen: (t: Task) => void };

export function Echeancier({ tasks, today, onBack, onOpen }: Props) {
  const swipe = useSwipeBack(onBack);
  const followed = tasks
    .filter((t) => t.active && (t.importance <= 2 || t.inSchedule))
    .sort((a, b) => a.importance - b.importance || a.title.localeCompare(b.title, 'fr'));
  const months = Array.from({ length: 12 }, (_, i) => new Date(today.getFullYear(), today.getMonth() + i, 1));
  const rows = followed.map((t) => ({ task: t, due: dueMonths(t, today) }));

  // Temps forts : maintenant (ce mois et le suivant), puis par saison, sans les tâches de chaque mois.
  const notMonthly = rows.filter((r) => r.due.size < 10);
  const now = notMonthly.filter((r) => r.due.has(0) || r.due.has(1)).map((r) => r.task.title);
  const seasons: { label: string; titles: string[] }[] = [];
  for (const m of months.slice(2)) {
    const s = season(m.getMonth());
    const idx = months.indexOf(m);
    const titles = notMonthly.filter((r) => r.due.has(idx)).map((r) => r.task.title);
    const label = SEASON_LABEL[s];
    const group = seasons.find((g) => g.label === label);
    if (group) titles.forEach((t) => !group.titles.includes(t) && group.titles.push(t));
    else seasons.push({ label, titles: [...titles] });
  }
  const currentSeason = SEASON_LABEL[season(today.getMonth())].replace(/^(En|Au) /, '').toLowerCase();

  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar>
        <button className="icon-btn" aria-label="Retour au planning" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 22 }}>Échéancier</h1>
        <span style={{ width: 44 }} />
      </Topbar>
      <div className="screen">
        <header className="header" style={{ paddingBottom: 62 }}>
          <span className="header__sub">Les entretiens qui comptent, sur les douze prochains mois.</span>
        </header>

        <div className="content" style={{ gap: 18 }}>
          <section className="card card--raised" style={{ padding: '14px 12px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 108, flexShrink: 0 }} />
              <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 3 }}>
                {months.map((m, i) => (
                  <span
                    key={i}
                    title={MONTH_NAME.format(m)}
                    style={{
                      height: 20, borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i === 0 ? 'var(--ink)' : 'transparent', color: i === 0 ? 'var(--bg)' : 'var(--ink-soft)',
                    }}
                  >
                    {MONTH_LETTER.format(m)}
                  </span>
                ))}
              </div>
            </div>
            {rows.length === 0 && <p className="meta" style={{ margin: '8px 0' }}>Aucun entretien important à suivre pour l'instant.</p>}
            {rows.map(({ task, due }) => (
              <button
                key={task.id}
                onClick={() => onOpen(task)}
                aria-label={`${task.title} : ${[...due].sort((a, b) => a - b).map((i) => MONTH_NAME.format(months[i])).join(', ') || 'rien dans les douze mois'}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 32, border: 0, background: 'none', padding: 0, color: 'var(--ink)', textAlign: 'left' }}
              >
                <span style={{ width: 108, flexShrink: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.15 }}>{task.title}</span>
                <span style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 3 }}>
                  {months.map((_, i) => (
                    <span key={i} style={{ height: 16, borderRadius: 5, background: due.has(i) ? DOMAIN_COLOR[task.domain] : 'var(--divider)', opacity: due.has(i) ? 1 : 0.55 }} />
                  ))}
                </span>
              </button>
            ))}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', paddingTop: 8, borderTop: '1px solid var(--divider)' }}>
              {(['maison', 'exterieur', 'vehicule'] as Domain[]).map((d) => (
                <span key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-soft)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: DOMAIN_COLOR[d] }} />
                  {DOMAIN_LABEL[d]}
                </span>
              ))}
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 className="title-2">Les temps forts</h2>
            {now.length > 0 && (
              <div className="card" style={{ background: 'var(--ink)', borderColor: 'var(--ink)', color: 'var(--bg)', padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-1)', letterSpacing: 0.6, textTransform: 'uppercase' }}>Maintenant · {currentSeason}</span>
                <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{now.join(', ')}</span>
              </div>
            )}
            <div className="card card--list">
              {seasons.filter((s) => s.titles.length > 0).map((s) => (
                <div key={s.label} style={{ minHeight: 60, padding: '10px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--link)', letterSpacing: 0.6, textTransform: 'uppercase' }}>{s.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{s.titles.join(', ')}</span>
                </div>
              ))}
            </div>
            <p className="meta" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
              Les tâches de chaque mois (comme la pression des pneus) restent dans la grille mais pas dans les temps forts.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
