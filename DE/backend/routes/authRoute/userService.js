const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_DIR = path.join(__dirname,'../..', 'data', 'admin', 'users');
const USERS_JSON = path.join(__dirname, '../..', 'data', 'admin', 'users.json');

class UserService {
    constructor() {
        this.initializeData();
    }

    async initializeData() {
        try {
            await fs.access(USERS_JSON);
        } catch (error) {
            await fs.writeFile(USERS_JSON, JSON.stringify({ users: [] }, null, 2));
        }
        try {
            await fs.access(USERS_DIR);
        } catch (error) {
            await fs.mkdir(USERS_DIR, { recursive: true });
        }
    }

    async getAllUsers() {
        try {
            const data = await fs.readFile(USERS_JSON, 'utf8');
            return JSON.parse(data).users;
        } catch (error) {
            console.error('Error reading users:', error);
            return [];
        }
    }

    async getUserByEmail(email) {
        const users = await this.getAllUsers();
        return users.find(user => user.email === email);
    }

    async getUserByUsername(username) {
        const users = await this.getAllUsers();
        return users.find(user => user.username === username);
    }

    async createUser(userData) {
        try {
            const existingUserByEmail = await this.getUserByEmail(userData.email);
            if (existingUserByEmail) {
                throw new Error('Un utilisateur avec cet email existe déjà');
            }

            const username = userData.email.split('@')[0] + '_' + Date.now();
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const newUser = {
                id: Date.now().toString(),
                username: username,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                name: `${userData.firstName} ${userData.lastName}`,
                phone: userData.phone || '',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                emailVerified: false,
                loyaltyPoints: 0
            };

            // Créer le dossier utilisateur avec structure complète
            const userDir = path.join(USERS_DIR, newUser.id);
            await fs.mkdir(userDir, { recursive: true });

            // Créer le fichier infos.json
            const userInfo = {
                ...newUser,
                password: hashedPassword
            };
            await fs.writeFile(
                path.join(userDir, 'infos.json'),
                JSON.stringify(userInfo, null, 2)
            );

            // Créer le fichier orders.json
            await fs.writeFile(
                path.join(userDir, 'orders.json'),
                JSON.stringify({ orders: [] }, null, 2)
            );

            // Créer le fichier reservations.json
            await fs.writeFile(
                path.join(userDir, 'reservations.json'),
                JSON.stringify({ reservations: [] }, null, 2)
            );

            // Créer le fichier events.json
            await fs.writeFile(
                path.join(userDir, 'events.json'),
                JSON.stringify({ events: [] }, null, 2)
            );

            // Créer le fichier favorites.json
            await fs.writeFile(
                path.join(userDir, 'favorites.json'),
                JSON.stringify({ favorites: [] }, null, 2)
            );

            // Créer le fichier activities.json
            await fs.writeFile(
                path.join(userDir, 'activities.json'),
                JSON.stringify({ activities: [] }, null, 2)
            );

            // Ajouter l'utilisateur à users.json
            const users = await this.getAllUsers();
            users.push(newUser);
            await fs.writeFile(USERS_JSON, JSON.stringify({ users }, null, 2));

            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async authenticateUser(email, password) {
        try {
            const user = await this.getUserByEmail(email);
            if (!user) {
                return { success: false, message: 'Email ou mot de passe incorrect' };
            }

            const userDir = path.join(USERS_DIR, user.id);
            const userInfoPath = path.join(userDir, 'infos.json');
            
            const userInfoData = await fs.readFile(userInfoPath, 'utf8');
            const userInfo = JSON.parse(userInfoData);

            const isPasswordValid = await bcrypt.compare(password, userInfo.password);
            
            if (!isPasswordValid) {
                return { success: false, message: 'Email ou mot de passe incorrect' };
            }

            // Mettre à jour le dernier login
            userInfo.lastLogin = new Date().toISOString();
            await fs.writeFile(userInfoPath, JSON.stringify(userInfo, null, 2));

            const users = await this.getAllUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex].lastLogin = userInfo.lastLogin;
                await fs.writeFile(USERS_JSON, JSON.stringify({ users }, null, 2));
            }

            const { password: _, ...userWithoutPassword } = userInfo;
            return { success: true, user: userWithoutPassword };
        } catch (error) {
            console.error('Error authenticating user:', error);
            return { success: false, message: 'Erreur lors de l\'authentification' };
        }
    }

