/**
 * Utils.js - Système de notifications et fonctions utilitaires
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Créer le conteneur de notifications s'il n'existe pas
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    }

    /**
     * Afficher une notification
     * @param {string} message - Le message à afficher
     * @param {string} type - Le type de notification: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Durée d'affichage en ms (défaut: 4000)
     */
    show(message, type = 'info', duration = 4000) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);

        // Animation d'entrée avec fade-in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        // Auto-fermeture
        if (duration > 0) {
            setTimeout(() => {
                this.close(notification);
            }, duration);
        }

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            min-width: 320px;
            max-width: 450px;
            padding: 18px 22px;
            border-radius: 16px;
            display: flex;
            align-items: flex-start;
            gap: 14px;
            transform: translateX(420px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            pointer-events: auto;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        `;

        const config = this.getConfig(type);
        
        notification.style.background = config.background;
        notification.style.border = config.border;

        // Ajouter un effet de brillance sur le bord
        const shine = document.createElement('div');
        shine.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 16px;
            pointer-events: none;
            background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
        `;
        notification.appendChild(shine);

        const content = document.createElement('div');
        content.style.cssText = 'position: relative; z-index: 1; display: flex; align-items: flex-start; gap: 14px; width: 100%;';
        content.innerHTML = `
            <div style="flex-shrink: 0; margin-top: 2px;">
                ${config.icon}
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="color: ${config.textColor}; font-weight: 600; margin-bottom: 4px; font-size: 14px;">
                    ${config.title}
                </div>
                <div style="color: ${config.messageColor}; font-size: 13px; line-height: 1.5;">
                    ${message}
                </div>
            </div>
            <button class="close-btn" style="
                flex-shrink: 0;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: ${config.closeColor};
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.2s;
            ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        notification.appendChild(content);

        // Effet hover sur le bouton de fermeture
        const closeBtn = content.querySelector('.close-btn');
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            closeBtn.style.transform = 'scale(1.1)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            closeBtn.style.transform = 'scale(1)';
        });
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close(notification);
        });

        notification.addEventListener('click', () => {
            this.close(notification);
        });

        return notification;
    }

    getConfig(type) {
        const configs = {
            success: {
                title: 'Succès',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid rgba(16, 185, 129, 0.6)',
                textColor: '#10b981',
                messageColor: 'rgba(255, 255, 255, 0.9)',
                closeColor: '#10b981',
                icon: `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                `
            },
            error: {
                title: 'Erreur',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.6)',
                textColor: '#ef4444',
                messageColor: 'rgba(255, 255, 255, 0.9)',
                closeColor: '#ef4444',
                icon: `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                `
            },
            warning: {
                title: 'Attention',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '2px solid rgba(245, 158, 11, 0.6)',
                textColor: '#f59e0b',
                messageColor: 'rgba(255, 255, 255, 0.9)',
                closeColor: '#f59e0b',
                icon: `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                `
            },
            info: {
                title: 'Information',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '2px solid rgba(59, 130, 246, 0.6)',
                textColor: '#3b82f6',
                messageColor: 'rgba(255, 255, 255, 0.9)',
                closeColor: '#3b82f6',
                icon: `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                `
            }
        };

        return configs[type] || configs.info;
    }

    close(notification) {
        notification.style.transform = 'translateX(420px) scale(0.95)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }

    // Méthodes de commodité
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    confirm(message, title = 'Confirmation') {
        return new Promise((resolve) => {
            const overlay = this.createOverlay();
            const dialog = this.createDialog(title, message, [
                {
                    text: 'Annuler',
                    style: 'cancel',
                    onClick: () => {
                        this.closeDialog(overlay);
                        resolve(false);
                    }
                },
                {
                    text: 'Confirmer',
                    style: 'confirm',
                    onClick: () => {
                        this.closeDialog(overlay);
                        resolve(true);
                    }
                }
            ]);

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // Animation d'entrée
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                dialog.style.transform = 'scale(1)';
                dialog.style.opacity = '1';
            });
        });
    }

    prompt(message, defaultValue = '', title = 'Saisie') {
        return new Promise((resolve) => {
            const overlay = this.createOverlay();
            const dialog = this.createDialog(title, message, [
                {
                    text: 'Annuler',
                    style: 'cancel',
                    onClick: () => {
                        this.closeDialog(overlay);
                        resolve(null);
                    }
                },
                {
                    text: 'Valider',
                    style: 'confirm',
                    onClick: () => {
                        const input = dialog.querySelector('input');
                        this.closeDialog(overlay);
                        resolve(input.value);
                    }
                }
            ], defaultValue);

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // Animation d'entrée
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                dialog.style.transform = 'scale(1)';
                dialog.style.opacity = '1';
                
                // Focus sur l'input
                const input = dialog.querySelector('input');
                if (input) {
                    input.focus();
                    input.select();
                }
            });
        });
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        return overlay;
    }

    createDialog(title, message, buttons, inputValue = null) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #5C4033;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 2px solid rgba(232, 229, 16, 0.87);
            border-radius: 20px;
            padding: 28px;
            min-width: 400px;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
            overflow: hidden;
        `;

        // Effet de brillance
        const shine = document.createElement('div');
        shine.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.03) 100%);
            pointer-events: none;
        `;
        dialog.appendChild(shine);

        const content = document.createElement('div');
        content.style.cssText = 'position: relative; z-index: 1;';

        // Titre
        const titleEl = document.createElement('div');
        titleEl.style.cssText = `
            color: #e1b815ff;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        titleEl.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>${title}</span>
        `;
        content.appendChild(titleEl);

        // Message
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            color: rgba(255, 255, 255, 0.9);
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 24px;
        `;
        messageEl.textContent = message;
        content.appendChild(messageEl);

        // Input si nécessaire
        if (inputValue !== null) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = inputValue;
            input.style.cssText = `
                width: 100%;
                padding: 12px 16px;
                background: #5C4033;
                border: 2px solid rgba(168, 115, 23, 0.43);
                border-radius: 10px;
                color: #ffffff;
                font-size: 14px;
                margin-bottom: 24px;
                outline: none;
                transition: all 0.2s;
                box-sizing: border-box;
            `;
            input.addEventListener('focus', () => {
                input.style.borderColor = '#D4AF37';
                input.style.background = 'rgba(255, 255, 255, 0.08)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = 'rgba(246, 230, 59, 0.3)';
                input.style.background = 'rgba(255, 255, 255, 0.05)';
            });
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const confirmBtn = buttons.find(b => b.style === 'confirm');
                    if (confirmBtn) confirmBtn.onClick();
                }
            });
            content.appendChild(input);
        }

        // Boutons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        `;

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            
            const styles = {
                cancel: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    hoverBg: 'rgba(255, 255, 255, 0.1)'
                },
                confirm: {
                    background: 'rgba(246, 196, 59, 0.16)',
                    border: '2px solid rgba(246, 215, 59, 0.6)',
                    color: '#D4AF37',
                    hoverBg: 'rgba(246, 237, 59, 0.3)'
                }
            };

            const style = styles[btn.style];
            button.style.cssText = `
                padding: 10px 24px;
                background: ${style.background};
                border: ${style.border};
                border-radius: 10px;
                color: ${style.color};
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                outline: none;
            `;

            button.addEventListener('mouseenter', () => {
                button.style.background = style.hoverBg;
                button.style.transform = 'translateY(-1px)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background = style.background;
                button.style.transform = 'translateY(0)';
            });
            button.addEventListener('click', btn.onClick);

            buttonContainer.appendChild(button);
        });

        content.appendChild(buttonContainer);
        dialog.appendChild(content);

        return dialog;
    }

    closeDialog(overlay) {
        const dialog = overlay.querySelector('div');
        overlay.style.opacity = '0';
        if (dialog) {
            dialog.style.transform = 'scale(0.9)';
            dialog.style.opacity = '0';
        }
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

// Instance globale
const notify = new NotificationSystem();

// Exporter pour utilisation globale
window.notify = notify;



// ============================================
// WEB COMPONENTS - INFORMATIONS RESTAURANT
// ============================================

// Configuration des informations du restaurant
const RESTAURANT_INFO = {
    name: 'Délices Exotiques',
    phone: '+237 629 61 68 01',
    email: 'delices-exotiques@gmail.com',
    address: '123 Avenue Bastos, Yaoundé',
    city: 'Yaoundé',
    country: 'Cameroun',
    hours: {
        weekdays: '12h - 14h30 - 19h - 23h',
        saturday: '19h - 23h30',
        sunday: '12h - 15h - 19h - 22h'
    }
};

// Component: Numéro de téléphone du restaurant
class RestaurantPhone extends HTMLElement {
    connectedCallback() {
        const clickable = this.hasAttribute('clickable');
        const iconOnly = this.hasAttribute('icon-only');
        const showIcon = this.hasAttribute('show-icon') || iconOnly;
        
        if (clickable) {
            this.innerHTML = `
                <a href="tel:${RESTAURANT_INFO.phone}" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: inherit;
                    text-decoration: none;
                    transition: color 0.3s ease;
                " onmouseover="this.style.color='#D4AF37'" onmouseout="this.style.color='inherit'">
                    ${showIcon ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>` : ''}
                    ${iconOnly ? '' : RESTAURANT_INFO.phone}
                </a>
            `;
        } else {
            this.innerHTML = `
                <span style="display: inline-flex; align-items: center; gap: 8px;">
                    ${showIcon ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>` : ''}
                    ${iconOnly ? '' : RESTAURANT_INFO.phone}
                </span>
            `;
        }
    }
}

// Component: Email du restaurant
class RestaurantEmail extends HTMLElement {
    connectedCallback() {
        const clickable = this.hasAttribute('clickable');
        const iconOnly = this.hasAttribute('icon-only');
        const showIcon = this.hasAttribute('show-icon') || iconOnly;
        
        if (clickable) {
            this.innerHTML = `
                <a href="${RESTAURANT_INFO.email}" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: inherit;
                    text-decoration: none;
                    transition: color 0.3s ease;
                " onmouseover="this.style.color='#D4AF37'" onmouseout="this.style.color='inherit'">
                    ${showIcon ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>` : ''}
                    ${iconOnly ? '' : RESTAURANT_INFO.email}
                </a>
            `;
        } else {
            this.innerHTML = `
                <span style="display: inline-flex; align-items: center; gap: 8px;">
                    ${showIcon ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>` : ''}
                    ${iconOnly ? '' : RESTAURANT_INFO.email}
                </span>
            `;
        }
    }
}

// Component: Adresse du restaurant
class RestaurantAddress extends HTMLElement {
    connectedCallback() {
        const clickable = this.hasAttribute('clickable');
        const iconOnly = this.hasAttribute('icon-only');
        const showIcon = this.hasAttribute('show-icon') || iconOnly;
        const short = this.hasAttribute('short');
        
        const addressText = short ? `${RESTAURANT_INFO.address.split(',')[0]}, ${RESTAURANT_INFO.city}` : RESTAURANT_INFO.address;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RESTAURANT_INFO.address + ', ' + RESTAURANT_INFO.city)}`;
        
        if (clickable) {
            this.innerHTML = `
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: inherit;
                    text-decoration: none;
                    transition: color 0.3s ease;
                " onmouseover="this.style.color='#D4AF37'" onmouseout="this.style.color='inherit'">
                    ${showIcon ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>` : ''}
                    ${iconOnly ? '' : addressText}
                </a>
            `;
        } else {
            this.innerHTML = `
                <span style="display: inline-flex; align-items: center; gap: 8px;">
                    ${showIcon ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>` : ''}
                    ${iconOnly ? '' : addressText}
                </span>
            `;
        }
    }
}

// Component: Horaires d'ouverture
class RestaurantHours extends HTMLElement {
    connectedCallback() {
        const compact = this.hasAttribute('compact');
        const showIcon = this.hasAttribute('show-icon');
        
        if (compact) {
            this.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${showIcon ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>` : ''}
                    <span>Lun-Ven: ${RESTAURANT_INFO.hours.weekdays} | Sam: ${RESTAURANT_INFO.hours.saturday} | Dim: ${RESTAURANT_INFO.hours.sunday}</span>
                </div>
            `;
        } else {
            this.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${showIcon ? `<div style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #D4AF37;">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Horaires d'ouverture
                    </div>` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="font-weight: 500;">Lun - Ven</span>
                        <span style="color: #D4AF37;">${RESTAURANT_INFO.hours.weekdays}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="font-weight: 500;">Samedi</span>
                        <span style="color: #D4AF37;">${RESTAURANT_INFO.hours.saturday}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="font-weight: 500;">Dimanche</span>
                        <span style="color: #D4AF37;">${RESTAURANT_INFO.hours.sunday}</span>
                    </div>
                </div>
            `;
        }
    }
}

