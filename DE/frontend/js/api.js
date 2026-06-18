const API_CONFIG = {
    BASE_URL: '', //http://localhost:3000,
    ENDPOINTS: {
        // Auth
        SIGNUP: '/api/auth/signup',
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        CHECK_SESSION: '/api/auth/check-session',
        GET_ME: '/api/auth/me',
        UPDATE_PROFILE: '/api/auth/update-profile',
        USER_DATA: '/api/auth/user-data',
        DELETE_ACCOUNT: '/api/auth/delete-account',
        
        // Orders
        ORDERS: '/api/auth/orders',
        ORDER_STATUS: (orderId) => `/api/auth/orders/${orderId}/status`,
        
        // Reservations
        RESERVATIONS: '/api/auth/reservations',
        RESERVATION: (id) => `/api/auth/reservations/${id}`,
        
        // Events
        EVENTS: '/api/auth/events',
        EVENT_STATUS: (eventId) => `/api/auth/events/${eventId}/status`,
        
        // Favorites
        FAVORITES: '/api/auth/favorites',
        FAVORITE: (id) => `/api/auth/favorites/${id}`,
        
        // Activities
        ACTIVITIES: '/api/auth/activities',
        
        // Menus (public)
        MENUS: '/api/menus',
        MENUS_BY_CATEGORY: (category) => `/api/menus/category/${category}`,
        MENU: (id) => `/api/menus/${id}`,
        
        // Admin
        ADMIN_STATS: '/api/admin/stats',
        ADMIN_MENUS: '/api/admin/menus',
        ADMIN_MENU: (id) => `/api/admin/menus/${id}`,
        ADMIN_MENU_TOGGLE: (id) => `/api/admin/menus/${id}/toggle`,
        ADMIN_RESERVATIONS: '/api/admin/reservations',
        ADMIN_RESERVATIONS_PENDING: '/api/admin/reservations/pending',
        ADMIN_RESERVATION: (userId, resId) => `/api/admin/reservations/${userId}/${resId}`,
        ADMIN_ORDERS: '/api/admin/orders',
        ADMIN_ORDERS_PENDING: '/api/admin/orders/pending',
        ADMIN_ORDER: (userId, orderId) => `/api/admin/orders/${userId}/${orderId}`,
        ADMIN_EVENTS: '/api/admin/events',
        ADMIN_EVENTS_PENDING: '/api/admin/events/pending',
        ADMIN_EVENT: (userId, eventId) => `/api/admin/events/${userId}/${eventId}`,
        ADMIN_ACTIVITIES: '/api/admin/activities',
        ADMIN_USERS: '/api/admin/users',
        ADMIN_USER: (userId) => `/api/admin/users/${userId}`,
        ADMIN_USER_MESSAGE: (userId) => `/api/admin/users/${userId}/message`,

        // Reviews 
        REVIEWS: '/api/reviews',
        REVIEWS_STATS: '/api/reviews/stats',
        REVIEW_LIKE: (reviewId) => `/api/reviews/${reviewId}/like`,
        REVIEWS_CAN_REVIEW: '/api/reviews/can-review',
        ADMIN_REVIEW_RESPOND: (reviewId) => `/api/admin/reviews/${reviewId}/respond`,
        ADMIN_REVIEW_DELETE: (reviewId) => `/api/admin/reviews/${reviewId}`,

        // Health
        HEALTH: '/api/health'
    }
};

