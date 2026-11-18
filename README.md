# WarLike Records

**WarLike Records** est un label musical indépendant organisé autour d'une direction centrale, d'un catalogue commun et de plusieurs artistes disposant chacun de leur propre univers artistique. Le site sert de vitrine publique du label et de point d'entrée vers les sites individuels des artistes.

> **Statut :** site vitrine en ligne. Le roster public est actuellement vide ; les artistes, sorties et contrats ne doivent pas être présentés comme confirmés avant validation. Le back-office administratif privé et les signatures électroniques ne sont pas encore opérationnels.

## Liens officiels

- **Site du label :** https://warlike-records.pages.dev/
- **Dépôt source :** https://github.com/Motherlode94/WarLike-Records
- **Contact professionnel :** warlikeofficiel@gmail.com
- **Administration des artistes :** [Procédure administrative](docs/ADMINISTRATIVE_WORKFLOW.md)

## L'histoire du fondateur

### De Kinshasa à la création d'un écosystème artistique

Originaire de **Kinshasa, en République démocratique du Congo**, **Hardi MBANVU**, également connu sous le nom de **HardieBay**, développe un parcours transversal entre musique, écriture, création visuelle et développement de logiciels. Il compose, écrit, rappe, chante, produit des instrumentales et travaille également la guitare.

Son approche artistique repose sur plusieurs identités créatives, qui ne sont pas de simples signatures promotionnelles. **HFlow** représente l'une de ses premières voix dans le rap. **CHAYAH VEHUIAH** incarne une expression vocale et musicale distincte. **Rich Ravi OTD (RROTD)** porte une facette d'écriture et de stratégie, associée à l'idée d'**« Ordre, Discipline, Travail »**. Derrière ces expressions, **HardieBay** conserve la direction de l'ensemble.

Son projet d'EP **_MOON LIGHT_** illustre cette recherche d'un univers musical personnel : une même personne peut composer et interpréter selon différentes voix, chaque morceau appelant sa propre identité artistique. Il ne faut pas interpréter cette mention comme une annonce de sortie commerciale du projet.

### Pourquoi WarLike Records ?

À mesure que sa pratique musicale se développe, HardieBay entreprend également de construire ses propres outils de création, notamment **WarLike Studio**, pensé pour la composition, l'enregistrement, le mixage et la production musicale dans un environnement Web.

**WarLike Records** prolonge cette démarche sous une forme collective : il ne s'agit plus seulement de produire ses propres œuvres, mais de diriger un label capable d'**accueillir, accompagner et développer d'autres artistes**. Le projet distingue clairement la liberté artistique des musiciens et la structure professionnelle chargée de les soutenir.

Le portail WarLike Records doit servir de point de rencontre : **un label central, des artistes aux identités différentes et des sites individuels rattachés au groupe**. Les biographies, discographies, sorties et annonces officielles de chaque artiste seront publiées après validation.

### Une ambition de long terme

La vision de WarLike Records est de relier création et autonomie : développer les artistes, constituer un catalogue pérenne, documenter les droits, produire des œuvres de qualité et disposer d'outils numériques contrôlés par l'organisation.

Cette histoire est celle d'un projet en construction. Elle ne revendique **ni palmarès, ni artistes déjà signés, ni contrats, ni succès commerciaux non documentés**.

## Vision

WarLike Records a vocation à produire, accompagner et développer plusieurs artistes au sein du même label. Le portail central présente leur musique, leur actualité et les projets du label. Chaque artiste peut disposer d'un **sous-site ou d'un site dédié** avec ses propres photographies autorisées, sa biographie, son identité visuelle, ses sorties, ses clips et ses événements.

Les sites d'artistes sont **rattachés au portail central**, sans devoir partager exactement le même design. Les liens publics sont publiés uniquement avec l'accord des personnes concernées.

## Structure fonctionnelle

| Espace | Fonction | État |
| --- | --- | --- |
| Accueil | Présentation de WarLike Records et de sa vision | En ligne |
| Label | Présentation du rôle du label : direction artistique, production et développement | En ligne |
| Artistes | Roster public, profils et liens vers les sites individuels | En ligne, catalogue vide |
| Sorties | Singles, EP, albums, clips, liens d'écoute et crédits | Présentation en ligne, catalogue à alimenter |
| Rejoindre | Parcours de candidature et contact professionnel | Contact par e-mail disponible |
| Administration | Dossiers privés, signature, échéances, droits et paiements | À développer |
| Sous-sites d'artistes | Portfolios et discographies spécifiques aux artistes | Infrastructure à définir |

## Organisation du label

La **Direction du label** pilote la stratégie, les décisions artistiques et commerciales, les signatures et les autorisations de publication.

Les fonctions envisagées pour le futur back-office sont :

