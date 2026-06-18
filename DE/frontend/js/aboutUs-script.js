// Etat global
let currentPage = 1;
const reviewsPerPage = 6;
let userCanReview = false;
let authReady = false;

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    feather.replace();
    
    // Attendre que authManager soit prêt
    await waitForAuthManager();
    
    // Marquer l'authentification comme prête
    authReady = true;
    
    // Charger les statistiques
    await loadStats();
    
    // Vérifier si l'utilisateur peut poster
    await checkCanReview();
    
    // Charger le formulaire
    renderReviewForm();
    
    // Charger les avis
    await loadReviews();
    
    // Écouter les changements d'état d'authentification
    document.addEventListener('authStateChanged', async () => {
        console.log('Auth state changed, refreshing review form...');
        authReady = true;
        await checkCanReview();
        renderReviewForm();
        await loadReviews();
    });
});

// Attendre que authManager soit disponible et initialisé
function waitForAuthManager() {
    return new Promise((resolve) => {
        if (window.authManager && window.authManager.currentUser !== undefined) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.authManager && window.authManager.currentUser !== undefined) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout après 10 secondes
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 10000);
        }
    });
}

// Obtenir l'utilisateur actuel
function getCurrentUser() {
    if (!authReady || !window.authManager) return null;
    return window.authManager.getUser();
}

// Vérifier si l'utilisateur est connecté
function isAuthenticated() {
    if (!authReady || !window.authManager) return false;
    return window.authManager.isAuthenticated();
}

// Vérifier si l'utilisateur peut laisser un avis
async function checkCanReview() {
    if (!isAuthenticated()) {
        userCanReview = false;
        console.log('User not authenticated, cannot review');
        return;
    }

    try {
        const data = await api.canUserReview();
        userCanReview = data.success && data.canReview;
        console.log('Can user review:', userCanReview);
    } catch (error) {
        console.error('Erreur vérification éligibilité:', error);
        userCanReview = false;
    }
}

