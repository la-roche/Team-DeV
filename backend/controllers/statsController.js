// ============================================================
// controllers/statsController.js
// Fournit les données statistiques pour le dashboard Admin
// ============================================================

const StatsModel = require('../models/statsModel');

const StatsController = {

    /**
     * GET /api/stats/top-products
     * Retourne les produits les plus vendus
     */
    topProduits: async (req, res) => {
        try {
            // Paramètre optionnel ?limite=10 dans l'URL
            const limite = parseInt(req.query.limite) || 5;
            const donnees = await StatsModel.topProduits(limite);

            res.status(200).json({
                success: true,
                data: donnees
            });

        } catch (erreur) {
            console.error('Erreur stats top produits :', erreur);
            res.status(500).json({ success: false, message: 'Erreur serveur.' });
        }
    },

    /**
     * GET /api/stats/revenue
     * Retourne le chiffre d'affaires global + évolution mensuelle
     */
    revenue: async (req, res) => {
        try {
            // Exécuter les deux requêtes en parallèle pour gagner du temps
            const [global, mensuel] = await Promise.all([
                StatsModel.chiffreAffairesGlobal(),
                StatsModel.evolutionMensuelle()
            ]);

            res.status(200).json({
                success: true,
                data: {
                    global,   // { nombre_commandes, chiffre_affaires_total, panier_moyen }
                    mensuel   // [ { mois, nombre_commandes, total_mensuel }, ... ]
                }
            });

        } catch (erreur) {
            console.error('Erreur stats revenue :', erreur);
            res.status(500).json({ success: false, message: 'Erreur serveur.' });
        }
    }
};

module.exports = StatsController;
