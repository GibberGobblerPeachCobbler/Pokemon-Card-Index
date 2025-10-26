const setGrid = document.getElementById('setGrid');
const cardGrid = document.getElementById('cardGrid');
const landing = document.getElementById('landing');
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('search');
const languageSelect = document.getElementById('language');
const backBtn = document.getElementById('backToSets');
const loadingMore = document.getElementById('loadingMore');

const modal = document.getElementById('cardModal');
const modalName = document.getElementById('modalName');
const modalFront = document.getElementById('modalFront');
const modalBack = document.getElementById('modalBack');
const modalPrice = document.getElementById('modalPrice');
const includeBack = document.getElementById('includeBack');
const downloadBtn = document.getElementById('downloadCard');
const closeModal = document.querySelector('.close');

let sets = [];
let currentSet = null;
let currentCards = [];
let filteredCards = [];
let currentCard = null;

// Pre-made online JSON dataset
const cardsJSON = 'https://raw.githubusercontent.com/flibustier/pokemon-tcg-pocket-database/main/dist/cards.json';
const setsJSON = 'https://raw.githubusercontent.com/flibustier/pokemon-tcg-pocket-database/main/dist/sets.json';

// Fetch sets first
async function fetchSets() {
  const res = await fetch(setsJSON);
  const data = await res.json();
  sets = data;
  renderSets();
}

function renderSets() {
  setGrid.innerHTML='';
  sets.forEach(set=>{
    const div = document.createElement('div');
    div.className='setCard';
    div.innerHTML=`<img src="${set.logo}" alt="${set.name}"><p>${set.name}</p>`;
    div.addEventListener('click',()=>openSet(set));
    setGrid.appendChild(div);
  });
}

async function openSet(set){
  currentSet = set;
  landing.style.display='none';
  gallery.style.display='block';
  cardGrid.innerHTML='';
  currentCards=[];
  filteredCards=[];
  loadingMore.style.display='block';
  
  // Fetch cards from online JSON
  const res = await fetch(cardsJSON);
  const data = await res.json();
  const lang = languageSelect.value;
  currentCards = data.filter(c=>c.setId===set.id && c.language===lang);
  renderCards();
  loadingMore.style.display='none';
}

function renderCards(){
  const term = searchInput.value.toLowerCase();
  filteredCards = currentCards.filter(c=>c.name.toLowerCase().includes(term));
  cardGrid.innerHTML='';
  filteredCards.forEach(card=>{
    const div = document.createElement('div');
    div.className='card';
    const front = card.imageUrl || '';
    const back = card.backImageUrl || front;
    div.innerHTML=`<div class="card-inner">
      <div class="card-front"><img loading="lazy" src="${front}" alt="${card.name}"></div>
      <div class="card-back"><img loading="lazy" src="${back}" alt="${card.name}"></div>
    </div>`;
    div.addEventListener('click',()=>openCardModal(card));
    cardGrid.appendChild(div);
  });
}

// Modal
function openCardModal(card){
  currentCard = card;
  modal.style.display='flex';
  modalName.textContent = card.name;
  modalFront.src = card.imageUrl;
  modalBack.src = card.backImageUrl || card.imageUrl;
  modalPrice.textContent = card.price ? `$${card.price}` : 'Price N/A';
  includeBack.checked=false;
}

closeModal.addEventListener('click',()=>modal.style.display='none');
window.addEventListener('click',e=>{if(e.target===modal) modal.style.display='none';});

downloadBtn.addEventListener('click',()=>{
  if(!currentCard) return;
  const data = {name:currentCard.name, front:modalFront.src};
  if(includeBack.checked) data.back = modalBack.src;
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url;
  a.download = currentCard.name.replace(/[^a-z0-9]/gi,'_')+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

searchInput.addEventListener('input',renderCards);
languageSelect.addEventListener('change',()=>openSet(currentSet));
backBtn.addEventListener('click',()=>{
  gallery.style.display='none';
  landing.style.display='block';
});

fetchSets();
