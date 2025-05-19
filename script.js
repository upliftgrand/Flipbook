// script.js - Enhanced JavaScript for Uplift Grand Flipbook
document.addEventListener('DOMContentLoaded', function() {
    // Configuration - Change these values to match your book
    const bookTitle = "Uplift Grand Magazine";
    const totalPages = 20; // Update this based on your actual number of pages
    let zoomLevel = 1;
    let currentPage = 1;
    
    // Image paths - Update these with your actual image paths
    function getPageImageUrl(pageNumber) {
        // Cover pages
        if (pageNumber === 1) {
            return 'images/cover.jpg'; // Front cover
        } else if (pageNumber === totalPages) {
            return 'images/backcover.jpg'; // Back cover
        } else {
            // Regular pages - using numbered format (page2.jpg, page3.jpg, etc.)
            return `images/page${pageNumber}.jpg`;
        }
    }
    
    // Create flipbook pages
    function createPages() {
        const flipbook = document.getElementById('flipbook');
        
        // Clear existing pages
        flipbook.innerHTML = '';
        
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Loading pages...';
        document.querySelector('.flipbook-container').appendChild(loadingIndicator);
        
        // Add pages
        for (let i = 1; i <= totalPages; i++) {
            const pageElement = document.createElement('div');
            
            // Make the first and last pages hard covers
            if (i === 1 || i === totalPages) {
                pageElement.className = 'hard';
                
                // Since we can't know if your images exist, start with placeholders
                // and set up background images to load asynchronously
                pageElement.style.backgroundColor = '#f0f0f0';
                
                const img = new Image();
                img.onload = function() {
                    pageElement.style.backgroundImage = `url('${getPageImageUrl(i)}')`;
                };
                img.onerror = function() {
                    // If the image fails to load, use placeholder
                    pageElement.style.backgroundImage = i === 1 ? 
                        `url('https://via.placeholder.com/800x1200/f0f0f0/333333?text=Front+Cover')` : 
                        `url('https://via.placeholder.com/800x1200/f0f0f0/333333?text=Back+Cover')`;
                };
                img.src = getPageImageUrl(i);
            } else {
                // Regular pages
                pageElement.style.backgroundColor = '#fff';
                
                const img = new Image();
                img.onload = function() {
                    pageElement.style.backgroundImage = `url('${getPageImageUrl(i)}')`;
                };
                img.onerror = function() {
                    // If the image fails to load, use placeholder
                    pageElement.style.backgroundImage = `url('https://via.placeholder.com/800x1200/ffffff/333333?text=Page+${i}')`;
                };
                img.src = getPageImageUrl(i);
            }
            
            flipbook.appendChild(pageElement);
        }
        
        // Set document title
        document.title = bookTitle;
    }
    
    // Initialize flipbook
    function initFlipbook() {
        createPages();
        document.getElementById('total-pages').textContent = totalPages;
        
        // Set a small timeout to ensure DOM is ready
        setTimeout(function() {
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
                        
                        // Remove loading indicator if present
                        const loadingIndicator = document.querySelector('.loading-indicator');
                        if (loadingIndicator) {
                            loadingIndicator.remove();
                        }
                    },
                    start: function(e, pageObj) {
                        // Add a specific class during animation
                        document.body.classList.add('turning-page');
                    },
                    end: function(e, pageObj) {
                        // Remove class after animation
                        document.body.classList.remove('turning-page');
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
            
            // Remove loading indicator after initialization
            setTimeout(function() {
                const loadingIndicator = document.querySelector('.loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.remove();
                }
            }, 1000);
        }, 100);
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
                updateThumbnails(); // Ensure active thumbnail is highlighted
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
            // Don't process keystrokes if in an input field
            if (e.target.tagName.toLowerCase() === 'input' || 
                e.target.tagName.toLowerCase() === 'textarea') {
                return;
            }
            
            switch(e.keyCode || e.which) {
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
                case 187: // plus key (with shift)
                    zoomIn();
                    break;
                case 109: // minus key
                case 189: // minus key (without shift)
                    zoomOut();
                    break;
                default: return;
            }
            e.preventDefault();
        });
        
        // Add touch swipe support for mobile
        let startX, startY;
        let distX, distY;
        const threshold = 50; // Minimum distance to be considered a swipe
        
        document.addEventListener('touchstart', function(e) {
            const touchobj = e.changedTouches[0];
            startX = touchobj.pageX;
            startY = touchobj.pageY;
        }, false);
        
        document.addEventListener('touchmove', function(e) {
            // Prevent page scroll while swiping in the flipbook area
            if (e.target.closest('#flipbook')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchend', function(e) {
            if (!e.target.closest('#flipbook')) return;
            
            const touchobj = e.changedTouches[0];
            distX = touchobj.pageX - startX;
            distY = touchobj.pageY - startY;
            
            // If horizontal distance is greater than vertical and greater than threshold
            if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > threshold) {
                if (distX > 0) {
                    // Swiped right, go to previous page
                    $('#flipbook').turn('previous');
                } else {
                    // Swiped left, go to next page
                    $('#flipbook').turn('next');
                }
                e.preventDefault();
            }
        }, false);
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
            const img = new Image();
            img.onload = function() {
                thumbnail.style.backgroundImage = `url('${getPageImageUrl(i)}')`;
            };
            img.onerror = function() {
                // If image fails to load, use placeholder
                if (i === 1) {
                    thumbnail.style.backgroundImage = `url('https://via.placeholder.com/150x200/f0f0f0/333333?text=Cover')`;
                } else if (i === totalPages) {
                    thumbnail.style.backgroundImage = `url('https://via.placeholder.com/150x200/f0f0f0/333333?text=Back')`;
                } else {
                    thumbnail.style.backgroundImage = `url('https://via.placeholder.com/150x200/ffffff/333333?text=${i}')`;
                }
            };
            img.src = getPageImageUrl(i);
            
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
                if (container.style.display !== 'none') {
                    setTimeout(function() {
                        container.scrollLeft = thumb.offsetLeft - container.clientWidth / 2 + thumb.clientWidth / 2;
                    }, 100);
                }
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
        
        // Only resize if Turn.js is initialized
        if ($('#flipbook').turn('is')) {
            $('#flipbook').turn('size', width, height);
            
            // Center the flipbook
            const flipbook = document.getElementById('flipbook');
            flipbook.style.top = ((containerHeight - height) / 2) + 'px';
            flipbook.style.left = ((containerWidth - width) / 2) + 'px';
        }
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            resizeFlipbook();
        }, 250);
    });
    
    // Handle orientation change on mobile devices
    window.addEventListener('orientationchange', function() {
        setTimeout(resizeFlipbook, 500);
    });
    
    // Handle fullscreen change
    document.addEventListener('fullscreenchange', resizeFlipbook);
    document.addEventListener('webkitfullscreenchange', resizeFlipbook);
    document.addEventListener('mozfullscreenchange', resizeFlipbook);
    document.addEventListener('MSFullscreenChange', resizeFlipbook);
    
    // Initialize the flipbook
    initFlipbook();
});
