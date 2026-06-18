class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background: linear-gradient(to bottom, rgba(92, 64, 51, 0.1), #0A0A0A);
                    border-top: 1px solid rgba(212, 175, 55, 0.2);
                }
                
                footer {
                    max-width: 1440px;
                    margin: 0 auto;
                    padding: 4rem 2rem 2rem;
                    color: rgba(255, 255, 255, 0.9);
                }
                
                .footer-main {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 3rem;
                    margin-bottom: 3rem;
                    padding-bottom: 3rem;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
                }
                
                .footer-section h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.5rem;
                    color: #D4AF37;
                    margin-bottom: 1.5rem;
                    font-weight: 700;
                }
                
                .footer-about p {
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.8;
                    margin-bottom: 1.5rem;
                }
                
                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .footer-links li {
                    margin-bottom: 0.75rem;
                }
                
                .footer-links a {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .footer-links a:hover {
                    color: #D4AF37;
                    padding-left: 5px;
                }
                
                .footer-links a:hover svg {
                    transform: translateX(3px);
                    stroke: #D4AF37;
                }
                
                .footer-links svg {
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                    stroke: rgba(212, 175, 55, 0.5);
                }
                
                .contact-info {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .contact-info li {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .contact-info svg {
                    color: #D4AF37;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                
                .social-links {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
                
                .social-links a {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #D4AF37;
                    transition: all 0.3s ease;
                }
                
                .social-links a:hover {
                    background: #D4AF37;
                    color: #0A0A0A;
                    transform: translateY(-3px);
                    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
                }
                
                .footer-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.9rem;
                }
                
                .footer-legal {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                }
                
                .footer-legal a {
                    color: rgba(255, 255, 255, 0.5);
                    text-decoration: none;
                    transition: color 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .footer-legal a:hover {
                    color: #D4AF37;
                }
                
                .footer-legal a svg {
                    width: 14px;
                    height: 14px;
                    stroke: currentColor;
                }
                
                .hours-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .hours-list li {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .hours-list li:last-child {
                    border-bottom: none;
                }
                
                .hours-list .day {
                    font-weight: 500;
                }
                
                .hours-list .time {
                    color: #D4AF37;
                }
                
                @media (max-width: 768px) {
                    footer {
                        padding: 3rem 1.5rem 1.5rem;
                    }
                    
                    .footer-main {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    
                    .footer-bottom {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .footer-legal {
                        justify-content: center;
                    }
                }
            </style>
            
            <footer>
                <div class="footer-main">
                    <!-- About Section -->
                    <div class="footer-section footer-about">
                        <h3>Délices Exotiques</h3>
                        <p>Une expérience gastronomique unique fusionnant traditions africaines et techniques modernes. Récompensé de 3 étoiles Michelin.</p>
                    </div>
                    
                    <!-- Quick Links -->
                    <div class="footer-section">
                        <h3>Navigation</h3>
                        <ul class="footer-links">
                            <li>
                                <a href="/">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                    Accueil
                                </a>
                            </li>
                            <li>
                                <a href="/history">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                                    </svg>
                                    Notre Histoire
                                </a>
                            </li>
                            <li>
                                <a href="/menu">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                        <path d="M7 2v20"></path>
                                        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                                    </svg>
                                    Notre Carte
                                </a>
                            </li>
                            <li>
                                <a href="/reservation">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                        <line x1="16" x2="16" y1="2" y2="6"></line>
                                        <line x1="8" x2="8" y1="2" y2="6"></line>
                                        <line x1="3" x2="21" y1="10" y2="10"></line>
                                    </svg>
                                    Réservation
                                </a>
                            </li>
                            <li>
                                <a href="/events">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                    Evénements
                                </a>
                            </li>
                            <li>
                                <a href="/contact">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="/about">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    À propos
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    <!-- Contact Info -->
                    <div class="footer-section">
                        <h3>Contact</h3>
                        <ul class="contact-info">
                            <li>
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>123 Avenue Bastos, Yaoundé</span>
                            </li>
                            <li>
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <span>+237 629 61 68 01</span>
                            </li>
                            <li>
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <span>delices-exotiques@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                    
                    <!-- Opening Hours -->
                    <div class="footer-section">
                        <h3>Horaires</h3>
                        <ul class="hours-list">
                            <li>
                                <span class="day">Lun - Ven</span>
                                <span class="time">12h - 14h30 - 19h - 23h</span>
                            </li>
                            <li>
                                <span class="day">Samedi</span>
                                <span class="time">19h - 23h30</span>
                            </li>
                            <li>
                                <span class="day">Dimanche</span>
                                <span class="time">12h - 15h - 19h - 22h</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <!-- Bottom Bar -->
                <div class="footer-bottom">
                    <div>
                        <p>&copy; 2025 Délices Exotiques. Tous droits réservés.</p>
                    </div>
                    <div class="footer-legal">
                        <a href="/privacy">
                            <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                            Politique de confidentialité
                        </a>
                        <a href="/terms">
                            <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Conditions générales
                        </a>
                        <a href="/cookies">
                            <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d=" M12 2 a10 10 0 1 0 9.5 7 a3 3 0 0 1 -3 -3 a3 3 0 0 1 -3 -3 a10 10 0 0 0 -3.5 -1 z " />
                                <circle cx="8.5" cy="11" r="0.9" />
                                <circle cx="12" cy="9" r="0.9" />
                                <circle cx="14.5" cy="12.5" r="0.9" />
                            </svg>
                            Cookies
                        </a>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('custom-footer', CustomFooter);