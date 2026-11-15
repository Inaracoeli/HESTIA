# HESTIA

Web app de planification et de suivi de l'entretien de la maison, des extérieurs et des véhicules.
Pensée d'abord pour l'iPhone (à installer sur l'écran d'accueil), utilisable sur ordinateur.

*Hestia Home · Bien gérer son foyer*

## État actuel

- Connexion par e-mail et mot de passe, sur invitation de l'administrateur du foyer.
- Écrans Accueil, Planning (choix du jour), Guides, Foyer et fiche tâche, branchés sur Supabase.
- Guides adaptables : quelques questions sur votre cas, des étapes selon votre niveau,
  et une solution de remplacement quand il vous manque du matériel.

## Technique

- **Interface** : React + Vite, en TypeScript
- **Données et comptes** : Supabase, espace `hestia` dédié et cloisonné
- **Hébergement** : Cloudflare, mise en ligne automatique à chaque envoi sur GitHub

## Organisation du code

| Dossier | Contenu |
| --- | --- |
| `src/screens` | Un fichier par écran |
| `src/components` | Logo, barre d'onglets, icônes, anneaux d'échéance |
| `src/data/engine.ts` | Moteur de priorité : choisit les tâches de chaque semaine |
| `src/lib/api.ts` | Lecture et écriture des données (Supabase) |
| `supabase/` | Évolutions de la base et fonction d'invitation |
| `src/styles.css` | Couleurs, polices et styles (thèmes clair et sombre) |
| `public` | Icônes de l'app et fichiers d'installation sur iPhone |

## Commandes

```bash
npm install      # installer les dépendances
npm run dev      # lancer en local
npm run build    # construire la version en ligne (dossier dist)
```

Réglages de mise en ligne sur Cloudflare : commande de construction `npm run build`,
dossier de sortie `dist`.