// Helper pour faire des requêtes API
class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include'
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la requête');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ============= METHODES D'AUTHENTIFICATION =============
    
    async signup(userData) {
        return this.request(API_CONFIG.ENDPOINTS.SIGNUP, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        return this.request(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async logout() {
        return this.request(API_CONFIG.ENDPOINTS.LOGOUT, {
            method: 'POST'
        });
    }

    async deleteAccount(credentials){
        return this.request(API_CONFIG.DELETE_ACCOUNT, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async checkSession() {
        return this.request(API_CONFIG.ENDPOINTS.CHECK_SESSION);
    }

    async getMe() {
        return this.request(API_CONFIG.ENDPOINTS.GET_ME);
    }

    async updateProfile(profileData) {
        return this.request(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async getUserData() {
        return this.request(API_CONFIG.ENDPOINTS.USER_DATA);
    }

    // ============= METHODES DES COMMANDES =============
    
    async getOrders() {
        return this.request(API_CONFIG.ENDPOINTS.ORDERS);
    }

    async createOrder(orderData) {
        return this.request(API_CONFIG.ENDPOINTS.ORDERS, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrderStatus(orderId, status) {
        return this.request(API_CONFIG.ENDPOINTS.ORDER_STATUS(orderId), {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // ============= METHODES DES RESERVATIONS =============
    
    async getReservations() {
        return this.request(API_CONFIG.ENDPOINTS.RESERVATIONS);
    }

    async createReservation(reservationData) {
        return this.request(API_CONFIG.ENDPOINTS.RESERVATIONS, {
            method: 'POST',
            body: JSON.stringify(reservationData)
        });
    }

    async updateReservation(reservationId, updates) {
        return this.request(API_CONFIG.ENDPOINTS.RESERVATION(reservationId), {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async cancelReservation(reservationId) {
        return this.request(API_CONFIG.ENDPOINTS.RESERVATION(reservationId), {
            method: 'DELETE'
        });
    }

    // ============= METHODES DES EVENEMENTS =============
    
    async getEvents() {
        return this.request(API_CONFIG.ENDPOINTS.EVENTS);
    }

    async createEvent(eventData) {
        return this.request(API_CONFIG.ENDPOINTS.EVENTS, {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    async updateEventStatus(eventId, status) {
        return this.request(API_CONFIG.ENDPOINTS.EVENT_STATUS(eventId), {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // ============= METHODES DES FAVORIS =============
    
    async getFavorites() {
        return this.request(API_CONFIG.ENDPOINTS.FAVORITES);
    }

    async addFavorite(itemData) {
        return this.request(API_CONFIG.ENDPOINTS.FAVORITES, {
            method: 'POST',
            body: JSON.stringify(itemData)
        });
    }

    async removeFavorite(favoriteId) {
        return this.request(API_CONFIG.ENDPOINTS.FAVORITE(favoriteId), {
            method: 'DELETE'
        });
    }

    // ============= METHODES DES ACTIVITES =============
    
    async getActivities() {
        return this.request(API_CONFIG.ENDPOINTS.ACTIVITIES);
    }

    // ============= METHODES DES MENUS (PUBLIC) =============
    
    async getMenus() {
        return this.request(API_CONFIG.ENDPOINTS.MENUS);
    }

    async getMenusByCategory(category) {
        return this.request(API_CONFIG.ENDPOINTS.MENUS_BY_CATEGORY(category));
    }

    async getMenu(menuId) {
        return this.request(API_CONFIG.ENDPOINTS.MENU(menuId));
    }

    // ============= METHODES ADMIN =============
    
    async getAdminStats() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_STATS);
    }

    // Menus Admin
    async getAdminMenus() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_MENUS);
    }

    async createAdminMenu(menuData) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_MENUS, {
            method: 'POST',
            body: JSON.stringify(menuData)
        });
    }

    async updateAdminMenu(menuId, menuData) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_MENU(menuId), {
            method: 'PUT',
            body: JSON.stringify(menuData)
        });
    }

    async deleteAdminMenu(menuId) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_MENU(menuId), {
            method: 'DELETE'
        });
    }

    async toggleMenuAvailability(menuId) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_MENU_TOGGLE(menuId), {
            method: 'PATCH'
        });
    }

    // Réservations Admin
    async getAdminReservations() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_RESERVATIONS);
    }

    async getPendingReservations() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_RESERVATIONS_PENDING);
    }

    async updateAdminReservation(userId, reservationId, data) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_RESERVATION(userId, reservationId), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Commandes Admin
    async getAdminOrders() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_ORDERS);
    }

    async getPendingOrders() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_ORDERS_PENDING);
    }

    async updateAdminOrder(userId, orderId, data) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_ORDER(userId, orderId), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Evénements Admin
    async getAdminEvents() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_EVENTS);
    }

    async getPendingEvents() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_EVENTS_PENDING);
    }

    async updateAdminEvent(userId, eventId, data) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_EVENT(userId, eventId), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Activités Admin
    async getAdminActivities(limit) {
        return this.request(`${API_CONFIG.ENDPOINTS.ADMIN_ACTIVITIES}?limit=${limit || 20}`);
    }

    // ============= METHODES DES AVIS =============

    async getReviews(page = 1, limit = 10) {
        return this.request(`${API_CONFIG.ENDPOINTS.REVIEWS}?page=${page}&limit=${limit}`);
    }

    async getReviewsStats() {
        return this.request(API_CONFIG.ENDPOINTS.REVIEWS_STATS);
    }

    async createReview(reviewData) {
        return this.request(API_CONFIG.ENDPOINTS.REVIEWS, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }

    async likeReview(reviewId) {
        return this.request(API_CONFIG.ENDPOINTS.REVIEW_LIKE(reviewId), {
            method: 'POST'
        });
    }

    async canUserReview() {
        return this.request(API_CONFIG.ENDPOINTS.REVIEWS_CAN_REVIEW);
    }

    async respondToReview(reviewId, response) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_REVIEW_RESPOND(reviewId), {
            method: 'POST',
            body: JSON.stringify({ response })
        });
    }

    async deleteReview(reviewId) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_REVIEW_DELETE(reviewId), {
            method: 'DELETE'
        });
    }

    // Utilisateurs Admin
    async getAdminUsers() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_USERS);
    }

    async getAdminUserDetails(userId) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_USER(userId));
    }

    async deleteAdminUser(userId, data) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_USER(userId), {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    }

    async sendMessageToUser(userId, data) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_USER_MESSAGE(userId), {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async checkHealth() {
        return this.request(API_CONFIG.ENDPOINTS.HEALTH);
    }
}

