let adminData = {
    menus: [],
    reservations: [],
    orders: [],
    events: [],
    users: [],
    stats: {},
    filteredMenus: [],
    filteredReservations: [],
    filteredOrders: [],
    filteredEvents: [],
    filteredUsers: []
};

let currentMenuId = null;

// ============= INITIALISATION =============

async function initializeAdmin() {
    if (!window.api) {
        setTimeout(initializeAdmin, 200);
        return;
    }

    const isAuth = await window.authManager.checkAuthStatus();
    if (!isAuth) {
        window.location.href = '/auth?redirect=/admin';
        return;
    } 

    await loadAdminData();
    feather.replace();
}

async function loadAdminData() {
    try {
        console.log('Loading admin data...');

        // Charger les statistiques
        const statsResponse = await window.api.getAdminStats();
        if (statsResponse.success) {
            adminData.stats = statsResponse.stats;
        }

        // Charger les réservations
        const resResponse = await window.api.getAdminReservations();
        if (resResponse.success) {
            adminData.reservations = resResponse.reservations;
            adminData.filteredReservations = adminData.reservations;
        }

        // Charger les commandes
        const ordersResponse = await window.api.getAdminOrders();
        if (ordersResponse.success) {
            adminData.orders = ordersResponse.orders;
            adminData.filteredOrders = adminData.orders;
        }

        // Charger les événements
        const eventsResponse = await window.api.getAdminEvents();
        if (eventsResponse.success) {
            adminData.events = eventsResponse.events;
            adminData.filteredEvents = adminData.events;
        }

        // Charger les menus
        const menusResponse = await window.api.getAdminMenus();
        if (menusResponse.success) {
            adminData.menus = menusResponse.menus;
            adminData.filteredMenus = adminData.menus;
        }

        // Charger les utilisateurs
        const usersResponse = await window.api.getAdminUsers();
        if (usersResponse.success) {
            adminData.users = usersResponse.users;
            adminData.filteredUsers = adminData.users;
        }

        // Mettre à jour l'interface
        updateDashboard();
        renderMenus();
        renderReservations();
        renderOrders();
        renderEvents();
        renderUsers();

    } catch (error) {
        console.error('Error loading admin data:', error);
        notify.error('Erreur lors du chargement des données');
    }
}

// ============= DASHBOARD =============

function updateDashboard() {
    const stats = adminData.stats;
    
    document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
    document.getElementById('newUsersThisMonth').textContent = `+${stats.newUsersThisMonth || 0} ce mois`;
    document.getElementById('totalRevenue').textContent = (stats.totalRevenue || 0).toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('avgOrderValue').textContent = `Moy: ${(stats.avgOrderValue || 0).toLocaleString('fr-FR')} FCFA`;
    document.getElementById('totalReservations').textContent = stats.totalReservations || 0;
    document.getElementById('confirmedReservations').textContent = `${stats.confirmedReservations || 0} confirmées`;
    document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
    document.getElementById('completedOrders').textContent = `${stats.completedOrders || 0} complétées`;
    document.getElementById('totalEvents').textContent = stats.totalEvents || 0;
    document.getElementById('confirmedEvents').textContent = `${stats.confirmedEvents || 0} confirmés`;
    document.getElementById('totalMenus').textContent = adminData.menus.filter(m => m.available).length;

    document.getElementById('pendingReservations').textContent = stats.pendingReservations || '';
    document.getElementById('pendingOrders').textContent = stats.pendingOrders || '';
    document.getElementById('pendingEvents').textContent = stats.pendingEvents || '';

    renderPendingRequests();
}

