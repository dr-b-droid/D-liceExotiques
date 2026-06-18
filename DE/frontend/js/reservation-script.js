// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, observerOptions);

// Observe all elements with animation classes
document.querySelectorAll('.fade-in-section, .fade-in-left, .fade-in-right, .scale-in, .stagger-item').forEach(el => {
    observer.observe(el);
});

// Initialize Feather icons
feather.replace();

// Gestion de la section réservation
async function initializeReservationSection() {
    const reservationContent = document.getElementById('reservationContent');
    
    // Vérifier l'état d'authentification
    const isAuthenticated = window.authManager && window.authManager.isAuthenticated();
    const user = window.authManager ? window.authManager.getUser() : null;

    if (!isAuthenticated) {
        // Afficher le bouton de connexion
        reservationContent.innerHTML = `
            <div class="text-center py-8">
                <i data-feather="lock" class="mx-auto mb-4 text-gold" width="64" height="64"></i>
                <p class="text-white/80 text-lg mb-6">
                    Connectez-vous pour réserver une table
                </p>
                <a href="/auth?redirect=/reservation" class="inline-block px-10 py-4 bg-gold hover:bg-gold/90 text-deepblack font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg">
                    Se connecter / S'inscrire
                </a>
            </div>
        `;
        feather.replace();
    } else {
        // Afficher le formulaire de réservation
        reservationContent.innerHTML = `
            <form id="reservationForm" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="name" class="block text-white/80 mb-2 font-medium">Nom complet</label>
                    <input type="text" id="name" required 
                            value="${user.firstName} ${user.lastName}"
                            class="w-full bg-deepblack/50 border border-gold/20 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none transition-all">
                </div>
                <div>
                    <label for="email" class="block text-white/80 mb-2 font-medium">Email</label>
                    <input type="email" id="email" required 
                            value="${user.email}"
                            readonly
                            class="w-full bg-deepblack/70 border border-gold/20 rounded-xl px-4 py-3 text-white/70 focus:border-gold focus:outline-none transition-all">
                </div>
                <div>
                    <label for="date" class="block text-white/80 mb-2 font-medium">Date</label>
                    <input type="date" id="date" required 
                            min="${new Date().toISOString().split('T')[0]}"
                            class="w-full bg-deepblack/50 border border-gold/20 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none transition-all">
                </div>
                <div>
                    <label for="time" class="block text-white/80 mb-2 font-medium">Heure</label>
                    <input type="time" id="time" required 
                            min="11:00" max="22:00"
                            class="w-full bg-deepblack/50 border border-gold/20 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none transition-all">
                </div>
                <div class="md:col-span-2">
                    <label for="guests" class="block text-white/80 mb-2 font-medium">Nombre de personnes</label>
                    <select id="guests" required class="w-full bg-deepblack/50 border border-gold/20 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none transition-all">
                        <option value="1">1 personne</option>
                        <option value="2">2 personnes</option>
                        <option value="3">3 personnes</option>
                        <option value="4">4 personnes</option>
                        <option value="5">5 personnes</option>
                        <option value="6">6 personnes</option>
                        <option value="7">7+ personnes</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label for="requests" class="block text-white/80 mb-2 font-medium">Demandes spéciales</label>
                    <textarea id="requests" rows="3" placeholder="Allergies, préférences alimentaires, occasion spéciale..."
                                class="w-full bg-deepblack/50 border border-gold/20 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none transition-all resize-none"></textarea>
                </div>
                <div class="md:col-span-2">
                    <button type="submit" id="submitBtn" 
                            class="w-full bg-gold hover:bg-gold/90 text-deepblack font-medium py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg text-lg">
                        Confirmer la réservation
                    </button>
                </div>
            </form>
            
            <!-- Message de succès -->
            <div id="successMessage" class="hidden mt-6 p-6 bg-emerald/10 border border-emerald/30 rounded-xl">
                <div class="flex items-center gap-3 mb-3">
                    <i data-feather="check-circle" class="text-emerald" width="24" height="24"></i>
                    <h3 class="text-lg font-medium text-emerald">Réservation confirmée !</h3>
                </div>
                <p class="text-white/80 mb-4">Votre réservation a été enregistrée avec succès.</p>
                <a href="/profile" class="inline-block px-6 py-2 bg-gold hover:bg-gold/90 text-deepblack font-medium rounded-lg transition-all">
                    Voir mes réservations
                </a>
            </div>
        `;

        // Ajouter le gestionnaire de soumission du formulaire
        const form = document.getElementById('reservationForm');
        form.addEventListener('submit', handleReservationSubmit);
    }
}

// Gérer la soumission du formulaire de réservation
async function handleReservationSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    try {
        const formData = {
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            guests: document.getElementById('guests').value,
            specialRequests: document.getElementById('requests').value || ''
        };

        const response = await window.api.createReservation(formData);

        if (response.success) {
            // Masquer le formulaire et afficher le message de succès
            document.getElementById('reservationForm').style.display = 'none';
            const successMessage = document.getElementById('successMessage');
            successMessage.classList.remove('hidden');
            feather.replace();
            
            // Scroll vers le message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            notify.info('Erreur lors de la réservation: ' + response.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Reservation error:', error);
        notify.info('Erreur lors de la réservation. Veuillez réessayer.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Ecouter les changements d'état d'authentification
document.addEventListener('authStateChanged', () => {
    initializeReservationSection();
});

// Initialiser au chargement
window.addEventListener('load', () => {
    setTimeout(initializeReservationSection, 500);
});