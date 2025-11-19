// Scroll Progress Bar
const scrollProgressBar = document.getElementById('scroll-progress');
function updateScrollProgress() {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    if (scrollProgressBar) {
        scrollProgressBar.style.width = scrolled + '%';
    }
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress(); // Initial call

// Disable scroll snap after first scroll
let snapDisabled = false;
const mainContentThreshold = 100;

// Debounced scroll handler for better performance
function handleScroll() {
    if (snapDisabled || window.scrollY <= mainContentThreshold) return;
    document.documentElement.style.scrollSnapType = 'none';
    snapDisabled = true;
    window.removeEventListener('scroll', handleScroll);
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Set current year in footer
const currentYearEl = document.getElementById('current-year');
if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
}

// Intersection Observer for scroll animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all hidden elements
document.querySelectorAll('.hidden').forEach(el => observer.observe(el));

// Skeleton Screen Loading
const skeletonLoader = document.getElementById('skeleton-loader');
const mainContent = document.querySelector('.main-content');

function hideSkeleton() {
    if (skeletonLoader) {
        skeletonLoader.classList.add('hidden');
        // Remove skeleton after animation
        setTimeout(() => {
            if (skeletonLoader.parentNode) {
                skeletonLoader.remove();
            }
        }, 500);
    }
}

// Hide skeleton when page is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Simulate loading time for better UX
        setTimeout(hideSkeleton, 800);
    });
} else {
    setTimeout(hideSkeleton, 800);
}

// Also hide skeleton when all images are loaded
window.addEventListener('load', () => {
    setTimeout(hideSkeleton, 300);
});

