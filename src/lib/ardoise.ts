// Export de la semaine : une image façon ardoise à la craie, à partager ou à garder,
// et le même contenu en texte simple.
import { formatMinutes } from '../data/engine';
import type { Task } from '../data/types';

const RANGE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });

export function weekTitle(monday: Date): string {
  return `Semaine du ${RANGE.format(monday)}`;
}

export function weekText(monday: Date, tasks: Task[], who: (t: Task) => string | null): string {
  return [weekTitle(monday), ...tasks.map((t) => `☐ ${t.title} (${formatMinutes(t.minutes)})${who(t) ? ` · ${who(t)}` : ''}`)].join('\n');
}

/** Dessine l'ardoise (1080 px de large) et renvoie une image PNG. */
export async function weekImage(monday: Date, tasks: Task[], who: (t: Task) => string | null): Promise<Blob> {
  const W = 1080;
  // Jusqu'à deux lignes par tâche
  const H = Math.max(900, 300 + tasks.length * 212 + 140);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  // Cadre en bois
  g.fillStyle = '#6B4A2B';
  g.fillRect(0, 0, W, H);
  // Ardoise
  const grad = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W);
  grad.addColorStop(0, '#2F3B36');
  grad.addColorStop(1, '#1E2623');
  g.fillStyle = grad;
  g.fillRect(36, 36, W - 72, H - 72);
  // Traces de craie effacée
  g.globalAlpha = 0.05;
  g.fillStyle = '#FFFFFF';
  for (let i = 0; i < 40; i++) g.fillRect(60 + Math.random() * (W - 200), 60 + Math.random() * (H - 200), 80 + Math.random() * 220, 6 + Math.random() * 14);
  g.globalAlpha = 1;

  await document.fonts?.ready;
  const chalk = (text: string, x: number, y: number, size: number, weight = 600, color = '#F4F1E8') => {
    g.font = `${weight} ${size}px "Space Grotesk", "Figtree", system-ui, sans-serif`;
    g.fillStyle = color;
    g.shadowColor = 'rgba(255, 255, 255, 0.35)';
    g.shadowBlur = 3;
    g.fillText(text, x, y);
    g.shadowBlur = 0;
  };
  /** Coupe un titre trop long en lignes qui tiennent dans la largeur. */
  const wrap = (text: string, size: number, max: number): string[] => {
    g.font = `600 ${size}px "Space Grotesk", "Figtree", system-ui, sans-serif`;
    const words = text.split(' ');
    const out: string[] = [];
    let cur = '';
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (g.measureText(next).width > max && cur) {
        out.push(cur);
        cur = w;
      } else cur = next;
    }
    if (cur) out.push(cur);
    return out;
  };

  chalk(weekTitle(monday), 96, 170, 64, 700, '#FFE08A');
  g.strokeStyle = 'rgba(255, 224, 138, 0.6)';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(96, 200);
  g.lineTo(W - 96, 196);
  g.stroke();

  let y = 300;
  for (const t of tasks) {
    g.strokeStyle = '#F4F1E8';
    g.lineWidth = 4;
    g.strokeRect(96, y - 46, 48, 48);
    const lines = wrap(t.title, 50, W - 96 - 180 - 96);
    lines.forEach((l, i) => chalk(l, 176, y + i * 58, 50));
    const meta = [formatMinutes(t.minutes), who(t)].filter(Boolean).join(' · ');
    chalk(meta, 176, y + lines.length * 58 + 4, 34, 500, 'rgba(244, 241, 232, 0.65)');
    y += lines.length * 58 + 96;
  }
  if (tasks.length === 0) chalk('Rien de prévu : profitez-en.', 96, y, 50);
  chalk('Hestia', W - 96 - 150, H - 80, 40, 700, 'rgba(255, 224, 138, 0.7)');

  return new Promise((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error('Image impossible'))), 'image/png'));
}