// Charger les statistiques
async function loadStats() {
    try {
        const data = await api.getReviewsStats();
        
        if (data.success) {
            renderStats(data.stats);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
    }
}

// Afficher les statistiques
function renderStats(stats) {
    const total = stats.total || 0;
    const average = stats.average || 0;
    const distribution = stats.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    const statsHTML = `
        <div class="bg-gradient-to-br from-gold/10 to-deepblack/50 border border-gold/30 rounded-2xl p-8">
            <div class="text-5xl font-bold text-gold mb-2">${average.toFixed(1)}</div>
            <div class="flex justify-center gap-1 mb-2">
                ${renderStars(average, 24)}
            </div>
            <div class="text-white/60 text-sm">Note moyenne</div>
        </div>
        
        <div class="bg-gradient-to-br from-emerald/10 to-deepblack/50 border border-emerald/30 rounded-2xl p-8">
            <div class="text-5xl font-bold text-emerald mb-2">${total}</div>
            <div class="text-white/60 text-sm">Avis total${total > 1 ? 's' : ''}</div>
        </div>
        
        <div class="bg-gradient-to-br from-africanred/10 to-deepblack/50 border border-africanred/30 rounded-2xl p-8">
            <div class="space-y-2 text-left">
                ${[5, 4, 3, 2, 1].map(rating => {
                    const count = distribution[rating] || 0;
                    const percentage = total > 0 ? (count / total * 100) : 0;
                    return `
                        <div class="flex items-center gap-3">
                            <span class="text-white/70 text-sm w-12">${rating} <i data-feather="star" class="text-gold fill-current" width="20" height="20"></i></span>
                            <div class="flex-1 stats-bar">
                                <div class="stats-bar-fill" style="width: ${percentage}%"></div>
                            </div>
                            <span class="text-white/50 text-sm w-8 text-right">${count}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('statsSection').innerHTML = statsHTML;
}

// Afficher le formulaire d'avis
function renderReviewForm() {
    const container = document.getElementById('reviewFormSection');
    
    // Vérifier si l'auth est prête
    if (!authReady) {
        container.innerHTML = `
            <div class="bg-gradient-to-br from-gold/10 via-richbrown/20 to-deepblack/90 border border-gold/30 rounded-2xl p-8 md:p-12 text-center">
                <div class="animate-pulse">
                    <div class="text-gold text-lg">Chargement...</div>
                </div>
            </div>
        `;
        return;
    }
    
    const currentUser = getCurrentUser();
    
    // Utilisateur non connecté
    if (!isAuthenticated()) {
        container.innerHTML = `
            <div class="bg-gradient-to-br from-gold/10 via-richbrown/20 to-deepblack/90 border border-gold/30 rounded-2xl p-8 md:p-12 text-center">
                <i data-feather="lock" class="mx-auto mb-4 text-gold" width="48" height="48"></i>
                <h3 class="text-2xl font-serif text-gold mb-4" style="font-family: 'Playfair Display', serif;">
                    Partagez votre expérience
                </h3>
                <p class="text-white/70 mb-6">
                    Connectez-vous pour laisser votre avis sur notre projet
                </p>
                <a href="/auth?redirect=/about" class="inline-block bg-gradient-to-r from-gold to-gold/80 text-deepblack px-8 py-3 rounded-xl font-semibold hover:from-gold/90 hover:to-gold/70 transition-all">
                    Se connecter
                </a>
            </div>
        `;
        setTimeout(() => feather.replace(), 0);
        return;
    }
    
    // Utilisateur a déjà posté un avis
    if (!userCanReview) {
        container.innerHTML = `
            <div class="bg-gradient-to-br from-emerald/10 via-richbrown/20 to-deepblack/90 border border-emerald/30 rounded-2xl p-8 md:p-12 text-center">
                <i data-feather="check-circle" class="mx-auto mb-4 text-emerald" width="48" height="48"></i>
                <h3 class="text-2xl font-serif text-emerald mb-4" style="font-family: 'Playfair Display', serif;">
                    Merci pour votre commentaire !
                </h3>
                <p class="text-white/70 mb-2">
                    Vous avez déjà partagé votre avis sur notre projet.
                </p>
            </div>
        `;
        setTimeout(() => feather.replace(), 0);
        return;
    }
    
    // Utilisateur peut poster un avis
    container.innerHTML = `
        <div class="bg-gradient-to-br from-gold/10 via-richbrown/20 to-deepblack/90 border border-gold/30 rounded-2xl p-8 md:p-12">
            <div class="text-center mb-8">
                <h3 class="text-3xl font-serif mb-2 text-gold" style="font-family: 'Playfair Display', serif;">
                    Partagez votre expérience
                </h3>
                <p class="text-white/70">Bienvenue ${currentUser.name} ! Votre avis compte pour nous.</p>
            </div>

            <form id="reviewForm" class="space-y-6">
                <!-- Star Rating -->
                <div class="text-center">
                    <label class="block text-white/80 mb-4 text-lg font-medium">Note globale</label>
                    <div class="star-rating flex justify-center gap-2" id="starRating">
                        ${[1, 2, 3, 4, 5].map(value => `
                            <span class="star inactive" data-value="${value}">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </span>
                        `).join('')}
                    </div>
                    <input type="hidden" id="ratingInput" name="rating" required>
                    <p id="ratingText" class="mt-3 text-gold font-medium text-lg"></p>
                </div>

                <!-- Comment -->
                <div>
                    <label class="block text-white/80 mb-2 font-medium">Votre avis</label>
                    <textarea
                        id="commentInput"
                        name="comment"
                        rows="5"
                        required
                        minlength="10"
                        maxlength="1000"
                        placeholder="Partagez votre expérience avec Délices Exotiques..."
                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-all resize-none"
                    ></textarea>
                    <div class="flex justify-between text-sm text-white/50 mt-2">
                        <span>Minimum 10 caractères</span>
                        <span id="charCount">0 / 1000</span>
                    </div>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    class="w-full bg-gradient-to-r from-gold to-gold/80 text-deepblack px-8 py-4 rounded-xl font-bold text-lg hover:from-gold/90 hover:to-gold/70 transition-all flex items-center justify-center gap-2"
                >
                    <i data-feather="send" width="20" height="20"></i>
                    <span>Publier mon avis</span>
                </button>
            </form>
        </div>
    `;
    
    setTimeout(() => {
        feather.replace();
        initReviewForm();
    }, 0);
}

// Initialiser le formulaire d'avis
function initReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;
    
    const starRating = document.getElementById('starRating');
    const ratingInput = document.getElementById('ratingInput');
    const ratingText = document.getElementById('ratingText');
    const commentInput = document.getElementById('commentInput');
    const charCount = document.getElementById('charCount');
    
    // Gestion des étoiles
    const stars = starRating.querySelectorAll('.star');
    let selectedRating = 0;
    
    const ratingLabels = {
        1: 'Décevant',
        2: 'Passable',
        3: 'Bien',
        4: 'Très bien',
        5: 'Excellent !'
    };
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            ratingInput.value = selectedRating;
            updateStars();
            ratingText.textContent = ratingLabels[selectedRating];
        });
        
        star.addEventListener('mouseenter', () => {
            const value = parseInt(star.dataset.value);
            highlightStars(value);
        });
    });
    
    starRating.addEventListener('mouseleave', () => {
        updateStars();
    });
    
    function highlightStars(value) {
        stars.forEach((star, index) => {
            if (index < value) {
                star.classList.add('active');
                star.classList.remove('inactive');
            } else {
                star.classList.add('inactive');
                star.classList.remove('active');
            }
        });
    }
    
    function updateStars() {
        highlightStars(selectedRating);
    }
    
    // Compteur de caractères
    commentInput.addEventListener('input', () => {
        const length = commentInput.value.length;
        charCount.textContent = `${length} / 1000`;
        
        if (length < 10) {
            charCount.classList.add('text-africanred');
            charCount.classList.remove('text-emerald');
        } else {
            charCount.classList.add('text-emerald');
            charCount.classList.remove('text-africanred');
        }
    });
    
    // Soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitReview();
    });
}

