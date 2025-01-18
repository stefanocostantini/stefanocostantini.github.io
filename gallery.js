document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    let currentIndex = 0;
    let images = [];

    // Touch handling variables
    let touchStartX = 0;
    let touchEndX = 0;
    let swipeHint = null;

    // Show loading state
    gallery.innerHTML = '<div class="loading">Loading gallery</div>';

    // Function to load images from the text file
    async function loadImages() {
        try {
            // Fetch the image list from our text file
            const response = await fetch('/sketches/black_and_white/black_and_white_imagelist.txt');
            const text = await response.text();
            
            // Convert text file into array of image paths
            // Filter out empty lines and comments
            images = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'))
                .map(filename => `/sketches/black_and_white/${filename}`);
            
            // Clear loading state
            gallery.innerHTML = '';
            
            // Create gallery items
            images.forEach((src, index) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Sketch ${index + 1}`;
                
                // Add loading state for each image
                img.onload = () => img.classList.add('loaded');
                
                // Add image title from filename
                const title = document.createElement('p');
                title.className = 'image-title';
                title.textContent = src.split('/').pop().split('.')[0].replace(/-/g, ' ');
                
                item.appendChild(img);
                item.appendChild(title);
                gallery.appendChild(item);

                item.addEventListener('click', () => openLightbox(index));
            });
        } catch (error) {
            console.error('Error loading images:', error);
            gallery.innerHTML = '<p>Unable to load gallery images. Please try again later.</p>';
        }
    }

    function createSwipeHint() {
        if (!swipeHint) {
            swipeHint = document.createElement('div');
            swipeHint.className = 'swipe-hint';
            swipeHint.textContent = 'Swipe for more images';
            lightbox.appendChild(swipeHint);
            
            // Hide hint after 3 seconds
            setTimeout(() => {
                swipeHint.style.display = 'none';
            }, 3000);
        }
    }

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        e.preventDefault(); // Prevent scrolling while swiping
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }

    function handleSwipe() {
        const swipeThreshold = 50; // minimum distance for a swipe
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe right - previous image
                navigateImages('prev');
            } else {
                // Swipe left - next image
                navigateImages('next');
            }
        }
    }

    function navigateImages(direction) {
        if (direction === 'prev') {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
        } else {
            currentIndex = (currentIndex + 1) % images.length;
        }
        lightboxImg.src = images[currentIndex];
        updateHash();
    }

    function updateHash() {
        const imageName = images[currentIndex].split('/').pop();
        history.replaceState(null, null, `#${imageName}`);
    }

    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = images[currentIndex];
        lightbox.style.display = 'block';
        updateHash();
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Show swipe hint on mobile
        if (window.innerWidth <= 768) {
            createSwipeHint();
        }

        // Add touch event listeners
        lightbox.addEventListener('touchstart', handleTouchStart, false);
        lightbox.addEventListener('touchmove', handleTouchMove, false);
        lightbox.addEventListener('touchend', handleTouchEnd, false);
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        history.replaceState(null, null, ' ');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Remove touch event listeners
        lightbox.removeEventListener('touchstart', handleTouchStart);
        lightbox.removeEventListener('touchmove', handleTouchMove);
        lightbox.removeEventListener('touchend', handleTouchEnd);

        if (swipeHint) {
            swipeHint.style.display = 'none';
        }
    }

    // Event Listeners
    document.querySelector('.close').addEventListener('click', closeLightbox);
    document.querySelector('.prev').addEventListener('click', () => navigateImages('prev'));
    document.querySelector('.next').addEventListener('click', () => navigateImages('next'));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Add double-tap support for mobile
    let lastTap = 0;
    lightbox.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 500 && tapLength > 0) {
            // Double tap detected
            closeLightbox();
            e.preventDefault();
        }
        lastTap = currentTime;
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                navigateImages('prev');
            } else if (e.key === 'ArrowRight') {
                navigateImages('next');
            }
        }
    });

    // Check for direct link to image
    window.addEventListener('load', () => {
        if (window.location.hash && images.length > 0) {
            const imageName = window.location.hash.slice(1);
            const imageIndex = images.findIndex(src => src.includes(imageName));
            if (imageIndex !== -1) {
                openLightbox(imageIndex);
            }
        }
    });

    // Load images when the page loads
    loadImages();
});