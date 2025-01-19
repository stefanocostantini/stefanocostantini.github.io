document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.getElementById('gallery');
    const gallery_watercolours = document.getElementById('gallery-watercolours');
    const gallery_digital = document.getElementById('gallery-digital');
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
    gallery_watercolours.innerHTML = '<div class="loading">Loading gallery</div>';
    gallery_digital.innerHTML = '<div class="loading">Loading gallery</div>';

    // Function to load images from the text file
    async function loadGalleryImages(galleryElement, imageListPath, baseImagePath = '', onImageClick = null) {
        if (!galleryElement || typeof imageListPath !== 'string') {
            throw new Error('Gallery element and image list path are required');
        }
    
        try {
            // Fetch the image list from the specified text file
            const response = await fetch(imageListPath);
            const text = await response.text();
            
            // Convert text file into array of image paths
            // Filter out empty lines and comments
            const images = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'))
                .map(filename => baseImagePath ? `${baseImagePath}/${filename}` : filename);
            
            // Clear loading state
            galleryElement.innerHTML = '';
            
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
                galleryElement.appendChild(item);
    
                // Handle click events with the images array
                item.addEventListener('click', () => {
                    console.log('Click handler called with:',
                        {
                            index: index,
                            currentImage: src,
                            allImages: images
                        }
                    );

                    if (typeof onImageClick === 'function') {
                        onImageClick(index, images);
                    }
                });
            });
    
            return images; // Return the array of image paths for potential further use
        } catch (error) {
            console.error('Error loading images:', error);
            galleryElement.innerHTML = '<p>Unable to load gallery images. Please try again later.</p>';
            throw error;
        }
    }


    // LOAD THE SKETCHES GALLERIES
    // Calling the function for the black and white gallery

    loadGalleryImages(
        gallery,
        '/sketches/black_and_white/black_and_white_imagelist.txt',
        '/sketches/black_and_white',
        openLightbox
    )

    // Calling the function for the watercolours gallery

    // Calling the function for the digital gallery
    


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

    function openLightbox(index, images) {
        console.log('Lightbox opened with:', {
            index: index,
            currentImage: images[index],
            totalImages: images.length,
            allImages: images
        })
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