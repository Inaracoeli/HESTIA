import { useCallback, useEffect, useMemo, useState } from 'react';
import { TabBar, type Tab } from './components/TabBar';
import { CAPACITY_STEPS, weekStart } from './data/engine';
import { toISODate, type Task } from './data/types';
import {
  DEFAULT_SETTINGS,
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
  markDone,
  onAuthChange,
  saveChoices,
  saveMaterielAbsent,
  saveSettings,
  createTask,
  deleteTask,
  setActive,
  setInSchedule,
  updateTask,
  setPlannedDay,
  type Foyer as FoyerT,
  type Session,
  type UserSettings,
} from './lib/api';
import { ChoosePassword, Loading, Login, NoAccess } from './screens/Auth';
import { Foyer } from './screens/Foyer';
import { Guides } from './screens/Guides';
import { MesTaches } from './screens/MesTaches';
import { Carnet } from './screens/Carnet';
import { Echeancier } from './screens/Echeancier';
import { Profil } from './screens/Profil';
import { Planning } from './screens/Planning';
import { TaskSheet } from './screens/TaskSheet';
import { Today } from './screens/Today';

// Lien d'invitation ou de mot de passe oublié : on le repère avant que Supabase ne nettoie l'adresse.
const LINK_TYPE = /type=(invite|recovery)/.exec(window.location.hash)?.[1] as 'invite' | 'recovery' | undefined;
const SETTINGS_CACHE = 'hestia.settings';

function cachedSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLater, setProfileLater] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const today = useMemo(() => new Date(), []);
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
  const refresh = useCallback(async (f: FoyerT) => {
    setTasks(await loadTasks(f.id, today));
  }, [today]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      try {
        const [f, s] = await Promise.all([loadFoyer(session.userId), loadSettings(session.userId)]);
        if (cancelled) return;
        setSettings((prev) => ({ ...s, brand: prev.brand }));
        setFoyer(f);
        if (f) {
          await refresh(f);
          loadMembers(f.id).then(setMembers).catch(() => setMembers([]));
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, refresh]);

  useEffect(() => {
    if (!session || !feedbackWeek) return;
    loadFeedback(session.userId, feedbackWeek).then(setFeedback).catch(() => setFeedback(null));
  }, [session, feedbackWeek]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  /* Thème et animations */
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.motion = settings.motion ? 'on' : 'off';
    document.documentElement.dataset.brand = settings.brand ?? 'capsule';
    try {
      localStorage.setItem(SETTINGS_CACHE, JSON.stringify(settings));
    } catch {
      /* ignoré */
    }
  }, [settings, dark]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, openId, schedule, manage, journal, profileOpen]);

  const changeSettings = (s: UserSettings) => {
    setSettings(s);
    if (session) saveSettings(session.userId, s).catch((err) => setError((err as Error).message));
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
          : `Noté : ${fmt(next)} par semaine désormais. Modifiable dans Foyer.`,
      );
    } catch (err) {
      setFeedback(null);
      setError((err as Error).message);
    }
  };

  const showProfile = profileOpen || (foyer.profile === null && !profileLater);

  const toggleFollow = (task: Task) => {
    const value = !task.inSchedule;
    setTasks((all) => all.map((t) => (t.id === task.id ? { ...t, inSchedule: value } : t)));
    setInSchedule(task.id, value).catch((err) => {
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
      {error && (
        <div className="notice notice--error" role="alert" style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top) + 8px)', left: 12, right: 12, zIndex: 50 }} onClick={() => setError('')}>
          {error}
        </div>
      )}
      {toast && (
        <div className="notice notice--ok" role="status" style={{ position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom) + 100px)', left: 16, right: 16, zIndex: 50, boxShadow: 'var(--shadow)', maxWidth: 520, margin: '0 auto' }} onClick={() => setToast('')}>
          {toast}
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
          onSaveChoices={(choices) => {
            setTasks((all) => all.map((t) => (t.id === open.id ? { ...t, choices } : t)));
            saveChoices(open.id, choices).catch((err) => setError((err as Error).message));
          }}
          onBack={() => setOpenId(null)}
          onDone={async (cost, note) => {
            try {
              await markDone(foyer.id, session.userId, open.id, today, cost, note);
              await refresh(foyer);
              setOpenId(null);
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
            setActive(t.id, value).catch((err) => {
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
              onOpen={(t) => setOpenId(t.id)}
              feedbackWeek={feedbackWeek}
              feedbackGiven={feedback !== null}
              onFeedback={answerFeedback}
            />
          )}
          {tab === 'planning' && (
            <Planning
              tasks={tasks}
              today={today}
              capacity={settings.capacity}
              onOpen={(t) => setOpenId(t.id)}
              onSchedule={() => setSchedule(true)}
              onPlan={async (t, day) => {
                try {
                  await setPlannedDay(foyer.id, t.id, day);
                  setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, plannedDay: day ?? undefined } : x)));
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            />
          )}
          {tab === 'guides' && <Guides tasks={tasks} onOpen={(t) => setOpenId(t.id)} />}
          {tab === 'foyer' && <Foyer foyer={foyer} email={session.email} settings={settings} dark={dark} onChange={changeSettings} taskCount={tasks.filter((t) => t.active).length} onOpenTasks={() => setManage(true)} onOpenProfile={() => setProfileOpen(true)} onOpenJournal={() => setJournal(true)} />}
          <TabBar current={tab} onChange={setTab} />
        </>
      )}
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
