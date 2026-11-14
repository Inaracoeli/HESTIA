# HESTIA

Web app de planification et de suivi de l'entretien de la maison, des extérieurs et des véhicules.
Pensée d'abord pour l'iPhone (à installer sur l'écran d'accueil), utilisable sur ordinateur.

## État actuel

Version de démonstration : les écrans Aujourd'hui, Planning, Guides, Foyer et la fiche tâche
fonctionnent avec des tâches d'exemple. Rien n'est encore enregistré : les comptes et la base
de données (Supabase) arrivent à l'étape suivante.

## Technique

- **Interface** : React + Vite, en TypeScript
- **Données et comptes** : Supabase (à venir)
- **Hébergement** : Cloudflare, mise en ligne automatique à chaque envoi sur GitHub

## Organisation du code

| Dossier | Contenu |
| --- | --- |
| `src/screens` | Un fichier par écran |
| `src/components` | Logo, barre d'onglets, icônes, anneaux d'échéance |
| `src/data/engine.ts` | Moteur de priorité : choisit les tâches de chaque semaine |
| `src/data/demo.ts` | Tâches d'exemple |
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