    async getUserInfo(userId) {
        try {
            const userDir = path.join(USERS_DIR, userId);
            const userInfoPath = path.join(userDir, 'infos.json');
            
            const userInfoData = await fs.readFile(userInfoPath, 'utf8');
            const userInfo = JSON.parse(userInfoData);
            
            const { password: _, ...userWithoutPassword } = userInfo;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    }

    async updateUserInfo(userId, updates) {
        try {
            const userDir = path.join(USERS_DIR, userId);
            const userInfoPath = path.join(userDir, 'infos.json');
            
            const userInfoData = await fs.readFile(userInfoPath, 'utf8');
            const userInfo = JSON.parse(userInfoData);

            const allowedFields = ['firstName', 'lastName', 'phone', 'loyaltyPoints'];
            allowedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    userInfo[field] = updates[field];
                }
            });

            // Mettre à jour le nom complet
            if (updates.firstName || updates.lastName) {
                userInfo.name = `${userInfo.firstName} ${userInfo.lastName}`;
            }

            await fs.writeFile(userInfoPath, JSON.stringify(userInfo, null, 2));

            const users = await this.getAllUsers();
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                allowedFields.forEach(field => {
                    if (updates[field] !== undefined) {
                        users[userIndex][field] = updates[field];
                    }
                });
                if (updates.firstName || updates.lastName) {
                    users[userIndex].name = userInfo.name;
                }
                await fs.writeFile(USERS_JSON, JSON.stringify({ users }, null, 2));
            }

            const { password: _, ...userWithoutPassword } = userInfo;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error updating user info:', error);
            throw error;
        }
    }

    // ============= GESTION DES COMMANDES =============
    async getUserOrders(userId) {
        try {
            const ordersPath = path.join(USERS_DIR, userId, 'orders.json');
            const data = await fs.readFile(ordersPath, 'utf8');
            return JSON.parse(data).orders;
        } catch (error) {
            console.error('Error getting user orders:', error);
            return [];
        }
    }

        async addOrder(userId, orderData) {
                try {
                    const orders = await this.getUserOrders(userId);
                    
                    const newOrder = {
                        id: `ORD-${Date.now()}`,
                        date: new Date().toISOString(),
                        status: 'pending',
                        total: orderData.total,
                        items: orderData.items,
                        deliveryAddress: orderData.deliveryAddress || null,
                        estimatedDelivery: orderData.estimatedDelivery || null,
                        createdAt: new Date().toISOString()
                    };
        
                    orders.push(newOrder);
                    
                    const ordersPath = path.join(USERS_DIR, userId, 'orders.json');
                    await fs.writeFile(ordersPath, JSON.stringify({ orders }, null, 2));
        
                    // Ajouter à l'activité
                    await this.addActivity(userId, {
                        type: 'order_placed',
                        title: 'Nouvelle commande',
                        description: `Commande ${newOrder.id} - ${newOrder.total.toFixed(2)}  fcfa`,
                        date: new Date().toISOString(),
                        icon: 'shopping-bag',
                        color: 'gold',
                        relatedId: newOrder.id
                    });
        
                    return newOrder;
                } catch (error) {
                    console.error('Error adding order:', error);
                    throw error;
                }
            }

    async updateOrderStatus(userId, orderId, status) {
        try {
            const orders = await this.getUserOrders(userId);
            const orderIndex = orders.findIndex(o => o.id === orderId);
            
            if (orderIndex === -1) {
                throw new Error('Commande non trouvée');
            }

            orders[orderIndex].status = status;
            orders[orderIndex].updatedAt = new Date().toISOString();

            const ordersPath = path.join(USERS_DIR, userId, 'orders.json');
            await fs.writeFile(ordersPath, JSON.stringify({ orders }, null, 2));

            return orders[orderIndex];
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // ============= GESTION DES RESERVATIONS =============
    async getUserReservations(userId) {
        try {
            const reservationsPath = path.join(USERS_DIR, userId, 'reservations.json');
            const data = await fs.readFile(reservationsPath, 'utf8');
            return JSON.parse(data).reservations;
        } catch (error) {
            console.error('Error getting user reservations:', error);
            return [];
        }
    }

    async addReservation(userId, reservationData) {
        try {
            const reservations = await this.getUserReservations(userId);
            
            const newReservation = {
                id: `RES-${Date.now()}`,
                date: reservationData.date,
                time: reservationData.time,
                guests: reservationData.guests,
                status: 'confirmed',
                specialRequests: reservationData.specialRequests || '',
                createdAt: new Date().toISOString()
            };

            reservations.push(newReservation);
            
            const reservationsPath = path.join(USERS_DIR, userId, 'reservations.json');
            await fs.writeFile(reservationsPath, JSON.stringify({ reservations }, null, 2));

            // Ajouter à l'activité
            await this.addActivity(userId, {
                type: 'reservation_confirmed',
                title: 'Réservation confirmée',
                description: `Table pour ${reservationData.guests} - ${reservationData.date}, ${reservationData.time}`,
                date: new Date().toISOString(),
                icon: 'calendar',
                color: 'gold',
                relatedId: newReservation.id
            });

            return newReservation;
        } catch (error) {
            console.error('Error adding reservation:', error);
            throw error;
        }
    }

    async updateReservation(userId, reservationId, updates) {
        try {
            const reservations = await this.getUserReservations(userId);
            const resIndex = reservations.findIndex(r => r.id === reservationId);
            
            if (resIndex === -1) {
                throw new Error('Réservation non trouvée');
            }

            reservations[resIndex] = {
                ...reservations[resIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            const reservationsPath = path.join(USERS_DIR, userId, 'reservations.json');
            await fs.writeFile(reservationsPath, JSON.stringify({ reservations }, null, 2));

            return reservations[resIndex];
        } catch (error) {
            console.error('Error updating reservation:', error);
            throw error;
        }
    }

    async deleteReservation(userId, reservationId) {
        try {
            const reservations = await this.getUserReservations(userId);
            const filtered = reservations.filter(r => r.id !== reservationId);
            
            const reservationsPath = path.join(USERS_DIR, userId, 'reservations.json');
            await fs.writeFile(reservationsPath, JSON.stringify({ reservations: filtered }, null, 2));

            return true;
        } catch (error) {
            console.error('Error deleting reservation:', error);
            throw error;
        }
    }

    // ============= GESTION DES EVENEMENTS =============
    async getUserEvents(userId) {
        try {
            const eventsPath = path.join(USERS_DIR, userId, 'events.json');
            const data = await fs.readFile(eventsPath, 'utf8');
            return JSON.parse(data).events;
        } catch (error) {
            console.error('Error getting user events:', error);
            return [];
        }
    }

    async addEventRequest(userId, eventData) {
        try {
            const events = await this.getUserEvents(userId);
            
            const newEvent = {
                id: 'EVT-' + Date.now(),
                eventType: eventData.eventType,
                contactName: eventData.contactName,
                email: eventData.email,
                phone: eventData.phone,
                company: eventData.company || '',
                date: eventData.date,
                time: eventData.time || '',
                guests: eventData.guests,
                budget: eventData.budget || '',
                services: eventData.services || [],
                description: eventData.description,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            events.push(newEvent);
            
            const eventsPath = path.join(USERS_DIR, userId, 'events.json');
            await fs.writeFile(eventsPath, JSON.stringify({ events }, null, 2));

            // Ajouter à l'activité
            await this.addActivity(userId, {
                type: 'event_request',
                title: 'Demande d\'événement',
                description: `${eventData.eventType} - ${eventData.date}`,
                date: new Date().toISOString(),
                icon: 'star',
                color: 'africanred',
                relatedId: newEvent.id
            });

            return newEvent;
        } catch (error) {
            console.error('Error adding event request:', error);
            throw error;
        }
    }

    async updateEventStatus(userId, eventId, status) {
        try {
            const events = await this.getUserEvents(userId);
            const eventIndex = events.findIndex(e => e.id === eventId);
            
            if (eventIndex === -1) {
                throw new Error('Evénement non trouvé');
            }

            events[eventIndex].status = status;
            events[eventIndex].updatedAt = new Date().toISOString();

            const eventsPath = path.join(USERS_DIR, userId, 'events.json');
            await fs.writeFile(eventsPath, JSON.stringify({ events }, null, 2));

            return events[eventIndex];
        } catch (error) {
            console.error('Error updating event status:', error);
            throw error;
        }
    }

    // ============= GESTION DES FAVORIS =============
    async getUserFavorites(userId) {
        try {
            const favoritesPath = path.join(USERS_DIR, userId, 'favorites.json');
            const data = await fs.readFile(favoritesPath, 'utf8');
            return JSON.parse(data).favorites;
        } catch (error) {
            console.error('Error getting user favorites:', error);
            return [];
        }
    }

    async addFavorite(userId, itemData) {
        try {
            const favorites = await this.getUserFavorites(userId);
            
            // Vérifier si déjà en favori
            if (favorites.find(f => f.name === itemData.name)) {
                throw new Error('Ce plat est déjà dans vos favoris');
            }

            const newFavorite = {
                id: Date.now().toString(),
                name: itemData.name,
                category: itemData.category,
                price: itemData.price,
                image: itemData.image || '',
                addedAt: new Date().toISOString()
            };

            favorites.push(newFavorite);
            
            const favoritesPath = path.join(USERS_DIR, userId, 'favorites.json');
            await fs.writeFile(favoritesPath, JSON.stringify({ favorites }, null, 2));

            return newFavorite;
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    }

    async removeFavorite(userId, favoriteId) {
        try {
            const favorites = await this.getUserFavorites(userId);
            const filtered = favorites.filter(f => f.id !== favoriteId);
            
            const favoritesPath = path.join(USERS_DIR, userId, 'favorites.json');
            await fs.writeFile(favoritesPath, JSON.stringify({ favorites: filtered }, null, 2));

            return true;
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw error;
        }
    }

    // ============= GESTION DES ACTIVITES =============
    async getUserActivities(userId) {
        try {
            const activitiesPath = path.join(USERS_DIR, userId, 'activities.json');
            const data = await fs.readFile(activitiesPath, 'utf8');
            return JSON.parse(data).activities;
        } catch (error) {
            console.error('Error getting user activities:', error);
            return [];
        }
    }

    async addActivity(userId, activityData) {
        try {
            const activities = await this.getUserActivities(userId);
            
            const newActivity = {
                id: Date.now().toString(),
                ...activityData,
                timestamp: activityData.date || new Date().toISOString()
            };

            activities.unshift(newActivity); // Ajouter au début
            
            // Garder seulement les 50 dernières activités
            const limitedActivities = activities.slice(0, 50);
            
            const activitiesPath = path.join(USERS_DIR, userId, 'activities.json');
            await fs.writeFile(activitiesPath, JSON.stringify({ activities: limitedActivities }, null, 2));

            return newActivity;
        } catch (error) {
            console.error('Error adding activity:', error);
            throw error;
        }
    }

    // ============= GESTION DES POINTS DE FIDELITE =============
    async addLoyaltyPoints(userId, points) {
        try {
            const userInfo = await this.getUserInfo(userId);
            const currentPoints = userInfo.loyaltyPoints || 0;
            const newPoints = currentPoints + points;

            await this.updateUserInfo(userId, { loyaltyPoints: newPoints });

            return newPoints;
        } catch (error) {
            console.error('Error adding loyalty points:', error);
            throw error;
        }
    }

    // ============= OBTENIR TOUTES LES DONNEES UTILISATEUR =============
    async getUserData(userId) {
        try {
            const [userInfo, orders, reservations, events, favorites, activities] = await Promise.all([
                this.getUserInfo(userId),
                this.getUserOrders(userId),
                this.getUserReservations(userId),
                this.getUserEvents(userId),
                this.getUserFavorites(userId),
                this.getUserActivities(userId)
            ]);

            return {
                user: userInfo,
                orders,
                reservations,
                events,
                favorites,
                activities,
                stats: {
                    totalOrders: orders.length,
                    totalReservations: reservations.filter(r => r.status === 'confirmed').length,
                    totalEvents: events.length,
                    totalFavorites: favorites.length
                }
            };
        } catch (error) {
            console.error('Error getting user data:', error);
            throw error;
        }
    }

    // ============= SAUVEGARDER LES DONNEES UTILISATEUR =============
    /**
     * Sauvegarde les données complètes d'un utilisateur
     * Utilisé par adminService pour mettre à jour les données
     */
    async saveUserData(userId, userData) {
        try {
            const userDir = path.join(USERS_DIR, userId);
            
            // Sauvegarder les commandes si présentes
            if (userData.orders) {
                const ordersPath = path.join(userDir, 'orders.json');
                await fs.writeFile(ordersPath, JSON.stringify({ orders: userData.orders }, null, 2));
            }
            
            // Sauvegarder les réservations si présentes
            if (userData.reservations) {
                const reservationsPath = path.join(userDir, 'reservations.json');
                await fs.writeFile(reservationsPath, JSON.stringify({ reservations: userData.reservations }, null, 2));
            }
            
            // Sauvegarder les événements si présents
            if (userData.events) {
                const eventsPath = path.join(userDir, 'events.json');
                await fs.writeFile(eventsPath, JSON.stringify({ events: userData.events }, null, 2));
            }
            
            // Sauvegarder les favoris si présents
            if (userData.favorites) {
                const favoritesPath = path.join(userDir, 'favorites.json');
                await fs.writeFile(favoritesPath, JSON.stringify({ favorites: userData.favorites }, null, 2));
            }
            
            // Sauvegarder les activités si présentes
            if (userData.activities) {
                const activitiesPath = path.join(userDir, 'activities.json');
                await fs.writeFile(activitiesPath, JSON.stringify({ activities: userData.activities }, null, 2));
            }
            
            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const userDir = path.join(USERS_DIR, userId);
            await fs.rm(userDir, { recursive: true, force: true });

            const users = await this.getAllUsers();
            const filteredUsers = users.filter(u => u.id !== userId);
            await fs.writeFile(USERS_JSON, JSON.stringify({ users: filteredUsers }, null, 2));

            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}

module.exports = new UserService();