# WarLike Records — Private Operations (P1)

Cette branche prépare trois services internes pour la direction : **dossiers artistes, circuits de contrats et relevés de royalties**.

## État réel

- **Back-office privé :** interface `/admin.html`, API Pages Functions sécurisée `/api/admin/*` et schéma D1 ajoutés ; **inutilisables en production tant que l'accès et la base privée ne sont pas configurés**.
- **Signature électronique :** création de **brouillons de contrats uniquement**. Aucun service de signature n'est relié et aucun document n'est réputé signé.
- **Comptabilité :** brouillons de relevés, conversion de pourcentages en points de base et calcul en centimes ; **pas de facture, paiement, rapprochement bancaire ni déclaration fiscale automatisés**.

## Sécurité indispensable avant utilisation

1. Créer une application **Cloudflare Access** pour `https://warlike-records.pages.dev/admin.html` ainsi que `https://warlike-records.pages.dev/api/admin/*`. Autoriser exclusivement les identités habilitées. Si possible, protéger les environnements Preview également.
2. Dans le projet Pages `warlike-records`, renseigner **ACCESS_TEAM_DOMAIN** (ex. `https://votre-equipe.cloudflareaccess.com`) et **ACCESS_AUD** (audience de cette application Access). **Ne jamais commiter de jetons, secrets ou identifiants**.
3. Créer une base Cloudflare D1 privée, exécuter `migrations/0001_records_admin.sql` et la lier à Pages sous le nom **RECORDS_DB**, dans chaque environnement autorisé.
4. Ajouter manuellement une entrée de direction à `records_roles` dans D1, après confirmation de l'identité : `INSERT INTO records_roles(email,role,enabled) VALUES ('adresse-verifiee@example.com','director',1);`. Ce SQL est un exemple : ne pas insérer une identité fictive.
5. Vérifier sur l'environnement Preview : accès anonyme = 401/403, JWT invalide = 401, membre sans rôle = 403, absence de D1 = 503, rôles insuffisants = 403.
6. Avant tout vrai dossier personnel, prévoir politique RGPD, conservation, sauvegardes, restauration, contrôle des accès, procédure de suppression et journalisation des accès. Ne pas tester avec de vraies données personnelles tant que ces mesures ne sont pas validées.

**Contrôle des JWT :** le code vérifie la signature RS256 avec les clés publiques Cloudflare Access, l'émetteur, l'audience, l'expiration et l'adresse de l'utilisateur. La présence d'un simple en-tête d'identité ne suffit pas. Cf. documentation [Cloudflare Access — validation JWT](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).

## Permissions

| Fonction | Director | A&R | Production | Finance | Artiste |
|---|---|---|---|---|---|
| Session et rôle | Oui | Oui | Oui | Oui | Oui |
| Liste des dossiers | Oui | Oui | Oui | Oui | Non |
| Créer un dossier artiste | Oui | Oui | Non | Non | Non |
| Consulter les brouillons d'accords | Oui | Oui | Oui | Non | Non |
| Créer un projet d'accord | Oui | Non | Non | Non | Non |
| Relevés financiers | Oui | Non | Non | Oui | Non |
| Ajouter un brouillon de royalties | Oui | Non | Non | Oui | Non |

Les comptes `artist` n'ont pas encore leur portail personnel. Ne leur donner aucune lecture sur les dossiers d'autres artistes.

## Cycle contractuel

Étapes prévues : `draft` → `legal_review` → `awaiting_provider` → `completed_verified`, ou `cancelled`.

**Dans cette branche, seule la création `draft` est possible.** Aucun bouton ne peut déclarer le contrat signé. Avant activation des autres étapes, intégrer un prestataire de signature conforme à l'usage visé et valider ses webhooks authentifiés, les preuves de consentement, l'intégrité du document final, l'identité des signataires et l'archivage privé.

## Royalties

Formule provisoire et explicite :

`payable_cents = round((gross_cents - permitted_deductions_cents) * basis_points / 10000)`

Avec `basis_points=2500` (25 %), recettes 1000,00 € et déductions permises 200,00 €, l'estimation est 200,00 €.

Cette formule est **une estimation de gestion**, pas une règle universelle du droit d'auteur : chaque contrat peut prévoir des assiettes, avances recoupables, plafonds, retenues, taxes, taux ou territoires différents. Pour des royalties réelles, ajouter un moteur contractuel versionné, les pièces de revenus et des contrôles comptables avant approbation.

Les relevés créés sont toujours `draft`. Les statuts `approved` et `paid` ne peuvent pas être activés par cette interface.

## Tests

```bash
node --test tests/private-operations.test.mjs
```

Ces tests vérifient l'activation conditionnelle de l'API, la cryptographie des JWT et les calculs. Ils ne remplacent pas des tests d'intégration avec Cloudflare Access et D1.

## À développer ensuite

- Autorisations précises par dossier et comptes artistes individuels.
- Prestataire de signature, piste d'audit et stockage R2 privé.
- Calcul de royalties par contrat et territoire, justificatifs, TVA, avances, paiements.
- Workflow à deux validations pour les publications et opérations financières.
- Alertes échéances contractuelles et exports comptables vérifiés.
