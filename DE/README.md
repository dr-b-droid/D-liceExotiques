# Délices Exotiques - Restaurant Management System

**Projet académique - Système complet de gestion de restaurant**

Un site web full-stack moderne pour un restaurant gastronomique avec réservations en ligne, gestion des commandes, organisation d'événements et interface d'administration.

---

## Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#-technologies-utilisées)
- [Architecture du projet](#-architecture-du-projet)
- [Frontend](#-frontend)
- [Backend](#-backend)
- [Base de données](#-base-de-données)
- [Authentification](#-authentification)
- [API Endpoints](#-api-endpoints)
- [Interface Admin](#-interface-admin)
- [Guide d'utilisation](#-guide-dutilisation)
- [L'équipe](#-léquipe)
- [Crédits et Licence](#-crédits-et-licence)

---

## Vue d'ensemble

**Délices Exotiques** est une application web complète simulant la gestion d'un restaurant gastronomique spécialisé dans la cuisine africaine et internationale. Le projet combine une interface utilisateur élégante avec un système backend robuste pour gérer toutes les opérations d'un restaurant moderne.

### Objectifs du projet

- Créer une expérience utilisateur fluide et intuitive
- Implémenter un système d'authentification sécurisé
- Développer une interface d'administration complète
- Gérer les réservations, commandes et événements
- Offrir un système de notification et de suivi en temps réel

---

## Fonctionnalités

### Coté Utilisateur

#### Authentification
- Inscription avec validation des données
- Connexion sécurisée avec sessions
- Gestion de profil utilisateur
- Système de points de fidélité (fictif)

#### Navigation et Découverte
- Page d'accueil avec présentation du restaurant
- Catalogue de 57 menus extensible
- Catégorisation par type (entrées, plats, desserts, boissons)
- Recherche et filtrage des plats
- Système de favoris

#### Réservations
- Formulaire de réservation de table
- Sélection de date, heure et nombre de personnes
- Demandes spéciales
- Confirmation par email (simulation)
- Historique des réservations
- Statut en temps réel (en attente, confirmé, annulé)

#### Commandes
- Panier d'achat dynamique
- Calcul automatique du total
- Suivi de commande en temps réel
- Historique des commandes
- Statuts : en attente, confirmé, en préparation, livré, terminé

#### Evénements
- Demande d'organisation d'événements (mariages, anniversaires, corporate)
- Formulaire détaillé avec budget et description
- Validation par l'administration
- Suivi des demandes

#### Profil Utilisateur
- Tableau de bord personnalisé
- Vue d'ensemble des statistiques
- Gestion des réservations
- Historique des commandes
- Liste des événements
- Flux d'activités récentes
- Modification des informations personnelles

### Coté Administration

#### Dashboard Admin
- Statistiques en temps réel
  - Nombre total d'utilisateurs
  - Réservations (totales, en attente, confirmées)
  - Commandes (totales, en attente, livrées)
  - Revenus générés
  - Evénements (totaux, en attente, confirmés)

#### Gestion des Réservations
- Vue de toutes les réservations
- Filtrage par statut
- Acceptation/Refus avec message personnalisé
- Informations complètes du client

#### Gestion des Commandes
- Liste complète des commandes
- Changement de statut (menu dropdown)
- Détails des commandes (items, prix)
- Notes administrateur

#### Gestion des Evénements
- Vue de tous les événements demandés
- Validation/Refus avec feedback
- Détails complets (type, date, invités, budget)

#### Gestion des Menus
- Création de nouveaux plats
- Modification des plats existants
- Activation/Désactivation
- Suppression
- Gestion des catégories et prix

#### Activités Récentes
- Timeline des actions utilisateurs
- Filtrage par type d'activité
- Suivi en temps réel

---

## Technologies utilisées

### Frontend

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **HTML5**   | - | Structure des pages |
| **CSS3** | - | Styles de base |
| **Tailwind CSS** | 3.x | Framework CSS |
| **JavaScript** | ES6+ | Logique coté client |
| **Feather Icons** | 4.x | Iconographie |
| **Web Components** | - | Navigation et Footer réutilisables; pack utils |

### Backend

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **Node.js** | 22.14 | Runtime JavaScript |
| **Express.js** | 4. | Framework web |
| **bcryptjs** | 2. | Hachage des mots de passe |
| **express-session** | 1. | Gestion des sessions |

### Stockage

| Technologie | Utilisation |
|-------------|-------------|
| **File System (fs)** | Stockage des données JSON |
| **LocalStorage** | Cache coté client (favoris, panier) |
| **SessionStorage** | Données temporaires |

---

## Architecture du projet

### Architecture Générale

```
 -----------------
│   FRONTEND      │
│   (Client)      │
│                 │
│ - HTML/CSS/JS   │
│ - Components    │
| - assets        |
 -----------------
         │ HTTP/AJAX
         │
 -----------------
│   BACKEND       │
│   (Server)      │
│                 │
│ - Node.js       │
│ - Express       │
│ - API Routes    │
 -----------------
         │
 -----------------
│   DONNEES       │
│   (Storage)     │
│ - data          │
│ - JSON Files    │
│ - User Data     │
│ - Menus         │
 -----------------
```

## L'équipe

Ce projet a été réalisé par une équipe de (5 - 1) élèves :

### **KEPSEU** - Gestionnaire Réservations & Livraison

### **MVOGO** - Gestionnaire du Menu

###  **SIMO** Exclu du Groupe! n'a pas travaillé.

### **WOLASSE** - Designer UI/UX

### **E.M.B.K.** - Chef de Groupe

## Informations Académiques

### Contexte

**Projet** : Système de gestion de restaurant (Délices Exotiques) 
**Type** : Projet d'informatique    
**Année** : 2025/2026  
**Durée** : 6 semaines  

### Crédits

- **Equipe de développement** :KEPSEU, MVOGO, SIMO(n'a pas participé), WOLASSE, E.M.B.K.
- **Icones** : Feather Icons
- **Framework CSS** : Tailwind CSS
- **Photos** : AI generated

### Licence

Ce projet est un **projet académique** réalisé dans un cadre pédagogique.  

---


**Délices Exotiques** - *Un voyage culinaire à travers l'Afrique et le monde*