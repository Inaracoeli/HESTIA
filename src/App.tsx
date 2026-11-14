import { useEffect, useMemo, useState } from 'react';
import { TabBar, type Tab } from './components/TabBar';
import { DEMO_TASKS } from './data/demo';
import type { Task } from './data/types';
import { Foyer, type Settings } from './screens/Foyer';
import { Guides } from './screens/Guides';
import { Planning } from './screens/Planning';
import { TaskSheet } from './screens/TaskSheet';
import { Today } from './screens/Today';

const SETTINGS_KEY = 'hestia.settings';
const DEFAULT_SETTINGS: Settings = { capacity: 90, level: 'intermediaire', dark: false, motion: true };

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* stockage indisponible : réglages par défaut */
  }
  const prefersDark = typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
  return { ...DEFAULT_SETTINGS, dark: prefersDark };
}

export function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [tasks] = useState<Task[]>(DEMO_TASKS);
  const [open, setOpen] = useState<Task | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.dark ? 'dark' : 'light';
    document.documentElement.dataset.motion = settings.motion ? 'on' : 'off';
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignoré */
    }
  }, [settings]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, open]);

  const markDone = (task: Task) => {
    setDone((d) => new Set(d).add(task.id));
    setOpen(null);
  };

  return (
    <div className="app">
      {open ? (
        <TaskSheet task={open} level={settings.level} today={today} onBack={() => setOpen(null)} onDone={() => markDone(open)} />
      ) : (
        <>
          {tab === 'today' && <Today tasks={tasks} today={today} capacity={settings.capacity} done={done} onOpen={setOpen} />}
          {tab === 'planning' && <Planning tasks={tasks} today={today} capacity={settings.capacity} onOpen={setOpen} />}
          {tab === 'guides' && <Guides tasks={tasks} onOpen={setOpen} />}
          {tab === 'foyer' && <Foyer settings={settings} onChange={setSettings} />}
          <TabBar current={tab} onChange={setTab} />
        </>
      )}
    </div>
  );
}
