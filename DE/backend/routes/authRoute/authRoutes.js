const express = require('express');
const router = express.Router();
const userService = require('./userService');
const { requireAuth } = require('../authRoute/authMiddleware');

// ============= ROUTES D'AUTHENTIFICATION =============

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Les mots de passe ne correspondent pas'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Le mot de passe doit contenir au moins 8 caractères'
            });
        }

        const newUser = await userService.createUser({
            firstName,
            lastName,
            email,
            phone,
            password
        });

        req.session.userId = newUser.id;
        req.session.userEmail = newUser.email;

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            user: newUser
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Erreur lors de l\'inscription'
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        const result = await userService.authenticateUser(email, password);

        if (!result.success) {
            return res.status(401).json(result);
        }

        req.session.userId = result.user.id;
        req.session.userEmail = result.user.email;

        res.json({
            success: true,
            message: 'Connexion réussie',
            user: result.user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion'
        });
    }
});

router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la déconnexion'
                });
            }
            res.clearCookie('connect.sid');
            res.json({
                success: true,
                message: 'Déconnexion réussie'
            });
        });
    } else {
        res.json({
            success: true,
            message: 'Aucune session active'
        });
    }
});

router.get('/check-session', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            authenticated: true,
            userId: req.session.userId,
            email: req.session.userEmail
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await userService.getUserInfo(req.session.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des informations'
        });
    }
});

router.put('/update-profile', requireAuth, async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        
        const updatedUser = await userService.updateUserInfo(req.session.userId, {
            firstName,
            lastName,
            phone
        });

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
});

// ============= ROUTES DES DONNEES UTILISATEUR =============

// Obtenir toutes les données utilisateur
router.get('/user-data', requireAuth, async (req, res) => {
    try {
        const userData = await userService.getUserData(req.session.userId);
        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des données'
        });
    }
});

// ============= ROUTES DES COMMANDES =============

// Obtenir toutes les commandes
router.get('/orders', requireAuth, async (req, res) => {
    try {
        const orders = await userService.getUserOrders(req.session.userId);
        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des commandes'
        });
    }
});

// Créer une nouvelle commande
router.post('/orders', requireAuth, async (req, res) => {
    try {
        const { items, total, deliveryAddress, estimatedDelivery } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'La commande doit contenir au moins un article'
            });
        }

        if (!total || total <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Le montant total est invalide'
            });
        }

        const newOrder = await userService.addOrder(req.session.userId, {
            items,
            total,
            deliveryAddress,
            estimatedDelivery
        });

        res.status(201).json({
            success: true,
            message: 'Commande créée avec succès',
            order: newOrder
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la commande'
        });
    }
});

// Mettre à jour le statut d'une commande
router.put('/orders/:orderId/status', requireAuth, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const allowedStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const updatedOrder = await userService.updateOrderStatus(req.session.userId, orderId, status);

        res.json({
            success: true,
            message: 'Statut mis à jour',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour'
        });
    }
});

// ============= ROUTES DES RESERVATIONS =============

// Obtenir toutes les réservations
router.get('/reservations', requireAuth, async (req, res) => {
    try {
        const reservations = await userService.getUserReservations(req.session.userId);
        res.json({
            success: true,
            reservations
        });
    } catch (error) {
        console.error('Get reservations error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des réservations'
        });
    }
});

// Créer une nouvelle réservation
router.post('/reservations', requireAuth, async (req, res) => {
    try {
        const { date, time, guests, specialRequests } = req.body;

        if (!date || !time || !guests) {
            return res.status(400).json({
                success: false,
                message: 'Date, heure et nombre de personnes requis'
            });
        }

        const newReservation = await userService.addReservation(req.session.userId, {
            date,
            time,
            guests,
            specialRequests
        });

        res.status(201).json({
            success: true,
            message: 'Réservation créée avec succès',
            reservation: newReservation
        });
    } catch (error) {
        console.error('Create reservation error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la réservation'
        });
    }
});

// Modifier une réservation
router.put('/reservations/:reservationId', requireAuth, async (req, res) => {
    try {
        const { reservationId } = req.params;
        const updates = req.body;

        const updatedReservation = await userService.updateReservation(
            req.session.userId,
            reservationId,
            updates
        );

        res.json({
            success: true,
            message: 'Réservation mise à jour',
            reservation: updatedReservation
        });
    } catch (error) {
        console.error('Update reservation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour'
        });
    }
});

