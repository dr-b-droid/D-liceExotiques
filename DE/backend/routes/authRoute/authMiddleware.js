// Middleware pour vérifier si l'utilisateur est authentifié
const requireAuth = (req, res, next) => {
    console.log('requireAuth - Session:', req.session ? {
        userId: req.session.userId,
        hasSession: true
    } : 'No session');
    
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé. Veuillez vous connecter.' 
    });
};

// Middleware pour attacher les infos utilisateur à la requête
const attachUser = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const userService = require('./userService');
            const user = await userService.getUserInfo(req.session.userId);
            
            if (user) {
                req.user = {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone || '',
                    loyaltyPoints: user.loyaltyPoints || 0
                };
                console.log('attachUser - User attached:', req.user.userId, req.user.name);
            } else {
                console.error('attachUser - User not found for userId:', req.session.userId);
            }
        } catch (error) {
            console.error('Error attaching user:', error);
        }
    } else {
        console.log('attachUser - No session or userId');
    }
    next();
};

module.exports = {
    requireAuth,
    attachUser
};