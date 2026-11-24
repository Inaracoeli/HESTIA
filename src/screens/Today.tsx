import { useEffect, useState } from 'react';
import { Sheet } from '../components/Sheet';
import { Tableau, useWide } from '../components/Tableau';
import { conseilDuJour } from '../data/conseils';
import { weekImage, weekText } from '../lib/ardoise';
import type { Member } from '../lib/api';
import { Wordmark } from '../components/Brand';
import { IconCheck, IconChevronRight, IconHelp } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { Ring } from '../components/Ring';
import { dueDate, formatMinutes, nextExtraTask, planWeeks, urgency, weekStart } from '../data/engine';
import type { Douceur } from '../data/douceur';
import { DOMAIN_COLOR, DOMAIN_LABEL, toISODate, type Task } from '../data/types';

const DATE_FMT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
const SHORT_FMT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const WEEKDAY_FMT = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' });
const RANGE_FMT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });

type Props = {
  tasks: Task[];
  today: Date;
  capacity: number;
  douceur: Douceur;
  onHelp: () => void;
  onOpen: (t: Task) => void;
  /** Semaine concernée par la question de fin de semaine, ou null si ce n'est pas le moment */
  feedbackWeek: string | null;
  feedbackGiven: boolean;
  onFeedback: (avis: 'trop' | 'bien' | 'pas_assez') => void;
  foyerId: string;
  members: Member[];
  onOpenModule: (m: 'produits' | 'epargne' | 'appareils') => void;
};

/** Prénom court d'un membre (début de l'e-mail). */
export function shortName(members: Member[], id?: string): string | null {
  if (!id) return null;
  const e = members.find((m) => m.userId === id)?.email;
  if (!e) return null;
  const n = e.split('@')[0].split(/[._-]/)[0];
  return n.charAt(0).toUpperCase() + n.slice(1);
}

