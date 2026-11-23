import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TabBar, type Tab } from './components/TabBar';
import { CAPACITY_STEPS, weekStart } from './data/engine';
import { toISODate, type Task } from './data/types';
import {
  DEFAULT_SETTINGS,
  normalizeReminder,
  setAssignee,
  getSession,
  loadFeedback,
  loadMembers,
  saveFeedback,
  saveProfile,
  type Feedback,
  type Member,
  loadFoyer,
  loadSettings,
  loadTasks,
  onAuthChange,
  saveMaterielAbsent,
  createTask,
  deleteTask,
  updateTask,
  recordVisit,
  type Foyer as FoyerT,
  type Session,
  type UserSettings,
} from './lib/api';
import { ChoosePassword, Loading, Login, NoAccess } from './screens/Auth';
import { Foyer } from './screens/Foyer';
import { Guides } from './screens/Guides';
import { Planning } from './screens/Planning';
import { TaskSheet } from './screens/TaskSheet';
import { Today } from './screens/Today';

// Écrans secondaires : chargés seulement quand on les ouvre, pour un démarrage plus léger.
const Esprit = lazy(() => import('./screens/Esprit').then((m) => ({ default: m.Esprit })));
const Reglages = lazy(() => import('./screens/Reglages').then((m) => ({ default: m.Reglages })));
const Tuto = lazy(() => import('./screens/Tuto').then((m) => ({ default: m.Tuto })));
const MesTaches = lazy(() => import('./screens/MesTaches').then((m) => ({ default: m.MesTaches })));
const Carnet = lazy(() => import('./screens/Carnet').then((m) => ({ default: m.Carnet })));
const Produits = lazy(() => import('./screens/Produits').then((m) => ({ default: m.Produits })));
const Epargne = lazy(() => import('./screens/Epargne').then((m) => ({ default: m.Epargne })));
const Appareils = lazy(() => import('./screens/Appareils').then((m) => ({ default: m.Appareils })));
const Echeancier = lazy(() => import('./screens/Echeancier').then((m) => ({ default: m.Echeancier })));
const Profil = lazy(() => import('./screens/Profil').then((m) => ({ default: m.Profil })));
import { gentleState } from './data/douceur';
import { flush, send } from './lib/outbox';

// Lien d'invitation ou de mot de passe oublié : on le repère avant que Supabase ne nettoie l'adresse.
const LINK_TYPE = /type=(invite|recovery)/.exec(window.location.hash)?.[1] as 'invite' | 'recovery' | undefined;
const SETTINGS_CACHE = 'hestia.settings';
const DATA_CACHE = 'hestia.donnees';

/** Dernières données chargées, pour ouvrir l'app sans réseau. */
function cachedData(userId: string): { foyer: FoyerT; tasks: Task[] } | null {
  try {
    const d = JSON.parse(localStorage.getItem(DATA_CACHE) ?? 'null');
    return d?.userId === userId ? d : null;
  } catch {
    return null;
  }
}

function cachedSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE);
    if (raw) {
      const s = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as UserSettings;
      return { ...s, reminder: normalizeReminder(s.reminder) };
    }
  } catch {
    /* stockage indisponible */
  }
  return DEFAULT_SETTINGS;
}

function prefersDark(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
}