// Instance globale
const api = new ApiService();

// Gestionnaire d'authentification
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.updateUI();
    }

    async checkAuthStatus() {
        try {
            const response = await api.checkSession();
            if (response.authenticated) {
                const userResponse = await api.getMe();
                this.currentUser = userResponse.user;
                return true;
            }
            this.currentUser = null;
            return false;
        } catch (error) {
            console.error('Error checking auth:', error);
            this.currentUser = null;
            return false;
        }
    }

    async signup(userData) {
        try {
            const response = await api.signup(userData);
            this.currentUser = response.user;
            this.updateUI();
            return { success: true, user: response.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async login(credentials) {
        try {
            const response = await api.login(credentials);
            this.currentUser = response.user;
            this.updateUI();
            return { success: true, user: response.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async logout() {
        try {
            await api.logout();
            this.currentUser = null;
            this.updateUI();
            window.location.href = '/';
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    async deleteAccount(credentials){
        try{
            await api.deleteAccount(credentials);
            this.currentUser = null;
            this.updateUI();
            window.location.href = '/';
            return { success: true };
        }
        catch(error){
            return {success: false, message: error.message};
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getUser() {
        return this.currentUser;
    }

    updateUI() {
        this.updateNavigationUI();
    }

    updateNavigationUI() {
        const event = new CustomEvent('authStateChanged', {
            detail: {
                isAuthenticated: this.isAuthenticated(),
                user: this.currentUser
            }
        });
        document.dispatchEvent(event);
    }
}

// Instance globale
const authManager = new AuthManager();

// Exporter pour utilisation globale
window.API_CONFIG = API_CONFIG;
window.api = api;
window.authManager = authManager;