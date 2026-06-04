/* ============================================
   PRICEBREAKER — Logique panier (panier.js)
   ============================================ */

const LIVRAISON_SEUIL  = 50000;   // Livraison gratuite au-dessus
const LIVRAISON_FRAIS  = 3500;    // Frais si en dessous
const CODES_PROMO = {
  'PRICEBREAKER10': 0.10,
  'WELCOME20': 0.20,
};

let reductionActive = 0; // pourcentage de réduction appliqué

// ── Rendu d'un article ────────────────────────
function creerArticleHTML(produit) {
  const role = Auth.getRole();
  const prixUnit = role === 'partenaire' ? produit.prix_partenaire : produit.prix_public;
  const prixTotal = prixUnit * produit.quantite;

  return `
    <div class="article-panier" id="article-${produit.id}">
      <div class="article-image">
        <img src="${produit.image_url}" alt="${produit.nom}"
             onerror="this.src='https://cdn-icons-png.flaticon.com/512/3659/3659895.png'">
      </div>
      <div class="article-info">
        <h3>${produit.nom}</h3>
        <p class="article-cat">${produit.categorie}</p>
        <p class="article-prix-unit">Prix unitaire : ${formatPrix(prixUnit)}</p>
      </div>
      <div class="article-droite">
        <div class="article-prix">${formatPrix(prixTotal)}</div>
        <div class="quantite-ctrl">
          <button onclick="changerQuantite(${produit.id}, -1)" aria-label="Diminuer">−</button>
          <div class="qte-valeur">${produit.quantite}</div>
          <button onclick="changerQuantite(${produit.id}, +1)" aria-label="Augmenter">+</button>
        </div>
        <button class="btn-supprimer" onclick="supprimerArticle(${produit.id})">🗑 Supprimer</button>
      </div>
    </div>
  `;
}

// ── Calcul du récapitulatif ───────────────────
function calculerTotaux() {
  const panier = Panier.obtenir();
  const role = Auth.getRole();

  const sousTotal = panier.reduce((acc, p) => {
    const prix = role === 'partenaire' ? p.prix_partenaire : p.prix_public;
    return acc + prix * p.quantite;
  }, 0);

  const apresRemise = sousTotal * (1 - reductionActive);
  const livraison = apresRemise >= LIVRAISON_SEUIL ? 0 : LIVRAISON_FRAIS;
  const total = apresRemise + livraison;

  return { sousTotal, apresRemise, livraison, total };
}

// ── Mise à jour du récapitulatif HTML ─────────
function mettreAJourRecap() {
  const { sousTotal, apresRemise, livraison, total } = calculerTotaux();

  document.getElementById('recap-sous-total').textContent = formatPrix(Math.round(sousTotal));

  const livEl = document.getElementById('recap-livraison');
  livEl.textContent = livraison === 0 ? '✓ Gratuite' : formatPrix(livraison);
  livEl.style.color = livraison === 0 ? '#16a34a' : '';

  document.getElementById('recap-total').textContent = formatPrix(Math.round(total));

  // Message livraison gratuite
  const infoEl = document.getElementById('recap-livraison-info');
  if (livraison > 0) {
    const manque = LIVRAISON_SEUIL - Math.round(apresRemise);
    infoEl.textContent = `Plus que ${formatPrix(manque)} pour la livraison gratuite !`;
    infoEl.style.color = '#f59e0b';
  } else {
    infoEl.textContent = '🎉 Vous bénéficiez de la livraison gratuite !';
    infoEl.style.color = '#16a34a';
  }
}

// ── Affichage complet du panier ───────────────
function afficherPanier() {
  const panier = Panier.obtenir();
  const layout  = document.querySelector('.panier-layout');
  const vide    = document.getElementById('panier-vide');
  const countEl = document.getElementById('panier-count');
  const articlesEl = document.getElementById('panier-articles');

  const nbArticles = Panier.compter();
  countEl.textContent = `${nbArticles} article${nbArticles > 1 ? 's' : ''}`;

  if (panier.length === 0) {
    layout.style.display = 'none';
    vide.style.display = 'block';
    countEl.style.display = 'none';
    return;
  }

  layout.style.display = 'grid';
  vide.style.display = 'none';
  countEl.style.display = 'inline-block';
  articlesEl.innerHTML = panier.map(creerArticleHTML).join('');
  mettreAJourRecap();
}

// ── Changer la quantité ───────────────────────
function changerQuantite(id, delta) {
  const panier = Panier.obtenir();
  const index = panier.findIndex(p => p.id === id);
  if (index === -1) return;

  panier[index].quantite += delta;

  if (panier[index].quantite <= 0) {
    panier.splice(index, 1);
  }

  Panier.sauvegarder(panier);
  afficherPanier();
}

// ── Supprimer un article ──────────────────────
function supprimerArticle(id) {
  Panier.supprimer(id);
  afficherPanier();
  Panier.afficherNotification('Article retiré du panier');
}

// ── Code promo ────────────────────────────────
function appliquerPromo() {
  const code = document.getElementById('code-promo').value.trim().toUpperCase();
  const msgEl = document.getElementById('promo-msg');

  if (CODES_PROMO[code] !== undefined) {
    reductionActive = CODES_PROMO[code];
    msgEl.textContent = `✓ Code appliqué ! −${reductionActive * 100}% sur votre commande`;
    msgEl.className = 'promo-msg ok';
    mettreAJourRecap();
  } else {
    reductionActive = 0;
    msgEl.textContent = '✗ Code invalide ou expiré';
    msgEl.className = 'promo-msg err';
    mettreAJourRecap();
  }
}

// ── Passer commande ───────────────────────────
function commander() {
  if (!Auth.estConnecte()) {
    Panier.afficherNotification('Connectez-vous pour passer commande !');
    setTimeout(() => window.location.href = 'connexion.html', 1200);
    return;
  }
  // Ici : appel API POST /api/orders quand le backend sera prêt
  alert('Commande envoyée ! Merci pour votre achat 🎉\n(Intégration backend à venir)');
}

// ── Initialisation ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Auth.mettreAJourUI();
  Panier.mettreAJourBadge();
  afficherPanier();

  // Enter sur le champ promo
  document.getElementById('code-promo').addEventListener('keydown', e => {
    if (e.key === 'Enter') appliquerPromo();
  });
});
