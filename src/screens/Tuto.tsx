import { useState, type ReactNode } from 'react';
import { IconBook, IconCalendar, IconCheck, IconChevronLeft, IconFlame, IconGear, IconHouse, IconPlus, IconStar } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { useSwipeBack } from '../components/useSwipeBack';

type Step = { icon: ReactNode; where: string; title: string; text: string; tip?: string };

/** Du plus important au moins important : on peut s'arrêter à tout moment. */
const STEPS: Step[] = [
  {
    icon: <IconFlame size={26} />, where: 'Onglet Semaine', title: 'Votre semaine, et c’est tout',
    text: 'Hestia vous propose quelques tâches pour la semaine, jamais plus de cinq, choisies parmi les plus utiles. Le reste attend son tour : rien ne s’accumule, même si vous ne venez pas pendant trois semaines.',
    tip: 'Pas de jour imposé : faites-les quand ça vous arrange, souvent le week-end.',
  },
  {
    icon: <IconCheck size={26} />, where: 'Une tâche de la liste', title: 'Ouvrir, faire, « C’est fait »',
    text: 'Touchez une tâche : la fiche explique pourquoi c’est utile, les étapes adaptées à votre niveau et le matériel. « C’est fait » est en haut de la fiche ; cocher toutes les étapes la valide aussi. La prochaine échéance se recale toute seule.',
    tip: 'Pas le moment, ou encore bon (des essuie-glaces qui tiennent) ? « Plus tard » la reporte : semaine prochaine, dans un mois, un an ou à la date de votre choix. Une autre tâche prend sa place.',
  },
  {
    icon: <IconGear size={26} />, where: 'Foyer › Réglages', title: 'Les rappels',
    text: 'Activez les rappels : par défaut vendredi, samedi et dimanche à 11 h, une notification liste 2 ou 3 petites choses. Ajoutez-en ou modifiez-les comme des alarmes. Recopiez-les sur l’ardoise ou le calendrier de la maison, c’est tout.',
    tip: 'Sur iPhone, ajoutez d’abord Hestia à l’écran d’accueil (Partager › Sur l’écran d’accueil).',
  },
  {
    icon: <IconFlame size={26} />, where: 'Onglet Semaine, le dimanche soir', title: 'Une question, une réponse',
    text: '« Comment c’était ? » Trop chargé, juste bien, ou j’aurais pu faire plus : d’un toucher, le temps prévu pour la semaine suivante s’ajuste.',
  },
  {
    icon: <IconPlus size={26} />, where: 'Onglet Semaine', title: 'Une tâche de plus',
    text: 'Une semaine en forme ? « Une tâche de plus » ajoute la suivante la plus utile. Uniquement si vous en avez envie.',
  },
  {
    icon: <IconHouse size={26} />, where: 'Foyer › Mes tâches', title: 'Ce qui ne vous concerne pas',
    text: 'Une bascule met une tâche en pause ou l’active, sans rien perdre ; la recherche la retrouve en un instant. Vous pouvez aussi régler son rythme, ou créer vos propres tâches. Glissez une tâche vers la gauche pour aller plus vite.',
  },
  {
    icon: <IconHouse size={26} />, where: 'Foyer › Composition de la maison', title: 'Votre maison, en six questions',
    text: 'Chauffage, équipements, jardin, véhicules : vos réponses choisissent les tâches utiles. Un nouvel équipement ? Mettez à jour, Hestia ajoute ce qu’il faut.',
  },
  {
    icon: <IconBook size={26} />, where: 'Onglet Guides', title: 'Des fiches pour tous les niveaux',
    text: 'Chaque fiche : comprendre, étapes selon votre niveau de bricolage, « Votre cas » pour l’adapter, ce qu’il faut éviter, ce que dit la loi, et souvent une vidéo.',
    tip: 'Il vous manque un outil ? Dites-le dans la fiche : Hestia propose une autre solution.',
  },
  {
    icon: <IconCalendar size={26} />, where: 'Onglet Planning', title: 'Voir plus loin, si besoin',
    text: 'Les trois prochaines semaines. Le petit calendrier programme une tâche à un jour ou à n’importe quelle date : programmée plus loin, elle quitte les semaines d’avant. L’Échéancier montre les grands rendez-vous de l’année.',
  },
  {
    icon: <IconStar size={26} filled />, where: 'Échéancier', title: 'Suivre une tâche',
    text: 'Les tâches essentielles y sont toujours. Étoilez les autres que vous voulez garder à l’œil.',
  },
  {
    icon: <IconBook size={26} />, where: 'Foyer › Carnet d’entretien', title: 'Le carnet',
    text: 'Chaque « C’est fait » y est noté, avec le coût réel et une note si vous voulez. Pratique pour l’assurance ou une revente.',
  },
  {
    icon: <IconGear size={26} />, where: 'Foyer › Réglages', title: 'À votre mesure',
    text: 'Temps par semaine, niveau de bricolage, thème sombre, mot de passe. Et ce tuto reste accessible depuis le bouton « ? » en haut de l’onglet Semaine.',
    tip: 'Glissez vers la droite pour revenir en arrière, partout.',
  },
];

