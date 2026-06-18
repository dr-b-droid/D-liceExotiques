const crypto = require('crypto');

class AdminAuthService {
    constructor() {
        // Codes admin
        this.adminCodes = new Map([
            ['ADMIN2025', { role: 'admin', name: 'Admin' }]
        ]);
        
        // Sessions admin actives
        this.adminSessions = new Map();
        
        // Durée de session : 7 heures
        this.SESSION_DURATION = 7 * 60 * 60 * 1000;
    }

    /**
     * Vérifie un code admin et crée une session
     */
    verifyAdminCode(code, userId, ipAddress) {
        const adminInfo = this.adminCodes.get(code);
        
        if (!adminInfo) {
            console.log(`[Admin] Tentative échouée - IP: ${ipAddress}`);
            return {
                success: false,
                message: 'Code administrateur invalide'
            };
        }

        // Générer un token de session unique
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + this.SESSION_DURATION;

        // Créer la session admin
        this.adminSessions.set(sessionToken, {
            token: sessionToken,
            userId: userId,
            role: adminInfo.role,
            ipAddress: ipAddress,
            expiresAt: expiresAt
        });

        console.log(`[Admin] Login réussi - User: ${userId}, IP: ${ipAddress}`);

        return {
            success: true,
            token: sessionToken,
            role: adminInfo.role,
            expiresAt: expiresAt
        };
    }

    /**
     * Vérifie si une session admin est valide
     */
    validateAdminSession(token, ipAddress) {
        const session = this.adminSessions.get(token);

        if (!session) {
            return { valid: false, message: 'Session introuvable' };
        }

        // Vérifier l'expiration
        if (Date.now() > session.expiresAt) {
            this.adminSessions.delete(token);
            return { valid: false, message: 'Session expirée' };
        }

        // Vérifier l'adresse IP
        if (session.ipAddress !== ipAddress) {
            this.adminSessions.delete(token);
            console.log(`[Admin] Alerte sécurité - IP mismatch`);
            return { valid: false, message: 'Violation de sécurité' };
        }

        return {
            valid: true,
            session: {
                userId: session.userId,
                role: session.role
            }
        };
    }

    /**
     * Déconnexion admin
     */
    logout(token) {
        const session = this.adminSessions.get(token);
        
        if (session) {
            console.log(`[Admin] Logout - User: ${session.userId}`);
            this.adminSessions.delete(token);
            return { success: true, message: 'Déconnexion réussie' };
        }

        return { success: false, message: 'Session introuvable' };
    }
}

module.exports = new AdminAuthService();