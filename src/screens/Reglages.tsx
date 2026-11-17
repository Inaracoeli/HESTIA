import { IconChevronLeft, IconChevronRight, IconMinus, IconPlus } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { useSwipeBack } from '../components/useSwipeBack';
import { CAPACITY_STEPS, formatMinutes } from '../data/engine';
import type { Level } from '../data/types';
import { useState, type CSSProperties, type FormEvent } from 'react';
import { setPassword, signOut, type UserSettings } from '../lib/api';
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

const JOURS = [
  { v: 4, l: 'Jeudi' },
  { v: 5, l: 'Vendredi' },
  { v: 6, l: 'Samedi' },
  { v: 0, l: 'Dimanche' },
];
const HEURES = ['08:00', '12:00', '18:00', '20:00'];

/** Rappel du week-end : 2 ou 3 tâches rapides à recopier sur l'ardoise. */
function Rappel({ userId, value, onChange }: { userId: string; value: UserSettings['reminder']; onChange: (v: UserSettings['reminder']) => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
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
  const chip = (on: boolean): CSSProperties => ({
    minHeight: 40, padding: '0 12px', borderRadius: 12, fontSize: 14, fontWeight: on ? 700 : 500,
    border: on ? '2px solid var(--gold-2)' : '1px solid var(--line)', background: on ? 'var(--chip-bg)' : 'var(--card)', color: 'var(--ink)',
  });
  return (
    <section className="card" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 className="title-2" style={{ fontSize: 17 }}>Rappel du week-end</h2>
      <p className="meta" style={{ margin: 0, fontSize: 13, lineHeight: 1.45 }}>
        Une notification avec 2 ou 3 petites choses à faire, à recopier sur l’ardoise de la maison. Rien d’autre.
      </p>
      {state === 'installer' ? (
        <div className="notice" style={{ background: 'var(--chip-bg)', color: 'var(--ink)' }}>
          Sur iPhone, ajoutez d’abord Hestia à l’écran d’accueil : dans Safari, touchez Partager puis « Sur l’écran d’accueil ». Ouvrez Hestia depuis cette icône et revenez ici.
        </div>
      ) : state === 'non' ? (
        <div className="notice" style={{ background: 'var(--chip-bg)', color: 'var(--ink)' }}>Ce navigateur ne permet pas les notifications.</div>
      ) : (
        <>
          <Switch label="Recevoir le rappel" on={value.on} onChange={(v) => !busy && toggle(v)} />
          {value.on && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {JOURS.map((j) => (
                  <button key={j.v} style={chip(value.day === j.v)} aria-pressed={value.day === j.v} onClick={() => onChange({ ...value, day: j.v })}>{j.l}</button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                {HEURES.map((h) => (
                  <button key={h} style={chip(value.time === h)} aria-pressed={value.time === h} onClick={() => onChange({ ...value, time: h })}>{h.replace(':00', ' h')}</button>
                ))}
                <input
                  type="time"
                  aria-label="Autre heure"
                  value={value.time}
                  onChange={(e) => /^\d\d:\d\d$/.test(e.target.value) && onChange({ ...value, time: e.target.value })}
                  style={{ ...chip(!HEURES.includes(value.time)), fontFamily: 'inherit' }}
                />
              </div>
              <button className="btn-secondary" disabled={busy} onClick={() => run(async () => {
                const n = await testPush();
                setMsg({ ok: n > 0, text: n > 0 ? 'Rappel envoyé : regardez vos notifications.' : 'Aucun appareil abonné : désactivez puis réactivez le rappel.' });
              })}>
                {busy ? 'Un instant…' : 'Recevoir un essai maintenant'}
              </button>
            </>
          )}
        </>
      )}
      {msg && <div className={`notice ${msg.ok ? 'notice--ok' : 'notice--error'}`} role="status">{msg.text}</div>}
    </section>
  );
}
