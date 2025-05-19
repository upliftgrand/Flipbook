const images = [
  'images/page1.png',
  'images/page2.png',
  'images/page3.png',
  'images/page4.png',
  // Add more pages here as needed
];

let currentPage = 0;
let isAnimating = false; // Lock to prevent double-clicking
const flipbook = document.getElementById('flipbook');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

// Preload all images for performance
function preloadImages() {
  for (let i = 0; i < images.length; i++) {
    const img = new Image();
    img.src = images[i];
  }
}

// Optimize large images using a canvas
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
      height *= MAX_WIDTH / width;
      width = MAX_WIDTH;
    }

    if (height > MAX_HEIGHT) {
      width *= MAX_HEIGHT / height;
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

    // Show loading indicator
    flipbook.innerHTML = "<div class='loading'>Loading...</div>";

    optimizeImage(images[index], (optimizedSrc) => {
      const imgElement = document.createElement("img");
      imgElement.src = optimizedSrc;
      imgElement.alt = `Page ${index + 1}`;

      // Set initial rotation direction
      if (direction === 'next') {
        imgElement.style.transform = 'rotateY(90deg)';
      } else {
        imgElement.style.transform = 'rotateY(-90deg)';
      }

      // Clear old content and append new image
      flipbook.innerHTML = "";
      flipbook.appendChild(imgElement);

      // Animate into view
      setTimeout(() => {
        imgElement.style.transition = 'transform 0.6s ease';
        imgElement.style.transform = 'rotateY(0deg)';

        // Unlock after animation
        setTimeout(() => {
          currentPage = index;
          isAnimating = false;
          updateButtons();
        }, 600);
      }, 50);
    });
  }
}

function updateButtons() {
  prevBtn.disabled = currentPage <= 0;
  nextBtn.disabled = currentPage >= images.length - 1;
}

// Event listeners
prevBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    showPage(currentPage
