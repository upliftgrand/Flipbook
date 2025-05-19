const images = [
  'images/page1.png',
  'images/page2.png',
  'images/page3.png',
  'images/page4.png',
  // Add more pages as needed
];

let currentPage = 0;
let isAnimating = false; // Flag to prevent rapid clicking
const flipbook = document.getElementById('flipbook');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

function preloadImages() {
  for (let i = 0; i < images.length; i++) {
    const img = new Image();
    img.src = images[i];
  }
}

function showPage(index, direction = 'next') {
  if (index >= 0 && index < images.length && !isAnimating) {
    isAnimating = true; 

    const imgElement = document.createElement("img");
    imgElement.src = images[index];
    imgElement.alt = `Page ${index + 1}`;

   if (direction === 'next') {
      imgElement.style.transform = 'rotateY(90deg)';
    } else {
      imgElement.style.transform = 'rotateY(-90deg)';
    }
    
    // Add animation
    imgElement.classList.add("flipping");

   flipbook.innerHTML = "";
    flipbook.appendChild(imgElement);

    setTimeout(() => {
        currentPage = index;
        isAnimating = false; // Unlock after animation
        updateButtons();
      }, 600);
    }, 50);
  }
}

function updateButtons() {
  prevBtn.disabled = currentPage <= 0;
  nextBtn.disabled = currentPage >= images.length - 1;
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 0) showPage(currentPage - 1, 'prev');
});

nextBtn.addEventListener("click", () => {
  if (currentPage < images.length - 1) showPage(currentPage + 1, 'next');
});

// Initialize
preloadImages();
showPage(currentPage);
updateButtons();

document.getElementById("prev").addEventListener("click", () => {
  if (currentPage > 0) showPage(currentPage - 1);
});

document.getElementById("next").addEventListener("click", () => {
  if (currentPage < images.length - 1) showPage(currentPage + 1);
});

showPage(currentPage);