// Soumettre un avis
async function submitReview() {
    const ratingInput = document.getElementById('ratingInput');
    const commentInput = document.getElementById('commentInput');
    const submitButton = document.querySelector('#reviewForm button[type="submit"]');
    
    const rating = parseInt(ratingInput.value);
    const comment = commentInput.value.trim();
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
        alert('Veuillez sélectionner une note de 1 à 5 étoiles');
        return;
    }
    
    if (!comment || comment.length < 10) {
        alert('Votre commentaire doit contenir au moins 10 caractères');
        return;
    }
    
    if (comment.length > 1000) {
        alert('Votre commentaire ne peut pas dépasser 1000 caractères');
        return;
    }
    
    // Désactiver le bouton
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-width="4"/>
        </svg>
        <span>Publication...</span>
    `;
    
    try {
        const response = await api.createReview({
            rating,
            comment
        });
        
        if (response.success) {
            // Réinitialiser le formulaire
            userCanReview = false;
            
            // Recharger
            await loadStats();
            renderReviewForm();
            await loadReviews();
            
            // Message de succès
            showNotification('Merci ! Votre avis a été publié avec succès.', 'success');
        }
    } catch (error) {
        console.error('Erreur lors de la publication:', error);
        showNotification(error.message || 'Erreur lors de la publication de votre avis', 'error');
        submitButton.disabled = false;
        submitButton.innerHTML = `
            <i data-feather="send" width="20" height="20"></i>
            <span>Publier mon avis</span>
        `;
        feather.replace();
    }
}

// Liker un avis
async function likeReview(reviewId) {
    if (!isAuthenticated()) {
        showNotification('Connectez-vous pour liker un avis', 'error');
        return;
    }
    
    try {
        await api.likeReview(reviewId);
        await loadReviews(); // Recharger les avis
    } catch (error) {
        console.error('Erreur lors du like:', error);
        showNotification('Erreur lors du like', 'error');
    }
}

// Charger les avis
async function loadReviews() {
    const container = document.getElementById('reviewsList');
    
    try {
        const data = await api.getReviews(currentPage, reviewsPerPage);
        
        if (data.success) {
            renderReviews(data.reviews);
            renderPagination(data.pagination);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des avis:', error);
        container.innerHTML = `
            <div class="text-center text-white/50 py-12">
                <i data-feather="alert-circle" class="mx-auto mb-4" width="48" height="48"></i>
                <p>Erreur lors du chargement des avis</p>
            </div>
        `;
        feather.replace();
    }
}

// Afficher les avis
function renderReviews(reviews) {
    const container = document.getElementById('reviewsList');
    const currentUser = getCurrentUser();
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="text-center text-white/50 py-12">
                <i data-feather="message-circle" class="mx-auto mb-4" width="48" height="48"></i>
                <p class="text-lg">Aucun avis pour le moment</p>
                <p class="text-sm mt-2">Soyez le premier à partager votre expérience !</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    container.innerHTML = reviews.map(review => {
        const date = new Date(review.date);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const isLiked = currentUser && review.likedBy && review.likedBy.includes(currentUser.userId);
        
        return `
            <div class="review-card bg-gradient-to-br from-white/5 to-deepblack/50 border border-white/10 rounded-2xl p-6 fade-in">
                <!-- Header -->
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-gradient-to-br from-gold to-gold/50 rounded-full flex items-center justify-center text-lg font-bold text-deepblack">
                            ${review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h4 class="font-semibold text-white">${escapeHtml(review.userName)}</h4>
                                ${review.verified ? '<i data-feather="check-circle" class="text-emerald" width="16" height="16"></i>' : ''}
                            </div>
                            <div class="text-white/50 text-sm">${formattedDate}</div>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        ${renderStars(review.rating, 20)}
                    </div>
                </div>
                
                <!-- Comment -->
                <p class="text-white/80 leading-relaxed mb-4">${escapeHtml(review.comment)}</p>
                
                <!-- Admin Response -->
                ${review.response ? `
                    <div class="bg-gold/10 border-l-4 border-gold rounded-lg p-4 mb-4">
                        <div class="flex items-center gap-2 mb-2">
                            <i data-feather="shield" class="text-gold" width="16" height="16"></i>
                            <span class="text-gold font-semibold text-sm">${escapeHtml(review.response.author)}</span>
                        </div>
                        <p class="text-white/70 text-sm">${escapeHtml(review.response.text)}</p>
                    </div>
                ` : ''}
                
                <!-- Actions -->
                <div class="flex items-center justify-between pt-4 border-t border-white/10">
                    <button onclick="likeReview('${review.id}')" 
                        class="like-button flex items-center gap-2 text-white/70 hover:text-africanred transition-colors ${isLiked ? 'liked' : ''}"
                        ${!isAuthenticated() ? 'disabled title="Connectez-vous pour liker"' : ''}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>${review.likes || 0}</span>
                    </button>
                    <div class="text-white/50 text-sm">
                        Avis #${review.id.substring(7, 13)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    setTimeout(() => feather.replace(), 0);
}

