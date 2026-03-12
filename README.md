# VehicleMarket Backend API

Backend Node.js + Express + MySQL pour la plateforme VehicleMarket.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE vehiclemarket;
exit;

# Exécuter les migrations
npm run db:migrate

# (Optionnel) Insérer des données de test
npm run db:seed
```

## 📦 Démarrage

```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

L'API sera accessible sur http://localhost:5000

## 📚 Documentation API

### Véhicules
- `GET /api/vehicles` - Liste tous les véhicules
- `GET /api/vehicles/:id` - Détails d'un véhicule
- `POST /api/vehicles` - Créer un véhicule (admin)
- `PUT /api/vehicles/:id` - Modifier un véhicule (admin)
- `DELETE /api/vehicles/:id` - Supprimer un véhicule (admin)

### Rendez-vous
- `POST /api/appointments` - Créer un RDV (showroom ou SAV)
- `GET /api/appointments` - Liste des RDV (admin)
- `PUT /api/appointments/:id` - Modifier statut RDV (admin)

### Devis
- `POST /api/quotes` - Demande de devis
- `GET /api/quotes` - Liste des devis (admin)

### Contact
- `POST /api/contact` - Formulaire de contact

### Avis clients
- `POST /api/reviews` - Soumettre un avis
- `GET /api/reviews` - Liste des avis approuvés
- `PUT /api/reviews/:id/approve` - Approuver un avis (admin)

### Services SAV
- `GET /api/services` - Liste des services garage
- `POST /api/services` - Créer un service (admin)
- `PUT /api/services/:id` - Modifier un service (admin)

### Authentification (Admin)
- `POST /api/auth/login` - Connexion admin
- `POST /api/auth/register` - Créer compte admin (première fois)

## 🗄️ Structure de la base de données

- `vehicles` - Véhicules en vente
- `appointments` - Rendez-vous showroom/SAV
- `quotes` - Demandes de devis
- `contacts` - Messages de contact
- `reviews` - Avis clients
- `services` - Services du garage
- `users` - Comptes administrateurs

## 🔒 Sécurité

- Authentification JWT pour les routes admin
- Validation des données avec express-validator
- Protection CORS
- Rate limiting
- Helmet pour headers sécurisés
- Hashage des mots de passe avec bcrypt
