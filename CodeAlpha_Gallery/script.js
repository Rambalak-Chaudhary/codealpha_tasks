// script.js – dynamic gallery, filter, lightbox navigation

// ----------------------------------------------
// image collection (category bonus)
// using reliable placeholder images from picsum
// each object: id, thumbnail, full res, category, alt
// ----------------------------------------------
const galleryImages = [
  { id: 1, thumb: 'https://picsum.photos/id/101/420/320', full: 'https://picsum.photos/id/101/1200/900', category: 'coastal', alt: 'Coastal cliffs' },
  { id: 2, thumb: 'https://picsum.photos/id/104/420/320', full: 'https://picsum.photos/id/104/1200/900', category: 'urban', alt: 'Factory facade' },
  { id: 3, thumb: 'https://picsum.photos/id/106/420/320', full: 'https://picsum.photos/id/106/1200/900', category: 'minimal', alt: 'Soft grass' },
  { id: 4, thumb: 'https://picsum.photos/id/108/420/320', full: 'https://picsum.photos/id/108/1200/900', category: 'coastal', alt: 'Beach hut' },
  { id: 5, thumb: 'https://picsum.photos/id/116/420/320', full: 'https://picsum.photos/id/116/1200/900', category: 'urban', alt: 'Leaves on concrete' },
  { id: 6, thumb: 'https://picsum.photos/id/130/420/320', full: 'https://picsum.photos/id/130/1200/900', category: 'minimal', alt: 'Blank wall' },
  { id: 7, thumb: 'https://picsum.photos/id/136/420/320', full: 'https://picsum.photos/id/136/1200/900', category: 'coastal', alt: 'Mountain lake' },
  { id: 8, thumb: 'https://picsum.photos/id/145/420/320', full: 'https://picsum.photos/id/145/1200/900', category: 'minimal', alt: 'Sand ripple' },
  { id: 9, thumb: 'https://picsum.photos/id/150/420/320', full: 'https://picsum.photos/id/150/1200/900', category: 'urban', alt: 'Railway' },
  { id: 10, thumb: 'https://picsum.photos/id/158/420/320', full: 'https://picsum.photos/id/158/1200/900', category: 'coastal', alt: 'Rocks and sea' }
];

// ---------- DOM elements ----------
const grid = document.getElementById('gridContainer');
const filterTabs = document.getElementById('filterTabs');
const lightbox = document.getElementById('lightboxOverlay');
const lightboxImg = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const closeBtn = document.getElementById('closeLightboxBtn');
const prevBtn = document.getElementById('prevImageBtn');
const nextBtn = document.getElementById('nextImageBtn');

// state
let activeFilter = '*';            // matches data-filter attribute
let filteredList = [];             // current displayed images
let currentIndex = 0;              // index inside filteredList

// ---------- render thumbnails based on filter ----------
function renderGrid(filter = '*') {
  const filtered = filter === '*' ? galleryImages : galleryImages.filter(img => img.category === filter);
  filteredList = filtered;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="grid-placeholder" style="grid-column:1/-1; text-align:center; color:#657b94; padding:3rem;">☁️ no images in this category</div>`;
    return;
  }

  const html = filtered.map((item, idx) => {
    return `
      <div class="grid-item" data-index="${idx}" data-category="${item.category}">
        <img src="${item.thumb}" alt="${item.alt}" loading="lazy">
        <span class="item-label">${item.category}</span>
      </div>
    `;
  }).join('');

  grid.innerHTML = html;
}

// ---------- lightbox update by index ----------
function updateLightbox(index) {
  if (!filteredList.length) return;
  // wrap around
  if (index < 0) index = filteredList.length - 1;
  if (index >= filteredList.length) index = 0;
  currentIndex = index;

  const img = filteredList[currentIndex];
  lightboxImg.src = img.full;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = `${img.alt}  ·  ${img.category}`;
}

// ---------- open lightbox ----------
function openLightbox(index) {
  if (!filteredList.length) return;
  updateLightbox(index);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ---------- close lightbox ----------
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// ---------- EVENT DELEGATION ----------

// filter tabs
filterTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-button');
  if (!btn) return;

  const filterValue = btn.dataset.filter;
  if (!filterValue) return;

  // update active class
  document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');

  activeFilter = filterValue;
  renderGrid(activeFilter);

  // close lightbox when filter changes (clean state)
  if (lightbox.classList.contains('active')) closeLightbox();
});

// thumbnail click
grid.addEventListener('click', (e) => {
  const item = e.target.closest('.grid-item');
  if (!item) return;
  const idx = item.dataset.index;
  if (idx !== undefined) openLightbox(parseInt(idx, 10));
});

// lightbox navigation
prevBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  updateLightbox(currentIndex - 1);
});

nextBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  updateLightbox(currentIndex + 1);
});

// close buttons
closeBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();   // backdrop click
});

// prevent closing when clicking inside content
document.querySelector('.lightbox__content')?.addEventListener('click', (e) => e.stopPropagation());

// keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  switch (e.key) {
    case 'Escape': closeLightbox(); break;
    case 'ArrowLeft': updateLightbox(currentIndex - 1); e.preventDefault(); break;
    case 'ArrowRight': updateLightbox(currentIndex + 1); e.preventDefault(); break;
  }
});

// ---------- initial render ----------
renderGrid('*');