const fs = require('fs').promises;
const path = require('path');

const MENUS_FILE = path.join(__dirname,'../..', 'data', 'menus.json');

// S'assurer que le dossier data existe
async function ensureDataDir() {
    const dataDir = path.join(__dirname, '../..', 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Charger les menus
async function loadMenus() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(MENUS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Sauvegarder les menus
async function saveMenus(menus) {
    await ensureDataDir();
    await fs.writeFile(MENUS_FILE, JSON.stringify(menus, null, 2));
}

// Obtenir tous les menus
async function getAllMenus() {
    const menus = await loadMenus();
    return menus;
}

// Obtenir les menus disponibles seulement
async function getAvailableMenus() {
    const menus = await loadMenus();
    return menus.filter(menu => menu.available);
}

// Obtenir un menu par ID
async function getMenuById(menuId) {
    const menus = await loadMenus();
    return menus.find(menu => menu.id === menuId);
}

// Créer un nouveau menu
async function createMenu(menuData) {
    const menus = await loadMenus();
    
    const newMenu = {
        id: 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: menuData.name,
        description: menuData.description,
        category: menuData.category,
        price: parseFloat(menuData.price),
        image: menuData.image || null,
        available: menuData.available !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    menus.push(newMenu);
    await saveMenus(menus);
    
    return newMenu;
}

// Mettre à jour un menu
async function updateMenu(menuId, updates) {
    const menus = await loadMenus();
    const menuIndex = menus.findIndex(menu => menu.id === menuId);
    
    if (menuIndex === -1) {
        throw new Error('Menu non trouvé');
    }

    menus[menuIndex] = {
        ...menus[menuIndex],
        ...updates,
        id: menuId, // Garder l'ID original
        updatedAt: new Date().toISOString()
    };

    await saveMenus(menus);
    return menus[menuIndex];
}

// Supprimer un menu
async function deleteMenu(menuId) {
    const menus = await loadMenus();
    const filteredMenus = menus.filter(menu => menu.id !== menuId);
    
    if (filteredMenus.length === menus.length) {
        throw new Error('Menu non trouvé');
    }

    await saveMenus(filteredMenus);
    return true;
}

// Basculer la disponibilité d'un menu
async function toggleMenuAvailability(menuId) {
    const menus = await loadMenus();
    const menu = menus.find(m => m.id === menuId);
    
    if (!menu) {
        throw new Error('Menu non trouvé');
    }

    menu.available = !menu.available;
    menu.updatedAt = new Date().toISOString();
    
    await saveMenus(menus);
    return menu;
}

// Obtenir les menus par catégorie
async function getMenusByCategory(category) {
    const menus = await loadMenus();
    return menus.filter(menu => menu.category === category && menu.available);
}

module.exports = {
    getAllMenus,
    getAvailableMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    toggleMenuAvailability,
    getMenusByCategory
};