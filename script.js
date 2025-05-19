// Digital Flipbook - script.js

// Configuration
const imageFolder = 'images/';
const imagePrefix = 'page';
const imageExtension = '.png';
const totalImages = 4; // Update this with your total image count

// State management
let currentPage = 0;
let isAnimating = false;
let isFullscreen = false;
let preloadedImages = [];
let imageAspectRatios = [];
let pageWidth, pageHeight;

// DOM elements
const flipbook = document.getElementById('flipbook');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const fullscreenButton = document.getElementById('fullscreen');
const currentPageEl = document.getElementById('current-page');
const totalPagesEl = document.getElementById('total-pages');
const flipbookContainer = document.querySelector('.flipbook-container');

// Set total page count in UI
totalPagesEl.textContent = totalImages;

// Preload all images and calculate their optimal dimensions
function preloadImages() {
  const loadingEl = document.querySelector('.loading');
  let loadedCount = 0;

  for (let i = 1; i <= totalImages; i++) {
    const path = `${imageFolder}${imagePrefix}${i}${imageExtension}`;
    const img = new Image();

    img.onload = function() {
      // Store the image's aspect ratio for later use
      imageAspectRatios[i-1] = img.width / img.height;
      
      // Create optimized version using canvas
      preloadedImages[i-1] = optimizeImage(img);
      
      loadedCount++;
      if (loadingEl) {
        loadingEl.innerHTML = `<div class="spinner"></div>
                             <p>Loading pages... ${Math.round((loadedCount / totalImages) * 100)}%</p>`;
      }
      
      // When all images are loaded, show the first page
      if (loadedCount === totalImages) {
        if (loadingEl) flipbook.removeChild(loadingEl);
        showPage(0);
        adjustSizeToScreen();
      }
    };

    img.onerror = function() {
      console.error(`Failed to load image: ${path}`);
      loadedCount++;
      
      if (loadedCount === totalImages && loadingEl) {
        loadingEl.innerHTML = '<p>Some images failed to load.</p>';
      }
    };

    img.src = path;
  }
}

// Optimize large images for better performance
function optimizeImage(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Calculate optimal dimensions while maintaining aspect ratio
  const MAX_WIDTH = 1600;  // Maximum width for large displays
  const MAX_HEIGHT = 1200; // Maximum height for large displays
  let width = img.width;
  let height = img.height;
  
  if (width > MAX_WIDTH) {
    height = (height * MAX_WIDTH) / width;
    width = MAX_WIDTH;
  }
  
  if (height > MAX_HEIGHT) {
    width = (width * MAX_HEIGHT) / height;
    height = MAX_HEIGHT;
  }
  
  canvas.width = width;
  canvas.height = height;
  
  // Draw the image at optimized dimensions
  ctx.drawImage(img, 0, 0, width, height);
  
  // Return optimized data URL
  return canvas.toDataURL('image/jpeg', 0.85); // Use 0.85 quality for good balance
}

// Calculate optimal dimensions based on screen and aspect ratio
function calculateOptimalDimensions(index) {
  // Get container dimensions
  const containerWidth = flipbookContainer.clientWidth;
  const containerHeight = flipbookContainer.clientHeight;
  
  // Calculate available space (accounting for margins)
  const availableWidth = containerWidth * 0.9;
  const availableHeight = containerHeight * 0.9;
  
  // Get the aspect ratio for this image
  const aspectRatio = imageAspectRatios[index] || 0.75; // Default to 3:4 if not known
  
  // Calculate dimensions that fit within container while maintaining aspect ratio
  if (availableWidth / aspectRatio <= availableHeight) {
    // Width constrained
    pageWidth = availableWidth;
    pageHeight = availableWidth / aspectRatio;
  } else {
    // Height constrained
    pageHeight = availableHeight;
    pageWidth = availableHeight * aspectRatio;
  }
  
  return { width: pageWidth, height: pageHeight };
}

