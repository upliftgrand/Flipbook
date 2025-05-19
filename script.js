// script.js - Main JavaScript for the Flipbook application
document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const totalPages = 12; // Update this based on your actual number of pages
    let zoomLevel = 1;
    let currentPage = 1;
    
    // Create flipbook pages
    function createPages() {
        const flipbook = document.getElementById('flipbook');
        
        // Clear existing pages
        flipbook.innerHTML = '';
        
        // Add pages
        for (let i = 1; i <= totalPages; i++) {
            const pageElement = document.createElement('div');
            
            // Make the first and last pages hard covers
            if (i === 1 || i === totalPages) {
                pageElement.className = 'hard';
                
                // Special styling for covers
                if (i === 1) {
                    pageElement.style.backgroundImage = `url('https://via.placeholder.com/800x1200/f5f5f5/333333?text=Front+Cover')`;
                } else {
                    pageElement.style.backgroundImage = `url('https://via.placeholder.com/800x1200/f5f5f5/333333?text=Back+Cover')`;
                }
            } else {
                // Regular pages
                pageElement.style.backgroundImage = `url('https://via.placeholder.com/800x1200/ffffff/333333?text=Page+${i-1}')`;
            }
            
            flipbook.appendChild(pageElement);
        }
    }
    
    // Initialize flipbook
    function initFlipbook() {
        createPages();
        document.getElementById('total-pages').textContent = totalPages;
        
        // Apply Turn.js to the flipbook
        $('#flipbook').turn({
            width: 922,
            height: 600,
            elevation: 50,
            gradients: true,
            autoCenter: true,
            duration: 1000,
            pages: totalPages,
            when: {
                turning: function(e, page, view) {
                    // Update current page
                    currentPage = page;
                    updatePageInfo();
                    updateThumbnails();
                },
                turned: function(e, page, view) {
                    // Update UI after page turn
                    updateNavButtons();
                }
            }
        });
        
        // Initialize controls and thumbnails
        initControls();
        createThumbnails();
        updatePageInfo();
        updateNavButtons();
        
        // Initial resize
        resizeFlipbook();
    }
    
    // Initialize controls
    function initControls() {
        // Previous button
        document.getElementById('prev-btn').addEventListener('click', function() {
            $('#flipbook').turn('previous');
        });
        
        // Next button
        document.getElementById('next-btn').addEventListener('click', function() {
            $('#flipbook').turn('next');
        });
        
        // First page button
        document.getElementById('first-btn').addEventListener('click', function() {
            $('#flipbook').turn('page', 1);
        });
        
        // Last page button
        document.getElementById('last-btn').addEventListener('click', function() {
            $('#flipbook').turn('page', totalPages);
        });
        
        // Zoom in button
        document.getElementById('zoom-in').addEventListener('click', function() {
            zoomIn();
        });
        
        // Zoom out button
        document.getElementById('zoom-out').addEventListener('click', function() {
            zoomOut();
        });
        
        // Toggle thumbnails
        document.getElementById('toggle-thumbnails').addEventListener('click', function() {
            const thumbnails = document.querySelector('.thumbnails-container');
            if (thumbnails.style.display === 'none' || thumbnails.style.display === '') {
                thumbnails.style.display = 'flex';
            } else {
                thumbnails.style.display = 'none';
            }
        });
        
        // Fullscreen button
        document.getElementById('fullscreen-btn').addEventListener('click', function() {
            toggleFullScreen();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', function(e) {
            switch(e.keyCode) {
                case 37: // left arrow
                    $('#flipbook').turn('previous');
                    break;
                case 39: // right arrow
                    $('#flipbook').turn('next');
                    break;
                case 36: // home
                    $('#flipbook').turn('page', 1);
                    break;
                case 35: // end
                    $('#flipbook').turn('page', totalPages);
                    break;
                case 107: // plus key
                    zoomIn();
                    break;
                case 109: // minus key
                    zoomOut();
                    break;
                default: return;
            }
            e.preventDefault();
        });
    }
    
    // Create thumbnails
    function createThumbnails() {
        const container = document.querySelector('.thumbnails-container');
        container.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            thumbnail.setAttribute('data-page', i);
            
            // Use the same image sources as the main pages
            if (i === 1) {
                thumbnail.style.backgroundImage = `url('https://via.placeholder.com/800x1200/f5f5f5/333333?text=Front+Cover')`;
            } else if (i === totalPages) {
                thumbnail.style.backgroundImage = `url('https://via.placeholder.com/800x1200/f5f5f5/333333?text=Back+Cover')`;
            } else {
                thumbnail.style.backgroundImage = `url('https://via.placeholder.com/800x1200/ffffff/333333?text=Page+${i-1}')`;
            }
            
            thumbnail.addEventListener('click', function() {
                const page = parseInt(this.getAttribute('data-page'));
                $('#flipbook').turn('page', page);
            });
            
            container.appendChild(thumbnail);
        }
        
        updateThumbnails();
    }
    
    // Update thumbnail highlighting
    function updateThumbnails() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumb => {
            thumb.classList.remove('active');
            if (parseInt(thumb.getAttribute('data-page')) === currentPage) {
                thumb.classList.add('active');
                
                // Scroll the thumbnails container to center the active thumbnail
                const container = document.querySelector('.thumbnails-container');
                container.scrollLeft = thumb.offsetLeft - container.clientWidth / 2 + thumb.clientWidth / 2;
            }
        });
    }
    
    // Update page information
    function updatePageInfo() {
        document.getElementById('current-page').textContent = currentPage;
    }
    
    // Update navigation buttons
    function updateNavButtons() {
        document.getElementById('prev-btn').disabled = currentPage === 1;
        document.getElementById('next-btn').disabled = currentPage === totalPages;
        document.getElementById('first-btn').disabled = currentPage === 1;
        document.getElementById('last-btn').disabled = currentPage === totalPages;
    }
    
    // Zoom in function
    function zoomIn() {
        if (zoomLevel < 2) {
            zoomLevel += 0.2;
            applyZoom();
        }
    }
    
    // Zoom out function
    function zoomOut() {
        if (zoomLevel > 0.6) {
            zoomLevel -= 0.2;
            applyZoom();
        }
    }
    
    // Apply zoom level
    function applyZoom() {
        document.getElementById('flipbook').style.transform = `scale(${zoomLevel})`;
    }
    
    // Toggle fullscreen
    function toggleFullScreen() {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const container = document.querySelector('.flipbook-container');
        
        if (!document.fullscreenElement && 
            !document.mozFullScreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            // Enter fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
        
        // Resize flipbook after fullscreen change
        setTimeout(resizeFlipbook, 1000);
    }
    
    // Function to resize the flipbook based on window size
    function resizeFlipbook() {
        const container = document.querySelector('.flipbook-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate appropriate dimensions while maintaining aspect ratio
        let width = containerWidth * 0.9;
        let height = width * 0.65; // Maintain aspect ratio
        
        if (height > containerHeight * 0.8) {
            height = containerHeight * 0.8;
            width = height / 0.65;
        }
        
        $('#flipbook').turn('size', width, height);
        
        // Center the flipbook
        const flipbook = document.getElementById('flipbook');
        flipbook.style.top = ((containerHeight - height) / 2) + 'px';
        flipbook.style.left = ((containerWidth - width) / 2) + 'px';
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        resizeFlipbook();
    });
    
    // Handle orientation change on mobile devices
    window.addEventListener('orientationchange', function() {
        resizeFlipbook();
    });
    
    // Initialize the flipbook
    initFlipbook();
});