function renderPendingRequests() {
    const container = document.getElementById('pendingRequests');
    const pending = [
        ...adminData.reservations.filter(r => r.status === 'pending').map(r => ({ ...r, type: 'reservation' })),
        ...adminData.orders.filter(o => o.status === 'pending').map(o => ({ ...o, type: 'order' })),
        ...adminData.events.filter(e => e.status === 'pending').map(e => ({ ...e, type: 'event' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (pending.length === 0) {
        container.innerHTML = '<p class="text-white/60">Aucune demande en attente</p>';
        return;
    }

    container.innerHTML = pending.slice(0, 5).map(item => `
        <div class="p-4 bg-deepblack/30 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-gold/20 rounded-lg">
                    <i data-feather="${item.type === 'reservation' ? 'calendar' : item.type === 'order' ? 'shopping-bag' : 'star'}" class="text-gold" width="20" height="20"></i>
                </div>
                <div>
                    <p class="text-white font-medium">${getRequestTitle(item)}</p>
                    <p class="text-white/60 text-sm">${item.userName || 'Client'} - ${formatDate(item.createdAt)}</p>
                </div>
            </div>
            <button onclick="switchToSection('${item.type}s')" class="px-4 py-2 bg-gold hover:bg-gold/90 text-deepblack rounded-lg transition-all">
                Gérer
            </button>
        </div>
    `).join('');

    feather.replace();
}

function getRequestTitle(item) {
    if (item.type === 'reservation') return `Réservation - ${item.guests} personne(s)`;
    if (item.type === 'order') return `Commande #${item.id.substring(0, 8)}`;
    return `Evénement - ${item.eventType}`;
}

// ============= MENUS =============

function renderMenus() {
    const container = document.getElementById('menusList');
    
    if (adminData.filteredMenus.length === 0) {
        container.innerHTML = '<p class="text-white/60">Aucun menu trouvé</p>';
        return;
    }

    container.innerHTML = adminData.filteredMenus.map(menu => `
        <div class="bg-gradient-to-br from-richbrown/40 to-richbrown/20 border border-gold/30 rounded-2xl p-6 flex gap-6">
            ${menu.image ? `
                <div class="w-32 h-32 flex-shrink-0">
                    <img src="${menu.image}" alt="${menu.name}" class="w-full h-full object-cover rounded-xl">
                </div>
            ` : ''}
            <div class="flex-1">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h3 class="text-xl font-medium text-white mb-1">${menu.name}</h3>
                        <p class="text-white/60 text-sm">${getCategoryLabel(menu.category)}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-gold mb-2">${menu.price.toFixed(2)} FCFA</div>
                        <span class="status-badge ${menu.available ? 'status-confirmed' : 'status-cancelled'}">
                            ${menu.available ? 'Disponible' : 'Indisponible'}
                        </span>
                    </div>
                </div>
                <p class="text-white/70 mb-4">${menu.description}</p>
                <div class="flex gap-2">
                    <button onclick="showEditMenuModal('${menu.id}')" class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm flex items-center gap-2">
                        <i data-feather="edit-2" width="16" height="16"></i>
                        Modifier
                    </button>
                    <button onclick="toggleMenuAvailability('${menu.id}')" class="px-4 py-2 bg-emerald/20 hover:bg-emerald/30 text-emerald rounded-lg transition-all text-sm">
                        ${menu.available ? 'Marquer indisponible' : 'Marquer disponible'}
                    </button>
                    <button onclick="deleteMenu('${menu.id}')" class="px-4 py-2 bg-africanred/20 hover:bg-africanred/30 text-africanred rounded-lg transition-all text-sm flex items-center gap-2">
                        <i data-feather="trash-2" width="16" height="16"></i>
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    feather.replace();
}

function filterMenus() {
    const searchTerm = document.getElementById('menuSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('menuCategoryFilter').value;

    adminData.filteredMenus = adminData.menus.filter(menu => {
        const matchesSearch = menu.name.toLowerCase().includes(searchTerm) || 
                            menu.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || menu.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    renderMenus();
}

function getCategoryLabel(category) {
    const labels = {
        'entrees': 'Entrées',
        'plats': 'Plats principaux',
        'desserts': 'Desserts',
        'boissons': 'Boissons'
    };
    return labels[category] || category;
}

function showAddMenuModal() {
    currentMenuId = null;
    document.getElementById('menuModalTitle').textContent = 'Ajouter un Menu';
    document.getElementById('menuForm').reset();
    document.getElementById('menuId').value = '';
    document.getElementById('menuModal').classList.remove('hidden');
    document.getElementById('menuModal').classList.add('flex');
    feather.replace();
}

function showEditMenuModal(menuId) {
    currentMenuId = menuId;
    const menu = adminData.menus.find(m => m.id === menuId);
    if (!menu) return;

    document.getElementById('menuModalTitle').textContent = 'Modifier le Menu';
    document.getElementById('menuId').value = menu.id;
    document.getElementById('menuName').value = menu.name;
    document.getElementById('menuDescription').value = menu.description;
    document.getElementById('menuCategory').value = menu.category;
    document.getElementById('menuPrice').value = menu.price;
    document.getElementById('menuImage').value = menu.image || '';
    document.getElementById('menuAvailable').checked = menu.available;

    document.getElementById('menuModal').classList.remove('hidden');
    document.getElementById('menuModal').classList.add('flex');
    feather.replace();
}

function closeMenuModal() {
    document.getElementById('menuModal').classList.add('hidden');
    document.getElementById('menuModal').classList.remove('flex');
    document.getElementById('menuForm').reset();
    currentMenuId = null;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('menuForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const menuData = {
            name: document.getElementById('menuName').value,
            description: document.getElementById('menuDescription').value,
            category: document.getElementById('menuCategory').value,
            price: parseFloat(document.getElementById('menuPrice').value),
            image: document.getElementById('menuImage').value,
            available: document.getElementById('menuAvailable').checked
        };

        try {
            if (currentMenuId) {
                await window.api.updateAdminMenu(currentMenuId, menuData);
                notify.success('Menu modifié avec succès !');
            } else {
                await window.api.createAdminMenu(menuData);
                notify.success('Menu ajouté avec succès !');
            }
            closeMenuModal();
            await loadAdminData();
        } catch (error) {
            console.error('Error saving menu:', error);
            notify.error('Erreur lors de l\'enregistrement du menu');
        }
    });
});

async function toggleMenuAvailability(menuId) {
    try {
        await window.api.toggleMenuAvailability(menuId);
        await loadAdminData();
    } catch (error) {
        console.error('Error toggling menu:', error);
        notify.error('Erreur lors de la mise à jour');
    }
}

async function deleteMenu(menuId) {
    if (!await notify.confirm('Etes-vous sur de vouloir supprimer ce menu ?')) return;
    
    try {
        await window.api.deleteAdminMenu(menuId);
        notify.info('Menu supprimé !');
        await loadAdminData();
    } catch (error) {
        console.error('Error deleting menu:', error);
        notify.error('Erreur lors de la suppression');
    }
}

// ============= RESERVATIONS =============

function renderReservations() {
    const container = document.getElementById('reservationsList');
    
    if (adminData.filteredReservations.length === 0) {
        container.innerHTML = '<p class="text-white/60">Aucune réservation trouvée</p>';
        return;
    }

    container.innerHTML = adminData.filteredReservations.map(res => `
        <div class="bg-gradient-to-br from-richbrown/40 to-richbrown/20 border border-gold/30 rounded-2xl p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-xl font-medium text-white">${res.userName}</h3>
                        <span class="status-badge status-${res.status}">
                            ${getStatusLabel(res.status)}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-white/60 text-sm">
                        <span><i data-feather="calendar" width="16" height="16" class="inline mr-1"></i>${formatDateFull(res.date)} à ${res.time}</span>
                        <span><i data-feather="users" width="16" height="16" class="inline mr-1"></i>${res.guests} personne(s)</span>
                        <span><i data-feather="mail" width="16" height="16" class="inline mr-1"></i>${res.userEmail}</span>
                        <span><i data-feather="phone" width="16" height="16" class="inline mr-1"></i>${res.userPhone || 'N/A'}</span>
                    </div>
                </div>
            </div>
            ${res.specialRequests ? `
                <div class="mb-4 p-3 bg-gold/5 border border-gold/10 rounded-lg">
                    <p class="text-white/80 text-sm"><strong>Demandes spéciales:</strong> ${res.specialRequests}</p>
                </div>
            ` : ''}
            ${((res.status !== 'cancelled') && (res.status !== 'completed')) ? `
                <div class="flex gap-2">
                    <button onclick="showReservationStatusModal('${res.userId}', '${res.id}')" class="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg transition-all text-sm">
                        Changer le statut
                    </button>
                </div>
                `:``}
            
        </div>
    `).join('');

    feather.replace();
}

function filterReservations() {
    const statusFilter = document.getElementById('reservationStatusFilter').value;

    adminData.filteredReservations = adminData.reservations.filter(res => {
        return !statusFilter || res.status === statusFilter;
    });

    renderReservations();
}

function showReservationStatusModal(userId, reservationId) {
    document.getElementById('reservationUserId').value = userId;
    document.getElementById('reservationId').value = reservationId;
    document.getElementById('reservationNewStatus').value = '';
    document.getElementById('reservationAdminResponse').value = '';
    
    document.getElementById('reservationStatusModal').classList.remove('hidden');
    document.getElementById('reservationStatusModal').classList.add('flex');
    feather.replace();
}

function closeReservationStatusModal() {
    document.getElementById('reservationStatusModal').classList.add('hidden');
    document.getElementById('reservationStatusModal').classList.remove('flex');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('reservationStatusForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userId = document.getElementById('reservationUserId').value;
        const reservationId = document.getElementById('reservationId').value;
        const status = document.getElementById('reservationNewStatus').value;
        const adminResponse = document.getElementById('reservationAdminResponse').value;

        try {
            await window.api.updateAdminReservation(userId, reservationId, { status, adminResponse });
            notify.success('Réservation mise à jour !');
            closeReservationStatusModal();
            await loadAdminData();
        } catch (error) {
            console.error('Error updating reservation:', error);
            notify.error('Erreur lors de la mise à jour');
        }
    });
});

// ============= COMMANDES =============

function renderOrders() {
    const container = document.getElementById('ordersList');
    
    if (adminData.filteredOrders.length === 0) {
        container.innerHTML = '<p class="text-white/60">Aucune commande trouvée</p>';
        return;
    }

    container.innerHTML = adminData.filteredOrders.map(order => `
        <div class="bg-gradient-to-br from-richbrown/40 to-richbrown/20 border border-gold/30 rounded-2xl p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-xl font-medium text-white">Commande #${order.id.substring(0, 8)}</h3>
                        <span class="status-badge status-${order.status}">
                            ${getStatusLabel(order.status)}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-white/60 text-sm mb-3">
                        <span><i data-feather="user" width="16" height="16" class="inline mr-1"></i>${order.userName}</span>
                        <span><i data-feather="mail" width="16" height="16" class="inline mr-1"></i>${order.userEmail}</span>
                        <span><i data-feather="phone" width="16" height="16" class="inline mr-1"></i>${order.userPhone || 'N/A'}</span>
                        <span><i data-feather="clock" width="16" height="16" class="inline mr-1"></i>${formatDate(order.createdAt)}</span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-gold">${order.total.toFixed(2)} FCFA</div>
                </div>
            </div>
            <div class="mb-4 p-3 bg-deepblack/30 rounded-lg">
                <h4 class="text-white font-medium mb-2">Articles:</h4>
                <div class="space-y-1">
                    ${order.items.map(item => `
                        <div class="flex justify-between text-sm text-white/70">
                            <span>${item.quantity}x ${item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)} FCFA</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${((order.status !== 'cancelled') && (order.status !== 'completed')) ? `
                <div class="flex gap-2">
                    <select onchange="updateOrderStatus('${order.userId}', '${order.id}', this.value)" 
                            class="px-4 py-2 bg-deepblack/50 border border-gold/20 rounded-lg text-white text-sm">
                        <option value="">Changer le statut...</option>
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="preparing">En préparation</option>
                        <option value="delivering">En livraison</option>
                        <option value="completed">Terminé</option>
                        <option value="cancelled">Annulé</option>
                    </select>
                </div>`:''
            }
        </div>
    `).join('');

    feather.replace();
}

function filterOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;

    adminData.filteredOrders = adminData.orders.filter(order => {
        return !statusFilter || order.status === statusFilter;
    });

    renderOrders();
}

async function updateOrderStatus(userId, orderId, status) {
    if (!status) return;

    try {
        await window.api.updateAdminOrder(userId, orderId, { status });
        notify.success('Commande mise à jour !');
        await loadAdminData();
    } catch (error) {
        console.error('Error updating order:', error);
        notify.error('Erreur lors de la mise à jour');
    }
}

// ============= EVENEMENTS =============

function renderEvents() {
    const container = document.getElementById('eventsList');
    
    if (adminData.filteredEvents.length === 0) {
        container.innerHTML = '<p class="text-white/60">Aucun événement trouvé</p>';
        return;
    }

    container.innerHTML = adminData.filteredEvents.map(event => `
        <div class="bg-gradient-to-br from-richbrown/40 to-richbrown/20 border border-gold/30 rounded-2xl p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-xl font-medium text-white">${event.eventType}</h3>
                        <span class="status-badge status-${event.status}">
                            ${getStatusLabel(event.status)}
                        </span>
                    </div>
                    <div class="flex items-center gap-4 text-white/60 text-sm mb-2">
                            <span><i data-feather="user" width="16" height="16" class="inline mr-1"></i>${event.userName}</span>
                            <span><i data-feather="calendar" width="16" height="16" class="inline mr-1"></i>${formatDateFull(event.date)}</span>
                            <span><i data-feather="users" width="16" height="16" class="inline mr-1"></i>${event.guests} invités</span>
                        </div>
                    <p class="text-white/70">${event.description}</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-gold">${event.budget} FCFA</div>
                    <p class="text-white/50 text-xs">Budget</p>
                </div>
            </div>
            ${event.specialRequests ? `
                <div class="mb-4 p-3 bg-gold/5 border border-gold/10 rounded-lg">
                    <p class="text-white/80 text-sm"><strong>Demandes spéciales:</strong> ${event.specialRequests}</p>
                </div>
            ` : ''}
            ${event.status === 'pending' ? `
                    <div class="flex gap-2">
                        <button onclick="handleEventAction('${event.userId}', '${event.id}', 'confirm')" class="flex-1 px-4 py-2 bg-emerald/20 hover:bg-emerald/30 text-emerald border border-emerald/30 rounded-lg transition-all">
                            Accepter
                        </button>
                        <button onclick="handleEventAction('${event.userId}', '${event.id}', 'reject')" class="flex-1 px-4 py-2 bg-africanred/20 hover:bg-africanred/30 text-africanred border border-africanred/30 rounded-lg transition-all">
                            Refuser
                        </button>
                    </div>
            ` : ''}
        </div>
    `).join('');

    feather.replace();
}

function filterEvents() {
    const statusFilter = document.getElementById('eventStatusFilter').value;

    adminData.filteredEvents = adminData.events.filter(event => {
        return !statusFilter || event.status === statusFilter;
    });

    renderEvents();
}

async function handleEventAction(userId, eventId, action) {
    let status, adminResponse;
    
    if (action === 'confirm') {
        status = 'confirmed';
        adminResponse = await notify.prompt('Message de confirmation (optionnel):') || 'Votre demande d\'événement a été confirmée !';
    } else if (action === 'reject') {
        adminResponse = await notify.prompt('Raison du refus:');
        if (!adminResponse) {
            notify.info('Veuillez entrer une raison pour le refus');
            return;
        }
        status = 'cancelled';
    }
    
    // Valider le status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
        notify.info('Status invalide: ' + status);
        console.error('Invalid status:', status);
        return;
    }
    
    console.log('Updating event:', { userId, eventId, status, adminResponse });

    try {
        
        const result = await window.api.updateAdminEvent(userId, eventId, { status, adminResponse });
        console.log('Event updated successfully:', result);
        notify.info(` Evénement mis à jour avec succès !

Status: ${status === 'confirmed' ? 'Confirmé' : 'Annulé'}
Message: ${adminResponse}`);
        await loadAdminData();
    } catch (error) {
        console.error('Error updating event:', error);
        notify.info(` Erreur lors de la mise à jour

Détails: ${error.message}

Veuillez réessayer ou contacter le support.`);
    }
}


// ============= UTILISATEURS =============

function renderUsers() {
    const container = document.getElementById('usersList');
    
    if (adminData.filteredUsers.length === 0) {
        container.innerHTML = '<p class="text-white/60">Aucun utilisateur trouvé</p>';
        return;
    }

    container.innerHTML = adminData.filteredUsers.map(user => `
        <div class="bg-gradient-to-br from-richbrown/40 to-richbrown/20 border border-gold/30 rounded-2xl p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-medium text-white mb-2">${user.firstName} ${user.lastName}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-white/60 text-sm">
                        <span><i data-feather="mail" width="16" height="16" class="inline mr-1"></i>${user.email}</span>
                        <span><i data-feather="phone" width="16" height="16" class="inline mr-1"></i>${user.phone || 'N/A'}</span>
                        <span><i data-feather="calendar" width="16" height="16" class="inline mr-1"></i>Inscrit le ${formatDateShort(user.createdAt)}</span>
                        <span><i data-feather="award" width="16" height="16" class="inline mr-1"></i>${user.loyaltyPoints || 0} points</span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-gold mb-1">${(user.totalSpent || 0).toFixed(2)} FCFA</div>
                    <p class="text-white/50 text-xs">Dépenses totales</p>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4 mb-4 p-3 bg-deepblack/30 rounded-lg">
                <div class="text-center">
                    <div class="text-lg font-bold text-emerald">${user.totalOrders || 0}</div>
                    <div class="text-xs text-white/60">Commandes</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-gold">${user.totalReservations || 0}</div>
                    <div class="text-xs text-white/60">Réservations</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-purple-500">${user.totalEvents || 0}</div>
                    <div class="text-xs text-white/60">Evénements</div>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="showUserDetails('${user.id}')" class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm flex items-center gap-2">
                    <i data-feather="eye" width="16" height="16"></i>
                    Voir détails
                </button>
                <button onclick="deleteUser('${user.id}', '${user.email}')" class="px-4 py-2 bg-africanred/20 hover:bg-africanred/30 text-africanred rounded-lg transition-all text-sm flex items-center gap-2">
                    <i data-feather="trash-2" width="16" height="16"></i>
                    Supprimer
                </button>
            </div>
        </div>
    `).join('');

    feather.replace();
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();

    adminData.filteredUsers = adminData.users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        return fullName.includes(searchTerm) || email.includes(searchTerm);
    });

    renderUsers();
}

async function showUserDetails(userId) {
    try {
        const response = await window.api.getAdminUserDetails(userId);
        if (!response.success) throw new Error('Failed to load user details');

        const userDetails = response.userDetails;
        const content = document.getElementById('userDetailsContent');

        content.innerHTML = `
            <div class="space-y-6">
                <div>
                    <h4 class="text-lg font-semibold text-gold mb-3">Informations personnelles</h4>
                    <div class="grid grid-cols-2 gap-4 bg-deepblack/30 p-4 rounded-lg">
                        <div><span class="text-white/60">Nom:</span> <span class="text-white">${userDetails.user.firstName} ${userDetails.user.lastName}</span></div>
                        <div><span class="text-white/60">Email:</span> <span class="text-white">${userDetails.user.email}</span></div>
                        <div><span class="text-white/60">Téléphone:</span> <span class="text-white">${userDetails.user.phone || 'N/A'}</span></div>
                        <div><span class="text-white/60">Points de fidélité:</span> <span class="text-white">${userDetails.user.loyaltyPoints || 0}</span></div>
                    </div>
                </div>

                <div>
                    <h4 class="text-lg font-semibold text-gold mb-3">Activités récentes</h4>
                    <div class="bg-deepblack/30 p-4 rounded-lg max-h-64 overflow-y-auto space-y-2">
                        ${userDetails.activities && userDetails.activities.length > 0 ? 
                            userDetails.activities.slice(0, 10).map(activity => `
                                <div class="flex items-center gap-3 py-2 border-b border-white/10">
                                    <i data-feather="${activity.icon || 'activity'}" width="16" height="16" class="text-gold"></i>
                                    <div class="flex-1">
                                        <p class="text-white text-sm">${activity.description}</p>
                                        <p class="text-white/50 text-xs">${formatDate(activity.timestamp)}</p>
                                    </div>
                                </div>
                            `).join('') : 
                            '<p class="text-white/60">Aucune activité</p>'
                        }
                    </div>
                </div>
            </div>
        `;

        document.getElementById('userDetailsModal').classList.remove('hidden');
        document.getElementById('userDetailsModal').classList.add('flex');
        feather.replace();
    } catch (error) {
        console.error('Error loading user details:', error);
        notify.error('Erreur lors du chargement des détails');
    }
}

function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').classList.add('hidden');
    document.getElementById('userDetailsModal').classList.remove('flex');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('messageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userId = document.getElementById('messageUserId').value;
        const subject = document.getElementById('messageSubject').value;
        const message = document.getElementById('messageContent').value;

        try {
            await window.api.sendMessageToUser(userId, { subject, message });
            notify.success('Message envoyé !');
        } catch (error) {
            console.error('Error sending message:', error);
            notify.error('Erreur lors de l\'envoi du message');
        }
    });
});