/** Tuto pas à pas : les fonctions de la plus importante à la moins importante. */
export function Tuto({ onBack, onOpenEsprit }: { onBack: () => void; onOpenEsprit: () => void }) {
  const swipe = useSwipeBack(onBack);
  const [i, setI] = useState(0);
  const s = STEPS[i];
  const last = i === STEPS.length - 1;
  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar>
        <button className="icon-btn" aria-label="Fermer" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 22 }}>Bien démarrer</h1>
        <span className="num" style={{ width: 44, textAlign: 'right', fontSize: 13, fontWeight: 700 }}>{i + 1}/{STEPS.length}</span>
      </Topbar>
      <div className="screen">
        <header className="header" style={{ paddingBottom: 62 }}>
          <div role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={i + 1} style={{ display: 'flex', gap: 4 }}>
            {STEPS.map((_, k) => (
              <span key={k} style={{ flexGrow: 1, height: 5, borderRadius: 3, background: k <= i ? 'var(--progress-on)' : 'var(--progress-off)', boxShadow: k <= i ? 'var(--progress-glow)' : 'none' }} />
            ))}
          </div>
        </header>
        <div className="content" style={{ gap: 14, paddingBottom: 'calc(env(safe-area-inset-bottom) + 150px)' }}>
          <section className="card card--raised" style={{ padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 300 }}>
            <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--gold)', color: 'var(--on-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </span>
            <span className="meta" style={{ fontSize: 13, fontWeight: 700, color: 'var(--link)' }}>{s.where}</span>
            <h2 className="title-2" style={{ fontSize: 22 }}>{s.title}</h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>{s.text}</p>
            {s.tip && (
              <div className="notice" style={{ background: 'var(--chip-bg)', color: 'var(--ink)', fontSize: 14 }}>{s.tip}</div>
            )}
          </section>
        </div>
      </div>

      {/* Boutons fixes en bas : ils ne bougent pas d'une étape à l'autre. */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, maxWidth: 560, margin: '0 auto',
          padding: '14px 16px calc(env(safe-area-inset-bottom) + 10px)', display: 'flex', flexDirection: 'column', gap: 4,
          background: 'var(--veil)', WebkitBackdropFilter: 'blur(18px)', backdropFilter: 'blur(18px)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setI(i - 1)} disabled={i === 0} style={{ visibility: i === 0 ? 'hidden' : 'visible' }}>
            Précédent
          </button>
          <button className="btn-gold" onClick={() => (last ? onBack() : setI(i + 1))}>{last ? 'C’est parti' : 'Suivant'}</button>
        </div>
        {last ? (
          <button className="btn-link" onClick={onOpenEsprit}>Lire l’esprit Hestia, en deux minutes</button>
        ) : (
          <button className="btn-link" onClick={onBack}>Passer le tuto</button>
        )}
      </div>
    </div>
  );
}
