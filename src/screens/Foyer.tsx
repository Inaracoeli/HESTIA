import { useEffect, useState, type FormEvent } from 'react';
import { IconChevronRight, IconGear, IconHouse } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { inviteMember, loadMembers, type Foyer as FoyerT, type Member } from '../lib/api';

type Props = {
  foyer: FoyerT;
  taskCount: number;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenTasks: () => void;
  onOpenProfile: () => void;
  onOpenJournal: () => void;
  onOpenModule: (m: 'produits' | 'epargne' | 'appareils') => void;
};

/** « Foyer » : tout ce qui concerne la maison et le foyer. Les réglages personnels sont à part. */
/** Mot de passe provisoire lisible : deux mots et un nombre. */
function tempPassword(): string {
  const mots = ['flamme', 'foyer', 'jardin', 'braise', 'volet', 'tuile', 'pivoine', 'cerise', 'chene', 'galet'];
  const pick = () => mots[Math.floor(Math.random() * mots.length)];
  return `${pick()}-${pick()}-${10 + Math.floor(Math.random() * 90)}`;
}

export function Foyer({ foyer, taskCount, onOpenTasks, onOpenProfile, onOpenJournal, onOpenModule, onOpenSettings, onOpenGuide }: Props) {
  const isAdmin = foyer.role === 'admin';

  const [members, setMembers] = useState<Member[]>([]);
  const [invite, setInvite] = useState('');
  const [temp, setTemp] = useState(tempPassword);
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
      const statut = await inviteMember(foyer.id, invite, temp);
      setMessage({
        ok: true,
        text: statut === 'cree'
          ? `Compte créé. Donnez à cette personne son e-mail (${invite}) et le mot de passe « ${temp} » : elle pourra le changer dans Réglages.`
          : `${invite} avait déjà un compte : il est ajouté au foyer et se connecte avec son mot de passe habituel.`,
      });
      setInvite('');
      setTemp(tempPassword());
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
        <button className="icon-btn" aria-label="Réglages" onClick={onOpenSettings}>
          <IconGear size={22} />
        </button>
      </Topbar>
      <header className="header" style={{ paddingBottom: 62 }}>
        <span className="header__sub">{foyer.description || foyer.nom}</span>
      </header>

      <div className="content">
        <div className="card card--raised card--list" style={{ padding: '0 16px' }}>
          {([
            ['Mes tâches', `${taskCount} actives · pause, réglages, ajout`, onOpenTasks],
            ['Composition de la maison', foyer.profile ? 'Chauffage, équipements, extérieurs, véhicules' : 'À compléter pour un catalogue adapté', onOpenProfile],
            ['Carnet d’entretien', 'Historique et coûts réels', onOpenJournal],
            ['Produits et courses', 'Ménage, consommables, liste de courses', () => onOpenModule('produits')],
            ['Épargne', 'Mettre de côté pour les coups durs', () => onOpenModule('epargne')],
            ['Appareils et garanties', 'Factures, notices, fins de garantie', () => onOpenModule('appareils')],
            ['Bien utiliser Hestia', 'L’esprit de l’app, en deux minutes', onOpenGuide],
          ] as const).map(([label, hint, action]) => (
            <button key={label} onClick={action} style={{ minHeight: 64, width: '100%', border: 0, background: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink)', textAlign: 'left' }}>
              <span style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{label}</span>
                <span className="meta num">{hint}</span>
              </span>
              <IconChevronRight size={18} />
            </button>
          ))}
        </div>


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
                <span className="field__label">Ajouter un membre : son e-mail</span>
                <input className="input" type="email" required placeholder="prenom@exemple.fr" value={invite} onChange={(e) => setInvite(e.target.value)} />
              </label>
              <label className="field">
                <span className="field__label">Mot de passe provisoire</span>
                <input className="input" type="text" required minLength={8} autoComplete="off" value={temp} onChange={(e) => setTemp(e.target.value)} />
              </label>
              <p className="meta" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>Aucun e-mail n'est envoyé : transmettez vous-même ce mot de passe. La personne pourra le changer dans Réglages.</p>
              <button className="btn-gold" type="submit" disabled={busy}>{busy ? 'Ajout…' : 'Ajouter au foyer'}</button>
            </form>
          )}
          {message && <div className={`notice ${message.ok ? 'notice--ok' : 'notice--error'}`} role="status">{message.text}</div>}
        </section>

      </div>
    </div>
  );
}