async function deleteUser(userId, userEmail) {
    const reason = await notify.prompt('Raison de la suppression (obligatoire):');
    if (!reason) {
        notify.info('Suppression annulée');
        return;
    }

    if (!await notify.confirm(`Etes-vous sur de vouloir supprimer l'utilisateur ${userEmail} ?\n\nCette action est irréversible.`)) return;
    
    try {
        await window.api.deleteAdminUser(userId, { reason });
        notify.success('Utilisateur supprimé');
        await loadAdminData();
    } catch (error) {
        console.error('Error deleting user:', error);
        notify.error('Erreur lors de la suppression');
    }
}

// ============= NAVIGATION =============

function switchSection(section) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(section).classList.add('active');
    event.target.classList.add('active');

    feather.replace();
}

function switchToSection(section) {
    switchSection(section);
    const btn = document.querySelector(`[onclick="switchSection('${section}')"]`);
    if (btn) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
}

// ============= UTILITAIRES =============

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatDateShort(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

function formatDateFull(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}

function getStatusLabel(status) {
    const labels = {
        pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé',
        completed: 'Terminé', preparing: 'En préparation', delivering: 'En livraison'
    };
    return labels[status] || status;
}

// ============= AUTHENTIFICATION ADMIN =============

async function checkAdminAuth() {
    try {
        const response = await fetch('/api/admin/auth/status', { credentials: 'include' });
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/verifyAdmin';
            return false;
        }
        return true;
    } catch (error) {
        window.location.href = '/verifyAdmin';
        return false;
    }
}

async function handleLogout() {
    if (await notify.confirm('Etes-vous sur de vouloir vous déconnecter ?')) {
        fetch('/api/admin/auth/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(() => window.location.href = '/verifyAdmin')
        .catch(() => window.location.href = '/verifyAdmin');
    }
}

// ============= INITIALISATION =============

window.addEventListener('load', async () => { const isAuth = await checkAdminAuth(); if (isAuth) await initializeAdmin(); });