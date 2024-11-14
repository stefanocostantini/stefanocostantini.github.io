document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    let currentIndex = 0;
    let images = [];

    // Function to load images from the text file
    async function loadImages() {
        try {
            // Fetch the image list from our text file
            const response = await fetch('/sketches/_imagelist.txt');
            const text = await response.text();
            
            // Convert text file into array of image paths
            // Filter out empty lines and comments
            images = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'))
                .map(filename => `/sketches/${filename}`);
            
            // Create gallery items
            images.forEach((src, index) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = src;
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
            gallery.innerHTML = '<p>Unable to load gallery images. Please try again later.</p>';
        }
    }

    // Open lightbox
    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = images[currentIndex];
        lightbox.style.display = 'block';
        updateHash();
    }

    // Update URL hash
    function updateHash() {
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
        lightboxImg.src = images[currentIndex];
        updateHash();
    });

    // Next image
    document.querySelector('.next').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex];
        updateHash();
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
                lightboxImg.src = images[currentIndex];
                updateHash();
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % images.length;
                lightboxImg.src = images[currentIndex];
                updateHash();
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