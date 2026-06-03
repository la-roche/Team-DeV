// ============================================================
// config/db.js
// Configuration et connexion à la base de données MySQL
// On utilise un "pool" de connexions pour de meilleures
// performances (réutilisation des connexions ouvertes)
// ============================================================

const mysql = require('mysql2');
require('dotenv').config(); // Charge les variables du fichier .env

// Création du pool de connexions
const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,   // Attendre si toutes les connexions sont occupées
    connectionLimit:    10,     // Maximum 10 connexions simultanées
    queueLimit:         0       // Pas de limite sur la file d'attente
});

// Conversion du pool en version "Promise" pour utiliser async/await
const promisePool = pool.promise();

// Test immédiat de la connexion au démarrage de l'application
pool.getConnection((erreur, connexion) => {
    if (erreur) {
        console.error('❌ Erreur de connexion à MySQL :', erreur.message);
        return;
    }
    console.log('✅ Connexion à la base de données MySQL réussie !');
    connexion.release(); // Libérer la connexion après le test
});

// Export du pool pour l'utiliser dans les models
module.exports = promisePool;