export function Today({ tasks, today, capacity, douceur, onHelp, onOpen, feedbackWeek, feedbackGiven, onFeedback, foyerId, members, onOpenModule }: Props) {
  const wide = useWide();
  const [ardoise, setArdoise] = useState(false);
  const monday = toISODate(weekStart(today));
  const todayISO = toISODate(today);
  // Faites cette semaine : elles restent affichées, cochées.
  const doneThisWeek = tasks.filter((t) => t.active && t.lastDone >= monday && t.lastDone <= todayISO);
  const doneIds = new Set(doneThisWeek.map((t) => t.id));
  const [week] = planWeeks(tasks.filter((t) => !doneIds.has(t.id)), today, [capacity], { gentle: !!douceur });
  // Une tâche de plus ou de moins cette semaine : gardé sur le téléphone, pour la semaine en cours.
  const adjKey = `hestia.semaine.${monday}`;
  const [adj, setAdjState] = useState<{ plus: string[]; moins: string[] }>(() => {
    try {
      const v = JSON.parse(localStorage.getItem(adjKey) ?? 'null');
      if (v && Array.isArray(v.plus) && Array.isArray(v.moins)) return v;
    } catch {
      // Rien de gardé
    }
    return { plus: [], moins: [] };
  });
  const setAdj = (v: { plus: string[]; moins: string[] }) => {
    setAdjState(v);
    try {
      localStorage.setItem(adjKey, JSON.stringify(v));
    } catch {
      // Stockage indisponible : l'ajustement vaut pour cette visite
    }
  };
  const removed = new Set(adj.moins);
  // Tâches faites pendant la semaine du bilan
  const weekDone = feedbackWeek
    ? tasks.filter((t) => t.lastDone >= feedbackWeek && t.lastDone <= toISODate(new Date(new Date(feedbackWeek + 'T12:00:00').getTime() + 6 * 86400000)))
    : [];
  const planned = new Set(week.tasks.map((t) => t.id));
  const extra = adj.plus
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => !!t && !doneIds.has(t.id) && !planned.has(t.id) && !removed.has(t.id));
  const todo = [...week.tasks.filter((t) => !removed.has(t.id)), ...extra];
  const list = [...todo, ...doneThisWeek];
  const listed = new Set(list.map((t) => t.id));
  const minutes = list.reduce((s, t) => s + t.minutes, 0);

  const upcoming = tasks
    .filter((t) => t.active && !listed.has(t.id))
    .sort((a, b) => dueDate(a, today).getTime() - dueDate(b, today).getTime())
    .slice(0, 3);

  /** Une de plus : on rend d'abord une tâche retirée, sinon la plus prioritaire qui reste. */
  const nextPlus = adj.moins.length ? null : nextExtraTask(tasks, new Set([...listed, ...removed]), today);
  const canPlus = adj.moins.length > 0 || !!nextPlus;
  const addOne = () => {
    if (adj.moins.length) setAdj({ ...adj, moins: adj.moins.slice(0, -1) });
    else if (nextPlus) setAdj({ ...adj, plus: [...adj.plus, nextPlus.id] });
  };
  /** Une de moins : on retire d'abord une tâche ajoutée, sinon la moins prioritaire (une essentielle en dernier).
   *  Elle revient simplement la semaine suivante. */
  const removeOne = () => {
    if (extra.length) {
      const last = extra[extra.length - 1].id;
      setAdj({ ...adj, plus: adj.plus.filter((id) => id !== last) });
      return;
    }
    const kept = week.tasks.filter((t) => !removed.has(t.id)).reverse();
    const pick = kept.find((t) => t.importance !== 1) ?? kept[0];
    if (pick) setAdj({ ...adj, moins: [...adj.moins, pick.id] });
  };

  return (
    <div className="screen">
      <Topbar>
        <Wordmark size={26} />
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <button
            onClick={onHelp}
            aria-label="Aide : bien démarrer"
            style={{ width: 36, height: 36, padding: 0, border: 0, borderRadius: 999, background: 'var(--pill-bg)', color: 'var(--header-ink)', boxShadow: 'var(--pill-glow)', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            <IconHelp size={22} />
          </button>
          <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>{DATE_FMT.format(today)}</span>
        </span>
      </Topbar>
      <header className="header">
        <div className="separator" aria-hidden="true" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 className="title-1 title-home">
            {todo.length === 0 ? 'Semaine bouclée' : `${todo.length} ${todo.length > 1 ? 'tâches' : 'tâche'} cette semaine`}
          </h1>
          <span className="header__sub num" style={{ fontWeight: 500 }}>
            Environ {formatMinutes(minutes)} · {doneThisWeek.length} sur {list.length} {list.length > 1 ? 'faites' : 'faite'}
          </span>
        </div>
      </header>

      <div className={wide ? 'today-grid' : undefined}>
      <div className="content">
        {douceur && (
          <div className="notice" style={{ background: 'var(--chip-bg)', color: 'var(--ink)', lineHeight: 1.45 }}>
            {douceur === 'debut'
              ? 'Pour commencer, juste quelques tâches cette semaine. Le reste attendra son tour, sans pression.'
              : 'Content de vous revoir. On reprend en douceur : seulement les tâches les plus utiles cette semaine.'}
          </div>
        )}
        <div className="card card--raised card--list" style={{ padding: '0 16px' }}>
          {list.length === 0 && <p className="meta" style={{ padding: '20px 0', margin: 0 }}>Rien à faire cette semaine. Profitez-en.</p>}
          {list.map((t) => {
            const done = doneIds.has(t.id);
            return (
              <button key={t.id} className="task-row" onClick={() => onOpen(t)} style={{ opacity: done ? 0.55 : 1 }}>
                {done ? (
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: DOMAIN_COLOR[t.domain], color: '#FFFDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconCheck size={18} />
                  </span>
                ) : (
                  <Ring progress={urgency(t, today)} color={DOMAIN_COLOR[t.domain]} />
                )}
                <span className="task-row__text">
                  <span className="task-row__title" style={{ textDecoration: done ? 'line-through' : 'none' }}>{t.title}</span>
                  <span className="meta num">
                    {DOMAIN_LABEL[t.domain]} · {formatMinutes(t.minutes)}
                    {t.plannedDay && !done ? ` · prévu ${WEEKDAY_FMT.format(new Date(t.plannedDay + 'T12:00:00'))}` : ''}
                    {members.length > 1 && shortName(members, t.assignee) ? ` · ${shortName(members, t.assignee)}` : ''}
                  </span>
                </span>
                {t.importance === 1 && !done ? <span className="chip">Essentiel</span> : <IconChevronRight size={18} />}
              </button>
            );
          })}
        </div>

        <PlusMoins count={todo.length} canMinus={todo.length > 0} canPlus={canPlus} onMinus={removeOne} onPlus={addOne} />
        {todo.length > 0 && (
          <button className="btn-link" onClick={() => setArdoise(true)} style={{ marginTop: -6 }}>Recopier sur l’ardoise</button>
        )}

        {feedbackWeek && !feedbackGiven && !douceur && (
          <section className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, borderColor: 'var(--gold-2)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--link)', letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Bilan · semaine du {RANGE_FMT.format(new Date(feedbackWeek + 'T12:00:00'))} au {RANGE_FMT.format(new Date(new Date(feedbackWeek + 'T12:00:00').getTime() + 6 * 86400000))}
            </span>
            <span style={{ fontSize: 15, lineHeight: 1.4 }}>
              {weekDone.length === 0
                ? 'Aucune tâche cochée cette semaine-là.'
                : `${weekDone.length} tâche${weekDone.length > 1 ? 's' : ''} faite${weekDone.length > 1 ? 's' : ''}, environ ${formatMinutes(weekDone.reduce((s, t) => s + t.minutes, 0))}.`}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Comment c'était ?</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
              {([['trop', 'Trop chargé'], ['bien', 'Juste bien'], ['pas_assez', 'J’aurais pu faire plus']] as const).map(([v, label]) => (
                <button key={v} onClick={() => onFeedback(v)} style={{ minHeight: 52, padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 12, background: 'var(--bg)', color: 'var(--ink)', fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                  {label}
                </button>
              ))}
            </div>
            <span className="meta" style={{ fontSize: 12 }}>Votre réponse ajuste le temps prévu pour la semaine qui commence.</span>
          </section>
        )}

        {upcoming.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <h2 className="title-2">Bientôt</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {upcoming.map((t) => (
                <button key={t.id} className="card" onClick={() => onOpen(t)} style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', color: 'var(--ink)' }}>
                  <span className="dot" style={{ background: DOMAIN_COLOR[t.domain] }} />
                  <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{t.title}</span>
                  <span className="meta num">{SHORT_FMT.format(dueDate(t, today))}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="card" style={{ background: 'var(--chip-bg)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--chip-ink)' }}>Conseil du jour</span>
          <span style={{ fontSize: 14, lineHeight: 1.4 }}>
            {conseilDuJour(today)}
          </span>
        </div>
      </div>
      {wide && (
        <Tableau foyerId={foyerId} tasks={tasks.filter((t) => !doneIds.has(t.id))} today={today} capacity={capacity} onOpen={onOpen} onOpenModule={onOpenModule} />
      )}
      </div>
      {ardoise && (
        <ArdoiseSheet monday={weekStart(today)} tasks={todo} who={(t) => (members.length > 1 ? shortName(members, t.assignee) : null)} onClose={() => setArdoise(false)} />
      )}
    </div>
  );
}

/** Export de la semaine : image façon ardoise à partager, ou texte à copier. */
function ArdoiseSheet({ monday, tasks, who, onClose }: { monday: Date; tasks: Task[]; who: (t: Task) => string | null; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    let u: string | null = null;
    weekImage(monday, tasks, who).then((b) => {
      setBlob(b);
      u = URL.createObjectURL(b);
      setUrl(u);
    }).catch(() => setMsg('Image impossible sur cet appareil : copiez le texte.'));
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const text = weekText(monday, tasks, who);
  const shareImage = async () => {
    if (!blob) return;
    const file = new File([blob], 'hestia-semaine.png', { type: 'image/png' });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'Ma semaine Hestia' });
      else {
        const a = document.createElement('a');
        a.href = url!;
        a.download = 'hestia-semaine.png';
        a.click();
      }
    } catch {
      // Partage annulé
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg('Texte copié.');
    } catch {
      setMsg('Copie impossible.');
    }
  };
  return (
    <Sheet title="Recopier sur l’ardoise" onClose={onClose}>
      {url ? <img src={url} alt={text} style={{ width: '100%', borderRadius: 14 }} /> : !msg && <p className="meta">Préparation…</p>}
      <button className="btn-gold" disabled={!blob} onClick={shareImage}>Partager ou enregistrer l’image</button>
      <button className="btn-secondary" onClick={copy}>Copier en texte</button>
      {msg && <p className="meta" role="status" style={{ margin: 0, textAlign: 'center' }}>{msg}</p>}
      <button className="btn-link" onClick={onClose}>Fermer</button>
    </Sheet>
  );
}
/** Bascule « une de moins / une de plus » : toucher − ou +, ou glisser la pastille vers la gauche ou la droite. */
function PlusMoins({ count, canMinus, canPlus, onMinus, onPlus }: { count: number; canMinus: boolean; canPlus: boolean; onMinus: () => void; onPlus: () => void }) {
  const [dx, setDx] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [flash, setFlash] = useState<'plus' | 'moins' | null>(null);
  const LIMIT = 70;
  const fire = (dir: 'plus' | 'moins') => {
    if (dir === 'plus' ? !canPlus : !canMinus) return;
    (dir === 'plus' ? onPlus : onMinus)();
    setFlash(dir);
    navigator.vibrate?.(10);
    setTimeout(() => setFlash(null), 450);
  };
  const end = () => {
    if (dx > 44) fire('plus');
    else if (dx < -44) fire('moins');
    setDx(0);
    setStart(null);
  };
  return (
    <div className="plusmoins" role="group" aria-label="Ajuster la semaine">
      <button className="plusmoins__side" aria-label="Une tâche de moins" disabled={!canMinus} onClick={() => fire('moins')}>
        <span aria-hidden="true">−</span>
        <small>une de moins</small>
      </button>
      <div
        className="plusmoins__track"
        onPointerDown={(e) => {
          setStart(e.clientX);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => start !== null && setDx(Math.max(-LIMIT, Math.min(LIMIT, e.clientX - start)))}
        onPointerUp={end}
        onPointerCancel={() => { setDx(0); setStart(null); }}
      >
        <span
          className={`plusmoins__knob${flash ? ` plusmoins__knob--${flash}` : ''}`}
          style={{ transform: `translateX(${dx}px)`, transition: start === null ? 'transform 0.25s cubic-bezier(.2,.9,.3,1.3)' : 'none' }}
        >
          <span className="num" style={{ fontSize: 18, fontWeight: 800 }}>{count}</span>
          <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8 }}>{count > 1 ? 'tâches' : 'tâche'}</span>
        </span>
        <span className="plusmoins__hint" aria-hidden="true"><span>‹‹</span><span>››</span></span>
      </div>
      <button className="plusmoins__side" aria-label="Une tâche de plus" disabled={!canPlus} onClick={() => fire('plus')}>
        <span aria-hidden="true">+</span>
        <small>une de plus</small>
      </button>
    </div>
  );
}