- **Direction / Administration générale :** validation des artistes, contrats, rôles et publications.
- **A&R / Développement artistique :** réception des candidatures, auditions, sélection et suivi des projets.
- **Production :** enregistrements, crédits, livrables, budgets, fichiers audio et vidéo.
- **Distribution / Marketing :** sorties, calendriers, communications et sites publics.
- **Comptabilité :** relevés, royalties, dépenses, facturation et échéances.
- **Artiste :** accès limité à son dossier, ses projets et ses documents autorisés.

Ces fonctions constituent l'organisation prévue, et non des comptes déjà créés.

## Parcours administratif de signature

Chaque artiste est suivi à travers **sept étapes documentées** :

1. **Candidature** — fiche d'identité professionnelle, présentation et démos.
2. **Évaluation** — audition, rapport artistique et décision.
3. **Négociation** — choix du cadre contractuel, budget, durée et droits.
4. **Signature** — validation juridique et conclusion écrite de l'accord adapté.
5. **Production** — projets, contributions, crédits, autorisations et splits.
6. **Publication** — contrôle des droits, métadonnées, visuels, distribution et sous-site.
7. **Suivi** — revenus, redevances, paiements, échéances et fin de collaboration le cas échéant.

Voir [docs/ADMINISTRATIVE_WORKFLOW.md](docs/ADMINISTRATIVE_WORKFLOW.md) pour le processus détaillé.

**Important :** contrats d'artiste-interprète, production phonographique, licence de masters, distribution et développement artistique ne sont pas interchangeables. Les modèles de documents sont des supports de préparation et doivent être adaptés et validés avant toute signature. Une publication du site ne vaut pas engagement contractuel.

## Publication d'un artiste sur le site

Le fichier `artists.json` contient uniquement des données **publiques et approuvées**. Par défaut, il contient un tableau vide.

Exemple de fiche non publiée :

```json
[
  {
    "name": "Nom de scène",
    "genre": "Style musical",
    "website": "https://artiste.example",
    "image": "https://artiste.example/portrait.jpg",
    "published": false
  }
]
```

Pour publier un profil, remplacer les données fictives par celles d'un artiste autorisé et passer `published` à `true`. Le site affiche alors sa fiche, sa catégorie musicale et, s'ils sont renseignés, son portrait et un lien vers son site HTTPS.

Ne jamais publier un artiste, une photographie, des liens privés ou un contrat avant d'avoir vérifié les autorisations nécessaires. Les pages de discographie détaillées, le système de diffusion et les données de sorties restent à développer.

## Architecture et déploiement

Ce dépôt est actuellement un site statique autonome :

```text
WarLike-Records/
├── index.html                       # Portail public responsive
├── artists.json                     # Roster public validé
├── docs/
│   └── ADMINISTRATIVE_WORKFLOW.md   # Procédure de signature et de suivi
└── README.md                        # Documentation du label et du site
```

**Hébergement :** Cloudflare Pages, projet `warlike-records`, relié à la branche `main` du dépôt GitHub. Les changements publiés sur `main` déclenchent le déploiement automatique configuré pour le projet.

Pour prévisualiser le site localement, utiliser un petit serveur HTTP statique à la racine du dépôt, puis ouvrir `index.html` depuis ce serveur. Le chargement du roster via `fetch('./artists.json')` nécessite ce contexte HTTP sur certains navigateurs.

### Infrastructure future du back-office

L'architecture prévue pourra s'appuyer sur les services existants de l'écosystème WarLike :

- **WarLike Keys** : identité, connexion et permissions.
- **WarLike Server** : API, métadonnées des artistes, dossiers et suivi.
- **Cloudflare D1** : données structurées de gestion.
- **Cloudflare R2 privé** : contrats et documents confidentiels avec accès contrôlés.
- **WarLike Studio** : liaison possible avec les workflows de production audio après validation des interfaces.

Ces intégrations ne sont pas considérées opérationnelles dans cette première version du site.

## Sécurité et confidentialité

Le dépôt GitHub et le site public ne doivent **jamais** contenir de pièces d'identité, contrats signés, coordonnées bancaires, mots de passe, données personnelles non nécessaires ou documents financiers privés.

Le futur système administratif devra prévoir authentification, rôles, accès par artiste, journal d'audit, sauvegarde, durée de conservation documentée et procédure de retrait. Les documents confidentiels ne doivent pas être servis directement depuis le dossier public de Pages.

## Feuille de route

**P0 — Portail du label :** stabiliser l'affichage, enrichir la navigation et valider les publications publiques.

**P1 — Roster et sous-sites :** fiches artistes, liens officiels, discographies, médias et gestion des autorisations.

**P1 — Administration privée :** dossiers artistes, suivi des sept étapes, modèles de documents, contrats et permissions.

**P2 — Activités du label :** campagnes, tableaux financiers, distribution, statistiques de sorties et intégrations WarLike Studio/Server.

---

**WarLike Records — une direction, plusieurs voix, des univers indépendants.**
