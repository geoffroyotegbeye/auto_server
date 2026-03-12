# Base de données - Migrations et Seeds

## 📋 Commandes disponibles

### Migrations

```bash
# Migration complète (toutes les tables en un seul fichier)
npm run db:migrate:all

# Migration originale (utilise schema.sql)
npm run db:migrate
```

### Seeds

```bash
# Seed complet (toutes les données en un seul fichier)
npm run db:seed:all

# Seed original (données de base)
npm run db:seed
```

### Reset complet

```bash
# Exécute migration + seed en une seule commande
npm run db:reset
```

## 🗄️ Tables créées

1. **brands** - Marques de véhicules (16 marques)
2. **hero_settings** - Paramètres de la section hero
3. **users** - Utilisateurs admin
4. **vehicles** - Véhicules disponibles
5. **appointments** - Rendez-vous showroom/SAV
6. **quotes** - Demandes de devis
7. **contacts** - Messages de contact
8. **reviews** - Avis clients
9. **services** - Services SAV
10. **stats** - Statistiques du site
11. **site_config** - Configuration (devise, etc.)

## 📊 Données insérées par le seed

- ✅ **1 admin** : admin@vehiclemarket.com / Admin123!
- ✅ **16 marques** : Audi, BMW, Mercedes, Tesla, Toyota, etc.
- ✅ **1 hero settings** : Titre, sous-titre, badges, cards
- ✅ **1 configuration** : FCFA (Franc CFA)
- ✅ **1 statistiques** : 12000 véhicules, 48 marques, 98% satisfaction
- ✅ **8 véhicules** : BMW, Mercedes, Audi, Tesla, etc.
- ✅ **6 services SAV** : Révision, vidange, diagnostic, etc.
- ✅ **3 avis clients** : Avis approuvés avec notes 4-5 étoiles

## 🔐 Compte admin par défaut

```
Email: admin@vehiclemarket.com
Mot de passe: Admin123!
```

## 📝 Structure des fichiers

```
backend/src/database/
├── migrate-all.js      # Migration complète (recommandé)
├── seed-all.js         # Seed complet (recommandé)
├── migrate.js          # Migration originale
├── seed.js             # Seed original
├── schema.sql          # Schéma SQL
├── check-tables.js     # Vérification des tables
└── README.md           # Ce fichier
```

## 🚀 Utilisation recommandée

Pour une installation propre :

```bash
# 1. Créer toutes les tables
npm run db:migrate:all

# 2. Insérer toutes les données
npm run db:seed:all

# OU en une seule commande
npm run db:reset
```

## ⚠️ Notes importantes

- Les seeds utilisent `INSERT IGNORE` ou `ON DUPLICATE KEY UPDATE` pour éviter les doublons
- Vous pouvez exécuter les seeds plusieurs fois sans créer de doublons
- Les prix sont en FCFA (Franc CFA) - devise du Bénin
- Les localisations sont adaptées au Bénin (Cotonou, Porto-Novo, etc.)
