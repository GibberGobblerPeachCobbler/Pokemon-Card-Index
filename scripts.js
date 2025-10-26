// ===== CONFIG =====
const proxy = "pokemonproxy.gibthehunter.workers.dev"; // replace this!
const setsAPI = "https://api.pokemontcg.io/v2/sets";
const cardsAPI = setId => `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}+language:en`;

// ===== ELEMENTS =====
const setGrid = document.getElementById("setGrid");
const cardGrid = document.getElementById("cardGrid");
const landing = document.getElementById("landing");
const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("search");
const backBtn = document.getElementById("backToSets");
const loadingMore = document.getElementById("loadingMore");
const modal = document.getElementById("cardModal");
const modalName = document.getElementById("modalName");
const modalFront = document.getElementById("modalFront");
const modalPrice = document.getElementById("modalPrice");
const closeModal = document.querySelector(".close");

// ===== STATE =====
let sets = [];
let currentSet = null;
let currentCards = [];

// ===== FUNCTIONS =====
async function fetchSets() {
  try {
    const res = await fetch(proxy + encodeURIComponent(setsAPI));
    const data = await res.json();
    sets = data.data;
    renderSets();
  } catch (err) {
    console.error(err);
    setGrid.innerHTML = "<p>Failed to load sets.</p>";
  }
}

function renderSets() {
  setGrid.innerHTML = "";
  sets.forEach(set => {
    const div = document.createElement("div");
    div.className = "setCard";
    div.innerHTML = `
      ${set.images?.logo ? `<img src="${set.images.logo}" alt="${set.name} logo">` : ""}
      <p>${set.name}</p>
    `;
    div.addEventListener("click", () => openSet(set));
    setGrid.appendChild(div);
  });
}

async function openSet(set) {
  currentSet = set;
  landing.style.display = "none";
  gallery.style.display = "block";
  cardGrid.innerHTML = "";
  loadingMore.style.display = "block";

  try {
    const res = await fetch(proxy + encodeURIComponent(cardsAPI(set.id)));
    const data = await res.json();
    currentCards = data.data;
    renderCards();
  } catch (err) {
    console.error(err);
    cardGrid.innerHTML = "<p>Failed to load cards.</p>";
  } finally {
    loadingMore.style.display = "none";
  }
}

function renderCards() {
  const term = searchInput.value.toLowerCase();
  const filtered = currentCards.filter(c => c.name.toLowerCase().includes(term));
  cardGrid.innerHTML = "";
  filtered.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${card.images.small}" alt="${card.name}">`;
    div.addEventListener("click", () => openCardModal(card));
    cardGrid.appendChild(div);
  });
}

function openCardModal(card) {
  modal.style.display = "flex";
  modalName.textContent = card.name;
  modalFront.src = card.images.large;
  modalPrice.textContent = card.tcgplayer?.prices?.normal?.market
    ? `$${card.tcgplayer.prices.normal.market}`
    : "Price N/A";
}

closeModal.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});
searchInput.addEventListener("input", renderCards);
backBtn.addEventListener("click", () => {
  gallery.style.display = "none";
  landing.style.display = "block";
});

// ===== INIT =====
fetchSets();
