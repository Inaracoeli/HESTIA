import { IconChevronLeft, IconChevronRight, IconMinus, IconPlus } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { useSwipeBack } from '../components/useSwipeBack';
import { CAPACITY_STEPS, formatMinutes } from '../data/engine';
import type { Level } from '../data/types';
import { useState, type CSSProperties, type FormEvent } from 'react';
import { setPassword, signOut, type Alarm, type UserSettings } from '../lib/api';
import { pushState, subscribePush, testPush } from '../lib/push';

const STEPS_MIN = CAPACITY_STEPS;
const LEVELS: { id: Level; name: string; note: string }[] = [
  { id: 'debutant', name: 'Débutant', note: 'Chaque geste est détaillé.' },
  { id: 'intermediaire', name: 'Intermédiaire', note: 'Les étapes clés, sans le superflu.' },
  { id: 'expert', name: 'Expert', note: "Deux ou trois lignes, l'essentiel seulement." },
];

function Switch({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ minHeight: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ flexGrow: 1, fontSize: 15, fontWeight: 600 }}>{label}</span>
      <button className="switch" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}>
        <span className="switch__track"><span className="switch__knob" /></span>
      </button>
    </div>
  );
}

type Props = {
  userId: string;
  email: string | null;
  settings: UserSettings;
  dark: boolean;
  onChange: (s: UserSettings) => void;
  onBack: () => void;
  onOpenGuide: () => void;
};

