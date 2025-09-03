document.addEventListener('DOMContentLoaded', function() {
    const gallery_watercolours = document.getElementById('gallery-watercolours');
    const gallery_digital = document.getElementById('gallery-digital');
    // const gallery_bandw = document.getElementById('gallery-bandw');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    let currentIndex = 0;
    let currentGalleryImages = []; // Store current gallery's images

    // Touch handling variables
    let touchStartX = 0;
    let touchEndX = 0;
    let swipeHint = null;

    // Show loading state
    gallery_watercolours.innerHTML = '<div class="loading">Loading gallery</div>';
    gallery_digital.innerHTML = '<div class="loading">Loading gallery</div>';
    // gallery_bandw.innerHTML = '<div class="loading">Loading gallery</div>';

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
            const galleryImages = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'))
                .map(filename => baseImagePath ? `${baseImagePath}/${filename}` : filename);
            
            // Clear loading state
            galleryElement.innerHTML = '';
            
            // Create gallery items
            galleryImages.forEach((src, index) => {
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
                    if (typeof onImageClick === 'function') {
                        currentGalleryImages = galleryImages; // Update current gallery images
                        onImageClick(index, galleryImages);
                    }
                });
            });
    
            return galleryImages;
        } catch (error) {
            console.error('Error loading images:', error);
            galleryElement.innerHTML = '<p>Unable to load gallery images. Please try again later.</p>';
            throw error;
        }
    }

    // LOAD THE SKETCHES GALLERIES
    loadGalleryImages(
        gallery_watercolours,
        '/sketches/watercolours/watercolours_imagelist.txt',
        '/sketches/watercolours',
        openLightbox
    );

    loadGalleryImages(
        gallery_digital,
        '/sketches/digital/digital_imagelist.txt',
        '/sketches/digital',
        openLightbox
    );

    //loadGalleryImages(
    //    gallery_bandw,
    //    '/sketches/black_and_white/black_and_white_imagelist.txt',
    //    '/sketches/black_and_white',
    //    openLightbox
    //);


    function createSwipeHint() {
        if (!swipeHint) {
            swipeHint = document.createElement('div');
            swipeHint.className = 'swipe-hint';
            swipeHint.textContent = 'Swipe for more images';
            lightbox.appendChild(swipeHint);
            
            setTimeout(() => {
                swipeHint.style.display = 'none';
            }, 3000);
        }
    }

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                navigateImages('prev');
            } else {
                navigateImages('next');
            }
        }
    }

    function navigateImages(direction) {
        if (currentGalleryImages.length === 0) return;
        
        if (direction === 'prev') {
            currentIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        } else {
            currentIndex = (currentIndex + 1) % currentGalleryImages.length;
        }
        lightboxImg.src = currentGalleryImages[currentIndex];
        updateHash();
    }

    function updateHash() {
        const imageName = currentGalleryImages[currentIndex].split('/').pop();
        history.replaceState(null, null, `#${imageName}`);
    }

    function openLightbox(index, images) {
        currentIndex = index;
        currentGalleryImages = images; // Update current gallery images
        lightboxImg.src = images[currentIndex];
        lightbox.style.display = 'block';
        updateHash();
        document.body.style.overflow = 'hidden';

        if (window.innerWidth <= 768) {
            createSwipeHint();
        }

        lightbox.addEventListener('touchstart', handleTouchStart, false);
        lightbox.addEventListener('touchmove', handleTouchMove, false);
        lightbox.addEventListener('touchend', handleTouchEnd, false);
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        history.replaceState(null, null, ' ');
        document.body.style.overflow = '';
        
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

    let lastTap = 0;
    lightbox.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 500 && tapLength > 0) {
            closeLightbox();
            e.preventDefault();
        }
        lastTap = currentTime;
    });

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
        if (window.location.hash) {
            const imageName = window.location.hash.slice(1);
            const findImage = (images) => images.findIndex(src => src.includes(imageName));
            
            // Search in all galleries
            if (currentGalleryImages.length > 0) {
                const imageIndex = findImage(currentGalleryImages);
                if (imageIndex !== -1) {
                    openLightbox(imageIndex, currentGalleryImages);
                }
            }
        }
    });
});