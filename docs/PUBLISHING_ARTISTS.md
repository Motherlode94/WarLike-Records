# Publier un artiste sur WarLike Records

Le portail public n'est **pas** la base des contrats. Aucun contrat, pièce d'identité, relevé bancaire ou fiche privée ne doit être ajouté à ces fichiers JSON.

## 1. Préparer et valider le dossier privé

Suivre [le parcours administratif](ADMINISTRATIVE_WORKFLOW.md) : identité et statut professionnel, approbation du label, autorisations écrites pour la biographie, les portraits, les publications et l'éventuel sous-site.

## 2. Fiche artiste publique

Ajouter une entrée à `artists.json`. Le champ `slug` est un identifiant stable en minuscules, chiffres et tirets. Il est utilisé pour les pages `/artist.html?slug=...`.

```json
{
  "slug": "nom-de-scene",
  "name": "Nom de scène",
  "genre": "R&B / Afro",
  "bio": "Biographie professionnelle approuvée.",
  "image": "https://media.example/portrait.jpg",
  "website": "https://artiste.example",
  "spotify": "https://open.spotify.com/...",
  "youtube": "https://www.youtube.com/...",
  "instagram": "https://www.instagram.com/...",
  "published": false
}
```

**Ce n'est qu'un exemple de schéma, pas un véritable artiste signé.** Ne pas ajouter cet exemple fictif au catalogue de production. Passer `published` à `true` après validation.

La page artiste est une fiche interne au portail. `website` est l'adresse HTTPS du **site indépendant** de l'artiste ; celui-ci peut être hébergé séparément et relié au label par navigation réciproque.

## 3. Ajouter une sortie

Dans `releases.json` :

```json
{
  "title": "Titre validé",
  "artistSlug": "nom-de-scene",
  "type": "single",
  "date": "2026-12-01",
  "cover": "https://media.example/cover.jpg",
  "link": "https://distribution.example/track",
  "published": false
}
```

`type` peut être `single`, `ep`, `album` ou `clip`. L'artiste associé doit avoir une fiche publiée. Vérifier les autorisations de master, featuring, photo, distribution et crédits avant de publier.

## 4. Actualités officielles

Dans `news.json` :

```json
{
  "title": "Annonce approuvée",
  "date": "2026-12-01",
  "summary": "Résumé public communiqué par le label.",
  "link": "https://artiste.example/actualite",
  "published": false
}
```

Le booléen `published` est obligatoire. Les actualités non validées ne sont pas affichées.

## 5. Tests et mise en ligne

```sh
node --test tests/catalog-public.test.mjs
```

La branche `main` est connectée au projet Cloudflare Pages `warlike-records`. Tester d'abord la branche de prévisualisation, vérifier la page artiste et les liens externes, puis fusionner après validation.

## 6. Administration privée à construire

La gestion des candidatures, signatures, redevances et pièces officielles doit être fournie par un futur backend avec authentification WarLike Keys, rôles serveur, stockage privé R2, métadonnées D1 et audit des accès. Les fichiers publics `artists.json`, `releases.json` et `news.json` ne constituent pas ce back-office.
