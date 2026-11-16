import { useState } from 'react';
import { SLOGAN, Wordmark } from '../components/Brand';
import { IconCheck, IconChevronLeft } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { EMPTY_PROFILE, PROFILE_OPTIONS, type Profile } from '../data/catalogue';
import { DOMAIN_COLOR, type Task } from '../data/types';
import { previewProfile, type ProfileChanges } from '../lib/api';

type Step = { key: keyof Profile; title: string; hint: string; multi: boolean };

const STEPS: Step[] = [
  { key: 'logement', title: 'Votre logement', hint: 'Une maison ouvre les tâches extérieures (gouttières, jardin…).', multi: false },
  { key: 'chauffage', title: 'Votre chauffage', hint: 'Plusieurs choix possibles.', multi: true },
  { key: 'equipements', title: 'Vos équipements', hint: 'Cochez ce que vous avez.', multi: true },
  { key: 'exterieur', title: 'Vos extérieurs', hint: 'Laissez vide si vous n’en avez pas.', multi: true },
  { key: 'vehicules', title: 'Vos véhicules', hint: 'Laissez vide si vous n’en avez pas.', multi: true },
  { key: 'extras', title: 'Les petits plus', hint: 'Des rappels pour ce qu’on oublie, avant que ça ne s’accumule.', multi: true },
];

type Props = {
  initial: Profile | null;
  tasks: Task[];
  firstTime: boolean;
  onCancel: () => void;
  onSave: (p: Profile) => Promise<ProfileChanges>;
};

