# WarLike Records — Parcours administratif des artistes

**Gouvernance :** WarLike Records est le portail central du label. Chaque artiste signé est suivi dans un dossier privé. Sa fiche publique et son site individuel sont publiés uniquement après validation.

## Étapes
1. **Candidature :** identité, coordonnées professionnelles, démos, engagements existants et notice de confidentialité.
2. **Évaluation :** rapport interne, audition, contrôle préalable des droits, décision.
3. **Négociation :** conditions indicatives par type de collaboration, rémunération, budget, durée et exclusivité éventuelle.
4. **Signature :** accord juridique approprié, validé avec conseil, signé par des personnes habilitées ; archivage privé.
5. **Production :** fiche titre, crédits, featurings, splits, licences de samples et pièces justificatives.
6. **Publication :** vérification des droits, métadonnées, sortie et autorisation des photos et du sous-site.
7. **Suivi :** relevés de recettes, paiements, échéances, audit et éventuelle fin de contrat.

## Sécurité
**Ne jamais ajouter ici de contrats signés, pièces d'identité, relevés bancaires ou données personnelles.** GitHub est public et réservé au code et aux modèles vierges. Le futur back-office privé doit utiliser WarLike Keys pour l'authentification, WarLike Server avec une base de données pour les métadonnées, stockage privé pour les documents, permissions strictes par rôle et journal des accès.

## Sites d'artistes
`artists.json` est exclusivement une liste publique d'artistes autorisés, par exemple :
```json
[
  {"name":"EXEMPLE À REMPLACER","genre":"Musique","website":"https://exemple.invalid","image":"https://exemple.invalid/portrait.jpg","published":false}
]
```
L'entrée ne s'affiche que si `published` vaut `true`. Les URL doivent être en HTTPS. Les artistes disposent d'un site dédié lié au portail, mais aucune publication n'est automatique à la signature.

## Avertissement
La qualification juridique et les droits doivent être vérifiés pour chaque contrat : artistes-interprètes, droits d'auteur, éventuelle présomption de salariat, autorisation pour mineurs et obligations de protection des données. Les modèles contractuels ne sont pas des accords prêts à signer.
