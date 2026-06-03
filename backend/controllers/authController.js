// ============================================================
// controllers/authController.js
// Gère l'inscription et la connexion des utilisateurs
// ============================================================

const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const UserModel = require('../models/userModel');
require('dotenv').config();

const AuthController = {

    /**
     * POST /api/auth/register
     * Inscription d'un nouvel utilisateur
     */
    inscrire: async (req, res) => {
        try {
            const { nom, email, mot_de_passe, role } = req.body;

            // --- Validation basique des champs ---
            if (!nom || !email || !mot_de_passe) {
                return res.status(400).json({
                    success: false,
                    message: 'Nom, email et mot de passe sont obligatoires.'
                });
            }

            // --- Vérifier si l'email est déjà utilisé ---
            const utilisateurExistant = await UserModel.trouverParEmail(email);
            if (utilisateurExistant) {
                return res.status(409).json({
                    success: false,
                    message: 'Un compte avec cet email existe déjà.'
                });
            }

            // --- Sécurité : Hasher le mot de passe (coût 12 = bon équilibre sécurité/vitesse) ---
            const sel          = await bcrypt.genSalt(12);
            const motDePasseHashe = await bcrypt.hash(mot_de_passe, sel);

            // --- Sécurité : Empêcher la création d'admin via l'API publique ---
            // Seul un admin existant peut créer un autre admin (à implémenter plus tard)
            const roleAutorise = ['client', 'partenaire'].includes(role) ? role : 'client';

            // --- Créer l'utilisateur en base de données ---
            const nouvelId = await UserModel.creer({
                nom,
                email,
                motDePasseHashe,
                role: roleAutorise
            });

            res.status(201).json({
                success: true,
                message: 'Compte créé avec succès !',
                data: { id: nouvelId, nom, email, role: roleAutorise }
            });

        } catch (erreur) {
            console.error('Erreur inscription :', erreur);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de l\'inscription.'
            });
        }
    },

    /**
     * POST /api/auth/login
     * Connexion et génération du token JWT
     */
    connecter: async (req, res) => {
        try {
            const { email, mot_de_passe } = req.body;

            // --- Validation ---
            if (!email || !mot_de_passe) {
                return res.status(400).json({
                    success: false,
                    message: 'Email et mot de passe sont obligatoires.'
                });
            }

            // --- Chercher l'utilisateur ---
            const utilisateur = await UserModel.trouverParEmail(email);
            if (!utilisateur) {
                // Message volontairement générique pour ne pas révéler si l'email existe
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect.'
                });
            }

            // --- Vérifier le mot de passe ---
            const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
            if (!motDePasseValide) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect.'
                });
            }

            // --- Générer le token JWT ---
            // Le "payload" contient les infos clés (pas le mot de passe !)
            const payload = {
                id:    utilisateur.id,
                email: utilisateur.email,
                nom:   utilisateur.nom,
                role:  utilisateur.role
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            res.status(200).json({
                success: true,
                message: `Bienvenue ${utilisateur.nom} !`,
                token,               // Le frontend stockera ce token
                utilisateur: payload // Infos utiles pour le frontend
            });

        } catch (erreur) {
            console.error('Erreur connexion :', erreur);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la connexion.'
            });
        }
    }
};

module.exports = AuthController;
