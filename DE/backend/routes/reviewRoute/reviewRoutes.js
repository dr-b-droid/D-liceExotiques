const express = require('express');
const router = express.Router();
const ReviewService = require('./reviewService');
const { requireAuth, attachUser } = require('../authRoute/authMiddleware');

/**
 * GET /api/reviews - Obtenir tous les avis avec pagination
 */
router.get('/reviews', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const data = await ReviewService.getReviewsPaginated(page, limit);
        
        res.json({
            success: true,
            ...data
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des avis'
        });
    }
});

/**
 * GET /api/reviews/stats - Obtenir les statistiques des avis
 */
router.get('/reviews/stats', async (req, res) => {
    try {
        const stats = await ReviewService.getStats();
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

/**
 * POST /api/reviews - Ajouter un nouvel avis (authentifié)
 */
router.post('/reviews', requireAuth, attachUser, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        // Vérifier que req.user existe
        if (!req.user || !req.user.userId) {
            console.error('User not attached to request:', req.session);
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non identifié. Veuillez vous reconnecter.'
            });
        }

        console.log('User submitting review:', req.user.userId, req.user.name);
        
        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Note invalide (1-5 étoiles requises)'
            });
        }

        if (!comment || comment.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Commentaire trop court (minimum 10 caractères)'
            });
        }

        if (comment.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Commentaire trop long (maximum 1000 caractères)'
            });
        }

        // Vérifier si l'utilisateur peut laisser un avis
        const canReview = await ReviewService.canUserReview(req.user.userId);
        console.log('Can user review?', canReview, 'for user:', req.user.userId);
        
        if (!canReview) {
            return res.status(429).json({
                success: false,
                message: 'Vous avez déjà laissé un avis.'
            });
        }

        // Créer l'avis
        const reviewData = {
            userId: req.user.userId,
            userName: req.user.name || 'Utilisateur',
            userEmail: req.user.email,
            rating: parseInt(rating),
            comment: comment.trim()
        };

        const newReview = await ReviewService.addReview(reviewData);
        console.log('Review created successfully:', newReview.id);

        res.status(201).json({
            success: true,
            message: 'Avis ajouté avec succès',
            review: newReview
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout de l\'avis'
        });
    }
});

/**
 * POST /api/reviews/:id/like - Liker/unliker un avis (authentifié)
 */
router.post('/reviews/:id/like', requireAuth, attachUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Vérifier que req.user existe
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non identifié. Veuillez vous reconnecter.'
            });
        }
        
        const userId = req.user.userId;

        const review = await ReviewService.likeReview(id, userId);

        res.json({
            success: true,
            message: 'Like mis à jour',
            review
        });
    } catch (error) {
        console.error('Error liking review:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors du like'
        });
    }
});

/**
 * POST /api/admin/reviews/:id/respond - Répondre à un avis (admin)
 */
router.post('/admin/reviews/:id/respond', requireAuth, attachUser, async (req, res) => {
    try {
        // Vérifier que req.user existe
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non identifié. Veuillez vous reconnecter.'
            });
        }

        // TODO: Vérifier que l'utilisateur est admin
        const { id } = req.params;
        const { response } = req.body;

        if (!response || response.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Réponse trop courte'
            });
        }

        const review = await ReviewService.addAdminResponse(
            id,
            response.trim(),
            req.user.name || 'Equipe Délices Exotiques'
        );

        res.json({
            success: true,
            message: 'Réponse ajoutée',
            review
        });
    } catch (error) {
        console.error('Error responding to review:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la réponse'
        });
    }
});

/**
 * DELETE /api/admin/reviews/:id - Supprimer un avis (admin)
 */
router.delete('/admin/reviews/:id', requireAuth, async (req, res) => {
    try {
        // TODO: Vérifier que l'utilisateur est admin
        const { id } = req.params;

        await ReviewService.deleteReview(id);

        res.json({
            success: true,
            message: 'Avis supprimé'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression'
        });
    }
});

/**
 * GET /api/reviews/can-review - Vérifier si l'utilisateur peut laisser un avis
 */
router.get('/reviews/can-review', requireAuth, attachUser, async (req, res) => {
    try {
        // Vérifier que req.user existe
        if (!req.user || !req.user.userId) {
            console.error('User not attached in can-review:', req.session);
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non identifié. Veuillez vous reconnecter.'
            });
        }

        const canReview = await ReviewService.canUserReview(req.user.userId);
        console.log('Can-review check:', req.user.userId, 'can review?', canReview);
        
        res.json({
            success: true,
            canReview
        });
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification'
        });
    }
});

module.exports = router;