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

## Phase complémentaire : ressources créées et sécurité renforcée

Au 18 novembre 2026, les ressources Cloudflare suivantes ont été créées **vides** et séparées des autres applications :

- **Base D1 :** `warlike-records-private` (juridiction D1 configurée `eu`). Migrations `0001`, `0002` et `0003` appliquées ; aucun compte, artiste, contrat ou relevé ajouté.
- **Bucket R2 :** `warlike-records-private-documents`, région de placement `WEUR`. **Attention : sa juridiction R2 est `default` ; le placement européen observé n'est pas à lui seul une garantie de résidence juridique européenne des données.** Vérifier les exigences de résidence avant tout document réel.
- **Cloudflare Access / Zero Trust :** *non activé sur ce compte*. L'API a renvoyé `access.api.error.not_enabled`. L'installation doit être complétée et ses paramètres confirmés avant activation de tout compte.

### Activation bloquante côté Cloudflare

1. Activer Cloudflare Zero Trust dans le tableau de bord Cloudflare de ce compte, choisir la configuration requise et son équipe. Une étape utilisateur peut être nécessaire.
2. Créer une application Access auto-hébergée qui protège **/admin.html** et **/api/admin/***, pour production et prévisualisations utilisées. Ajouter une politique explicitement limitée aux identités de l'équipe. Activer MFA selon le niveau de risque. Récupérer l'URL de l'équipe et l'audience de l'application.
3. Configurer `ACCESS_TEAM_DOMAIN` et `ACCESS_AUD` dans l'environnement sécurisé de Cloudflare Pages, idéalement séparément pour production et Preview.
4. Lier D1 sous le binding `RECORDS_DB` et R2 sous `RECORDS_DOCS`. Avant toute donnée personnelle, vérifier la juridiction du bucket, la confidentialité des objets et la politique de rétention.
5. **Ensuite seulement**, créer dans `records_roles` un premier compte `director` correspondant à une identité Access confirmée. Ne pas attribuer automatiquement un rôle à une simple adresse Cloudflare ou GitHub.
6. Effectuer un test anonyme, un test Access valide sans rôle, puis un test avec rôle ; vérifier chaque route, y compris la protection serveur de `admin.html`.
7. Auditer la configuration RGPD, les conditions contractuelles, les sauvegardes, les accès et les coûts Cloudflare avant des documents réels.

### Nouveau contrôle serveur de l'interface

`functions/admin.html.js` intercepte l'accès à la page HTML : tant qu'Access, l'audience JWT, la base D1 et un rôle adapté ne sont pas présents, le HTML d'administration n'est pas servi. Cette protection complète, mais ne remplace pas, la politique Access en amont.

### Cofre documentaire

`functions/api/admin/document.js` prend en charge un PDF de 8 MiB au maximum pour un contrat déjà référencé, seulement pour les rôles `director` et `production`. Le fichier est identifié par un nom de clé opaque R2 et une empreinte SHA-256. Le téléchargement est servi en pièce jointe privée, après une seconde vérification de l'authentification et du rôle.

Le dépôt n'est **ni une signature**, ni une preuve de validité du contrat. Des vérifications antivirales, des règles de conservation, un contrôle de confidentialité et une gestion de révocation restent nécessaires avant usage réel.

### Approbation des royalties

Les nouvelles colonnes `created_by`, `approved_by` et `approved_at` accompagnent un journal `records_royalty_events`. Seul le rôle `director` peut approuver un brouillon **créé par une autre identité autorisée**. La modification est conditionnelle et liée à un enregistrement d'audit.

- **Draft** : calcul interne non validé.
- **Approved** : validation interne par une deuxième personne.
- **Paid** : aucun paiement n'est implémenté, et aucun bouton ne peut émettre une transaction bancaire.

La formule actuelle reste indicative ; elle ne couvre pas les contrats complexes, les taxes et la comptabilité légale.

### Signature électronique

Le schéma `records_signature_evidence` prépare l'identifiant fournisseur, l'empreinte du PDF et la vérification des preuves. Aucun prestataire n'est connecté, aucun webhook fournisseur n'est accepté et **aucune opération ne peut passer en `completed_verified`**. Le choix d'un prestataire, la vérification des webhooks et de l'identité des signataires, le dossier de preuve et les modalités eIDAS doivent être validés avant activation.


## À développer ensuite

- Autorisations précises par dossier et comptes artistes individuels.
- Prestataire de signature, piste d'audit et stockage R2 privé.
- Calcul de royalties par contrat et territoire, justificatifs, TVA, avances, paiements.
- Workflow à deux validations pour les publications et opérations financières.
- Alertes échéances contractuelles et exports comptables vérifiés.