// Afficher la pagination
function renderPagination(pagination) {
    const container = document.getElementById('paginationSection');
    
    if (pagination.total <= 1) {
        container.innerHTML = '';
        return;
    }
    
    const buttons = [];
    
    // Bouton précédent
    if (pagination.hasPrev) {
        buttons.push(`
            <button onclick="changePage(${pagination.current - 1})"
                class="px-4 py-2 bg-gold/20 text-gold border border-gold/30 rounded-lg hover:bg-gold/30 transition-all">
                <i data-feather="chevron-left" width="16" height="16"></i>
            </button>
        `);
    }
    
    // Numéros de page
    for (let i = 1; i <= pagination.total; i++) {
        if (i === pagination.current) {
            buttons.push(`
                <button class="px-4 py-2 bg-gold text-deepblack font-bold rounded-lg">
                    ${i}
                </button>
            `);
        } else {
            buttons.push(`
                <button onclick="changePage(${i})"
                    class="px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-all">
                    ${i}
                </button>
            `);
        }
    }
    
    // Bouton suivant
    if (pagination.hasNext) {
        buttons.push(`
            <button onclick="changePage(${pagination.current + 1})"
                class="px-4 py-2 bg-gold/20 text-gold border border-gold/30 rounded-lg hover:bg-gold/30 transition-all">
                <i data-feather="chevron-right" width="16" height="16"></i>
            </button>
        `);
    }
    
    container.innerHTML = buttons.join('');
    setTimeout(() => feather.replace(), 0);
}

// Changer de page
async function changePage(page) {
    currentPage = page;
    window.scrollTo({ top: document.getElementById('reviewsList').offsetTop - 100, behavior: 'smooth' });
    await loadReviews();
}

// Afficher les étoiles
function renderStars(rating, size = 20) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let html = '';
    
    // Etoiles pleines
    for (let i = 0; i < fullStars; i++) {
        html += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    
    // Demi-étoile
    if (hasHalfStar) {
        html += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#halfGrad)" stroke="#D4AF37" stroke-width="2">
            <defs>
                <linearGradient id="halfGrad">
                    <stop offset="50%" stop-color="#D4AF37"/>
                    <stop offset="50%" stop-color="transparent"/>
                </linearGradient>
            </defs>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>`;
    }
    
    // Etoiles vides
    for (let i = 0; i < emptyStars; i++) {
        html += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="rgba(212, 175, 55, 0.3)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    
    return html;
}

// Fonction d'échappement HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Afficher une notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg border animate-slide-in ${
        type === 'success' ? 'bg-emerald/90 border-emerald text-white' :
        type === 'error' ? 'bg-africanred/90 border-africanred text-white' :
        'bg-gold/90 border-gold text-deepblack'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slide-out 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}