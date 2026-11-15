import { useCallback, useEffect, useMemo, useState } from 'react';
import { TabBar, type Tab } from './components/TabBar';
import type { Task } from './data/types';
import {
  DEFAULT_SETTINGS,
  getSession,
  loadFoyer,
  loadSettings,
  loadTasks,
  markDone,
  onAuthChange,
  saveChoices,
  saveMaterielAbsent,
  saveSettings,
  setPlannedDay,
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
  const [error, setError] = useState('');
  const today = useMemo(() => new Date(), []);
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
        if (f) await refresh(f);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, refresh]);

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
  }, [tab, openId]);

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
      {open ? (
        <TaskSheet
          key={open.id}
          task={open}
          level={settings.level}
          today={today}
          missing={foyer.materielAbsent}
          onToggleMissing={toggleMissing}
          onSaveChoices={(choices) => {
            setTasks((all) => all.map((t) => (t.id === open.id ? { ...t, choices } : t)));
            saveChoices(open.id, choices).catch((err) => setError((err as Error).message));
          }}
          onBack={() => setOpenId(null)}
          onDone={async () => {
            try {
              await markDone(foyer.id, session.userId, open.id, today);
              await refresh(foyer);
              setOpenId(null);
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        />
      ) : (
        <>
          {tab === 'home' && <Today tasks={tasks} today={today} capacity={settings.capacity} onOpen={(t) => setOpenId(t.id)} />}
          {tab === 'planning' && (
            <Planning
              tasks={tasks}
              today={today}
              capacity={settings.capacity}
              onOpen={(t) => setOpenId(t.id)}
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
          {tab === 'foyer' && <Foyer foyer={foyer} email={session.email} settings={settings} dark={dark} onChange={changeSettings} />}
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
