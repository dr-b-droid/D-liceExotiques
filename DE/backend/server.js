const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/authRoute/authRoutes');
const menuRoutes = require('./routes/menuRoute/menuRoutes');
const adminRoutes = require('./routes/adminRoute/adminRoutes');
const reviewRoutes = require('./routes/reviewRoute/reviewRoutes');
const { attachUser } = require('./routes/authRoute/authMiddleware');
require("dotenv").config({path:".env"})

const app = express();
const PORT = process.env.PORT||3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration de la session
app.use(session({
    secret: process.env.SECRET||"12345678",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24h
    }
}));

// === SERVICE  FRONTEND ===
app.use(express.static(path.join(__dirname, '../frontend')));

// Pages HTML directes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/auth.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/auth.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/auth.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/profile.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/AboutUs.html'));
});

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/history.html'));
});

app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/menu.html'));
});

app.get('/reservation', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/reservation.html'));
});

app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/events.html'));

});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/terms.html'));
});

app.get('/cookies', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cookies.html'));
});

app.get('/verifyAdmin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/VerifyAdmin.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/contact.html'));
});


app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('/deleteAccount', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/deleteAccount.html'));
});

// Attacher l'utilisateur aux requêtes
app.use(attachUser);

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes des menus (publiques et admin)
app.use('/api', menuRoutes);
app.use('/api', reviewRoutes);

// Routes admin
app.use('/api/admin', adminRoutes);

// Route de test
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Serveur Délices Exotiques en ligne',
        timestamp: new Date().toISOString()
    });
});

// Route pour obtenir tous les utilisateurs (admin seulement)
app.get('/api/users', async (req, res) => {
    try {
        const userService = require('./routes/authRoute/userService');
        const users = await userService.getAllUsers();
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs'
        });
    }
});

// === GESTION DES ERREURS 404 ===
// Pour les routes API : renvoyer JSON
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route API non trouvée',
        path: req.path
    });
});

// Pour toutes les autres routes : afficher la page 404 HTML
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`
 ---------------------------------------------------
|                                                   |
|         DELICES EXOTIQUES - API                   |
|                                                   |
|   Serveur démarré sur le port ${PORT}             |
|   URL: http://localhost:${PORT}                   |
|                                                   |
|   Routes disponibles:                             |
|                                                   |
|   === AUTHENTIFICATION ===                        |
|   * POST /api/auth/signup                         |
|   * POST /api/auth/login                          |
|   * POST /api/auth/logout                         |
|   * GET  /api/auth/check-session                  |
|   * GET  /api/auth/me                             |
|   * PUT  /api/auth/update-profile                 |
|   * GET  /api/auth/user-data                      |
|                                                   |
|   === RESERVATIONS ===                            |
|   * GET  /api/auth/reservations                   |
|   * POST /api/auth/reservations                   |
|   * PUT  /api/auth/reservations/:id               |
|   * DEL  /api/auth/reservations/:id               |
|                                                   |
|   === COMMANDES ===                               |
|   * GET  /api/auth/orders                         |
|   * POST /api/auth/orders                         |
|   * PUT  /api/auth/orders/:id/status              |
|                                                   |
|   === EVENEMENTS ===                              |
|   * GET  /api/auth/events                         |
|   * POST /api/auth/events                         |
|   * PUT  /api/auth/events/:id/status              |
|                                                   |
|   === MENUS (PUBLIC) ===                          |
|   * GET  /api/menus                               |
|   * GET  /api/menus/category/:category            |
|   * GET  /api/menus/:menuId                       |
|                                                   |
|   === MENUS (ADMIN) ===                           |
|   * GET  /api/admin/menus                         |
|   * POST /api/admin/menus                         |
|   * PUT  /api/admin/menus/:id                     |
|   * DEL  /api/admin/menus/:id                     |
|   * PATCH /api/admin/menus/:id/toggle             |
|                                                   |
|   === AVIS ===                                    |
|   * GET  /api/reviews                             |
|   * GET  /api/reviews/stats                       |
|   * POST /api/reviews                             |
|   * POST /api/reviews/:id/like                    |
|   * GET  /api/reviews/can-review                  |
|   * POST /api/admin/reviews/:id/respond           |
|   * DEL  /api/admin/reviews/:id                   |
|                                                   |
|   === ADMIN ===                                   |
|   * GET  /api/admin/stats                         |
|   * GET  /api/admin/reservations                  |
|   * GET  /api/admin/reservations/pending          |
|   * PUT  /api/admin/reservations/:uid/:rid        |
|   * GET  /api/admin/orders                        |
|   * GET  /api/admin/orders/pending                |
|   * PUT  /api/admin/orders/:uid/:oid              |
|   * GET  /api/admin/events                        |
|   * GET  /api/admin/events/pending                |
|   * PUT  /api/admin/events/:uid/:eid              |
|   * GET  /api/admin/activities                    |
|                                                   |
|   === AUTRES ===                                  |
|   * GET  /api/health                              |
|   * GET  /api/users                               |
|                                                   |
 ---------------------------------------------------
`);
});

module.exports = app;