document.addEventListener('DOMContentLoaded', function() {
    // Flipbook elements
    const flipbook = document.getElementById('flipbook');
    const pages = document.querySelectorAll('.page');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageNum = document.getElementById('page-num');
    const totalPages = document.getElementById('total-pages');
    const zoomSlider = document.getElementById('zoom-slider');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    let currentPage = 0;
    const numPages = pages.length;
    totalPages.textContent = numPages;
    
    // Initialize page positions
    function initializePages() {
        pages.forEach((page, index) => {
            // Set z-index in reverse order so first pages are on top
            page.style.zIndex = numPages - index;
            
            // Position even and odd pages differently
            if (index === 0) {
                // First page (cover)
                page.style.transform = 'rotateY(0deg)';
                page.style.left = '0';
            } else if (index === numPages - 1) {
                // Last page (back cover)
                page.style.transform = 'rotateY(0deg)';
                page.style.left = '50%';
            } else if (index % 2 === 1) {
                // Odd pages (right side)
                page.style.transform = 'rotateY(0deg)';
                page.style.left = '50%';
            } else {
                // Even pages (left side)
                page.style.transform = 'rotateY(0deg)';
                page.style.left = '0';
            }
            
            // Add click events to the page corners for turning
            page.addEventListener('click', function(e) {
                const rect = page.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Check if click is in the bottom right corner (approximately)
                if (x > rect.width * 0.8 && y > rect.height * 0.8) {
                    if (currentPage < numPages - 1) {
                        nextPage();
                    }
                }
                // Check if click is in the bottom left corner (approximately)
                else if (x < rect.width * 0.2 && y > rect.height * 0.8) {
                    if (currentPage > 0) {
                        prevPage();
                    }
                }
            });
        });
        
        // Show only the current page pair
        updatePageVisibility();
    }
    
    // Update which pages are visible based on current page
    function updatePageVisibility() {
        pages.forEach((page, index) => {
            // Determine if the page should be visible
            if (index === currentPage || index === currentPage + 1) {
                page.style.display = 'block';
                page.style.zIndex = numPages - index;
            } else {
                // Keep first and last page always in DOM for proper styling
                if (index === 0 || index === numPages - 1) {
                    page.style.display = 'block';
                    page.style.zIndex = 0;
                } else {
                    page.style.display = 'none';
                }
            }
        });
        
        // Update page number display
        pageNum.textContent = Math.ceil((currentPage + 1) / 2);
        
        // Update button states
        prevBtn.disabled = currentPage <= 0;
        nextBtn.disabled = currentPage >= numPages - 2;
    }
    
    // Go to previous page with animation
    function prevPage() {
        if (currentPage > 0) {
            // For smooth animation
            const pageToTurn = pages[currentPage];
            
            if (currentPage % 2 === 0) {
                // If on even page, go back 2 pages
                currentPage -= 2;
            } else {
                // If on odd page, go back 1 page
                currentPage -= 1;
            }
            
            // Add turning animation
            pageToTurn.classList.add('turning');
            setTimeout(() => {
                pageToTurn.classList.remove('turning');
                updatePageVisibility();
            }, 500);
            
            updatePageVisibility();
        }
    }
    
    // Go to next page with animation
    function nextPage() {
        if (currentPage < numPages - 2) {
            // For smooth animation
            const pageToTurn = pages[currentPage + 1];
            
            if (currentPage % 2 === 0) {
                // If on even page, go forward 1 page
                currentPage += 1;
            } else {
                // If on odd page, go forward 2 pages
                currentPage += 2;
            }
            
            // Add turning animation
            pageToTurn.classList.add('turning');
            setTimeout(() => {
                pageToTurn.classList.remove('turning');
                updatePageVisibility();
            }, 500);
            
            updatePageVisibility();
        }
    }
    
    // Navigation buttons event listeners
    prevBtn.addEventListener('click', prevPage);
    nextBtn.addEventListener('click', nextPage);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevPage();
        } else if (e.key === 'ArrowRight') {
            nextPage();
        }
    });
    
    // Zoom functionality
    zoomSlider.addEventListener('input', function() {
        const zoomLevel = parseFloat(this.value);
        flipbook.style.transform = `scale(${zoomLevel})`;
    });
    
    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', function() {
        const container = document.querySelector('.flipbook-container');
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.mozRequestFullScreen) { // Firefox
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) { // Chrome, Safari, Opera
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) { // IE/Edge
                container.msRequestFullscreen();
            }
            fullscreenBtn.textContent = 'Exit Fullscreen';
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            fullscreenBtn.textContent = 'Fullscreen';
        }
    });
    
    // Handle fullscreen changes
    document.addEventListener('fullscreenchange', updateFullscreenButtonText);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonText);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtonText);
    document.addEventListener('MSFullscreenChange', updateFullscreenButtonText);
    
    function updateFullscreenButtonText() {
        if (document.fullscreenElement) {
            fullscreenBtn.textContent = 'Exit Fullscreen';
        } else {
            fullscreenBtn.textContent = 'Fullscreen';
        }
    }
    
    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    flipbook.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    flipbook.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left
            nextPage();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right
            prevPage();
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Adjust flipbook size if needed
        const container = document.querySelector('.flipbook-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Maintain aspect ratio if needed
        // You can add specific code here if you want to maintain a certain aspect ratio
    });
    
    // Initialize the flipbook
    initializePages();
    
    // Error handling
    window.addEventListener('error', function(e) {
        console.error('Flipbook error:', e.message);
        // You could display a user-friendly error message here
    });
});