// Animated Tag Cloud - Random positioning and interactions
function initTagCloud() {
    const tagCloud = document.getElementById('tag-cloud');
    if (!tagCloud) return;
    
    const tags = tagCloud.querySelectorAll('.tag');
    
    // Add random initial positions for more organic look
    tags.forEach((tag, index) => {
        // Random slight rotation
        const rotation = (Math.random() - 0.5) * 4;
        tag.style.transform = `rotate(${rotation}deg)`;
        
        // Add click interaction
        tag.addEventListener('click', function() {
            // Pulse animation on click
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'float 6s ease-in-out infinite';
            }, 10);
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.width = '0px';
            ripple.style.height = '0px';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.pointerEvents = 'none';
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            const size = Math.max(this.offsetWidth, this.offsetHeight);
            ripple.animate([
                { width: '0px', height: '0px', opacity: 0.6 },
                { width: `${size * 2}px`, height: `${size * 2}px`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'ease-out'
            }).onfinish = () => ripple.remove();
        });
    });
    
    // Add mouse move parallax effect
    tagCloud.addEventListener('mousemove', (e) => {
        const rect = tagCloud.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        tags.forEach((tag, index) => {
            const tagRect = tag.getBoundingClientRect();
            const tagX = tagRect.left + tagRect.width / 2 - rect.left;
            const tagY = tagRect.top + tagRect.height / 2 - rect.top;
            
            const dx = x - tagX;
            const dy = y - tagY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 200;
            
            if (distance < maxDistance) {
                const force = (1 - distance / maxDistance) * 10;
                const angle = Math.atan2(dy, dx);
                const moveX = Math.cos(angle) * force;
                const moveY = Math.sin(angle) * force;
                
                tag.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${(Math.random() - 0.5) * 4}deg)`;
            }
        });
    });
    
    tagCloud.addEventListener('mouseleave', () => {
        tags.forEach(tag => {
            tag.style.transform = '';
        });
    });
}

// Initialize tag cloud when visible
const tagCloudObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            initTagCloud();
            tagCloudObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

const tagCloudContainer = document.querySelector('.tag-cloud-container');
if (tagCloudContainer) {
    tagCloudObserver.observe(tagCloudContainer);
}

// Interactive Timeline - Expandable Details
function initInteractiveTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-clickable');
    
    timelineItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Prevent event bubbling
            e.stopPropagation();
            
            // Toggle active state
            const isActive = this.classList.contains('active');
            
            // Close all other items (optional - remove if you want multiple open)
            timelineItems.forEach(otherItem => {
                if (otherItem !== this && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.setAttribute('aria-expanded', 'false');
                    const otherDetails = otherItem.querySelector('.timeline-details');
                    if (otherDetails) {
                        otherDetails.style.maxHeight = '0';
                        setTimeout(() => {
                            otherDetails.style.opacity = '0';
                        }, 50);
                    }
                }
            });
            
            // Toggle current item
            if (isActive) {
                this.classList.remove('active');
                this.setAttribute('aria-expanded', 'false');
                const details = this.querySelector('.timeline-details');
                if (details) {
                    details.style.maxHeight = details.scrollHeight + 'px';
                    setTimeout(() => {
                        details.style.maxHeight = '0';
                        details.style.opacity = '0';
                    }, 10);
                }
            } else {
                this.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
                const details = this.querySelector('.timeline-details');
                if (details) {
                    // Get the natural height
                    details.style.maxHeight = 'none';
                    const height = details.scrollHeight;
                    details.style.maxHeight = '0';
                    // Trigger reflow
                    void details.offsetHeight;
                    // Animate to full height
                    details.style.maxHeight = height + 'px';
                    details.style.opacity = '1';
                }
            }
        });
        
        // Add keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-expanded', 'false');
        
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Initialize timeline when visible
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            initInteractiveTimeline();
            timelineObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

const timeline = document.querySelector('.timeline');
if (timeline) {
    timelineObserver.observe(timeline);
}

// Scrollytelling - Scroll-based storytelling
function initScrollytelling() {
    const scrollytellingSection = document.getElementById('story');
    if (!scrollytellingSection) return;
    
    const stages = scrollytellingSection.querySelectorAll('.story-stage');
    const container = scrollytellingSection.querySelector('.scrollytelling-container');
    const sectionHeight = scrollytellingSection.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollableHeight = sectionHeight - viewportHeight;
    
    // Calculate stage thresholds
    const stageThresholds = Array.from(stages).map((stage, index) => {
        return (index + 1) / (stages.length + 1);
    });
    
    function updateScrollytelling() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const sectionTop = scrollytellingSection.offsetTop;
        const sectionScroll = scrollTop - sectionTop;
        const scrollProgress = Math.max(0, Math.min(1, sectionScroll / scrollableHeight));
        
        // Update background based on scroll progress
        const currentStageIndex = Math.floor(scrollProgress * stages.length);
        const stageNumber = Math.min(currentStageIndex + 1, stages.length);
        scrollytellingSection.setAttribute('data-stage', stageNumber);
        
        // Update active stage
        stages.forEach((stage, index) => {
            const stageProgress = (scrollProgress - (index / stages.length)) * stages.length;
            const isActive = stageProgress >= 0 && stageProgress < 1;
            const isPrev = stageProgress < 0 && stageProgress > -0.5;
            
            stage.classList.remove('active', 'prev');
            if (isActive) {
                stage.classList.add('active');
            } else if (isPrev) {
                stage.classList.add('prev');
            }
            
            // Parallax effect for visual elements
            if (isActive) {
                const parallaxOffset = (stageProgress - 0.5) * 50;
                const visual = stage.querySelector('.story-visual');
                if (visual) {
                    visual.style.transform = `translateY(${parallaxOffset}px)`;
                }
            }
        });
        
        // Animate text changes
        stages.forEach((stage, index) => {
            if (stage.classList.contains('active')) {
                const textElements = stage.querySelectorAll('.story-title, .story-description');
                textElements.forEach((el, i) => {
                    el.style.animationDelay = `${i * 0.1}s`;
                    if (!el.classList.contains('animated')) {
                        el.classList.add('animated');
                    }
                });
            }
        });
    }
    
    // Throttled scroll handler
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateScrollytelling();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        const newSectionHeight = scrollytellingSection.offsetHeight;
        const newScrollableHeight = newSectionHeight - window.innerHeight;
        updateScrollytelling();
    });
    
    // Initial call
    updateScrollytelling();
}

// Initialize scrollytelling when section is visible
const scrollytellingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            initScrollytelling();
            scrollytellingObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

const scrollytellingSection = document.getElementById('story');
if (scrollytellingSection) {
    scrollytellingObserver.observe(scrollytellingSection);
}

// ASMR Sound System
class ASMRSoundSystem {
    constructor() {
        this.audioContext = null;
        this.isMuted = localStorage.getItem('soundsMuted') === 'true';
        this.isInitialized = false;
        this.setupMuteButton();
        this.setupInitialization();
    }

    initAudioContext() {
        if (this.audioContext) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    setupInitialization() {
        // Initialize on first user interaction
        const initOnInteraction = () => {
            if (!this.isInitialized) {
                this.initAudioContext();
            }
        };

        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, initOnInteraction, { once: true });
        });
    }

    setupMuteButton() {
        const muteBtn = document.getElementById('toggle-sound');
        if (!muteBtn) return;

        muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
        if (this.isMuted) {
            muteBtn.classList.add('muted');
        }

        muteBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            localStorage.setItem('soundsMuted', this.isMuted);
            muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
            if (this.isMuted) {
                muteBtn.classList.add('muted');
            } else {
                muteBtn.classList.remove('muted');
            }
            this.playClickSound();
        });
    }

    // Soft click sound (ASMR-style)
    playClickSound() {
        if (this.isMuted) return;
        if (!this.audioContext) {
            this.initAudioContext();
            if (!this.audioContext) return;
        }
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // Camera shutter sound (soft ASMR)
    playShutterSound() {
        if (this.isMuted) return;
        if (!this.audioContext) {
            this.initAudioContext();
            if (!this.audioContext) return;
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        oscillator1.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.06, this.audioContext.currentTime + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.15);
        oscillator2.start(this.audioContext.currentTime);
        oscillator2.stop(this.audioContext.currentTime + 0.15);
    }

    // Soft ambient noise (very subtle)
    playAmbientNoise() {
        if (this.isMuted || !this.audioContext) return;
        
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.01; // Very quiet white noise
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.loop = true;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.value = 0.02; // Very quiet
        
        source.start(0);
        return { source, gainNode };
    }

    // Soft tap/click for buttons
    playTapSound() {
        if (this.isMuted) return;
        if (!this.audioContext) {
            this.initAudioContext();
            if (!this.audioContext) return;
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.12);
    }
}

// Initialize sound system
const soundSystem = new ASMRSoundSystem();

// Wow Effect - Scale up images on scroll
function initWowEffect() {
    const wowCards = document.querySelectorAll('.case-study-card.wow-effect');
    if (wowCards.length === 0) return;

    let ticking = false;
    let activeCard = null;

    function updateWowEffect() {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const scrollThreshold = 100; // Start effect after scrolling 100px

        wowCards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardTop = cardRect.top + scrollY;
            const cardCenter = cardTop + cardRect.height / 2;
            const distanceFromCenter = Math.abs(scrollY + viewportHeight / 2 - cardCenter);
            const maxDistance = viewportHeight * 0.8;

            // Calculate scroll progress for this card
            const scrollProgress = Math.max(0, Math.min(1, 1 - (distanceFromCenter / maxDistance)));

            if (scrollProgress > 0.1 && scrollY > scrollThreshold) {
                // Activate wow effect
                if (activeCard !== card) {
                    // Deactivate previous card
                    if (activeCard) {
                        activeCard.classList.remove('scrolling');
                    }
                    activeCard = card;
                    card.classList.add('scrolling');
                }

                // Scale based on scroll progress
                const scale = 1 + (scrollProgress * 2); // Scale from 1 to 3
                const image = card.querySelector('.case-logo');
                const textContent = card.querySelector('.case-text-content');
                const meta = card.querySelector('.case-meta');

                if (image && scrollProgress > 0.2) {
                    // Start scaling when scroll progress > 0.2
                    const scaleValue = Math.min(3.5, 1 + (scrollProgress - 0.2) * 3.125);
                    image.style.position = 'fixed';
                    image.style.top = '50%';
                    image.style.left = '50%';
                    image.style.zIndex = '9998';
                    image.style.transform = `translate(-50%, -50%) scale(${scaleValue})`;
                    image.style.opacity = Math.min(0.95, 0.6 + scrollProgress * 0.35);
                    image.style.maxWidth = '100vw';
                    image.style.maxHeight = '100vh';
                    image.style.width = 'auto';
                    image.style.height = 'auto';
                    image.style.objectFit = 'cover';
                }

                if (textContent) {
                    textContent.style.opacity = Math.max(0, 1 - scrollProgress * 2);
                    textContent.style.transform = `translateY(${scrollProgress * 20}px)`;
                }

                if (meta) {
                    meta.style.opacity = Math.max(0, 1 - scrollProgress * 2);
                }
            } else {
                // Deactivate if not in range
                if (activeCard === card) {
                    card.classList.remove('scrolling');
                    activeCard = null;
                    const image = card.querySelector('.case-logo');
                    const textContent = card.querySelector('.case-text-content');
                    const meta = card.querySelector('.case-meta');

                    if (image) {
                        image.style.transform = '';
                        image.style.opacity = '';
                        image.style.position = '';
                        image.style.top = '';
                        image.style.left = '';
                        image.style.zIndex = '';
                        image.style.maxWidth = '';
                        image.style.maxHeight = '';
                        image.style.width = '';
                        image.style.height = '';
                        image.style.objectFit = '';
                    }

                    if (textContent) {
                        textContent.style.opacity = '';
                        textContent.style.transform = '';
                    }

                    if (meta) {
                        meta.style.opacity = '';
                    }
                }
            }
        });
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateWowEffect();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateWowEffect);

    // Initial call
    updateWowEffect();
}

// Add click sounds to interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // Click sounds for buttons and clickable elements
    const clickableElements = document.querySelectorAll(
        'button, .btn-case, .btn-contact, .btn-nav-cv, .timeline-clickable, .tag, a[href^="#"]'
    );
    
    clickableElements.forEach(element => {
        element.addEventListener('click', () => {
            soundSystem.playClickSound();
        });
    });

    // Shutter sound for images on hover
    const images = document.querySelectorAll('img.case-logo, img[loading="lazy"]');
    images.forEach(img => {
        let hoverTimeout;
        img.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                soundSystem.playShutterSound();
            }, 200); // Small delay for natural feel
        });
        
        img.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
        });
    });

    // Tap sound for form inputs
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            soundSystem.playTapSound();
        });
    });

    // Initialize Wow Effect
    initWowEffect();
});

// Language switcher
const languageSelect = document.getElementById('language-select');
if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        if (e.target.value === 'pl') {
            alert("Polska wersja już niedługo!");
        }
    });
}

// Collaboration form handler
const collabForm = document.getElementById('collab-form');
if (collabForm) {
    collabForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert("Thanks for your message! I'll be in touch soon 😊");
        this.reset();
    });
}

// Visitor counter animation
const visitorCountEl = document.getElementById('visitor-count');
if (visitorCountEl) {
    const targetCount = 127;
    let count = 0;
    const increment = Math.ceil(targetCount / 50);
    
    const counterInterval = setInterval(() => {
        count += increment;
        if (count >= targetCount) {
            count = targetCount;
            clearInterval(counterInterval);
        }
        visitorCountEl.textContent = count;
    }, 50);
}

// Dark mode toggle
const toggleThemeBtn = document.getElementById('toggle-theme');
const body = document.body;
if (toggleThemeBtn) {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        toggleThemeBtn.textContent = '☀️';
    }
    
    toggleThemeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        toggleThemeBtn.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}