// ============================================================
// models/productModel.js
// Toutes les requêtes SQL concernant la table "products"
// ============================================================

const db = require('../config/db');

const ProductModel = {

    /**
     * Récupérer tous les produits
     * Le paramètre "role" détermine quels champs de prix retourner
     * @param {string} role - 'client', 'partenaire', ou 'admin'
     */
    tousLesProduits: async (role) => {
        let sql;

        if (role === 'partenaire' || role === 'admin') {
            // Partenaires et admins voient les deux prix
            sql = `
                SELECT id, nom, description, image_url,
                       prix_public, prix_partenaire, stock
                FROM products
                WHERE stock > 0
                ORDER BY date_ajout DESC
            `;
        } else {
            // Clients et visiteurs ne voient que le prix public
            sql = `
                SELECT id, nom, description, image_url,
                       prix_public, stock
                FROM products
                WHERE stock > 0
                ORDER BY date_ajout DESC
            `;
        }

        const [rows] = await db.execute(sql);
        return rows;
    },

    /**
     * Trouver un produit par son ID
     * @param {number} id
     */
    trouverParId: async (id) => {
        const sql = 'SELECT * FROM products WHERE id = ? LIMIT 1';
        const [rows] = await db.execute(sql, [id]);
        return rows[0] || null;
    },

    /**
     * Créer un nouveau produit
     * @param {Object} donnees - { nom, description, image_url, prix_public, prix_partenaire, stock }
     */
    creer: async ({ nom, description, image_url, prix_public, prix_partenaire, stock }) => {
        const sql = `
            INSERT INTO products (nom, description, image_url, prix_public, prix_partenaire, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [resultat] = await db.execute(sql, [
            nom, description, image_url, prix_public, prix_partenaire, stock
        ]);
        return resultat.insertId;
    },

    /**
     * Mettre à jour un produit existant
     * @param {number} id
     * @param {Object} donnees - Champs à mettre à jour
     */
    mettreAJour: async (id, { nom, description, image_url, prix_public, prix_partenaire, stock }) => {
        const sql = `
            UPDATE products
            SET nom = ?, description = ?, image_url = ?,
                prix_public = ?, prix_partenaire = ?, stock = ?
            WHERE id = ?
        `;
        const [resultat] = await db.execute(sql, [
            nom, description, image_url, prix_public, prix_partenaire, stock, id
        ]);
        return resultat.affectedRows; // Nombre de lignes modifiées
    },

    /**
     * Supprimer un produit
     * @param {number} id
     */
    supprimer: async (id) => {
        const sql = 'DELETE FROM products WHERE id = ?';
        const [resultat] = await db.execute(sql, [id]);
        return resultat.affectedRows;
    }
};

module.exports = ProductModel;
