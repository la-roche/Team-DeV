// ============================================================
// routes/authRoutes.js
// ============================================================
const express        = require('express');
const router         = express.Router();
const AuthController = require('../controllers/authController');

// POST /api/auth/register — Inscription
router.post('/register', AuthController.inscrire);

// POST /api/auth/login — Connexion
router.post('/login', AuthController.connecter);

module.exports = router;
