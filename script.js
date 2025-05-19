// Paperback Flipbook - script.js

// Configuration - Update these values to match your images
const imageFolder = 'images/';
const imagePrefix = 'page';
const imageExtension = '.png'; 
const totalImages = 10; // Update this to match your actual number of pages

// State management
let currentSpread = 0; // Current two-page spread (0 = pages 0-1, 1 = pages 2-3, etc.)
let isAnimating = false;
let isFullscreen = false;
let preloadedImages = [];
let maxSpreads = Math.ceil(totalImages / 2);

// DOM elements
const book = document.getElementById('book');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const currentPagesEl = document.getElementById('current-pages');
const totalPagesEl = document.getElementById('total-pages');
const bookWrapper = document.querySelector('.book-wrapper');

// Set total page count in UI
totalPagesEl.textContent = totalImages;

/**
 * Preload all images and store them for faster access
 */
function preloadImages() {
  const loadingEl = document.querySelector('.loading');
  let loadedCount = 0;

  for (let i = 1; i <= totalImages; i++) {
    const path = `${imageFolder}${imagePrefix}${i}${imageExtension}`;
    const img = new Image();

    img.onload = function() {
      // Store optimized version
      preloadedImages[i-1] = optimizeImage(img);
      
      loadedCount++;
      if (loadingEl) {
        loadingEl.innerHTML = `<div class="spinner"></div>
                              <p>Loading pages... ${Math.round((loadedCount / totalImages) * 100)}%</p>`;
      }
      
      // When all images are loaded, show the first spread
      if (loadedCount === totalImages) {
        if (loadingEl) book.removeChild(loadingEl);
        createBook();
        showSpread(0);
        // Briefly show touch indicators
        setTimeout(() => {
          document.querySelector('.touch-indicators').style.opacity = '1';
        }, 500);
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

/**
 * Optimize large images for better performance
 */
function optimizeImage(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Calculate optimal dimensions while preserving aspect ratio
  const MAX_WIDTH = 1000;  // Adjust based on your needs
  const MAX_HEIGHT = 1500; // Adjust based on your needs
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
  
  // Return optimized data URL (use higher quality for better appearance)
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Create initial book structure with all spreads
 */
function createBook() {
  book.innerHTML = '';
  
  // Calculate total number of spreads
  maxSpreads = Math.ceil(totalImages / 2);
  
  // Create spreads (each with two pages)
  for (let i = 0; i < maxSpreads; i++) {
    const leftPageNum = i * 2;
    const rightPageNum = i * 2 + 1;
    
    const spread = document.createElement('div');
    spread.className = 'spread';
    spread.id = `spread-${i}`;
    spread.style.zIndex = maxSpreads - i;
    spread.style.display = 'none'; // Hide all spreads initially
    
    // Left page (even number)
    if (leftPageNum < totalImages) {
      const leftPage = createPageElement(leftPageNum, 'left');
      spread.appendChild(leftPage);
    }
    
    // Right page (odd number)
    if (rightPageNum < totalImages) {
      const rightPage = createPageElement(rightPageNum, 'right');
      spread.appendChild(rightPage);
    }
    
    book.appendChild(spread);
  }
}

/**
 * Create a page element with image and page number
 */
function createPageElement(pageIndex, position) {
  const pageDiv = document.createElement('div');
  pageDiv.className = `page page-${position}`;
  
  // Page content (image)
  const img = document.createElement('img');
  img.src = preloadedImages[pageIndex];
  img.alt = `Page ${pageIndex + 1}`;
  pageDiv.appendChild(img);
  
  // Page number
  const pageNumber = document.createElement('div');
  pageNumber.className = 'page-number';
  pageNumber.textContent = pageIndex + 1;
  pageDiv.appendChild(pageNumber);
  
  // Add corner elements for navigation
  if (position === 'left') {
    // Add left page corners
    const topLeftCorner = document.createElement('div');
    topLeftCorner.className = 'corner corner-top-left';
    topLeftCorner.addEventListener('click', goToPreviousSpread);
    
    const bottomLeftCorner = document.createElement('div');
    bottomLeftCorner.className = 'corner corner-bottom-left';
    bottomLeftCorner.addEventListener('click', goToPreviousSpread);
    
    pageDiv.appendChild(topLeftCorner);
    pageDiv.appendChild(bottomLeftCorner);
  } else {
    // Add right page corners
    const topRightCorner = document.createElement('div');
    topRightCorner.className = 'corner corner-top-right';
    topRightCorner.addEventListener('click', goToNextSpread);
    
    const bottomRightCorner = document.createElement('div');
    bottomRightCorner.className = 'corner corner-bottom-right';
    bottomRightCorner.addEventListener('click', goToNextSpread);
    
    pageDiv.appendChild(topRightCorner);
    pageDiv.appendChild(bottomRightCorner);
  }
  
  return pageDiv;
}

/**
 * Show a specific spread (two pages) with animation
 */
function showSpread(index) {
  if (index < 0 || index >= maxSpreads || isAnimating) return;
  
  // Hide all spreads first
  const allSpreads = document.querySelectorAll('.spread');
  allSpreads.forEach(spread => {
    spread.style.display = 'none';
  });
  
  // Show current spread
  const currentSpreadEl = document.getElementById(`spread-${index}`);
  if (currentSpreadEl) {
    currentSpreadEl.style.display = 'flex';
  }
  
  // Update page counter
  const startPage = index * 2 + 1;
  const endPage = Math.min(startPage + 1, totalImages);
  currentPagesEl.textContent = `${startPage}-${endPage}`;
  
  // Update current spread index
  currentSpread = index;
  
  // Update button states
  updateButtonStates();
}

/**
 * Handle page turn animation
 */
function turnPage(direction) {
  if (isAnimating) return;
  isAnimating = true;
  
  const currentSpreadEl = document.getElementById(`spread-${currentSpread}`);
  const newSpreadIndex = direction === 'next' ? currentSpread + 1 : currentSpread - 1;
  
  if (newSpreadIndex < 0 || newSpreadIndex >= maxSpreads) {
    isAnimating = false;
    return;
  }
  
  // Apply turning animation to current spread
  if (direction === 'next') {
    currentSpreadEl.classList.add('turn-forward');
  } else {
    const prevSpreadEl = document.getElementById(`spread-${newSpreadIndex}`);
    prevSpreadEl.style.display = 'flex';
    prevSpreadEl.classList.add('turn-backward');
  }
  
  // After animation completes
  setTimeout(() => {
    if (direction === 'next') {
      currentSpreadEl.classList.remove('turn-forward');
      currentSpreadEl.style.display = 'none';
    } else {
      const prevSpreadEl = document.getElementById(`spread-${newSpreadIndex}`);
      prevSpreadEl.classList.remove('turn-backward');
      currentSpreadEl.style.display = 'none';
    }
    
    showSpread(newSpreadIndex);
    isAnimating = false;
  }, 800); // Match animation duration
}

/**
 * Navigate to next spread
 */
function goToNextSpread() {
  if (currentSpread < maxSpreads - 1 && !isAnimating) {
    turnPage('next');
  }
}

/**
 * Navigate to previous spread
 */
function goToPreviousSpread() {
  if (currentSpread > 0 && !isAnimating) {
    turnPage('prev');
  }
}

/**
 * Update navigation button states
 */
function updateButtonStates() {
  prevBtn.disabled = currentSpread <= 0;
  nextBtn.disabled = currentSpread >= maxSpreads - 1;
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
  if (!isFullscreen) {
    if (bookWrapper.requestFullscreen) {
      bookWrapper.requestFullscreen();
    } else if (bookWrapper.mozRequestFullScreen) {
      bookWrapper.mozRequestFullScreen();
    } else if (bookWrapper.webkitRequestFullscreen) {
      bookWrapper.webkitRequestFullscreen();
    } else if (bookWrapper.msRequestFullscreen) {
      bookWrapper.msRequestFullscreen();
    }
    bookWrapper.classList.add('fullscreen');
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
    bookWrapper.classList.remove('fullscreen');
  }
  isFullscreen = !isFullscreen;
}

/**
 * Handle fullscreen change events
 */
function handleFullscreenChange() {
  isFullscreen = !!document.fullscreenElement || 
                 !!document.mozFullScreenElement || 
                 !!document.webkitFullscreenElement || 
                 !!document.msFullscreenElement;
}

// Event Listeners
prevBtn.addEventListener('click', goToPreviousSpread);
nextBtn.addEventListener('click', goToNextSpread);
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
    goToPreviousSpread();
  } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
    goToNextSpread();
  } else if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
  }
});

// Fullscreen change events
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('msfullscreenchange', handleFullscreenChange);

// Window resize event to adjust book dimensions if needed
window.addEventListener('resize', () => {
  // If needed, add code here to adjust book dimensions on window resize
});

// Touch events for mobile swipe gestures (optional enhancement)
let touchStartX = 0;
let touchEndX = 0;

bookWrapper.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

bookWrapper.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50; // Minimum distance for swipe
  if (touchEndX < touchStartX - swipeThreshold) {
    // Swipe left - go to next page
    goToNextSpread();
  }
  if (touchEndX > touchStartX + swipeThreshold) {
    // Swipe right - go to previous page
    goToPreviousSpread();
  }
}

// Initialize the flipbook
preloadImages();
