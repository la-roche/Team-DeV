// ============================================================
// middlewares/verifyToken.js
// Ce middleware vérifie que la requête contient un token JWT
// valide avant de laisser passer vers la route protégée.
// Il fonctionne comme un "vigile" à l'entrée.
// ============================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware : Vérification du Token JWT
 * @param {Object} req  - Requête HTTP entrante
 * @param {Object} res  - Réponse HTTP
 * @param {Function} next - Passe au middleware/contrôleur suivant
 */
const verifyToken = (req, res, next) => {
    // Récupérer l'en-tête Authorization (format attendu: "Bearer <token>")
    const authHeader = req.headers['authorization'];

    // Vérifier que l'en-tête existe
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Accès refusé. Aucun token fourni. Veuillez vous connecter.'
        });
    }

    // Extraire le token (supprimer le préfixe "Bearer ")
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Format du token invalide. Format attendu : Bearer <token>'
        });
    }

    try {
        // Vérifier et décoder le token avec la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ajouter les informations de l'utilisateur à la requête
        // Ces infos seront accessibles dans les contrôleurs suivants
        req.utilisateur = decoded; // contient { id, email, role, iat, exp }

        next(); // Tout est bon, on passe à la suite

    } catch (erreur) {
        // Le token est invalide ou expiré
        if (erreur.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expirée. Veuillez vous reconnecter.'
            });
        }
        return res.status(403).json({
            success: false,
            message: 'Token invalide ou falsifié.'
        });
    }
};

module.exports = verifyToken;
