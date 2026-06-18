let currentUser = null;
let userData = { reservations: [], orders: [], events: [], favorites: [], activities: [] };

// Vérifier l'authentification au chargement
async function checkAuth() {
    console.log('Checking authentication...');
    
    if (!window.authManager) {
        console.log('authManager not ready, waiting...');
        setTimeout(checkAuth, 200);
        return;
    }

    try {
        const isAuth = await window.authManager.checkAuthStatus();
        console.log('Authentication status:', isAuth);
        
        if (!isAuth) {
            console.log('Not authenticated, redirecting...');
            window.location.href = '/auth?redirect=/profile';
            return;
        }

        currentUser = window.authManager.getUser();
        console.log('Current user:', currentUser);
        
        if (!currentUser) {
            window.location.href = '/auth?redirect=/profile';
            return;
        }

        loadUserProfile();
        await loadUserData();
        
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/auth?redirect=/profile';
    }
}

function loadUserProfile() {
    if (!currentUser) return;

    const initials = getInitials(currentUser.firstName + ' ' + currentUser.lastName);
    document.getElementById('userAvatar').innerHTML = initials;
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;

    const contactParts = [];
    contactParts.push(`<i data-feather="mail" width="16" height="16" class="inline mr-2"></i>${currentUser.email}`);
    if (currentUser.phone) {
        contactParts.push(`<i data-feather="phone" width="16" height="16" class="inline ml-4 mr-2"></i>${currentUser.phone}`);
    }
    document.getElementById('userContact').innerHTML = contactParts.join('');

    document.getElementById('settingsName').value = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('settingsPhone').value = currentUser.phone || '';

    feather.replace();
}

