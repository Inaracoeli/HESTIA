import { useState, type FormEvent, type ReactNode } from 'react';
import { SLOGAN, Wordmark } from '../components/Brand';
import { sendPasswordReset, setPassword, signIn, signOut } from '../lib/api';

function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header
        className="header"
        style={{ alignItems: 'center', textAlign: 'center', paddingTop: 'calc(env(safe-area-inset-top) + 64px)', paddingBottom: 72, gap: 14 }}
      >
        <Wordmark size={34} />
        <span style={{ fontFamily: 'var(--font-title)', fontSize: 17, fontWeight: 600, fontStyle: 'italic' }}>{SLOGAN}</span>
      </header>
      <div className="content" style={{ maxWidth: 440, width: '100%', alignSelf: 'center' }}>
        <div className="card card--raised" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPwd] = useState('');
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'login') await signIn(email, password);
      else {
        await sendPasswordReset(email);
        setInfo('Si ce compte existe, un e-mail vient de partir avec un lien pour choisir un nouveau mot de passe.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h1 className="title-2" style={{ fontSize: 22 }}>{mode === 'login' ? 'Connexion' : 'Mot de passe oublié'}</h1>
        <label className="field">
          <span className="field__label">E-mail</span>
          <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {mode === 'login' && (
          <label className="field">
            <span className="field__label">Mot de passe</span>
            <input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPwd(e.target.value)} />
          </label>
        )}
        {error && <div className="notice notice--error" role="alert">{error}</div>}
        {info && <div className="notice notice--ok" role="status">{info}</div>}
        <button className="btn-gold" type="submit" disabled={busy}>
          {busy ? 'Un instant…' : mode === 'login' ? 'Se connecter' : 'Recevoir le lien'}
        </button>
        <button type="button" className="btn-link" onClick={() => { setMode(mode === 'login' ? 'reset' : 'login'); setError(''); setInfo(''); }}>
          {mode === 'login' ? 'Mot de passe oublié ?' : 'Retour à la connexion'}
        </button>
      </form>
      <p className="meta" style={{ margin: 0, textAlign: 'center', lineHeight: 1.4 }}>Votre compte est créé par l’administrateur du foyer.</p>
    </Shell>
  );
}

export function ChoosePassword({ invited, onDone }: { invited: boolean; onDone: () => void }) {
  const [password, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError('Au moins 8 caractères, s’il vous plaît.');
    if (password !== confirm) return setError('Les deux mots de passe ne sont pas identiques.');
    setBusy(true);
    setError('');
    try {
      await setPassword(password);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h1 className="title-2" style={{ fontSize: 22 }}>{invited ? 'Bienvenue dans Hestia' : 'Nouveau mot de passe'}</h1>
        {invited && <p className="meta" style={{ margin: 0, fontSize: 14, lineHeight: 1.4 }}>Choisissez votre mot de passe pour accéder au foyer.</p>}
        <label className="field">
          <span className="field__label">Mot de passe (8 caractères minimum)</span>
          <input className="input" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPwd(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Confirmer</span>
          <input className="input" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {error && <div className="notice notice--error" role="alert">{error}</div>}
        <button className="btn-gold" type="submit" disabled={busy}>{busy ? 'Un instant…' : 'Enregistrer'}</button>
      </form>
    </Shell>
  );
}

export function NoAccess({ email }: { email: string | null }) {
  return (
    <Shell>
      <h1 className="title-2" style={{ fontSize: 22 }}>Pas encore de foyer</h1>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>
        Le compte {email ? <strong>{email}</strong> : 'utilisé'} n’est rattaché à aucun foyer Hestia. Demandez à l’administrateur du foyer de vous ajouter.
      </p>
      <button className="btn-gold" onClick={() => signOut()}>Se déconnecter</button>
    </Shell>
  );
}

export function Loading() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold)' }}>
      <Wordmark size={34} />
    </div>
  );
}
