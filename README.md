# NaYa

Marketplace directe entre particuliers pour le Niger — immobilier, véhicules, électronique,
troc. NaYa met en relation vendeurs et clients sans intermédiaire ; la transaction financière
du bien se déroule toujours en dehors de l'application.

L'application est pensée pour des utilisateurs qui ne savent ni lire ni écrire : publication
d'annonce à la voix, pictogrammes, vérification par appel téléphonique plutôt que par code à
recopier, synthèse vocale sur les écrans clés. Charte graphique aux couleurs du Niger
(vert / orange / blanc).

## Stack technique

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma — SQLite en développement local, portable vers PostgreSQL (Supabase) en production
  en changeant uniquement `provider` et `DATABASE_URL` dans `prisma/schema.prisma`
- Auth par téléphone + OTP (pas de mot de passe), session par cookie httpOnly
- Zod pour la validation des entrées API
- Vitest pour les tests unitaires de la logique métier

### Fournisseurs externes (SMS, appel, paiement, stockage)

Ces services sont cachés derrière des interfaces dans [`src/lib/providers.ts`](src/lib/providers.ts),
avec une implémentation **"dev"** qui simule tout localement (le code OTP est affiché et lu à
l'écran, les paiements sont auto-confirmés, les fichiers sont stockés sur disque local). Aucun
identifiant de fournisseur réel (Twilio, Africa's Talking, Orange Money, S3...) n'est requis
pour développer ou tester l'application. Brancher un vrai fournisseur en production ne demande
qu'une nouvelle classe implémentant l'interface, sélectionnée via les variables d'environnement
`OTP_PROVIDER`, `CALL_PROVIDER`, `PAYMENT_PROVIDER`.

## Démarrage

```bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

L'application est servie sur `http://localhost:3000`.

## Scripts

| Commande              | Description                                      |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`           | Serveur de développement Next.js                  |
| `npm run build`         | Build de production                                |
| `npm run start`         | Démarre le build de production                    |
| `npm run db:generate`   | Génère le client Prisma                            |
| `npm run db:push`       | Synchronise le schéma Prisma avec la base locale   |
| `npm run test`          | Lance les tests unitaires (Vitest)                 |

## Structure du projet

```
prisma/schema.prisma        Modèle de données (User, Listing, ContactRequest, Payment, ...)
src/app/                    Pages (App Router) et routes API
src/app/api/                Endpoints : sellers (auth), listings, contact-requests, payments, uploads
src/components/             Composants UI (enregistreur vocal, clavier numérique, pictogrammes, ...)
src/lib/                    Logique métier, validation, session, fournisseurs abstraits
tests/                      Tests unitaires (logique métier pure)
```

## Fonctionnalités principales

- Inscription/connexion vendeur par téléphone, vérification par appel flash ou code vocal/SMS
- Création d'annonce vocale : pictogrammes (catégorie, type de transaction), clavier numérique
  (prix), note vocale, photos
- Fil d'annonces public avec filtres, lecture audio, synthèse vocale ("🔊 Écouter")
- Mise en contact en un bouton, avec vérification du numéro client et appel masqué simulé
- **Un vendeur ne peut pas se contacter lui-même** sur sa propre annonce (vérifié côté serveur
  et masqué côté interface)
- Modèle économique : quota d'annonces gratuites, paiement à l'annonce supplémentaire, mise en
  avant payante (boost), abonnement Professionnel — réglés via mobile money (simulé en dev)
- Bandeau de non-responsabilité affiché et lu à voix haute aux étapes clés, page CGU dédiée

## Points ouverts avant une mise en production réelle

- Couverture effective des opérateurs Niger par le fournisseur SMS/voix/mobile money choisi
- Disponibilité d'un moteur de synthèse/reconnaissance vocale en langues locales (haoussa,
  zarma) — le MVP est en français uniquement
- Montants du modèle économique (prix annonce/boost/abonnement) à valider par étude de marché
- Migration de SQLite vers PostgreSQL (Supabase) et du stockage local vers S3-compatible
