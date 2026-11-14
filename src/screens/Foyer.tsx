import { IconHouse, IconMinus, IconPlus } from '../components/Icons';
import { formatMinutes } from '../data/engine';
import type { Level } from '../data/types';

export type Settings = {
  capacity: number; // minutes par semaine
  level: Level;
  dark: boolean;
  motion: boolean;
};

const STEPS_MIN = [30, 60, 90, 120, 180, 240];
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

export function Foyer({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const idx = Math.max(0, STEPS_MIN.indexOf(settings.capacity));
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  const level = LEVELS.find((l) => l.id === settings.level) ?? LEVELS[1];

  return (
    <div className="screen">
      <header className="header" style={{ paddingBottom: 62 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="title-icon" aria-hidden="true">
            <IconHouse size={22} className="anim-bounce" />
          </span>
          <h1 className="title-1">Foyer</h1>
        </div>
        <span className="header__sub">Maison avec jardin, 2 voitures</span>
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
          <span className="meta" style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.4 }}>
            Les tâches essentielles passent toujours.
          </span>
        </section>

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
          <Switch label="Thème sombre" on={settings.dark} onChange={(v) => set({ dark: v })} />
          <Switch label="Animations" on={settings.motion} onChange={(v) => set({ motion: v })} />
        </section>

        <p className="meta" style={{ textAlign: 'center', lineHeight: 1.4 }}>
          Version de démonstration : les tâches sont des exemples
          <br />et rien n'est encore enregistré.
        </p>
      </div>
    </div>
  );
}
