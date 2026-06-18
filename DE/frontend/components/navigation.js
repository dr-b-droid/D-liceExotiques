class CustomNavigation extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: rgba(10, 10, 10, 0.95);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
                    transition: all 0.3s ease;
                }
                
                :host(.scrolled) {
                    background: rgba(10, 10, 10, 0.98);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }
                
                nav {
                    max-width: 1440px;
                    margin: 0 auto;
                    padding: 1.25rem 2rem;
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    gap: 2rem;
                    align-items: center;
                    position: relative;
                }
                
                .logo {
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                    z-index: 1001;
                    height: 47.5px;
                }
                
                .logo img {
                    height: 100%;
                    width: auto;
                    max-width: 400px;
                    object-fit: contain;
                    transition: filter 0.3s ease;
                    scale: 4;
                    margin-left: 50px;
                }
                
                .logo:hover {
                    transform: scale(1.05);
                    opacity: 0.9;
                }
                
                .logo:hover img {
                    filter: brightness(1.1);
                }
                
                .nav-links {
                    display: flex;
                    gap: 2rem;
                    align-items: center;
                    justify-content: center;
                }
                
                .nav-links a {
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    font-weight: 500;
                    position: relative;
                    transition: color 0.3s ease;
                    white-space: nowrap;
                    font-size: 0.95rem;
                }
                
                .nav-links a:hover {
                    color: #D4AF37;
                }
                
                .nav-links a::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: #D4AF37;
                    transition: width 0.3s ease;
                }
                
                .nav-links a:hover::after {
                    width: 100%;
                }
                
                /* Container pour séparer les liens et le user menu */
                
                .nav-right {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                }
                
                /* User Menu */
                .user-menu {
                    position: relative;
                }
                
                .user-button {
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    color: #D4AF37;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .user-button:hover {
                    background: rgba(212, 175, 55, 0.2);
                    transform: scale(1.05);
                }
                
                .user-initials {
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                
                .user-dropdown {
                    position: absolute;
                    top: calc(100% + 10px);
                    right: 0;
                    background: rgba(10, 10, 10, 0.98);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    border-radius: 12px;
                    min-width: 220px;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(10px);
                }
                
                .user-dropdown.active {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                
                .user-dropdown::before {
                    content: '';
                    position: absolute;
                    top: -6px;
                    right: 12px;
                    width: 12px;
                    height: 12px;
                    background: rgba(10, 10, 10, 0.98);
                    border-left: 1px solid rgba(212, 175, 55, 0.3);
                    border-top: 1px solid rgba(212, 175, 55, 0.3);
                    transform: rotate(45deg);
                }
                
                .user-info {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                }
                
                .user-name {
                    color: #D4AF37;
                    font-weight: 600;
                    font-size: 1rem;
                    margin-bottom: 4px;
                }
                
                .user-email {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.85rem;
                }
                
                .user-dropdown a,
                .user-dropdown button {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 20px;
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                    width: 100%;
                    background: none;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    font-family: inherit;
                }
                
                .user-dropdown a:hover,
                .user-dropdown button:hover {
                    background: rgba(212, 175, 55, 0.1);
                    color: #D4AF37;
                }
                
                .dropdown-divider {
                    height: 1px;
                    background: rgba(212, 175, 55, 0.2);
                    margin: 0;
                }
                
                /* Mobile Menu Button */
                .mobile-menu-btn {
                    display: none;
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    color: #D4AF37;
                    width: 44px;
                    height: 44px;
                    border-radius: 8px;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 998;
                    position: relative;
                }
                
                .mobile-menu-btn:hover {
                    background: rgba(212, 175, 55, 0.2);
                }
                
                .mobile-menu-btn svg {
                    width: 24px;
                    height: 24px;
                }
                
                /* Mobile Menu Overlay */
                .mobile-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        135deg,
                        rgba(0, 0, 0, 0.85) 0%,
                        rgba(10, 10, 10, 0.90) 50%,
                        rgba(0, 0, 0, 0.85) 100%
                    );
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    z-index: 999;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                                visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .mobile-menu-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                
               
                .mobile-menu-overlay::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(212, 175, 55, 0.02) 0%, transparent 50%);
                    pointer-events: none;
                }
                
                /* Mobile Menu Sidebar */
                .mobile-menu {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 320px;
                    max-width: 85vw;
                    height: 100vh;
                    background: linear-gradient(
                        180deg,
                        rgba(10, 10, 10, 0.98) 0%,
                        rgba(15, 15, 15, 0.98) 100%
                    );
                    border-left: 1px solid rgba(212, 175, 55, 0.3);
                    z-index: 1000;
                    transform: translateX(100%);
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow-y: auto;
                    box-shadow: -20px 0 60px rgba(0, 0, 0, 0.6),
                                -5px 0 20px rgba(212, 175, 55, 0.1);
                }
                
                .mobile-menu::-webkit-scrollbar {
                        width: 8px;
                    }

                .mobile-menu::-webkit-scrollbar-track {
                    background: #0A0A0A;
                }

                .mobile-menu::-webkit-scrollbar-thumb {
                    background: #D4AF37;
                    border-radius: 4px;
                }


                .mobile-menu::selection {
                    background: #D4AF37;
                    color: #0A0A0A;
                }

                
                .mobile-menu-overlay.active .mobile-menu {
                    transform: translateX(0);
                }
                
                .mobile-menu-header {
                    padding: 2rem 1.5rem;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .mobile-menu-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #D4AF37;
                }
                
                .mobile-menu-close {
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    color: #D4AF37;
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .mobile-menu-close:hover {
                    background: rgba(212, 175, 55, 0.2);
                }
                
                .mobile-menu-links {
                    display: flex;
                    flex-direction: column;
                    padding: 1rem 0;
                }
                
                .mobile-menu-links a {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 1rem 1.5rem;
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    transition: all 0.3s ease;
                    font-size: 1rem;
                    border-left: 3px solid transparent;
                }
                
                .mobile-menu-links a:hover {
                    background: rgba(212, 175, 55, 0.1);
                    border-left-color: #D4AF37;
                    color: #D4AF37;
                }
                
                .mobile-user-section {
                    padding: 1.5rem;
                    border-top: 1px solid rgba(212, 175, 55, 0.2);
                    margin-top: auto;
                }
                
                .mobile-user-info {
                    background: rgba(212, 175, 55, 0.05);
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                }
                
                .mobile-user-name {
                    color: #D4AF37;
                    font-weight: 600;
                    font-size: 1rem;
                    margin-bottom: 4px;
                }
                
                .mobile-user-email {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.85rem;
                }
                
                .mobile-user-links a,
                .mobile-user-links button {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                    width: 100%;
                    background: none;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    font-family: inherit;
                    border-radius: 8px;
                }
                
                .mobile-user-links a:hover,
                .mobile-user-links button:hover {
                    background: rgba(212, 175, 55, 0.1);
                    color: #D4AF37;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    nav {
                        padding: 1rem 1.5rem;
                        grid-template-columns: auto auto;
                        gap: 1rem;
                    }
                    
                    .logo {
                        height: 55px;
                        
                    }
                    
                    .logo img {
                        max-width: 300px;
                    }
                    
                    .nav-center {
                        display: none;
                    }
                    
                    .nav-right {
                        gap: 1rem;
                    }
                    
                    .user-menu {
                        display: none;
                    }
                    
                    .mobile-menu-btn {
                        display: flex;
                    }
                }
                
                @media (max-width: 480px) {
                    nav {
                        padding: 0.875rem 1rem;
                    }
                    
                    .logo {
                        height: 45px;
                        
                    }
                    
                    .logo img {
                        max-width: 240px;
                    }
                }
                
                @media (min-width: 769px) and (max-width: 1024px) {
                    .logo {
                        height: 50px;
                    }       
                    .logo img {
                        max-width: 350px;
                        scale:3;
                        margin-left: 5px;
                    }
                }
            </style>
            
            <nav>
                <a href="/" class="logo logo-image">
                    <img src="/assets/imgs/logo-text.png" alt="Délices Exotiques"/>
                </a>
                <div class="nav-center">
                    <div class="nav-links">
                        <a href="/" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Accueil
                        </a>
                        <a href="/history" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                            </svg>
                            Notre Histoire
                        </a>
                        <a href="/menu" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                <path d="M7 2v20"></path>
                                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                            </svg>
                            La Carte
                        </a>
                        <a href="/reservation" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                <line x1="16" x2="16" y1="2" y2="6"></line>
                                <line x1="8" x2="8" y1="2" y2="6"></line>
                                <line x1="3" x2="21" y1="10" y2="10"></line>
                            </svg>
                            Réservation
                        </a>
                        <a href="/events" style="display: flex; align-items: center; gap: 8px;">
                            <svg   width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            Evénements
                        </a>
                        <a href="/contact" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Contact
                        </a>
                        <a href="/about" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            À propos
                        </a>
                    </div> 
                </div>
                
                <div class="nav-right">
                    <div class="user-menu">
                        <button class="user-button" id="userButton">
                            <svg id="userIcon"   width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span id="userInitials" class="user-initials" style="display: none;"></span>
                        </button>
                        <div class="user-dropdown" id="userDropdown"></div>
                    </div>
                    
                    <button class="mobile-menu-btn" id="mobileMenuBtn">
                        <svg   width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </nav>
            
            <div class="mobile-menu-overlay" id="mobileMenuOverlay">
                <div class="mobile-menu">
                    <div class="mobile-menu-header">
                        <div class="mobile-menu-title">Menu</div>
                        <button class="mobile-menu-close" id="mobileMenuClose">
                            <svg  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="mobile-menu-links">
                        <a href="/" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Accueil
                        </a>
                        <a href="/history" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                            </svg>
                            Notre Histoire
                        </a>
                        <a href="/menu" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                <path d="M7 2v20"></path>
                                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                            </svg>
                            La Carte
                        </a>
                        <a href="/reservation" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                <line x1="16" x2="16" y1="2" y2="6"></line>
                                <line x1="8" x2="8" y1="2" y2="6"></line>
                                <line x1="3" x2="21" y1="10" y2="10"></line>
                            </svg>
                            Réservation
                        </a>
                        <a href="/events" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            Evénements
                        </a>
                        <a href="/contact" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Contact
                        </a>
                        <a href="/about" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            À propos
                        </a>
                    </div>
                    <div class="mobile-user-section">
                        <div class="mobile-user-links" id="mobileUserLinks"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
        this.checkAuthStatus();
        this.setupAuthListener();
        this.handleScroll = this.handleScroll.bind(this);
        window.addEventListener('scroll', this.handleScroll);
    }
    
    setupEventListeners() {
        // User button desktop
        const userButton = this.shadowRoot.getElementById('userButton');
        const userDropdown = this.shadowRoot.getElementById('userDropdown');
        
        userButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Fermer le dropdown si on clique ailleurs
        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });
        
        // Mobile menu button
        const mobileMenuBtn = this.shadowRoot.getElementById('mobileMenuBtn');
        const mobileMenuOverlay = this.shadowRoot.getElementById('mobileMenuOverlay');
        const mobileMenuClose = this.shadowRoot.getElementById('mobileMenuClose');
        
        mobileMenuBtn.addEventListener('click', () => {
            this.openMobileMenu();
        });
        
        mobileMenuClose.addEventListener('click', () => {
            this.closeMobileMenu();
        });
        
        // Fermer en cliquant sur l'overlay
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                this.closeMobileMenu();
            }
        });
        
        // Fermer le menu mobile quand on clique sur un lien
        const mobileLinks = this.shadowRoot.querySelectorAll('.mobile-menu-links a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }
    
    handleScroll() {
        if (window.scrollY > 50) {
            this.classList.add('scrolled');
        } else {
            this.classList.remove('scrolled');
        }
    }
    
    async checkAuthStatus() {
        // Attendre que authManager soit disponible
        let attempts = 0;
        const maxAttempts = 20;
        
        const waitForAuthManager = () => {
            if (window.authManager) {
                this.updateAuthUI();
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(waitForAuthManager, 100);
            }
        };
        
        waitForAuthManager();
    }
    
    openMobileMenu() {
        const mobileMenuOverlay = this.shadowRoot.getElementById('mobileMenuOverlay');
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeMobileMenu() {
        const mobileMenuOverlay = this.shadowRoot.getElementById('mobileMenuOverlay');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    setupAuthListener() {
        // Ecouter les changements d'état d'authentification
        document.addEventListener('authStateChanged', (e) => {
            this.updateAuthUI(e.detail);
        });
    }
    
    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    
    updateAuthUI(authState) {
        // Si authState n'est pas fourni, essayer de le récupérer de authManager
        if (!authState && window.authManager) {
            authState = {
                isAuthenticated: window.authManager.isAuthenticated(),
                user: window.authManager.getUser()
            };
        }
        
        const userDropdown = this.shadowRoot.getElementById('userDropdown');
        const mobileUserLinks = this.shadowRoot.getElementById('mobileUserLinks');
        const userIcon = this.shadowRoot.getElementById('userIcon');
        const userInitials = this.shadowRoot.getElementById('userInitials');
        
        if (authState && authState.isAuthenticated && authState.user) {
            // Utilisateur connecté
            const initials = this.getInitials(authState.user.name || authState.user.email);
            userInitials.textContent = initials;
            userInitials.style.display = 'block';
            userIcon.style.display = 'none';
            
            // Desktop dropdown
            userDropdown.innerHTML = `
                <div class="user-info">
                    <div class="user-name">${authState.user.name || 'Utilisateur'}</div>
                    <div class="user-email">${authState.user.email}</div>
                </div>
                <a href="/profile">
                    <svg   width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Mon Profil
                </a>
                <div class="dropdown-divider"></div>
                <button id="logoutBtn">
                    <svg   width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Déconnexion
                </button>
            `;
            
            // Mobile menu
            mobileUserLinks.innerHTML = `
                <div class="mobile-user-info">
                    <div class="mobile-user-name">${authState.user.name || 'Utilisateur'}</div>
                    <div class="mobile-user-email">${authState.user.email}</div>
                </div>
                <a href="/profile">
                    <svg   width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Mon Profil
                </a>
                <button id="mobileLogoutBtn">
                    <svg   width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Déconnexion
                </button>
            `;
            
            // Event listeners pour logout
            const logoutBtn = this.shadowRoot.getElementById('logoutBtn');
            const mobileLogoutBtn = this.shadowRoot.getElementById('mobileLogoutBtn');
            
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.handleLogout());
            }
            
            if (mobileLogoutBtn) {
                mobileLogoutBtn.addEventListener('click', () => {
                    this.closeMobileMenu();
                    this.handleLogout();
                });
            }
            
        } else {
            // Utilisateur non connecté
            userInitials.style.display = 'none';
            userIcon.style.display = 'block';
            
            // Desktop dropdown
            userDropdown.innerHTML = `
                <a href="/auth?form=login">
                    <svg   width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    Connexion
                </a>
                <div class="dropdown-divider"></div>
                <a href="/auth?form=signup">
                    <svg   width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    Inscription
                </a>
            `;
            
            // Mobile menu
            mobileUserLinks.innerHTML = `
                <a href="/auth?form=login">
                    <svg   width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    Connexion
                </a>
                <a href="/auth?form=signup">
                    <svg   width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    Inscription
                </a>
            `;
        }
    }
    
    async handleLogout() {
        if (window.authManager) {
            const result = await window.authManager.logout();
            if (!result.success) {
                console.error('Erreur lors de la déconnexion:', result.message);
                notify.info('Erreur lors de la déconnexion. Veuillez réessayer.');
            }
        } else {
            console.error('AuthManager non disponible');
            window.location.href = '/';
        }
    }
    
    disconnectedCallback() {
        window.removeEventListener('scroll', this.handleScroll);
    }
}

customElements.define('custom-navigation', CustomNavigation);