// Annuler une réservation
router.delete('/reservations/:reservationId', requireAuth, async (req, res) => {
    try {
        const { reservationId } = req.params;

        const cancelledReservation = await userService.cancelReservation(
            req.session.userId,
            reservationId
        );

        res.json({
            success: true,
            message: 'Réservation annulée',
            reservation: cancelledReservation
        });
    } catch (error) {
        console.error('Cancel reservation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de l\'annulation'
        });
    }
});

// ============= ROUTES DES EVENEMENTS =============

// Obtenir tous les événements
router.get('/events', requireAuth, async (req, res) => {
    try {
        const events = await userService.getUserEvents(req.session.userId);
        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des événements'
        });
    }
});

// Créer une demande d'événement
router.post('/events', requireAuth, async (req, res) => {
    try {
        const eventData = req.body;

        if (!eventData.eventType || !eventData.name || !eventData.email || 
            !eventData.phone || !eventData.date || !eventData.guests || 
            !eventData.description) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        const newEvent = await userService.addEventRequest(req.session.userId, eventData);

        res.status(201).json({
            success: true,
            message: 'Demande d\'événement envoyée avec succès',
            event: newEvent
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'événement'
        });
    }
});

// Mettre à jour le statut d'un événement
router.put('/events/:eventId/status', requireAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { status } = req.body;

        const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const updatedEvent = await userService.updateEventStatus(
            req.session.userId,
            eventId,
            status
        );

        res.json({
            success: true,
            message: 'Statut mis à jour',
            event: updatedEvent
        });
    } catch (error) {
        console.error('Update event status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour'
        });
    }
});

// ============= ROUTES DES FAVORIS =============

// Obtenir tous les favoris
router.get('/favorites', requireAuth, async (req, res) => {
    try {
        const favorites = await userService.getUserFavorites(req.session.userId);
        res.json({
            success: true,
            favorites
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des favoris'
        });
    }
});

// Ajouter un favori
router.post('/favorites', requireAuth, async (req, res) => {
    try {
        const { name, category, price, image } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({
                success: false,
                message: 'Nom, catégorie et prix requis'
            });
        }

        const newFavorite = await userService.addFavorite(req.session.userId, {
            name,
            category,
            price,
            image
        });

        res.status(201).json({
            success: true,
            message: 'Favori ajouté',
            favorite: newFavorite
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de l\'ajout'
        });
    }
});

// Supprimer un favori
router.delete('/favorites/:favoriteId', requireAuth, async (req, res) => {
    try {
        const { favoriteId } = req.params;

        await userService.removeFavorite(req.session.userId, favoriteId);

        res.json({
            success: true,
            message: 'Favori supprimé'
        });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression'
        });
    }
});

// ============= ROUTES DES ACTIVITES =============

// Obtenir toutes les activités
router.get('/activities', requireAuth, async (req, res) => {
    try {
        const activities = await userService.getUserActivities(req.session.userId);
        res.json({
            success: true,
            activities
        });
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des activités'
        });
    }
});

// ============= SUPPRESSION DE COMPTE =============

router.delete('/delete-account', requireAuth, async (req, res) => {
    try {
        const { password, reason, otherReason } = req.body;
        const userId = req.session.userId;

        // Vérifier que le mot de passe est fourni
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Le mot de passe est requis pour supprimer votre compte'
            });
        }

        // Vérifier que la raison est fournie
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez indiquer la raison de la suppression'
            });
        }

        // Récupérer l'utilisateur
        const user = await userService.getUserInfo(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await userService.verifyPassword(userId, password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mot de passe incorrect'
            });
        }

        // Préparer les données de suppression
        const deletionData = {
            reason: reason,
            otherReason: reason === 'other' ? otherReason : null,
            deletedAt: new Date().toISOString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`
        };

        // Logger la suppression
        console.log('Account deletion requested:', {
            userId: userId,
            email: user.email,
            reason: reason,
            otherReason: otherReason,
            timestamp: deletionData.deletedAt
        });

        // Supprimer le compte
        await userService.deleteUser(userId);

        // Détruire la session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
        });

        res.json({
            success: true,
            message: 'Votre compte a été supprimé avec succès'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la suppression du compte'
        });
    }
});

// ============= ROUTE DE SANTE =============

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API fonctionnelle',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
