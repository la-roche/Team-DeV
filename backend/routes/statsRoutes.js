// ============================================================
// routes/statsRoutes.js
// ============================================================
const express          = require('express');
const router           = express.Router();
const StatsController  = require('../controllers/statsController');
const verifyToken      = require('../middlewares/verifyToken');
const verifyRole       = require('../middlewares/verifyRole');

// Toutes les stats sont réservées aux admins
router.get('/top-products', verifyToken, verifyRole('admin'), StatsController.topProduits);
router.get('/revenue',      verifyToken, verifyRole('admin'), StatsController.revenue);

module.exports = router;
