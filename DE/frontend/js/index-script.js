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

// Charger les plats signature
async function loadSignatureDishes() {
    try {
        const response = await api.getMenus();
        
        if (response.success && response.menus.length > 0) {
            const menus = response.menus;
            
            // Recuperer une entree, un plat et un dessert aleatoirement
            const entrees = menus.filter(m => m.category === 'entrees');
            const plats = menus.filter(m => m.category === 'plats');
            const desserts = menus.filter(m => m.category === 'desserts');
            
            const selectedDishes = [];
            
            // Selectionner aleatoirement
            if (entrees.length > 0) {
                selectedDishes.push(entrees[Math.floor(Math.random() * entrees.length)]);
            }
            if (plats.length > 0) {
                selectedDishes.push(plats[Math.floor(Math.random() * plats.length)]);
            }
            if (desserts.length > 0) {
                selectedDishes.push(desserts[Math.floor(Math.random() * desserts.length)]);
            }
            
            // Si on n'a pas assez de plats, completer avec n'importe quoi
            while (selectedDishes.length < 3 && menus.length > 0) {
                const randomMenu = menus[Math.floor(Math.random() * menus.length)];
                if (!selectedDishes.includes(randomMenu)) {
                    selectedDishes.push(randomMenu);
                }
            }
            
            renderSignatureDishes(selectedDishes);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des plats:', error);
    }
}

function renderSignatureDishes(dishes) {
    const badges = {
        'entrees': { icon: 'coffee', label: 'SIGNATURE', color: 'gold' },
        'plats': { icon: 'award', label: 'BEST SELLER', color: 'gold' },
        'desserts': { icon: 'heart', label: 'PREMIUM', color: 'gold' }
    };
    
    const container = document.getElementById('signatureDishes');
    container.innerHTML = dishes.map(dish => {
        const badge = badges[dish.category] || badges['plats'];
        const imageUrl = dish.image || '/assets/imgs/logo.png';
        
        return `
            <div class="relative group overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-105">
                <div class="absolute inset-0 bg-gradient-to-t from-deepblack via-deepblack/50 to-transparent z-10"></div>
                <img src="${imageUrl}" alt="${dish.name}" class="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.src='/assets/imgs/logo.png'">
                <div class="absolute bottom-0 left-0 z-20 p-6 w-full">
                    <div class="flex items-center gap-2 mb-2">
                        <i data-feather="${badge.icon}" class="text-${badge.color}" width="20" height="20"></i>
                        <span class="text-${badge.color} text-sm font-medium">${badge.label}</span>
                    </div>
                    <h3 class="text-2xl font-serif text-gold mb-2">${dish.name}</h3>
                    <p class="text-white/90 mb-4">${dish.description}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-emerald font-medium text-xl">${dish.price} FCFA</span>
                        <button onclick="window.location.href='/menu'" class="bg-gold/10 hover:bg-gold hover:text-deepblack text-gold px-4 py-2 rounded-full transition-all text-sm font-medium border border-gold/30">
                            Commander
                        </button>
                    </div>
                </div>
            </div>
            
        `;
    }).join('');
    
    setTimeout(() => feather.replace(), 100);
}

function renderDefaultDishes() {
    const container = document.getElementById('signatureDishes');
    container.innerHTML = `
        <div class="col-span-3 text-center text-white/50 py-12">
            <i data-feather="alert-circle" class="mx-auto mb-4" width="48" height="48"></i>
            <p>Erreur lors du chargement des plats</p>
        </div>
    `;
    setTimeout(() => feather.replace(), 100);
}

// Charger les temoignages
async function loadTestimonials() {
    try {
        const response = await api.getReviews(1, 50);
        
        if (response.success && response.reviews.length > 0) {
            const reviews = response.reviews;
            const selectedReviews = [];
            const usedIndices = new Set();
            
            while (selectedReviews.length < 3 && selectedReviews.length < reviews.length) {
                const randomIndex = Math.floor(Math.random() * reviews.length);
                if (!usedIndices.has(randomIndex)) {
                    usedIndices.add(randomIndex);
                    selectedReviews.push(reviews[randomIndex]);
                }
            }
            
            renderTestimonials(selectedReviews);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des temoignages:', error);
    }
}

function renderTestimonials(reviews) {
    const container = document.getElementById('testimonials');
    
    container.innerHTML = reviews.map(review => {
        return `
            <div class="bg-deepblack/50 border border-gold/20 rounded-2xl p-8">
                <div class="flex gap-1 mb-4">
                    ${renderStars(review.rating)}
                </div>
                <p class="text-white/90 mb-6 italic leading-relaxed">
                    "${review.comment.length > 150 ? review.comment.substring(0, 150) + '...' : review.comment}"
                </p>
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                        <span class="text-gold font-serif text-lg">${review.userName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <div class="text-white font-medium">${review.userName}</div>
                        <div class="text-white/60 text-sm">Client ${review.verified ? 'verifie' : 'regulier'}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    setTimeout(() => feather.replace(), 100);
}

function renderStars(rating) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars.push('<i data-feather="star" class="text-gold fill-current" width="20" height="20"></i>');
        } else {
            stars.push('<i data-feather="star" class="text-gold/30" width="20" height="20"></i>');
        }
    }
    return stars.join('');
}

// Charger tout au chargement de la page
document.addEventListener('DOMContentLoaded', async function(){
    loadSignatureDishes();
    loadTestimonials();
    
});