export function Profil({ initial, tasks, firstTime, onCancel, onSave }: Props) {
  const [profile, setProfile] = useState<Profile>({ ...EMPTY_PROFILE, ...(initial ?? {}) });
  const [index, setIndex] = useState(firstTime ? -1 : 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<ProfileChanges | null>(null);

  const steps = profile.logement === 'appartement' ? STEPS.filter((s) => s.key !== 'exterieur') : STEPS;
  const step = steps[index];
  const summary = index >= steps.length;
  const changes = previewProfile(tasks, initial, profile);

  const toggle = (key: keyof Profile, value: string) => {
    if (key === 'logement') return setProfile({ ...profile, logement: value as Profile['logement'], exterieur: value === 'appartement' ? [] : profile.exterieur });
    const list = (profile[key] as string[] | undefined) ?? [];
    setProfile({ ...profile, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      setDone(await onSave(profile));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /* Accueil (première fois) */
  if (index === -1) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <header className="header" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 'calc(env(safe-area-inset-top) + 64px)', paddingBottom: 72, gap: 14 }}>
          <Wordmark size={32} />
          <span style={{ fontFamily: 'var(--font-title)', fontSize: 17, fontWeight: 600, fontStyle: 'italic' }}>{SLOGAN}</span>
        </header>
        <div className="content" style={{ maxWidth: 480, width: '100%', alignSelf: 'center' }}>
          <div className="card card--raised" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h1 className="title-2" style={{ fontSize: 22 }}>Présentez-nous votre foyer</h1>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>
              Six questions rapides : Hestia en déduit les entretiens utiles chez vous, et rien de plus.
            </p>
            <button className="btn-gold" onClick={() => setIndex(0)}>Commencer</button>
            <button className="btn-link" onClick={onCancel}>Plus tard</button>
          </div>
        </div>
      </div>
    );
  }

  /* Résultat */
  if (done) {
    return (
      <div className="swipe-sheet">
        <Topbar><span style={{ width: 44 }} /><h1 className="title-1" style={{ fontSize: 22 }}>C'est prêt</h1><span style={{ width: 44 }} /></Topbar>
        <div className="screen">
          <header className="header" style={{ paddingBottom: 62 }}>
            <span className="header__sub">Votre foyer est enregistré.</span>
          </header>
          <div className="content">
            <div className="card card--raised" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, lineHeight: 1.45 }}>
              {done.added.length > 0 && <span><strong>{done.added.length}</strong> tâche{done.added.length > 1 ? 's' : ''} ajoutée{done.added.length > 1 ? 's' : ''}, étalée{done.added.length > 1 ? 's' : ''} sur les semaines à venir.</span>}
              {done.paused.length > 0 && <span><strong>{done.paused.length}</strong> mise{done.paused.length > 1 ? 's' : ''} en pause, car elle{done.paused.length > 1 ? 's ne servent' : ' ne sert'} plus.</span>}
              {done.resumed.length > 0 && <span><strong>{done.resumed.length}</strong> réactivée{done.resumed.length > 1 ? 's' : ''}.</span>}
              {done.added.length + done.paused.length + done.resumed.length === 0 && <span>Aucun changement dans vos tâches.</span>}
              <span className="meta" style={{ fontSize: 13 }}>
                Pour les tâches importantes (contrôle technique, chaudière, ramonage…), indiquez la vraie date du dernier passage dans Mon foyer › Mes tâches : le planning sera exact.
              </span>
            </div>
            <button className="btn-gold" onClick={onCancel}>Voir mon planning</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-sheet">
      <Topbar>
        <button className="icon-btn" aria-label={index === 0 ? 'Fermer' : 'Étape précédente'} onClick={() => (index === 0 ? onCancel() : setIndex(index - 1))}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 22 }}>{summary ? 'Récapitulatif' : step.title}</h1>
        <span className="num" style={{ width: 44, textAlign: 'right', fontSize: 13, fontWeight: 700 }}>{Math.min(index + 1, steps.length)}/{steps.length}</span>
      </Topbar>
      <div className="screen" style={{ paddingBottom: 24 }}>
        <header className="header" style={{ paddingBottom: 62 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, gap: 4 }} aria-hidden="true">
            {steps.map((_, i) => <span key={i} style={{ height: 5, borderRadius: 3, background: i <= index ? 'var(--on-gold)' : 'rgba(36,30,25,0.18)' }} />)}
          </div>
          <span className="header__sub">{summary ? 'Voici ce que Hestia va faire.' : step.hint}</span>
        </header>

        <div className="content">
          {!summary && (
            <div className="card card--raised card--list" style={{ padding: '2px 16px' }}>
              {(step.key === 'logement'
                ? ([['maison', 'Maison'], ['appartement', 'Appartement']] as const)
                : PROFILE_OPTIONS[step.key as Exclude<keyof Profile, 'logement'>]
              ).map(([value, label]) => {
                const on = step.key === 'logement' ? profile.logement === value : ((profile[step.key] as string[] | undefined) ?? []).includes(value);
                return (
                  <button
                    key={value}
                    role={step.multi ? 'checkbox' : 'radio'}
                    aria-checked={on}
                    onClick={() => toggle(step.key, value)}
                    style={{ minHeight: 56, display: 'flex', alignItems: 'center', gap: 12, border: 0, background: 'none', padding: 0, width: '100%', textAlign: 'left', color: 'var(--ink)', fontSize: 16, fontWeight: on ? 700 : 500 }}
                  >
                    <span style={{
                      flexShrink: 0, width: 26, height: 26, borderRadius: step.multi ? 8 : '50%',
                      border: on ? 0 : '2px solid #B9AC9C', background: on ? 'var(--gold-2)' : 'transparent', color: '#241E19',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {on && <IconCheck size={15} />}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {summary && (
            <div className="card card--raised" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>
                {changes.added.length} tâche{changes.added.length > 1 ? 's' : ''} à ajouter
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {changes.added.map((t) => (
                  <span key={t.id} className="chip" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)', fontWeight: 600, fontSize: 12, padding: '5px 9px', gap: 6 }}>
                    <span className="dot" style={{ width: 8, height: 8, background: DOMAIN_COLOR[t.domain] }} />{t.title}
                  </span>
                ))}
              </div>
              {changes.paused.length > 0 && (
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>Mises en pause : {changes.paused.map((t) => t.title).join(', ')}.</span>
              )}
              {changes.resumed.length > 0 && (
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>Réactivées : {changes.resumed.map((t) => t.title).join(', ')}.</span>
              )}
              <span className="meta" style={{ fontSize: 13, lineHeight: 1.4 }}>Rien n'est supprimé : vous pourrez tout ajuster dans Mes tâches.</span>
            </div>
          )}

          {error && <div className="notice notice--error" role="alert">{error}</div>}

          {summary ? (
            <button className="btn-gold" onClick={save} disabled={busy}>{busy ? 'Préparation…' : 'Valider'}</button>
          ) : (
            <button className="btn-gold" onClick={() => setIndex(index + 1)}>Suivant</button>
          )}
        </div>
      </div>
    </div>
  );
}
