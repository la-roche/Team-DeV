// ============================================================
// models/statsModel.js
// Requêtes SQL complexes pour les statistiques Admin
// ============================================================

const db = require('../config/db');

const StatsModel = {

    /**
     * Top des produits les plus vendus
     * Utilise GROUP BY et ORDER BY pour agréger les quantités
     * @param {number} limite - Nombre de produits à retourner (défaut: 5)
     */
    topProduits: async (limite = 5) => {
        const sql = `
            SELECT
                p.id,
                p.nom,
                p.image_url,
                SUM(oi.quantite)          AS total_vendu,
                SUM(oi.quantite * oi.prix_unitaire) AS chiffre_affaires
            FROM order_items oi
            -- Jointure pour récupérer le nom du produit
            INNER JOIN products p ON oi.product_id = p.id
            GROUP BY p.id, p.nom, p.image_url
            ORDER BY total_vendu DESC
            LIMIT ?
        `;
        const [rows] = await db.execute(sql, [limite]);
        return rows;
    },

    /**
     * Chiffre d'affaires global
     * Somme de toutes les commandes
     */
    chiffreAffairesGlobal: async () => {
        const sql = `
            SELECT
                COUNT(id)          AS nombre_commandes,
                SUM(montant_total) AS chiffre_affaires_total,
                AVG(montant_total) AS panier_moyen
            FROM orders
        `;
        const [rows] = await db.execute(sql);
        return rows[0];
    },

    /**
     * Évolution du chiffre d'affaires par mois (12 derniers mois)
     * Utile pour le graphique linéaire du dashboard
     */
    evolutionMensuelle: async () => {
        const sql = `
            SELECT
                DATE_FORMAT(date_commande, '%Y-%m') AS mois,
                COUNT(id)                           AS nombre_commandes,
                SUM(montant_total)                  AS total_mensuel
            FROM orders
            WHERE date_commande >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY mois
            ORDER BY mois ASC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }
};

module.exports = StatsModel;
