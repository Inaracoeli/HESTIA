import type { ReactNode } from 'react';
import { IconCheck, IconChevronLeft, IconPlus, IconStar } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { Ring } from '../components/Ring';
import { useSwipeBack } from '../components/useSwipeBack';

function Point({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="card" style={{ padding: '16px', display: 'flex', gap: 14 }}>
      <span
        aria-hidden="true"
        className="num"
        style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', color: 'var(--on-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}
      >
        {n}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 className="title-2" style={{ fontSize: 18 }}>{title}</h2>
        <div style={{ fontSize: 15, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
      </div>
    </section>
  );
}

/** L'esprit Hestia : comment bien utiliser l'app sans se prendre la tête. */
export function Esprit({ onBack, onOpenTuto }: { onBack: () => void; onOpenTuto: () => void }) {
  const swipe = useSwipeBack(onBack);
  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar>
        <button className="icon-btn" aria-label="Retour" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 22 }}>L'esprit Hestia</h1>
        <span style={{ width: 44 }} />
      </Topbar>
      <div className="screen">
        <header className="header" style={{ paddingBottom: 62 }}>
          <span className="header__sub" style={{ fontFamily: 'var(--font-title)', fontStyle: 'italic', fontSize: 17 }}>
            Une maison bien tenue, sans y penser tout le temps.
          </span>
        </header>

        <div className="content" style={{ gap: 12, paddingBottom: 24 }}>
          <button className="card card--raised" onClick={onOpenTuto} style={{ border: 0, textAlign: 'left', padding: '16px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink)', font: 'inherit' }}>
            <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: 'var(--gold)', color: 'var(--on-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>?</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
              <strong style={{ fontSize: 16 }}>Bien démarrer</strong>
              <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Le tuto pas à pas, des fonctions essentielles aux plus secondaires.</span>
            </span>
          </button>
          <Point n={1} title="Le minimum suffisant">
            <p style={{ margin: 0 }}>
              Hestia ne vous montre pas tout ce qu'il faudrait faire : seulement ce qui tient dans votre temps de la semaine, jamais plus de cinq tâches. Après une absence, la reprise se fait en douceur. Le reste attend
              son tour, sans culpabiliser. Mieux vaut peu, mais vraiment fait.
            </p>
          </Point>

          <Point n={2} title="Ouvrez « Semaine », c'est tout">
            <p style={{ margin: 0 }}>
              La liste du jour, c'est celle de la semaine : pas de jour imposé. Faites ces tâches quand ça vous arrange, le week-end par
              exemple. Besoin de bloquer un jour précis ? Touchez le petit calendrier dans le Planning.
            </p>
          </Point>

          <Point n={3} title="Un geste : « C'est fait »">
            <p style={{ margin: 0 }}>
              Ouvrez la tâche, suivez les étapes, touchez <strong>C'est fait</strong>. Tout se recale tout seul : prochaine échéance, échéancier,
              carnet. Une erreur ? Le bouton <strong>Annuler</strong> est là.
            </p>
          </Point>

          <Point n={4} title="Lire les signes d'un coup d'œil">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Ring progress={0.9} color="var(--maison)" size={30} />
              <span>L'anneau se remplit à mesure que l'échéance approche.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="chip">Essentiel</span>
              <span>Sécurité ou obligation : ces tâches passent toujours, même une semaine chargée.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', gap: 6 }}>
                <span className="dot" style={{ background: 'var(--maison)' }} />
                <span className="dot" style={{ background: 'var(--exterieur)' }} />
                <span className="dot" style={{ background: 'var(--vehicule)' }} />
              </span>
              <span>Maison, jardin, voiture.</span>
            </div>
          </Point>

          <Point n={5} title="Trop ? Pas assez ? Hestia s'adapte">
            <p style={{ margin: 0 }}>
              Le dimanche soir, une question : <em>comment c'était ?</em> Répondez d'un toucher, et le temps prévu pour la semaine suivante
              s'ajuste. Une semaine de forme ?
            </p>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--link)' }}>
              <IconPlus size={16} /> Une tâche de plus
            </span>
          </Point>

          <Point n={6} title="Des fiches faites pour votre maison">
            <p style={{ margin: 0 }}>
              Les étapes suivent votre niveau de bricolage (dans les Réglages). Quelques questions « Votre cas » les adaptent à ce que vous avez
              vraiment. Il vous manque un outil ? Dites-le : Hestia propose une autre solution.
            </p>
          </Point>

          <Point n={7} title="Ce qui ne vous concerne pas, on le met de côté">
            <p style={{ margin: 0 }}>
              Dans <strong>Foyer › Mes tâches</strong>, une bascule met une tâche en pause, sans rien perdre. Un nouvel équipement ? Mettez à jour
              la composition de la maison, ou créez votre propre tâche.
            </p>
          </Point>

          <Point n={8} title="Garder un œil sur l'année">
            <p style={{ margin: 0 }}>
              L'<strong>Échéancier</strong>, dans le Planning, montre les grands rendez-vous des douze prochains mois. Une tâche vous tient à cœur ?
            </p>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="star-on" style={{ display: 'flex' }}><IconStar size={18} filled /></span> Étoilez-la pour la suivre.
            </span>
          </Point>

          <Point n={9} title="Les gestes">
            <p style={{ margin: 0 }}>Glissez vers la droite pour revenir en arrière. Dans Mes tâches, glissez une tâche vers la gauche pour la régler.</p>
          </Point>

          <div className="card" style={{ background: 'var(--chip-bg)', padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: 'var(--exterieur)', color: '#FFFDF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCheck size={16} />
            </span>
            <span style={{ fontSize: 15, lineHeight: 1.45 }}>
              En résumé : les rappels du week-end recopiés sur l'ardoise, quelques tâches le week-end, une réponse le dimanche soir. Hestia s'occupe du reste.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
