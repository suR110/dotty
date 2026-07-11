document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // --- References ---
    const bouquet = document.getElementById('start-bouquet');
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainContainer = document.getElementById('main-container');
    const bgMusic = document.getElementById('bg-music');
    const heartsContainer = document.getElementById('hearts-container');
    let hasStarted = false;

    // --- Load ALL Pictures into the Galleries ---
    const allPictures = [
        'pictures/d1ca05e4-aab3-4a02-850b-00e2c0c446f5.jpg',
        'pictures/unnamed (1).jpg', 'pictures/unnamed (1).png',
        'pictures/unnamed (11).jpg', 'pictures/unnamed (12).jpg',
        'pictures/unnamed (13).jpg', 'pictures/unnamed (14).jpg', 'pictures/unnamed (15).jpg',
        'pictures/unnamed (16).jpg', 'pictures/unnamed (18).jpg',
        'pictures/unnamed (19).jpg', 'pictures/unnamed (2).jpg', 'pictures/unnamed (2).png',
        'pictures/unnamed (3).jpg', 'pictures/unnamed (3).png', 'pictures/unnamed (4).jpg',
        'pictures/unnamed (4).png', 'pictures/unnamed (5).jpg', 'pictures/unnamed (5).png',
        'pictures/unnamed (6).jpg', 'pictures/unnamed (6).png', 'pictures/unnamed (7).jpg',
        'pictures/unnamed (7).png', 'pictures/unnamed (8).jpg', 'pictures/unnamed (9).jpg',
        'pictures/unnamed.jpg', 'pictures/unnamed.png'
    ];

    // Shuffle array for random distribution
    for (let i = allPictures.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPictures[i], allPictures[j]] = [allPictures[j], allPictures[i]];
    }

    const galleries = [
        document.getElementById('gallery-1'),
        document.getElementById('gallery-2'),
        document.getElementById('gallery-3'),
        document.getElementById('gallery-4')
    ];

    // Distribute images among the 4 galleries
    let currentGallery = 0;
    allPictures.forEach((src) => {
        const isDesign = src.includes('designs');
        
        const img = document.createElement('img');
        img.src = src;
        img.className = isDesign ? 'gallery-design' : 'gallery-item';
        
        // Randomize sizes but keep natural aspect ratio so faces are never cropped!
        const size = isDesign ? (Math.random() * 150 + 100) : (Math.random() * 200 + 250);
        img.style.height = `${size}px`;
        img.style.width = 'auto'; // Never force aspect ratio
        img.style.transform = `translateY(${(Math.random() - 0.5) * 50}px) rotate(${(Math.random() - 0.5) * 10}deg)`;
        
        // Create grid container if not exists
        let grid = galleries[currentGallery].querySelector('.gallery-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'gallery-grid';
            galleries[currentGallery].appendChild(grid);
        }
        
        grid.appendChild(img);
        currentGallery = (currentGallery + 1) % galleries.length;
    });

    // --- The Click to Enter ---
    bouquet.addEventListener('click', () => {
        if (hasStarted) return;
        hasStarted = true;

        // Start Audio (catch error if any so script doesn't crash)
        bgMusic.play().catch(e => console.log("Audio play failed: ", e));

        // Start Hearts
        setInterval(createHeart, 300);

        // Animate Bouquet Out
        gsap.to(bouquet, {
            scale: 2,
            opacity: 0,
            rotation: 15,
            duration: 1,
            ease: "power2.in",
            onComplete: () => {
                welcomeScreen.style.opacity = '0';
                setTimeout(() => {
                    welcomeScreen.classList.add('hidden');
                    mainContainer.classList.remove('hidden');
                    
                    // Small delay to ensure browser has rendered mainContainer before calculating GSAP triggers
                    requestAnimationFrame(() => {
                        initVerticalScroll();
                    });
                }, 500);
            }
        });
    });

    // --- Floating Hearts Generator ---
    const heartSymbols = ['❤️', '💖', '🤍', '✨', '🌷'];
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        heart.innerText = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        heart.style.left = `${Math.random() * 100}vw`;
        const duration = Math.random() * 5 + 5;
        heart.style.animationDuration = `${duration}s`;
        const scale = Math.random() * 1.5 + 0.5;
        heart.style.fontSize = `${24 * scale}px`;
        heartsContainer.appendChild(heart);
        setTimeout(() => heart.remove(), duration * 1000);
    }

    // --- Vertical Scroll Animations (Bulletproof) ---
    function initVerticalScroll() {
        // Init Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical', 
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => { lenis.raf(time * 1000) });
        gsap.ticker.lagSmoothing(0);

        // Simple fade-up for gallery items as you scroll down
        const galleryItems = gsap.utils.toArray('.gallery-item, .gallery-design, .glass-card, .grand-title');
        
        galleryItems.forEach(item => {
            gsap.from(item, {
                y: 100,
                opacity: 0,
                duration: 1.5,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%", // trigger when item is 85% down the viewport
                    toggleActions: "play none none reverse"
                }
            });
        });
    }
});