// Component: Carte de contact complète
class RestaurantContactCard extends HTMLElement {
    connectedCallback() {
        const theme = this.getAttribute('theme') || 'light';
        const bgColor = theme === 'dark' ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(10, 10, 10, 0.9)';
        const borderColor = 'rgba(212, 175, 55, 0.3)';
        
        this.innerHTML = `
            <div style="
                background: ${bgColor};
                border: 2px solid ${borderColor};
                border-radius: 16px;
                padding: 24px;
                color: ${textColor};
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            ">
                <h3 style="
                    font-family: 'Playfair Display', serif;
                    font-size: 24px;
                    color: #D4AF37;
                    margin: 0 0 20px 0;
                    font-weight: 700;
                ">${RESTAURANT_INFO.name}</h3>
                
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <svg width="20" height="20" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <a href="tel:${RESTAURANT_INFO.phone}" style="color: inherit; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#D4AF37'" onmouseout="this.style.color='${textColor}'">${RESTAURANT_INFO.phone}</a>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <svg width="20" height="20" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <a href="${RESTAURANT_INFO.email}" style="color: inherit; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#D4AF37'" onmouseout="this.style.color='${textColor}'">${RESTAURANT_INFO.email}</a>
                    </div>
                    
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <svg width="20" height="20" style="margin-top: 2px;" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <div>
                            <div>${RESTAURANT_INFO.address}</div>
                            <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">${RESTAURANT_INFO.city}, ${RESTAURANT_INFO.country}</div>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid ${borderColor}; padding-top: 16px; margin-top: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #D4AF37; font-weight: 600;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Horaires d'ouverture
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 14px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Lun - Ven</span>
                                <span style="color: #D4AF37; font-weight: 500;">${RESTAURANT_INFO.hours.weekdays}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Samedi</span>
                                <span style="color: #D4AF37; font-weight: 500;">${RESTAURANT_INFO.hours.saturday}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Dimanche</span>
                                <span style="color: #D4AF37; font-weight: 500;">${RESTAURANT_INFO.hours.sunday}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Enregistrer tous les Web Components
customElements.define('restaurant-phone', RestaurantPhone);
customElements.define('restaurant-email', RestaurantEmail);
customElements.define('restaurant-address', RestaurantAddress);
customElements.define('restaurant-hours', RestaurantHours);
customElements.define('restaurant-contact-card', RestaurantContactCard);

// ============================================
// UTILITAIRES SUPPLEMENTAIRES
// ============================================

const Utils = {
    formatDate(date, format = 'long') {
        const d = new Date(date);
        const options = {
            short: { day: 'numeric', month: 'short', year: 'numeric' },
            long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' }
        };
        return d.toLocaleDateString('fr-FR', options[format] || options.long);
    },

    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF'
        }).format(price);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            notify.success('Copié dans le presse-papiers');
            return true;
        } catch (err) {
            notify.error('Erreur lors de la copie');
            return false;
        }
    },

    getRestaurantInfo() {
        return { ...RESTAURANT_INFO };
    }
};

// Animations CSS
if (!document.getElementById('utils-animations')) {
    const style = document.createElement('style');
    style.id = 'utils-animations';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Instance globale
window.notify = notify;
window.Utils = Utils;
window.RESTAURANT_INFO = RESTAURANT_INFO;