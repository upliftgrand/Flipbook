const images = [
  'images/page1.png',
  'images/page2.png',
  'images/page3.png',
  'images/page4.png',
  // Add more pages as needed
];

let currentPage = 0;
let isAnimating = false;
const flipbook = document.getElementById('flipbook');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

// Preload images
function preloadImages() {
  for (let i = 0; i < images.length; i++) {
    const img = new Image();
    img.src = images[i];
  }
}

// Optimize large images
function optimizeImage(src, callback) {
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const MAX_WIDTH = 1200;
    const MAX_HEIGHT = 1600;
    let width = img.width;
    let height = img.height;

    if (width > MAX_WIDTH) {
      height = height * (MAX_WIDTH / width);
      width = MAX_WIDTH;
    }

    if (height > MAX_HEIGHT) {
      width = width * (MAX_HEIGHT / height);
      height = MAX_HEIGHT;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    callback(canvas.toDataURL('image/jpeg', 0.8));
  };
  img.src = src;
}

function showPage(index, direction = 'next') {
  if (index >= 0 && index < images.length && !isAnimating) {
    isAnimating = true;

    flipbook.innerHTML = "<div class='loading'>Loading...</div>";

    optimizeImage(images[index], (optimizedSrc) => {
