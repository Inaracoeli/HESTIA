import { useEffect, useState, type FormEvent } from 'react';
import { IconHouse, IconMinus, IconPlus } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { formatMinutes } from '../data/engine';
import type { Level } from '../data/types';
import { inviteMember, loadMembers, signOut, type Foyer as FoyerT, type Member, type UserSettings } from '../lib/api';

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

type Props = {
  foyer: FoyerT;
  email: string | null;
  settings: UserSettings;
  dark: boolean;
  onChange: (s: UserSettings) => void;
};

export function Foyer({ foyer, email, settings, dark, onChange }: Props) {
  const idx = Math.max(0, STEPS_MIN.indexOf(settings.capacity));
  const set = (patch: Partial<UserSettings>) => onChange({ ...settings, ...patch });
  const level = LEVELS.find((l) => l.id === settings.level) ?? LEVELS[1];
  const isAdmin = foyer.role === 'admin';

  const [members, setMembers] = useState<Member[]>([]);
  const [invite, setInvite] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    loadMembers(foyer.id).then(setMembers).catch(() => setMembers([]));
  }, [foyer.id]);

  const sendInvite = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const statut = await inviteMember(foyer.id, invite);
      setMessage({
        ok: true,
        text: statut === 'invite' ? `Invitation envoyée à ${invite}.` : `${invite} avait déjà un compte : il est ajouté au foyer et peut se connecter.`,
      });
      setInvite('');
      setMembers(await loadMembers(foyer.id));
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen">
      <Topbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="title-icon" aria-hidden="true">
            <IconHouse size={22} className="anim-bounce" />
          </span>
          <h1 className="title-1">Foyer</h1>
        </div>
      </Topbar>
      <header className="header" style={{ paddingBottom: 62 }}>
        <span className="header__sub">{foyer.nom}{foyer.description ? ` · ${foyer.description}` : ''}</span>
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
          <span className="meta" style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.4 }}>Les tâches essentielles passent toujours.</span>
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

        <section className="card" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="title-2" style={{ fontSize: 17 }}>Style du nom HESTIA</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 4, background: 'var(--divider)', borderRadius: 14, padding: 4 }}>
            {([['capsule', 'Capsule dorée'], ['braise', 'Braise']] as const).map(([v, label]) => {
              const on = (settings.brand ?? 'capsule') === v;
              return (
                <button
                  key={v}
                  aria-pressed={on}
                  onClick={() => set({ brand: v })}
                  style={{ height: 44, border: 0, borderRadius: 11, background: on ? 'var(--card)' : 'transparent', color: 'var(--ink)', fontSize: 14, fontWeight: on ? 700 : 500, boxShadow: on ? '0 1px 4px rgba(42,36,32,0.15)' : 'none' }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <span className="meta" style={{ fontSize: 13 }}>Réglage gardé sur cet appareil.</span>
        </section>

        <section className="card card--list">
          <Switch label="Thème sombre" on={dark} onChange={(v) => set({ theme: v ? 'sombre' : 'clair' })} />
          <Switch label="Animations" on={settings.motion} onChange={(v) => set({ motion: v })} />
        </section>

        <section className="card" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="title-2" style={{ fontSize: 17 }}>Membres du foyer</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {members.map((m) => (
              <div key={m.userId} style={{ minHeight: 48, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flexGrow: 1, fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.email ?? 'Membre'}</span>
                <span className="chip">{m.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
              </div>
            ))}
          </div>
          {isAdmin && (
            <form onSubmit={sendInvite} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label className="field">
                <span className="field__label">Inviter par e-mail</span>
                <input className="input" type="email" required placeholder="prenom@exemple.fr" value={invite} onChange={(e) => setInvite(e.target.value)} />
              </label>
              <button className="btn-gold" type="submit" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer l’invitation'}</button>
            </form>
          )}
          {message && <div className={`notice ${message.ok ? 'notice--ok' : 'notice--error'}`} role="status">{message.text}</div>}
        </section>

        <section className="card card--list">
          <div style={{ minHeight: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ flexGrow: 1, fontSize: 14, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</span>
            <button className="btn-link" onClick={() => signOut()}>Se déconnecter</button>
          </div>
        </section>
      </div>
    </div>
  );
}
