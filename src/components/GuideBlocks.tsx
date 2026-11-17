import type { Guide, Level, Link } from '../data/types';

/** « Comprendre » : en tête de fiche, pour tous les niveaux. */
export function Comprendre({ guide }: { guide?: Guide }) {
  if (!guide?.comprendre) return null;
  return (
    <section className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--chip-bg)', boxShadow: 'none' }}>
      <h2 className="title-2" style={{ fontSize: 17 }}>Comprendre</h2>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{guide.comprendre}</p>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15, lineHeight: 1.45 }}>
      {items.map((t) => <li key={t}>{t}</li>)}
    </ul>
  );
}

/** Après les étapes : aller plus loin, pièges, réglementation. */
export function PlusLoin({ guide, level }: { guide?: Guide; level: Level }) {
  if (!guide) return null;
  return (
    <>
      {guide.expert && guide.expert.length > 0 && (
        <details className="card" open={level === 'expert'} style={{ padding: '14px 16px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-title)' }}>Pour aller plus loin</summary>
          <div style={{ marginTop: 10 }}><Bullets items={guide.expert} /></div>
        </details>
      )}
      {guide.pieges && guide.pieges.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 className="title-2">À éviter</h2>
          <div className="card" style={{ padding: '14px 16px' }}><Bullets items={guide.pieges} /></div>
        </section>
      )}
      {guide.regle && (
        <section className="notice" style={{ background: 'var(--chip-bg)', color: 'var(--ink)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <strong style={{ fontSize: 14 }}>Ce que dit la loi</strong>
          <span style={{ fontSize: 14, lineHeight: 1.45 }}>{guide.regle}</span>
        </section>
      )}
    </>
  );
}

function LinkList({ title, links, video }: { title: string; links: Link[]; video?: boolean }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2 className="title-2">{title}</h2>
      <div className="card card--list">
        {links.map((k) => (
          <a key={k.url} href={k.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: 'var(--ink)', textDecoration: 'none', fontSize: 15 }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: video ? '#C4302B' : 'var(--chip-bg)', color: video ? '#FFF' : 'var(--ink-soft)', fontSize: 12, fontWeight: 800 }}>
              {video ? '▶' : '§'}
            </span>
            <span style={{ flexGrow: 1, lineHeight: 1.35 }}>{k.l}</span>
            <span aria-hidden="true" style={{ color: 'var(--ink-soft)' }}>↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

/** En bas de fiche : vidéos et sources. */
export function Liens({ guide }: { guide?: Guide }) {
  if (!guide) return null;
  return (
    <>
      {guide.videos && guide.videos.length > 0 && <LinkList title="En vidéo" links={guide.videos} video />}
      {guide.sources && guide.sources.length > 0 && <LinkList title="Sources" links={guide.sources} />}
    </>
  );
}
