document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    let currentIndex = 0;
    let images = [];

    // Function to load images from the generated JSON file
    async function loadImages() {
        try {
            // Fetch the image list from our generated JSON
            const response = await fetch('/data/sketches.json');
            const imageFiles = await response.json();
            
            images = imageFiles;
            
            // Create gallery items
            imageFiles.forEach((src, index) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = '/' + src; // Add leading slash for absolute path
                img.alt = `Sketch ${index + 1}`;
                
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
            // Fallback message if gallery can't be loaded
            gallery.innerHTML = '<p>Unable to load gallery images. Please try again later.</p>';
        }
    }

    // Open lightbox
    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = '/' + images[currentIndex];
        lightbox.style.display = 'block';
        
        // Update URL with current image (for sharing)
        const imageName = images[currentIndex].split('/').pop();
        history.replaceState(null, null, `#${imageName}`);
    }

    // Close lightbox
    document.querySelector('.close').addEventListener('click', () => {
        lightbox.style.display = 'none';
        history.replaceState(null, null, ' ');
    });

    // Previous image
    document.querySelector('.prev').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = '/' + images[currentIndex];
        const imageName = images[currentIndex].split('/').pop();
        history.replaceState(null, null, `#${imageName}`);
    });

    // Next image
    document.querySelector('.next').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = '/' + images[currentIndex];
        const imageName = images[currentIndex].split('/').pop();
        history.replaceState(null, null, `#${imageName}`);
    });

    // Close on outside click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            history.replaceState(null, null, ' ');
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                lightbox.style.display = 'none';
                history.replaceState(null, null, ' ');
            } else if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                lightboxImg.src = '/' + images[currentIndex];
                const imageName = images[currentIndex].split('/').pop();
                history.replaceState(null, null, `#${imageName}`);
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % images.length;
                lightboxImg.src = '/' + images[currentIndex];
                const imageName = images[currentIndex].split('/').pop();
                history.replaceState(null, null, `#${imageName}`);
            }
        }
    });

    // Check for direct link to image
    if (window.location.hash) {
        const imageName = window.location.hash.slice(1);
        const imageIndex = images.findIndex(src => src.includes(imageName));
        if (imageIndex !== -1) {
            openLightbox(imageIndex);
        }
    }

    // Load images when the page loads
    loadImages();
});