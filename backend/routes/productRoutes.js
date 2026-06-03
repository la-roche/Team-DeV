// ============================================================
// routes/productRoutes.js
// ============================================================
const express           = require('express');
const router            = express.Router();
const ProductController = require('../controllers/productController');
const verifyToken       = require('../middlewares/verifyToken');
const verifyRole        = require('../middlewares/verifyRole');

// GET /api/products — Public (mais le token optionnel change le prix affiché)
// On utilise un middleware "optionnel" : on essaie de décoder le token s'il existe
const verifyTokenOptional = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return next(); // Pas de token ? On continue quand même

    const token = authHeader.split(' ')[1];
    const jwt   = require('jsonwebtoken');
    try {
        req.utilisateur = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        // Token invalide ignoré silencieusement pour cette route publique
    }
    next();
};

router.get('/',    verifyTokenOptional,              ProductController.listerProduits);

// Routes protégées : Admin uniquement
router.post('/',        verifyToken, verifyRole('admin'), ProductController.ajouterProduit);
router.put('/:id',      verifyToken, verifyRole('admin'), ProductController.modifierProduit);
router.delete('/:id',   verifyToken, verifyRole('admin'), ProductController.supprimerProduit);

module.exports = router;
