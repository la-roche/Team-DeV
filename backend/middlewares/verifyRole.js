// ============================================================
// middlewares/verifyRole.js
// Ce middleware vérifie que l'utilisateur authentifié possède
// le bon rôle pour accéder à une ressource protégée.
// Il s'utilise APRÈS verifyToken dans la chaîne de middlewares.
//
// Exemple d'utilisation dans une route :
//   router.delete('/products/:id',
//     verifyToken,
//     verifyRole('admin'),
//     productController.supprimerProduit
//   );
// ============================================================

/**
 * Fabrique de middleware : Vérification du Rôle
 * @param  {...string} rolesAutorises - Un ou plusieurs rôles acceptés
 *                                     Ex: verifyRole('admin')
 *                                         verifyRole('admin', 'partenaire')
 * @returns {Function} Middleware Express
 */
const verifyRole = (...rolesAutorises) => {
    return (req, res, next) => {
        // Vérifier que verifyToken a bien été exécuté avant
        if (!req.utilisateur) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise avant la vérification du rôle.'
            });
        }

        const roleUtilisateur = req.utilisateur.role;

        // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
        if (!rolesAutorises.includes(roleUtilisateur)) {
            return res.status(403).json({
                success: false,
                message: `Accès interdit. Cette action nécessite le rôle : [${rolesAutorises.join(' ou ')}]. Votre rôle actuel : "${roleUtilisateur}".`
            });
        }

        // Le rôle est autorisé, on continue
        next();
    };
};

module.exports = verifyRole;
