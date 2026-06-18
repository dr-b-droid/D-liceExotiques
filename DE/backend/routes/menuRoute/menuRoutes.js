const express = require('express');
const router = express.Router();
const menuService = require('./menuService.Js');

// Middleware pour vérifier les permissions admin
function requireAdmin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Authentification requise'
        });
    }
    next();
}

// ============= ROUTES PUBLIQUES (pour les clients) =============

// Obtenir tous les menus disponibles
router.get('/menus', async (req, res) => {
    try {
        const menus = await menuService.getAvailableMenus();
        res.json({
            success: true,
            menus
        });
    } catch (error) {
        console.error('Get menus error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des menus'
        });
    }
});

// Obtenir les menus par catégorie
router.get('/menus/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const menus = await menuService.getMenusByCategory(category);
        res.json({
            success: true,
            menus
        });
    } catch (error) {
        console.error('Get menus by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des menus'
        });
    }
});

// Obtenir un menu spécifique
router.get('/menus/:menuId', async (req, res) => {
    try {
        const { menuId } = req.params;
        const menu = await menuService.getMenuById(menuId);
        
        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menu non trouvé'
            });
        }

        res.json({
            success: true,
            menu
        });
    } catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du menu'
        });
    }
});

// ============= ROUTES ADMIN =============

// Obtenir tous les menus (y compris indisponibles) - Admin seulement
router.get('/admin/menus', requireAdmin, async (req, res) => {
    try {
        const menus = await menuService.getAllMenus();
        res.json({
            success: true,
            menus
        });
    } catch (error) {
        console.error('Get all menus error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des menus'
        });
    }
});

// Créer un nouveau menu - Admin seulement
router.post('/admin/menus', requireAdmin, async (req, res) => {
    try {
        const { name, description, category, price, image, available } = req.body;

        if (!name || !description || !category || !price) {
            return res.status(400).json({
                success: false,
                message: 'Nom, description, catégorie et prix requis'
            });
        }

        const validCategories = ['entrees', 'plats', 'desserts', 'boissons'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Catégorie invalide'
            });
        }

        const newMenu = await menuService.createMenu({
            name,
            description,
            category,
            price,
            image,
            available
        });

        res.status(201).json({
            success: true,
            message: 'Menu créé avec succès',
            menu: newMenu
        });
    } catch (error) {
        console.error('Create menu error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du menu'
        });
    }
});

// Mettre à jour un menu - Admin seulement
router.put('/admin/menus/:menuId', requireAdmin, async (req, res) => {
    try {
        const { menuId } = req.params;
        const updates = req.body;

        const updatedMenu = await menuService.updateMenu(menuId, updates);

        res.json({
            success: true,
            message: 'Menu mis à jour avec succès',
            menu: updatedMenu
        });
    } catch (error) {
        console.error('Update menu error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour du menu'
        });
    }
});

// Supprimer un menu - Admin seulement
router.delete('/admin/menus/:menuId', requireAdmin, async (req, res) => {
    try {
        const { menuId } = req.params;
        await menuService.deleteMenu(menuId);

        res.json({
            success: true,
            message: 'Menu supprimé avec succès'
        });
    } catch (error) {
        console.error('Delete menu error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la suppression du menu'
        });
    }
});

// Basculer la disponibilité d'un menu - Admin seulement
router.patch('/admin/menus/:menuId/toggle', requireAdmin, async (req, res) => {
    try {
        const { menuId } = req.params;
        const menu = await menuService.toggleMenuAvailability(menuId);

        res.json({
            success: true,
            message: 'Disponibilité mise à jour',
            menu
        });
    } catch (error) {
        console.error('Toggle menu error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour'
        });
    }
});

module.exports = router;