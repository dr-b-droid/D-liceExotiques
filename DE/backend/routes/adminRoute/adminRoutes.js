const express = require('express');
const router = express.Router();
const adminService = require('./adminService');
const adminAuth = require('./adminAuth');

// Middleware pour vérifier les permissions admin
function requireAdmin(req, res, next) {
    const adminToken = req.session?.adminToken;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!adminToken) {
        return res.status(401).json({
            success: false,
            message: 'Authentification admin requise'
        });
    }

    const validation = adminAuth.validateAdminSession(adminToken, ipAddress);
    
    if (!validation.valid) {
        return res.status(401).json({
            success: false,
            message: validation.message
        });
    }

    req.adminSession = validation.session;
    next();
}

// ============= AUTHENTIFICATION ADMIN =============

// Vérifier un code admin
router.post('/auth/verify', async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.session?.userId || 'anonymous';
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Code requis'
            });
        }

        const result = adminAuth.verifyAdminCode(code, userId, ipAddress);

        if (result.success) {
            req.session.adminToken = result.token;
            req.session.adminRole = result.role;
            
            res.json({
                success: true,
                message: 'Authentification réussie',
                role: result.role
            });
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        console.error('Admin verify error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification'
        });
    }
});

// Vérifier le statut de la session admin
router.get('/auth/status', async (req, res) => {
    try {
        const adminToken = req.session?.adminToken;
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (!adminToken) {
            return res.json({
                authenticated: false
            });
        }

        const validation = adminAuth.validateAdminSession(adminToken, ipAddress);

        if (validation.valid) {
            res.json({
                authenticated: true,
                role: validation.session.role
            });
        } else {
            delete req.session.adminToken;
            delete req.session.adminRole;
            
            res.json({
                authenticated: false
            });
        }
    } catch (error) {
        console.error('Admin status error:', error);
        res.status(500).json({
            authenticated: false
        });
    }
});

// Déconnexion admin
router.post('/auth/logout', async (req, res) => {
    try {
        const adminToken = req.session?.adminToken;

        if (adminToken) {
            adminAuth.logout(adminToken);
        }

        delete req.session.adminToken;
        delete req.session.adminRole;

        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error('Admin logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la déconnexion'
        });
    }
});

// ============= STATISTIQUES =============

router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const stats = await adminService.getAdminStats();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// ============= RESERVATIONS =============

router.get('/reservations', requireAdmin, async (req, res) => {
    try {
        const reservations = await adminService.getAllReservations();
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

router.get('/reservations/pending', requireAdmin, async (req, res) => {
    try {
        const reservations = await adminService.getPendingReservations();
        res.json({
            success: true,
            reservations
        });
    } catch (error) {
        console.error('Get pending reservations error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des réservations'
        });
    }
});

router.put('/reservations/:userId/:reservationId', requireAdmin, async (req, res) => {
    try {
        const { userId, reservationId } = req.params;
        const { status, adminResponse } = req.body;

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const updatedReservation = await adminService.updateReservationStatus(
            userId,
            reservationId,
            status,
            adminResponse
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

// ============= COMMANDES =============

router.get('/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await adminService.getAllOrders();
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

router.get('/orders/pending', requireAdmin, async (req, res) => {
    try {
        const orders = await adminService.getPendingOrders();
        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get pending orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des commandes'
        });
    }
});

router.put('/orders/:userId/:orderId', requireAdmin, async (req, res) => {
    try {
        const { userId, orderId } = req.params;
        const { status, adminNotes } = req.body;

        const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const updatedOrder = await adminService.updateOrderStatusAdmin(
            userId,
            orderId,
            status,
            adminNotes
        );

        res.json({
            success: true,
            message: 'Commande mise à jour',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour'
        });
    }
});

// ============= EVENEMENTS =============

router.get('/events', requireAdmin, async (req, res) => {
    try {
        const events = await adminService.getAllEvents();
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

router.get('/events/pending', requireAdmin, async (req, res) => {
    try {
        const events = await adminService.getPendingEvents();
        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Get pending events error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des événements'
        });
    }
});

router.put('/events/:userId/:eventId', requireAdmin, async (req, res) => {
    try {
        const { userId, eventId } = req.params;
        const { status, adminResponse } = req.body;

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const updatedEvent = await adminService.updateEventStatus(
            userId,
            eventId,
            status,
            adminResponse
        );

        res.json({
            success: true,
            message: 'Evénement mis à jour',
            event: updatedEvent
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour'
        });
    }
});

// ============= ACTIVITES =============

router.get('/activities', requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const activities = await adminService.getRecentActivities(limit);
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

// ============= GESTION DES UTILISATEURS =============

router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await adminService.getAllUsersAdmin();
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs'
        });
    }
});

router.get('/users/:userId', requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const userDetails = await adminService.getUserDetailsAdmin(userId);
        res.json({
            success: true,
            userDetails
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des détails'
        });
    }
});

router.delete('/users/:userId', requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Une raison est requise pour la suppression'
            });
        }

        await adminService.deleteUserAdmin(userId, reason);
        res.json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la suppression'
        });
    }
});

router.post('/users/:userId/message', requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { subject, message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Le message est requis'
            });
        }

        await adminService.sendMessageToUser(userId, { subject, message });
        res.json({
            success: true,
            message: 'Message envoyé avec succès'
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de l\'envoi du message'
        });
    }
});

module.exports = router;