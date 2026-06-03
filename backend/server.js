// ============================================================
// server.js
// Point d'entrée principal du serveur PriceBreaker
// ============================================================

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

// Import des fichiers de routes
const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const statsRoutes   = require('./routes/statsRoutes');

// Initialisation de l'application Express
const app  = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARES GLOBAUX
// ============================================================

// Autoriser les requêtes venant du frontend (CORS)
app.use(cors({
    origin: '*',    // En production, remplacer par l'URL exacte du frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser le corps des requêtes en JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// MONTAGE DES ROUTES
// ============================================================

// Route de test (vérifier que le serveur tourne)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 API PriceBreaker opérationnelle !',
        version: '1.0.0',
        endpoints: {
            auth:     '/api/auth',
            produits: '/api/products',
            stats:    '/api/stats'
        }
    });
});

// Montage de chaque groupe de routes
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stats',    statsRoutes);

// ============================================================
// GESTION DES ROUTES INEXISTANTES (404)
// ============================================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route "${req.method} ${req.url}" introuvable.`
    });
});

// ============================================================
// GESTION GLOBALE DES ERREURS (500)
// ============================================================
app.use((erreur, req, res, next) => {
    console.error('💥 Erreur non gérée :', erreur);
    res.status(500).json({
        success: false,
        message: 'Une erreur interne est survenue.'
    });
});

// ============================================================
// DÉMARRAGE DU SERVEUR
// ============================================================
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║   🛒 PriceBreaker API - Démarré !     ║
    ║   🌐 http://localhost:${PORT}            ║
    ║   📅 ${new Date().toLocaleString('fr-FR')}        ║
    ╚════════════════════════════════════════╝
    `);
});

module.exports = app;