/** Réglages personnels : rythme, niveau, apparence, compte. */
export function Reglages({ userId, email, settings, dark, onChange, onBack, onOpenGuide }: Props) {
  const swipe = useSwipeBack(onBack);
  const idx = Math.max(0, STEPS_MIN.indexOf(settings.capacity));
  const set = (patch: Partial<UserSettings>) => onChange({ ...settings, ...patch });
  const level = LEVELS.find((l) => l.id === settings.level) ?? LEVELS[1];

  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar>
        <button className="icon-btn" aria-label="Retour" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 22 }}>Réglages</h1>
        <span style={{ width: 44 }} />
      </Topbar>
      <div className="screen">
        <header className="header" style={{ paddingBottom: 62 }}>
          <span className="header__sub">Votre rythme, votre niveau, l'apparence.</span>
        </header>

        <div className="content">
        <section className="card card--raised" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="title-2" style={{ fontSize: 17 }}>Mon temps d'entretien par semaine</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              aria-label="Moins de temps"
              onClick={() => set({ capacity: STEPS_MIN[Math.max(0, idx - 1)] })}
              style={{ width: 48, height: 48, border: 0, borderRadius: '50%', background: 'var(--chip-bg)', color: 'var(--chip-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconMinus size={20} />
            </button>
            <span className="num" style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8 }}>{formatMinutes(settings.capacity)}</span>
            <button
              aria-label="Plus de temps"
              onClick={() => set({ capacity: STEPS_MIN[Math.min(STEPS_MIN.length - 1, idx + 1)] })}
              style={{ width: 48, height: 48, border: 0, borderRadius: '50%', background: 'var(--gold)', color: 'var(--on-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconPlus size={20} />
            </button>
          </div>
          <span className="meta" style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.4 }}>Jamais plus de 5 tâches par semaine ; les essentielles passent en priorité.</span>
        </section>

        <Rappel userId={userId} value={settings.reminder} onChange={(reminder) => set({ reminder })} />

        <section className="card" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 className="title-2" style={{ fontSize: 17 }}>Mon niveau de bricolage</h2>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--link)' }}>{level.name}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
            {LEVELS.map((l, i) => (
              <button
                key={l.id}
                aria-label={l.name}
                aria-pressed={l.id === settings.level}
                onClick={() => set({ level: l.id })}
                style={{ height: 44, border: 0, padding: 0, background: 'transparent', display: 'flex', alignItems: 'center' }}
              >
                <span style={{ width: '100%', height: 12, borderRadius: 6, background: i <= LEVELS.indexOf(level) ? 'var(--gold-2)' : 'var(--divider)' }} />
              </button>
            ))}
          </div>
          <span className="meta" style={{ fontSize: 13 }}>{level.note}</span>
        </section>

        <section className="card card--list">
          <Switch label="Thème sombre" on={dark} onChange={(v) => set({ theme: v ? 'sombre' : 'clair' })} />
          <Switch label="Animations" on={settings.motion} onChange={(v) => set({ motion: v })} />
        </section>

        <button className="card" onClick={onOpenGuide} style={{ minHeight: 64, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink)', textAlign: 'left' }}>
          <span style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Bien utiliser Hestia</span>
            <span className="meta">L'esprit de l'app, en deux minutes</span>
          </span>
          <IconChevronRight size={18} />
        </button>

        <PasswordForm />

        <section className="card card--list">
          <div style={{ minHeight: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ flexGrow: 1, fontSize: 14, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</span>
            <button className="btn-link" onClick={() => signOut()}>Se déconnecter</button>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}

/** Changer son mot de passe (utile après un mot de passe provisoire). */
function PasswordForm() {
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await setPassword(pwd);
      setPwd('');
      setMsg({ ok: true, text: 'Mot de passe changé.' });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="card" onSubmit={submit} style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 className="title-2" style={{ fontSize: 17 }}>Mot de passe</h2>
      <label className="field">
        <span className="field__label">Nouveau mot de passe (8 caractères minimum)</span>
        <input className="input" type="password" required minLength={8} autoComplete="new-password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
      </label>
      <button className="btn-secondary" type="submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Changer mon mot de passe'}</button>
      {msg && <div className={`notice ${msg.ok ? 'notice--ok' : 'notice--error'}`} role="status">{msg.text}</div>}
    </form>
  );
}

/** Jours dans l'ordre de la semaine française (lundi d'abord) ; 0 = dimanche comme en JavaScript. */
const JOURS = [
  { v: 1, c: 'L', l: 'lun.' },
  { v: 2, c: 'M', l: 'mar.' },
  { v: 3, c: 'M', l: 'mer.' },
  { v: 4, c: 'J', l: 'jeu.' },
  { v: 5, c: 'V', l: 'ven.' },
  { v: 6, c: 'S', l: 'sam.' },
  { v: 0, c: 'D', l: 'dim.' },
];

function daysLabel(days: number[]): string {
  if (days.length === 7) return 'Tous les jours';
  if (days.length === 0) return 'Aucun jour choisi';
  if (days.length === 2 && days.includes(6) && days.includes(0)) return 'Le week-end';
  return JOURS.filter((j) => days.includes(j.v)).map((j) => j.l).join(' ');
}

/** Rappels : 2 ou 3 petites choses à recopier sur l'ardoise, autant de rappels que voulu, comme des alarmes. */
function Rappel({ userId, value, onChange }: { userId: string; value: UserSettings['reminder']; onChange: (v: UserSettings['reminder']) => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState<Alarm | null>(null);
  const state = pushState();
  const run = async (f: () => Promise<void>) => {
    setBusy(true);
    setMsg(null);
    try {
      await f();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };
  const toggle = (on: boolean) =>
    run(async () => {
      if (on) await subscribePush(userId);
      onChange({ ...value, on });
    });
  const setList = (list: Alarm[]) => onChange({ ...value, list: [...list].sort((a, b) => a.time.localeCompare(b.time)) });
  const save = (a: Alarm) => {
    setList(value.list.some((x) => x.id === a.id) ? value.list.map((x) => (x.id === a.id ? a : x)) : [...value.list, a]);
    setEditing(null);
  };
  return (
    <>
    <section className="card" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 className="title-2" style={{ fontSize: 17 }}>Rappels</h2>
      <p className="meta" style={{ margin: 0, fontSize: 13, lineHeight: 1.45 }}>
        Une notification avec 2 ou 3 petites choses à faire, à recopier sur l’ardoise de la maison. Ajoutez autant de rappels que vous voulez, comme des alarmes.
      </p>
      {state === 'installer' ? (
        <div className="notice" style={{ background: 'var(--chip-bg)', color: 'var(--ink)' }}>
          Sur iPhone, ajoutez d’abord Hestia à l’écran d’accueil : dans Safari, touchez Partager puis « Sur l’écran d’accueil ». Ouvrez Hestia depuis cette icône et revenez ici.
        </div>
      ) : state === 'non' ? (
        <div className="notice" style={{ background: 'var(--chip-bg)', color: 'var(--ink)' }}>Ce navigateur ne permet pas les notifications.</div>
      ) : (
        <>
          <Switch label="Recevoir les rappels" on={value.on} onChange={(v) => !busy && toggle(v)} />
          {value.on && (
            <>
              <div className="card--list" style={{ display: 'flex', flexDirection: 'column' }}>
                {value.list.length === 0 && <p className="meta" style={{ margin: '4px 0' }}>Aucun rappel pour l’instant.</p>}
                {value.list.map((a) => (
                  <div key={a.id} style={{ minHeight: 68, display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--divider)' }}>
                    <button onClick={() => setEditing(a)} aria-label={`Modifier le rappel de ${a.time}`} style={{ flexGrow: 1, border: 0, background: 'none', padding: '8px 0', textAlign: 'left', color: 'var(--ink)', opacity: a.on ? 1 : 0.45, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="num" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1.1 }}>{a.time.replace(':', ' h ')}</span>
                      <span className="meta" style={{ fontSize: 13 }}>{daysLabel(a.days)}</span>
                    </button>
                    <button className="switch" role="switch" aria-checked={a.on} aria-label={`Rappel de ${a.time} ${a.on ? 'actif' : 'inactif'}`} onClick={() => setList(value.list.map((x) => (x.id === a.id ? { ...x, on: !x.on } : x)))}>
                      <span className="switch__track"><span className="switch__knob" /></span>
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn-secondary" onClick={() => setEditing({ id: Math.random().toString(36).slice(2, 9), days: [5], time: '11:00', on: true })}>
                <IconPlus size={18} /> Ajouter un rappel
              </button>
              <button className="btn-link" disabled={busy} onClick={() => run(async () => {
                const n = await testPush();
                setMsg({ ok: n > 0, text: n > 0 ? 'Rappel envoyé : regardez vos notifications.' : 'Aucun appareil abonné : désactivez puis réactivez les rappels.' });
              })}>
                {busy ? 'Un instant…' : 'Recevoir un essai maintenant'}
              </button>
            </>
          )}
        </>
      )}
      {msg && <div className={`notice ${msg.ok ? 'notice--ok' : 'notice--error'}`} role="status">{msg.text}</div>}
    </section>
      {editing && (
        <AlarmEditor
          alarm={editing}
          isNew={!value.list.some((x) => x.id === editing.id)}
          onSave={save}
          onDelete={() => { setList(value.list.filter((x) => x.id !== editing.id)); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function AlarmEditor({ alarm, isNew, onSave, onDelete, onClose }: { alarm: Alarm; isNew: boolean; onSave: (a: Alarm) => void; onDelete: () => void; onClose: () => void }) {
  const [time, setTime] = useState(alarm.time);
  const [days, setDays] = useState(alarm.days);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={isNew ? 'Nouveau rappel' : 'Modifier le rappel'} onClick={(e) => e.stopPropagation()}>
        <span className="sheet__grip" aria-hidden="true" />
        <h2 className="title-2">{isNew ? 'Nouveau rappel' : 'Modifier le rappel'}</h2>
        <label className="field">
          <span className="field__label">Heure</span>
          <input
            className="input num"
            type="time"
            value={time}
            onChange={(e) => /^\d\d:\d\d$/.test(e.target.value) && setTime(e.target.value)}
            style={{ fontSize: 28, fontWeight: 600, height: 64, textAlign: 'center' }}
          />
        </label>
        <div className="field">
          <span className="field__label">Jours</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
            {JOURS.map((j) => {
              const on = days.includes(j.v);
              return (
                <button
                  key={j.v}
                  aria-pressed={on}
                  aria-label={j.l}
                  onClick={() => setDays(on ? days.filter((d) => d !== j.v) : [...days, j.v])}
                  style={{
                    height: 44, borderRadius: 999, fontSize: 15, fontWeight: 700,
                    border: on ? 0 : '1px solid var(--line)', background: on ? 'var(--gold)' : 'var(--card)', color: on ? 'var(--on-gold)' : 'var(--ink)',
                  }}
                >
                  {j.c}
                </button>
              );
            })}
          </div>
          <span className="meta" style={{ fontSize: 13 }}>{daysLabel(days)}</span>
        </div>
        <button className="btn-gold" disabled={days.length === 0} onClick={() => onSave({ ...alarm, time, days, on: true })}>Enregistrer</button>
        {!isNew && <button className="btn-link" style={{ color: '#9B2C1F' }} onClick={onDelete}>Supprimer ce rappel</button>}
        <button className="btn-link" onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
}