// Create page element with appropriate dimensions
function createPageElement(index, animation) {
  const page = document.createElement('div');
  page.className = `page ${animation || ''}`;

  // Calculate optimal dimensions for this page
  const dimensions = calculateOptimalDimensions(index);
  
  // Apply dimensions
  page.style.width = `${dimensions.width}px`;
  page.style.height = `${dimensions.height}px`;
  
  // Create image element
  const img = document.createElement('img');
  img.src = preloadedImages[index];
  img.alt = `Page ${index + 1}`;
  
  // Add page fold effect layer
  const pageFold = document.createElement('div');
  pageFold.className = 'page-fold';
  
  // Add elements to page
  page.appendChild(img);
  page.appendChild(pageFold);
  
  return page;
}

// Display a specific page with animation
function showPage(index, direction = 'next') {
  if (index < 0 || index >= totalImages || isAnimating) return;
  
  isAnimating = true;
  
  // Create page element with appropriate animation class
  const animation = direction === 'next' ? 'flip-in-right' : 'flip-out-left';
  const page = createPageElement(index, animation);
  
  // Clear previous content and add new page
  flipbook.innerHTML = '';
  flipbook.appendChild(page);
  
  // Add turning class to activate page fold effect
  page.classList.add('turning');
  
  // Handle animation end
  page.addEventListener('animationend', () => {
    page.classList.remove('turning');
    isAnimating = false;
    
    // Update state and UI
    currentPage = index;
    currentPageEl.textContent = currentPage + 1;
    updateButtonState();
  });
}

// Update navigation button state
function updateButtonState() {
  prevButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === totalImages - 1;
}

// Adjust flipbook size when window is resized
function adjustSizeToScreen() {
  if (currentPage >= 0 && currentPage < totalImages) {
    const page = flipbook.querySelector('.page');
    if (page) {
      const dimensions = calculateOptimalDimensions(currentPage);
      page.style.width = `${dimensions.width}px`;
      page.style.height = `${dimensions.height}px`;
    }
  }
}

// Handle full screen mode
function toggleFullscreen() {
  if (!isFullscreen) {
    if (flipbookContainer.requestFullscreen) {
      flipbookContainer.requestFullscreen();
    } else if (flipbookContainer.mozRequestFullScreen) {
      flipbookContainer.mozRequestFullScreen();
    } else if (flipbookContainer.webkitRequestFullscreen) {
      flipbookContainer.webkitRequestFullscreen();
    } else if (flipbookContainer.msRequestFullscreen) {
      flipbookContainer.msRequestFullscreen();
    }
    flipbookContainer.classList.add('fullscreen');
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    flipbookContainer.classList.remove('fullscreen');
  }
  isFullscreen = !isFullscreen;
  
  // Give the browser a moment to adjust before recalculating dimensions
  setTimeout(adjustSizeToScreen, 100);
}

// Event Listeners
prevButton.addEventListener('click', () => {
  if (currentPage > 0 && !isAnimating) {
    showPage(currentPage - 1, 'prev');
  }
});

nextButton.addEventListener('click', () => {
  if (currentPage < totalImages - 1 && !isAnimating) {
    showPage(currentPage + 1, 'next');
  }
});

fullscreenButton.addEventListener('click', toggleFullscreen);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && currentPage > 0 && !isAnimating) {
    showPage(currentPage - 1, 'prev');
  } else if (e.key === 'ArrowRight' && currentPage < totalImages - 1 && !isAnimating) {
    showPage(currentPage + 1, 'next');
  } else if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
  }
});

// Handle fullscreen change events
document.addEventListener('fullscreenchange', adjustSizeToScreen);
document.addEventListener('mozfullscreenchange', adjustSizeToScreen);
document.addEventListener('webkitfullscreenchange', adjustSizeToScreen);
document.addEventListener('msfullscreenchange', adjustSizeToScreen);

// Window resize event
window.addEventListener('resize', adjustSizeToScreen);

// Initialize
preloadImages();
