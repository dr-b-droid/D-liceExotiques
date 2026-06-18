const userService = require('../authRoute/userService');

// ============= GESTION DES RESERVATIONS =============

async function getAllReservations() {
    const users = await userService.getAllUsers();
    const allReservations = [];

    for (const user of users) {
        const userData = await userService.getUserData(user.id);
        if (userData.reservations) {
            userData.reservations.forEach(res => {
                allReservations.push({
                    ...res,
                    userId: user.id,
                    userName: `${user.firstName} ${user.lastName}`,
                    userEmail: user.email,
                    userPhone: user.phone
                });
            });
        }
    }

    return allReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getPendingReservations() {
    const allReservations = await getAllReservations();
    return allReservations.filter(res => res.status === 'pending');
}

async function updateReservationStatus(userId, reservationId, status, adminResponse) {
    const userData = await userService.getUserData(userId);
    const reservation = userData.reservations.find(r => r.id === reservationId);

    if (!reservation) {
        throw new Error('Réservation non trouvée');
    }

    reservation.status = status;
    if (adminResponse) {
        reservation.adminResponse = adminResponse;
    }
    reservation.updatedAt = new Date().toISOString();

    // Mettre à jour les données utilisateur
    await userService.saveUserData(userId, userData);

    // Ajouter une activité
    await userService.addActivity(userId, {
        type: 'reservation_update',
        icon: 'calendar',
        description: `Réservation ${status === 'confirmed' ? 'confirmée' : 'annulée'} pour le ${new Date(reservation.date).toLocaleDateString('fr-FR')}`
    });

    return reservation;
}

// ============= GESTION DES COMMANDES =============

async function getAllOrders() {
    const users = await userService.getAllUsers();
    const allOrders = [];

    for (const user of users) {
        const userData = await userService.getUserData(user.id);
        if (userData.orders) {
            userData.orders.forEach(order => {
                allOrders.push({
                    ...order,
                    userId: user.id,
                    userName: `${user.firstName} ${user.lastName}`,
                    userEmail: user.email,
                    userPhone: user.phone
                });
            });
        }
    }

    return allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getPendingOrders() {
    const allOrders = await getAllOrders();
    return allOrders.filter(order => order.status === 'pending');
}

async function updateOrderStatusAdmin(userId, orderId, status, adminNotes) {
    const userData = await userService.getUserData(userId);
    const order = userData.orders.find(o => o.id === orderId);

    if (!order) {
        throw new Error('Commande non trouvée');
    }

    order.status = status;
    if (adminNotes) {
        order.adminNotes = adminNotes;
    }
    order.updatedAt = new Date().toISOString();

    // Mettre à jour les données utilisateur
    await userService.saveUserData(userId, userData);

    // Ajouter une activité
    const statusLabels = {
        pending: 'en attente',
        confirmed: 'confirmée',
        preparing: 'en préparation',
        delivering: 'en livraison',
        completed: 'livrée',
        cancelled: 'annulée'
    };

    await userService.addActivity(userId, {
        type: 'order_update',
        icon: 'shopping-bag',
        description: `Commande #${orderId.substring(0, 8)} ${statusLabels[status] || status}`
    });

    return order;
}

// ============= GESTION DES EVENEMENTS =============

async function getAllEvents() {
    const users = await userService.getAllUsers();
    const allEvents = [];

    for (const user of users) {
        const userData = await userService.getUserData(user.id);
        if (userData.events) {
            userData.events.forEach(event => {
                allEvents.push({
                    ...event,
                    userId: user.id,
                    userName: `${user.firstName} ${user.lastName}`,
                    userEmail: user.email,
                    userPhone: user.phone
                });
            });
        }
    }

    return allEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getPendingEvents() {
    const allEvents = await getAllEvents();
    return allEvents.filter(event => event.status === 'pending');
}

async function updateEventStatus(userId, eventId, status, adminResponse) {
    const userData = await userService.getUserData(userId);
    const event = userData.events.find(e => e.id === eventId);

    if (!event) {
        throw new Error('Evénement non trouvé');
    }

    event.status = status;
    if (adminResponse) {
        event.adminResponse = adminResponse;
    }
    event.updatedAt = new Date().toISOString();

    // Mettre à jour les données utilisateur
    await userService.saveUserData(userId, userData);

    // Ajouter une activité
    await userService.addActivity(userId, {
        type: 'event_update',
        icon: 'star',
        description: `Demande d'événement ${status === 'confirmed' ? 'confirmée' : 'refusée'}: ${event.eventType}`
    });

    return event;
}

// ============= GESTION DES UTILISATEURS =============

async function getAllUsersAdmin() {
    const users = await userService.getAllUsers();
    const usersWithData = [];

    for (const user of users) {
        const userData = await userService.getUserData(user.id);
        usersWithData.push({
            ...user,
            totalOrders: userData.orders?.length || 0,
            totalReservations: userData.reservations?.length || 0,
            totalEvents: userData.events?.length || 0,
            totalSpent: userData.orders
                ?.filter(o => o.status === 'completed')
                .reduce((sum, order) => sum + (order.total || 0), 0) || 0
        });
    }

    return usersWithData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getUserDetailsAdmin(userId) {
    const user = await userService.getUserInfo(userId);
    const userData = await userService.getUserData(userId);
    
    return {
        user,
        ...userData
    };
}

async function deleteUserAdmin(userId, reason) {
    // Ajouter une trace de la suppression
    const user = await userService.getUserInfo(userId);
    console.log(`User ${user.email} deleted by admin. Reason: ${reason}`);
    
    await userService.deleteUser(userId);
    return true;
}

async function sendMessageToUser(userId, messageData) {
    await userService.addActivity(userId, {
        type: 'admin_message',
        icon: 'message-circle',
        description: messageData.message,
        adminMessage: true,
        subject: messageData.subject || 'Message de l\'administration'
    });

    return true;
}

// ============= STATISTIQUES ADMIN =============

async function getAdminStats() {
    const users = await userService.getAllUsers();
    const allReservations = await getAllReservations();
    const allOrders = await getAllOrders();
    const allEvents = await getAllEvents();

    const totalRevenue = allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + (order.total || 0), 0);

    const avgOrderValue = allOrders.filter(o => o.status === 'completed').length > 0
        ? totalRevenue / allOrders.filter(o => o.status === 'completed').length
        : 0;

    return {
        totalUsers: users.length,
        newUsersThisMonth: users.filter(u => {
            const createdDate = new Date(u.createdAt);
            const now = new Date();
            return createdDate.getMonth() === now.getMonth() && 
                   createdDate.getFullYear() === now.getFullYear();
        }).length,
        totalReservations: allReservations.length,
        pendingReservations: allReservations.filter(r => r.status === 'pending').length,
        confirmedReservations: allReservations.filter(r => r.status === 'confirmed').length,
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter(o => o.status === 'pending').length,
        completedOrders: allOrders.filter(o => o.status === 'completed').length,
        totalRevenue: totalRevenue,
        avgOrderValue: avgOrderValue,
        totalEvents: allEvents.length,
        pendingEvents: allEvents.filter(e => e.status === 'pending').length,
        confirmedEvents: allEvents.filter(e => e.status === 'confirmed').length
    };
}

// ============= ACTIVITES RECENTES =============

async function getRecentActivities(limit = 20) {
    const users = await userService.getAllUsers();
    const allActivities = [];

    for (const user of users) {
        const userData = await userService.getUserData(user.id);
        if (userData.activities) {
            userData.activities.forEach(activity => {
                allActivities.push({
                    ...activity,
                    userId: user.id,
                    userName: `${user.firstName} ${user.lastName}`
                });
            });
        }
    }

    return allActivities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
}

module.exports = {
    getAllReservations,
    getPendingReservations,
    updateReservationStatus,
    getAllOrders,
    getPendingOrders,
    updateOrderStatusAdmin,
    getAllEvents,
    getPendingEvents,
    updateEventStatus,
    getAdminStats,
    getRecentActivities,
    getAllUsersAdmin,
    getUserDetailsAdmin,
    deleteUserAdmin,
    sendMessageToUser
};