async function loadUserData() {
    try {
        console.log('Loading user data...');
        const response = await window.api.getUserData();
        console.log('User data response:', response);

        if (response.success) {
            userData = response.data;
            updateStats();
            renderReservations();
            renderOrders();
            renderEvents();
            renderRecentActivity();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('recentActivity').innerHTML = 
            '<p class="text-white/60 text-center py-8">Erreur lors du chargement des données</p>';
    }
}

function updateStats() {
    document.getElementById('reservationsCount').textContent = userData.reservations?.length || 0;
    document.getElementById('ordersCount').textContent = userData.orders?.length || 0;
    document.getElementById('eventsCount').textContent = userData.events?.length || 0;
}

function renderReservations() {
    const container = document.getElementById('reservationsList');
    
    if (!userData.reservations || userData.reservations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i data-feather="calendar" class="mx-auto mb-4 text-gold/30" width="64" height="64"></i>
                <p class="text-white/60 mb-4">Aucune réservation pour le moment</p>
                <a href="/#reservation" class="inline-block px-6 py-3 bg-gold hover:bg-gold/90 text-deepblack font-medium rounded-xl transition-all">
                    Réserver une table
                </a>
            </div>
        `;
        feather.replace();
        return;
    }

    container.innerHTML = userData.reservations.map(res => `
        <div class="mb-4 p-6 bg-deepblack/50 border border-gold/20 rounded-xl">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-xl font-medium text-white">${formatDateFull(res.date)} à ${res.time}</h3>
                        <span class="status-badge status-${res.status}">
                            <i data-feather="${getStatusIcon(res.status)}" width="16" height="16"></i>
                            ${getStatusLabel(res.status)}
                        </span>
                    </div>
                    <div class="flex items-center gap-4 text-white/60">
                        <span><i data-feather="users" width="16" height="16" class="inline mr-1"></i>${res.guests} personne(s)</span>
                        <span><i data-feather="calendar" width="16" height="16" class="inline mr-1"></i>${formatRelativeDate(res.createdAt)}</span>
                    </div>
                </div>
            </div>
            ${res.specialRequests ? `
                <div class="mt-3 p-3 bg-gold/5 border border-gold/10 rounded-lg">
                    <p class="text-sm text-white/70"><strong>Demandes spéciales:</strong> ${res.specialRequests}</p>
                </div>
            ` : ''}
            ${res.status === 'pending' ? `
                <div class="mt-4 flex gap-2">
                    <button onclick="cancelReservation('${res.id}')" class="px-4 py-2 bg-africanred/20 hover:bg-africanred/30 text-africanred border border-africanred/30 rounded-lg transition-all">
                        Annuler
                    </button>
                </div>
            ` : ''}
            ${res.adminResponse ? `
                <div class="mt-4 p-4 ${res.status === 'confirmed' ? 'bg-emerald/10 border-emerald/30' : 'bg-africanred/10 border-africanred/30'} border rounded-lg">
                    <p class="text-sm"><strong>Réponse du restaurant:</strong> ${res.adminResponse}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    feather.replace();
}

function renderOrders() {
    const container = document.getElementById('ordersList');
    
    if (!userData.orders || userData.orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i data-feather="shopping-bag" class="mx-auto mb-4 text-gold/30" width="64" height="64"></i>
                <p class="text-white/60 mb-4">Aucune commande pour le moment</p>
                <a href="/menu" class="inline-block px-6 py-3 bg-gold hover:bg-gold/90 text-deepblack font-medium rounded-xl transition-all">
                    Voir le menu
                </a>
            </div>
        `;
        feather.replace();
        return;
    }

    container.innerHTML = userData.orders.map(order => `
        <div class="mb-4 p-6 bg-deepblack/50 border border-gold/20 rounded-xl">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-xl font-medium text-white">Commande #${order.id.substring(0, 8)}</h3>
                        <span class="status-badge status-${order.status}">
                            <i data-feather="${getStatusIcon(order.status)}" width="16" height="16"></i>
                            ${getStatusLabel(order.status)}
                        </span>
                    </div>
                    <p class="text-white/60 text-sm">${formatDate(order.createdAt)}</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-gold">${order.total.toFixed(2)}  fcfa</div>
                </div>
            </div>
            <div class="space-y-2 mb-4">
                ${order.items.map(item => `
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-white/80">${item.quantity}x ${item.name}</span>
                        <span class="text-gold">${(item.price * item.quantity).toFixed(2)}  fcfa</span>
                    </div>
                `).join('')}
            </div>
            ${order.deliveryAddress ? `
                <div class="mt-3 p-3 bg-gold/5 border border-gold/10 rounded-lg">
                    <p class="text-sm text-white/70"><i data-feather="map-pin" width="14" height="14" class="inline mr-1"></i><strong>Livraison:</strong> ${order.deliveryAddress}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    feather.replace();
}

function renderEvents() {
    const container = document.getElementById('eventsList');
    
    if (!userData.events || userData.events.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i data-feather="star" class="mx-auto mb-4 text-gold/30" width="64" height="64"></i>
                <p class="text-white/60 mb-4">Aucun événement demandé</p>
                <button onclick="notify.info('Formulaire événement à venir')" class="inline-block px-6 py-3 bg-gold hover:bg-gold/90 text-deepblack font-medium rounded-xl transition-all">
                    Demander un événement
                </button>
            </div>
        `;
        feather.replace();
        return;
    }

    container.innerHTML = userData.events.map(event => `
        <div class="mb-4 p-6 bg-deepblack/50 border border-gold/20 rounded-xl">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-xl font-medium text-white">${event.eventType}</h3>
                        <span class="status-badge status-${event.status}">
                            <i data-feather="${getStatusIcon(event.status)}" width="16" height="16"></i>
                            ${getStatusLabel(event.status)}
                        </span>
                    </div>
                    <div class="flex items-center gap-4 text-white/60 text-sm mb-2">
                        <span><i data-feather="calendar" width="16" height="16" class="inline mr-1"></i>${formatDateFull(event.date)}</span>
                        <span><i data-feather="users" width="16" height="16" class="inline mr-1"></i>${event.guests} invités</span>
                    </div>
                </div>
            </div>
            <p class="text-white/70 mb-3">${event.description}</p>
            ${event.adminResponse ? `
                <div class="mt-4 p-4 ${event.status === 'confirmed' ? 'bg-emerald/10 border-emerald/30' : 'bg-africanred/10 border-africanred/30'} border rounded-lg">
                    <p class="text-sm"><strong>Réponse du restaurant:</strong> ${event.adminResponse}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    feather.replace();
}

function renderRecentActivity() {
    const container = document.getElementById('recentActivity');
    
    if (!userData.activities || userData.activities.length === 0) {
        container.innerHTML = '<p class="text-white/60 text-center py-8">Aucune activité récente</p>';
        return;
    }

    container.innerHTML = userData.activities.slice(0, 10).map(activity => `
        <div class="flex items-center gap-4 p-4 bg-deepblack/30 rounded-xl">
            <div class="p-2 bg-gold/20 rounded-lg">
                <i data-feather="${activity.icon || 'activity'}" class="text-gold" width="20" height="20"></i>
            </div>
            <div class="flex-1">
                <p class="text-white/90">${activity.description}</p>
                <p class="text-white/50 text-sm">${formatRelativeDate(activity.timestamp)}</p>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getStatusLabel(status) {
    const labels = {
        pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé',
        completed: 'Terminé', preparing: 'En préparation', delivering: 'En livraison'
    };
    return labels[status] || status;
}

function getStatusIcon(status) {
    const icons = {
        pending: 'clock', confirmed: 'check-circle', cancelled: 'x-circle',
        completed: 'check', preparing: 'package', delivering: 'truck'
    };
    return icons[status] || 'help-circle';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatDateFull(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}

function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
    return `Il y a ${Math.floor(days / 30)} mois`;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    event.target.closest('.tab-btn').classList.add('active');

    feather.replace();
}

async function handleLogout() {
    if (await notify.confirm('Etes-vous sur de vouloir vous déconnecter ?')) {
        await window.authManager.logout();
    }
}

function showEditProfile() {
    switchTab('settings');
    const settingsBtn = document.querySelector('[onclick="switchTab(\'settings\')"]');
    if (settingsBtn) settingsBtn.classList.add('active');
}

async function cancelReservation(reservationId) {
    if (!await notify.confirm('Etes-vous sur de vouloir annuler cette réservation ?')) return;
    
    try {
        await window.api.cancelReservation(reservationId);
        notify.info('Réservation annulée avec succès');
        await loadUserData();
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        notify.info('Erreur lors de l\'annulation');
    }
}


document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('settingsName').value;
    const nameParts = fullName.trim().split(' ');
    const formData = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || nameParts[0],
        phone: document.getElementById('settingsPhone').value
    };

    try {
        const result = await window.api.updateProfile(formData);
        
        if (result.success) {
            notify.success('Profil mis à jour avec succès !');
            currentUser = { ...currentUser, ...result.user };
            loadUserProfile();
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        notify.error('Erreur lors de la mise à jour du profil');
    }
});



window.addEventListener('load', () => {
    console.log('Page loaded, initializing...');
    feather.replace();
    checkAuth();
});