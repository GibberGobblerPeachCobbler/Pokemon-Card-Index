const setsDiv = document.getElementById("sets");
const cardsDiv = document.getElementById("cards");
const backButton = document.getElementById("backButton");
const searchInput = document.getElementById("search");
const languageSelect = document.getElementById("language");

let currentLanguage = "en";
let allSets = [];
let allCards = [];

async function fetchSets() {
  setsDiv.innerHTML = "<p>Loading sets...</p>";

  try {
    const res = await fetch(`https://api.tcgdex.dev/v2/${currentLanguage}/sets`);
    if (!res.ok) throw new Error("Failed to load sets");
    allSets = await res.json();
    displaySets(allSets);
  } catch (err) {
    console.error(err);
    setsDiv.innerHTML = `<p style="color:red;">Failed to load sets. Try again later.</p>`;
  }
}

function displaySets(sets) {
  setsDiv.innerHTML = "";
  cardsDiv.style.display = "none";
  setsDiv.style.display = "grid";
  backButton.style.display = "none";

  sets.forEach(set => {
    const div = document.createElement("div");
    div.className = "set";
    const logo = set.logo || "https://archives.bulbagarden.net/media/upload/3/3f/Pok%C3%A9_Ball_icon.svg"; // fallback
    div.innerHTML = `
      <img src="${logo}" alt="${set.name}" />
      <h3>${set.name}</h3>
      <p>${set.releaseDate || "Unknown Date"}</p>
    `;
    div.onclick = () => openSet(set.id);
    setsDiv.appendChild(div);
  });
}

async function openSet(setId) {
  setsDiv.style.display = "none";
  cardsDiv.style.display = "grid";
  backButton.style.display = "inline-block";
  cardsDiv.innerHTML = "<p>Loading cards...</p>";

  try {
    const res = await fetch(`https://api.tcgdex.dev/v2/${currentLanguage}/sets/${setId}`);
    if (!res.ok) throw new Error("Failed to load set data");
    const setData = await res.json();

    allCards = setData.cards || [];
    displayCards(allCards);
  } catch (err) {
    console.error(err);
    cardsDiv.innerHTML = `<p style="color:red;">Failed to load cards. Try again later.</p>`;
  }
}

function displayCards(cards) {
  cardsDiv.innerHTML = "";
  if (cards.length === 0) {
    cardsDiv.innerHTML = "<p>No cards found in this set.</p>";
    return;
  }

  cards.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    const img = card.image || "https://archives.bulbagarden.net/media/upload/3/3f/Pok%C3%A9_Ball_icon.svg";
    div.innerHTML = `
      <img src="${img}" alt="${card.name}" />
      <h4>${card.name}</h4>
      <p>${card.rarity || ""}</p>
    `;
    div.onclick = () => showCardDetails(card);
    cardsDiv.appendChild(div);
  });
}

function showCardDetails(card) {
  cardsDiv.innerHTML = `
    <img src="${card.image || "https://archives.bulbagarden.net/media/upload/3/3f/Pok%C3%A9_Ball_icon.svg"}" alt="${card.name}" />
    <h2>${card.name}</h2>
    <p>Rarity: ${card.rarity || "N/A"}</p>
    <button onclick="window.open('${card.image}', '_blank')">Download Card</button>
    <button onclick="displayCards(allCards)">⬅ Back</button>
  `;
}

backButton.onclick = () => {
  cardsDiv.style.display = "none";
  setsDiv.style.display = "grid";
  backButton.style.display = "none";
};

searchInput.addEventListener("input", e => {
  const search = e.target.value.toLowerCase();
  if (cardsDiv.style.display === "grid") {
    const filtered = allCards.filter(c => c.name.toLowerCase().includes(search));
    displayCards(filtered);
  } else {
    const filteredSets = allSets.filter(s => s.name.toLowerCase().includes(search));
    displaySets(filteredSets);
  }
});

languageSelect.onchange = () => {
  currentLanguage = languageSelect.value;
  fetchSets();
};

// Load sets on page start
fetchSets();
