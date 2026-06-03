// ============================================================
// controllers/productController.js
// Gère le CRUD des produits
// ============================================================

const ProductModel = require('../models/productModel');

const ProductController = {

    /**
     * GET /api/products
     * Récupère tous les produits (prix selon le rôle)
     */
    listerProduits: async (req, res) => {
        try {
            // Si l'utilisateur est connecté, req.utilisateur existe (mis par verifyToken)
            // Sinon, on le traite comme un client simple
            const role = req.utilisateur ? req.utilisateur.role : 'client';

            const produits = await ProductModel.tousLesProduits(role);

            res.status(200).json({
                success: true,
                count:   produits.length,
                data:    produits
            });

        } catch (erreur) {
            console.error('Erreur récupération produits :', erreur);
            res.status(500).json({ success: false, message: 'Erreur serveur.' });
        }
    },

    /**
     * POST /api/products
     * Ajouter un nouveau produit (Admin uniquement)
     */
    ajouterProduit: async (req, res) => {
        try {
            const { nom, description, image_url, prix_public, prix_partenaire, stock } = req.body;

            // --- Validation ---
            if (!nom || !prix_public || !prix_partenaire) {
                return res.status(400).json({
                    success: false,
                    message: 'Nom, prix_public et prix_partenaire sont obligatoires.'
                });
            }

            const newId = await ProductModel.creer({
                nom, description, image_url, prix_public, prix_partenaire,
                stock: stock || 0
            });

            res.status(201).json({
                success: true,
                message: 'Produit ajouté avec succès !',
                data: { id: newId, nom }
            });

        } catch (erreur) {
            console.error('Erreur ajout produit :', erreur);
            res.status(500).json({ success: false, message: 'Erreur serveur.' });
        }
    },

    /**
     * PUT /api/products/:id
     * Modifier un produit (Admin uniquement)
     */
    modifierProduit: async (req, res) => {
        try {
            const { id } = req.params;

            // Vérifier que le produit existe
            const produit = await ProductModel.trouverParId(id);
            if (!produit) {
                return res.status(404).json({
                    success: false,
                    message: `Produit avec l'id ${id} introuvable.`
                });
            }

            // Fusionner les données existantes avec les nouvelles (pour mise à jour partielle)
            const donneesMisesAJour = {
                nom:             req.body.nom             || produit.nom,
                description:     req.body.description     || produit.description,
                image_url:       req.body.image_url       || produit.image_url,
                prix_public:     req.body.prix_public     || produit.prix_public,
                prix_partenaire: req.body.prix_partenaire || produit.prix_partenaire,
                stock:           req.body.stock           !== undefined ? req.body.stock : produit.stock
            };

            await ProductModel.mettreAJour(id, donneesMisesAJour);

            res.status(200).json({
                success: true,
                message: 'Produit mis à jour avec succès !',
                data: donneesMisesAJour
            });

        } catch (erreur) {
            console.error('Erreur modification produit :', erreur);
            res.status(500).json({ success: false, message: 'Erreur serveur.' });
        }
    },

    /**
     * DELETE /api/products/:id
     * Supprimer un produit (Admin uniquement)
     */
    supprimerProduit: async (req, res) => {
        try {
            const { id } = req.params;

            const lignesAffectees = await ProductModel.supprimer(id);

            if (lignesAffectees === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Produit avec l'id ${id} introuvable.`
                });
            }

            res.status(200).json({
                success: true,
                message: `Produit #${id} supprimé avec succès.`
            });

        } catch (erreur) {
            console.error('Erreur suppression produit :', erreur);
            res.status(500).json({ success: false, message: 'Erreur serveur.' });
        }
    }
};

module.exports = ProductController;
