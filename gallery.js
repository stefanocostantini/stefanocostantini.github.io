document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    let currentIndex = 0;
    let images = [];

    // Function to load images from the sketches directory
    async function loadImages() {
        try {
            // In a real GitHub Pages setup, you would list your images in the sketches directory
            // This is just a placeholder that you'll need to update with your actual images
            const imageFiles = [
                'sketches/sketch1.jpg',
                'sketches/sketch2.jpg',
                'sketches/sketch3.jpg'
                // Add more images as you add them to your sketches folder
            ];

            images = imageFiles;
            
            // Create gallery items
            imageFiles.forEach((src, index) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Sketch ${index + 1}`;
                
                item.appendChild(img);
                gallery.appendChild(item);

                item.addEventListener('click', () => openLightbox(index));
            });
        } catch (error) {
            console.error('Error loading images:', error);
        }
    }

    // Open lightbox
    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = images[currentIndex];
        lightbox.style.display = 'block';
    }

    // Close lightbox
    document.querySelector('.close').addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    // Previous image
    document.querySelector('.prev').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex];
    });

    // Next image
    document.querySelector('.next').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex];
    });

    // Close on outside click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                lightbox.style.display = 'none';
            } else if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                lightboxImg.src = images[currentIndex];
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % images.length;
                lightboxImg.src = images[currentIndex];
            }
        }
    });

    // Load images when the page loads
    loadImages();
});