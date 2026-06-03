// ============================================================
// models/userModel.js
// Toutes les requêtes SQL concernant la table "users"
// ============================================================

const db = require('../config/db');

const UserModel = {

    /**
     * Trouver un utilisateur par son email
     * @param {string} email
     * @returns {Object|null} L'utilisateur trouvé ou null
     */
    trouverParEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
        const [rows] = await db.execute(sql, [email]);
        return rows[0] || null; // Retourne le premier résultat ou null
    },

    /**
     * Créer un nouvel utilisateur
     * @param {Object} donnees - { nom, email, motDePasseHashe, role }
     * @returns {number} L'id du nouvel utilisateur créé
     */
    creer: async ({ nom, email, motDePasseHashe, role = 'client' }) => {
        const sql = `
            INSERT INTO users (nom, email, mot_de_passe, role)
            VALUES (?, ?, ?, ?)
        `;
        const [resultat] = await db.execute(sql, [nom, email, motDePasseHashe, role]);
        return resultat.insertId;
    }
};

module.exports = UserModel;