export function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [needPassword, setNeedPassword] = useState<'invite' | 'recovery' | null>(LINK_TYPE ?? null);
  const [foyer, setFoyer] = useState<FoyerT | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<UserSettings>(cachedSettings);
  const [tab, setTab] = useState<Tab>('home');
  const [openId, setOpenId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState(false);
  const [manage, setManage] = useState(false);
  const [journal, setJournal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [tutoOpen, setTutoOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLater, setProfileLater] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [module, setModule] = useState<'produits' | 'epargne' | 'appareils' | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [toast, setToast] = useState('');
  const [toastAction, setToastAction] = useState<{ label: string; run: () => void } | null>(null);
  const [error, setError] = useState('');
  const today = useMemo(() => new Date(), []);
  // Semaine de reprise, décidée pour tout le foyer à partir de sa dernière visite.
  const foyerId = foyer?.id;
  const gentle = useMemo(
    () => (foyer ? gentleState(today, foyer.visit) : { kind: null, week: null }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [foyerId, today],
  );
  const douceur = gentle.kind;
  useEffect(() => {
    if (!foyer) return;
    recordVisit(foyer.id, toISODate(today), gentle.week, gentle.kind).catch(() => {
      /* hors ligne : la visite sera notée la prochaine fois */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foyerId]);
  // Bilan de la semaine : les tâches se font surtout du jeudi au dimanche, donc on pose la question
  // une fois la semaine finie, du dimanche 18 h au mardi soir, sur la semaine qui vient de s'écouler.
  const feedbackWeek = useMemo(() => {
    const day = today.getDay();
    if (day === 0 && today.getHours() >= 18) return toISODate(weekStart(today));
    if (day === 1 || day === 2) return toISODate(weekStart(new Date(today.getTime() - 7 * 86400000)));
    return null;
  }, [today]);
  const dark = settings.theme === 'sombre' || (settings.theme === 'auto' && prefersDark());

  /* Session */
  useEffect(() => {
    getSession().then(setSession);
    return onAuthChange((event, s) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setNeedPassword('recovery');
      if (event === 'SIGNED_OUT') {
        setFoyer(undefined);
        setTasks([]);
        setOpenId(null);
      }
    });
  }, []);

  /* Données du foyer */
  const [offline, setOffline] = useState(false);
  const beforeDone = useRef(new Map<string, Task>());
  const refresh = useCallback(async (f: FoyerT) => {
    await flush();
    setTasks(await loadTasks(f.id, today));
    setOffline(false);
  }, [today]);

  // Copie locale des dernières données (y compris les changements en attente), pour l'ouverture sans réseau.
  useEffect(() => {
    if (!session || !foyer) return;
    try {
      localStorage.setItem(DATA_CACHE, JSON.stringify({ userId: session.userId, foyer, tasks }));
    } catch {
      /* stockage plein ou indisponible */
    }
  }, [session, foyer, tasks]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      try {
        const [f, s] = await Promise.all([loadFoyer(session.userId), loadSettings(session.userId)]);
        if (cancelled) return;
        setSettings(s);
        setFoyer(f);
        if (f) {
          await refresh(f);
          loadMembers(f.id).then(setMembers).catch(() => setMembers([]));
        }
      } catch (err) {
        if (cancelled) return;
        // Sans réseau : on affiche les dernières données connues.
        const cache = cachedData(session.userId);
        if (cache && !navigator.onLine) {
          setFoyer(cache.foyer);
          setTasks(cache.tasks);
          setOffline(true);
        } else setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, refresh]);

  // Première visite, maison décrite : le tuto s'ouvre une fois.
  useEffect(() => {
    if (!foyer?.profile) return;
    try {
      if (localStorage.getItem('hestia.tuto')) return;
      localStorage.setItem('hestia.tuto', '1');
      setTutoOpen(true);
    } catch {
      /* stockage indisponible */
    }
  }, [foyer?.profile]);

  // Retour du réseau : on envoie ce qui attendait, puis on recharge.
  useEffect(() => {
    if (!foyer) return;
    const back = () => {
      refresh(foyer)
        .then(() => setToast('Réseau retrouvé : vos changements sont envoyés.'))
        .catch(() => {});
    };
    window.addEventListener('online', back);
    return () => window.removeEventListener('online', back);
  }, [foyer, refresh]);

  useEffect(() => {
    if (!session || !feedbackWeek) return;
    loadFeedback(session.userId, feedbackWeek).then(setFeedback).catch(() => setFeedback(null));
  }, [session, feedbackWeek]);

  useEffect(() => {
    if (!toast) {
      setToastAction(null);
      return;
    }
    const id = setTimeout(() => setToast(''), toastAction ? 7000 : 4000);
    return () => clearTimeout(id);
  }, [toast, toastAction]);

  /* Thème et animations */
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.motion = settings.motion ? 'on' : 'off';
    document.documentElement.dataset.brand = 'capsule';
    try {
      localStorage.setItem(SETTINGS_CACHE, JSON.stringify(settings));
    } catch {
      /* ignoré */
    }
  }, [settings, dark]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, openId, schedule, manage, journal, module, profileOpen, settingsOpen, guideOpen, tutoOpen]);

  const changeSettings = (s: UserSettings) => {
    setSettings(s);
    if (session) send({ kind: 'settings', userId: session.userId, settings: s }).catch((err) => setError((err as Error).message));
  };

  if (session === undefined) return <Loading />;
  if (needPassword && session) {
    return (
      <ChoosePassword
        invited={needPassword === 'invite'}
        onDone={() => {
          setNeedPassword(null);
          history.replaceState(null, '', '/');
        }}
      />
    );
  }
  if (!session) return <Login />;
  if (foyer === undefined) return error ? <ErrorScreen message={error} /> : <Loading />;
  if (foyer === null) return <NoAccess email={session.email} />;

  const open = openId ? tasks.find((t) => t.id === openId) ?? null : null;

  const answerFeedback = async (avis: Feedback) => {
    if (!feedbackWeek) return;
    setFeedback(avis);
    try {
      await saveFeedback(foyer.id, session.userId, feedbackWeek, avis);
      const i = Math.max(0, CAPACITY_STEPS.indexOf(settings.capacity));
      const next = avis === 'trop' ? CAPACITY_STEPS[Math.max(0, i - 1)] : avis === 'pas_assez' ? CAPACITY_STEPS[Math.min(CAPACITY_STEPS.length - 1, i + 1)] : settings.capacity;
      if (next !== settings.capacity) changeSettings({ ...settings, capacity: next });
      const fmt = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) : ''}`);
      setToast(
        avis === 'bien' ? 'Parfait, on garde ce rythme pour la semaine qui commence.'
          : next === settings.capacity ? 'Noté. Vous êtes déjà au palier ' + (avis === 'trop' ? 'le plus bas.' : 'le plus haut.')
          : `Noté : ${fmt(next)} par semaine désormais. Modifiable dans Réglages.`,
      );
    } catch (err) {
      setFeedback(null);
      setError((err as Error).message);
    }
  };

  const showProfile = profileOpen || (foyer.profile === null && !profileLater);

  const undo = async (task: Task) => {
    try {
      const r = await send({ kind: 'undo', taskId: task.id });
      if (r === 'sent') await refresh(foyer);
      else {
        // Sans réseau : on remet la tâche telle qu'elle était avant « C'est fait ».
        const before = beforeDone.current.get(task.id);
        if (before) setTasks((all) => all.map((t) => (t.id === task.id ? before : t)));
        setOffline(true);
      }
      setToastAction(null);
      setToast(`Validation de « ${task.title} » annulée.`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleFollow = (task: Task) => {
    const value = !task.inSchedule;
    setTasks((all) => all.map((t) => (t.id === task.id ? { ...t, inSchedule: value } : t)));
    send({ kind: 'follow', taskId: task.id, value }).catch((err) => {
      setTasks((all) => all.map((t) => (t.id === task.id ? { ...t, inSchedule: !value } : t)));
      setError((err as Error).message);
    });
  };

  const toggleMissing = async (tool: string) => {
    const list = foyer.materielAbsent.includes(tool) ? foyer.materielAbsent.filter((x) => x !== tool) : [...foyer.materielAbsent, tool];
    setFoyer({ ...foyer, materielAbsent: list });
    saveMaterielAbsent(foyer.id, list).catch((err) => setError((err as Error).message));
  };

  return (
    <div className="app">
      <Suspense fallback={null}>
      {offline && (
        <div className="notice" role="status" style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top) + 8px)', left: 12, right: 12, zIndex: 49, background: 'var(--chip-bg)', color: 'var(--ink)', boxShadow: 'var(--shadow)', maxWidth: 520, margin: '0 auto' }}>
          Hors ligne : vos changements sont gardés sur le téléphone et partiront dès le retour du réseau.
        </div>
      )}
      {error && (
        <div className="notice notice--error" role="alert" style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top) + 8px)', left: 12, right: 12, zIndex: 50 }} onClick={() => setError('')}>
          {error}
        </div>
      )}
      {toast && (
        <div className="notice notice--ok" role="status" style={{ position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom) + 100px)', left: 16, right: 16, zIndex: 50, boxShadow: 'var(--shadow)', maxWidth: 520, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flexGrow: 1 }} onClick={() => setToast('')}>{toast}</span>
          {toastAction && (
            <button
              onClick={() => {
                const action = toastAction;
                setToast('');
                action.run();
              }}
              style={{ flexShrink: 0, minHeight: 40, padding: '0 14px', border: 0, borderRadius: 12, background: '#2C5420', color: '#FFFFFF', fontSize: 14, fontWeight: 700 }}
            >
              {toastAction.label}
            </button>
          )}
        </div>
      )}
      {showProfile ? (
        <Profil
          initial={foyer.profile}
          tasks={tasks}
          firstTime={foyer.profile === null && !profileOpen}
          onCancel={() => {
            setProfileOpen(false);
            setProfileLater(true);
          }}
          onSave={async (p) => {
            const changes = await saveProfile(foyer.id, tasks, foyer.profile, p, today);
            // L'écran reste ouvert pour afficher le résultat.
            setProfileOpen(true);
            setFoyer({ ...foyer, profile: p });
            await refresh({ ...foyer, profile: p });
            return changes;
          }}
        />
      ) : tutoOpen ? (
        <Tuto onBack={() => setTutoOpen(false)} onOpenEsprit={() => { setTutoOpen(false); setGuideOpen(true); }} />
      ) : guideOpen ? (
        <Esprit onBack={() => setGuideOpen(false)} onOpenTuto={() => { setGuideOpen(false); setTutoOpen(true); }} />
      ) : settingsOpen ? (
        <Reglages userId={session.userId} email={session.email} settings={settings} dark={dark} onChange={changeSettings} onBack={() => setSettingsOpen(false)} onOpenGuide={() => setGuideOpen(true)} />
      ) : module === 'produits' ? (
        <Produits foyerId={foyer.id} onBack={() => setModule(null)} />
      ) : module === 'epargne' ? (
        <Epargne foyerId={foyer.id} tasks={tasks} onBack={() => setModule(null)} />
      ) : module === 'appareils' ? (
        <Appareils foyerId={foyer.id} today={today} onBack={() => setModule(null)} />
      ) : journal ? (
        <Carnet foyerId={foyer.id} members={members} onBack={() => setJournal(false)} onChanged={() => refresh(foyer)} />
      ) : open ? (
        <TaskSheet
          key={open.id}
          task={open}
          level={settings.level}
          today={today}
          missing={foyer.materielAbsent}
          onToggleMissing={toggleMissing}
          onToggleFollow={() => toggleFollow(open)}
          doneThisWeek={!!open.lastValidated && open.lastValidated >= toISODate(weekStart(today)) && open.lastValidated <= toISODate(today)}
          onUndo={async () => {
            await undo(open);
            setOpenId(null);
          }}
          onSaveChoices={(choices) => {
            setTasks((all) => all.map((t) => (t.id === open.id ? { ...t, choices } : t)));
            send({ kind: 'choices', taskId: open.id, choices }).catch((err) => setError((err as Error).message));
          }}
          onBack={() => setOpenId(null)}
          members={members}
          onAssign={async (userId) => {
            const task = open;
            setTasks((all) => all.map((x) => (x.id === task.id ? { ...x, assignee: userId ?? undefined } : x)));
            try {
              await setAssignee(task.id, userId);
            } catch (err) {
              setError((err as Error).message);
            }
          }}
          onPostpone={async (day) => {
            const task = open;
            try {
              await send({ kind: 'plan', foyerId: foyer.id, taskId: task.id, day });
              setTasks((all) => all.map((x) => (x.id === task.id ? { ...x, plannedDay: day ?? undefined } : x)));
              setOpenId(null);
              setToastAction(null);
              setToast(
                day
                  ? `« ${task.title} » programmée le ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(day + 'T12:00:00'))}.`
                  : `Date retirée : « ${task.title} » revient à son rythme habituel.`,
              );
            } catch (err) {
              setError((err as Error).message);
            }
          }}
          onDone={async (cost, note) => {
            try {
              const task = open;
              const day = toISODate(today);
              const r = await send({ kind: 'done', foyerId: foyer.id, userId: session.userId, taskId: task.id, day, cost, note: note ?? '' });
              if (r === 'sent') await refresh(foyer);
              else {
                // Sans réseau : noté sur le téléphone, envoyé au retour du réseau.
                beforeDone.current.set(task.id, task);
                setTasks((all) => all.map((t) => (t.id === task.id ? { ...t, lastDone: day, lastValidated: day, plannedDay: undefined } : t)));
                setOffline(true);
              }
              setOpenId(null);
              setToastAction({ label: 'Annuler', run: () => undo(task) });
              setToast(r === 'sent' ? `« ${task.title} » noté au carnet.` : `« ${task.title} » noté sur le téléphone : envoi dès le retour du réseau.`);
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        />
      ) : manage ? (
        <MesTaches
          tasks={tasks}
          onBack={() => setManage(false)}
          onToggleActive={(t) => {
            const value = !t.active;
            setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, active: value } : x)));
            send({ kind: 'active', taskId: t.id, value }).catch((err) => {
              setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, active: !value } : x)));
              setError((err as Error).message);
            });
          }}
          onSave={async (t, edit) => {
            if (t) await updateTask(t.id, edit);
            else await createTask(foyer.id, edit);
            await refresh(foyer);
          }}
          onDelete={async (t) => {
            try {
              await deleteTask(t.id);
              await refresh(foyer);
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        />
      ) : schedule ? (
        <Echeancier tasks={tasks} today={today} onBack={() => setSchedule(false)} onOpen={(t) => setOpenId(t.id)} onToggleFollow={toggleFollow} />
      ) : (
        <>
          {tab === 'home' && (
            <Today
              tasks={tasks}
              today={today}
              capacity={settings.capacity}
              douceur={douceur}
              onHelp={() => setTutoOpen(true)}
              onOpen={(t) => setOpenId(t.id)}
              feedbackWeek={feedbackWeek}
              feedbackGiven={feedback !== null}
              onFeedback={answerFeedback}
              foyerId={foyer.id}
              members={members}
              onOpenModule={setModule}
            />
          )}
          {tab === 'planning' && (
            <Planning
              tasks={tasks}
              today={today}
              capacity={settings.capacity}
              gentle={!!douceur}
              onOpen={(t) => setOpenId(t.id)}
              onSchedule={() => setSchedule(true)}
              onPlan={async (t, day) => {
                try {
                  await send({ kind: 'plan', foyerId: foyer.id, taskId: t.id, day });
                  setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, plannedDay: day ?? undefined } : x)));
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            />
          )}
          {tab === 'guides' && <Guides tasks={tasks} onOpen={(t) => setOpenId(t.id)} onOpenGuide={() => setGuideOpen(true)} />}
          {tab === 'foyer' && <Foyer foyer={foyer} taskCount={tasks.filter((t) => t.active).length} onOpenTasks={() => setManage(true)} onOpenProfile={() => setProfileOpen(true)} onOpenJournal={() => setJournal(true)} onOpenModule={setModule} onOpenSettings={() => setSettingsOpen(true)} onOpenGuide={() => setGuideOpen(true)} />}
          <TabBar current={tab} onChange={setTab} />
        </>
      )}
      </Suspense>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 className="title-2">Connexion aux données impossible</h1>
      <div className="notice notice--error">{message}</div>
      <button className="btn-gold" onClick={() => location.reload()}>Réessayer</button>
    </div>
  );
}
