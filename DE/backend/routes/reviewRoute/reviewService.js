const fs = require('fs').promises;
const path = require('path');

const REVIEWS_FILE = path.join(__dirname, '../../data/admin/reviews.json');

class ReviewService {
    /**
     * Initialiser le fichier des avis s'il n'existe pas
     */
    static async initReviewsFile() {
        try {
            await fs.access(REVIEWS_FILE);
        } catch {
            const initialData = {
                reviews: [],
                stats: {
                    total: 0,
                    average: 0,
                    distribution: {
                        5: 0,
                        4: 0,
                        3: 0,
                        2: 0,
                        1: 0
                    }
                }
            };
            await fs.mkdir(path.dirname(REVIEWS_FILE), { recursive: true });
            await fs.writeFile(REVIEWS_FILE, JSON.stringify(initialData, null, 2));
        }
    }

    /**
     * Lire tous les avis
     */
    static async getAllReviews() {
        await this.initReviewsFile();
        const data = await fs.readFile(REVIEWS_FILE, 'utf8');
        return JSON.parse(data);
    }

    /**
     * Ajouter un nouvel avis
     */
    static async addReview(reviewData) {
        const data = await this.getAllReviews();
        
        const newReview = {
            id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: reviewData.userId,
            userName: reviewData.userName,
            userEmail: reviewData.userEmail,
            rating: reviewData.rating,
            comment: reviewData.comment,
            date: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            verified: true, // Vérifié car utilisateur connecté
            response: null // Réponse de l'admin
        };

        data.reviews.unshift(newReview); // Ajouter au début
        
        // Recalculer les statistiques
        this.updateStats(data);
        
        await fs.writeFile(REVIEWS_FILE, JSON.stringify(data, null, 2));
        return newReview;
    }

    /**
     * Mettre à jour les statistiques
     */
    static updateStats(data) {
        const reviews = data.reviews;
        
        if (reviews.length === 0) {
            data.stats = {
                total: 0,
                average: 0,
                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };
            return;
        }

        // Calculer la moyenne
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / reviews.length;

        // Calculer la distribution
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            distribution[r.rating]++;
        });

        data.stats = {
            total: reviews.length,
            average: Math.round(average * 10) / 10,
            distribution
        };
    }

    /**
     * Obtenir les statistiques
     */
    static async getStats() {
        const data = await this.getAllReviews();
        return data.stats;
    }

    /**
     * Liker un avis
     */
    static async likeReview(reviewId, userId) {
        const data = await this.getAllReviews();
        const review = data.reviews.find(r => r.id === reviewId);
        
        if (!review) {
            throw new Error('Avis non trouvé');
        }

        if (review.likedBy.includes(userId)) {
            // Unlike
            review.likedBy = review.likedBy.filter(id => id !== userId);
            review.likes--;
        } else {
            // Like
            review.likedBy.push(userId);
            review.likes++;
        }

        await fs.writeFile(REVIEWS_FILE, JSON.stringify(data, null, 2));
        return review;
    }

    /**
     * Vérifier si un utilisateur peut laisser un avis
     */
    static async canUserReview(userId) {
        const data = await this.getAllReviews();
        // Vérifier si l'utilisateur a déjà laissé un avis
        const userReviews = data.reviews.filter(r => r.userId === userId);
        
        // L'utilisateur PEUT noter si il n'a PAS d'avis (length === 0)
        return userReviews.length === 0;
    }

    /**
     * Obtenir les avis avec pagination
     */
    static async getReviewsPaginated(page = 1, limit = 10) {
        const data = await this.getAllReviews();
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
            reviews: data.reviews.slice(startIndex, endIndex),
            stats: data.stats,
            pagination: {
                current: page,
                total: Math.ceil(data.reviews.length / limit),
                hasNext: endIndex < data.reviews.length,
                hasPrev: page > 1
            }
        };
    }

    /**
     * Ajouter une réponse admin à un avis
     */
    static async addAdminResponse(reviewId, response, adminName) {
        const data = await this.getAllReviews();
        const review = data.reviews.find(r => r.id === reviewId);
        
        if (!review) {
            throw new Error('Avis non trouvé');
        }

        review.response = {
            text: response,
            author: adminName,
            date: new Date().toISOString()
        };

        await fs.writeFile(REVIEWS_FILE, JSON.stringify(data, null, 2));
        return review;
    }

    /**
     * Supprimer un avis (admin)
     */
    static async deleteReview(reviewId) {
        const data = await this.getAllReviews();
        data.reviews = data.reviews.filter(r => r.id !== reviewId);
        
        this.updateStats(data);
        
        await fs.writeFile(REVIEWS_FILE, JSON.stringify(data, null, 2));
        return true;
    }
}

module.exports = ReviewService;