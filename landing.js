// Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeLanding();
    setupScrollAnimations();
    setupNumberCounters();
});

function initializeLanding() {
    console.log('Ghana Budget Planner Landing Page Loaded');
    
    // Animate floating shapes
    animateShapes();
    
    // Setup smooth scrolling for internal links
    setupSmoothScrolling();
}

function animateShapes() {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        // Add slight delay to each shape for staggered animation
        shape.style.animationDelay = `${index * 2}s`;
    });
}

function setupSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

function setupNumberCounters() {
    const previewAmounts = document.querySelectorAll('.preview-card .amount');
    
    previewAmounts.forEach((amount, index) => {
        const delay = index * 200;
        setTimeout(() => {
            animateNumber(amount);
        }, delay + 1000); // Start after initial animations
    });
}

function animateNumber(element) {
    const targetText = element.textContent;
    const targetValue = parseInt(targetText.replace(/[₵,\s]/g, ''));
    const duration = 1500;
    const increment = targetValue / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            current = targetValue;
            clearInterval(timer);
        }
        element.textContent = `₵ ${Math.round(current).toLocaleString()}`;
    }, 16);
}

// Add some interactive hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Feature cards hover effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Preview cards hover effect
    const previewCards = document.querySelectorAll('.preview-card');
    previewCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
        });
    });
});

// Parallax effect for floating shapes
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        shape.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Trigger entrance animations
    setTimeout(() => {
        const heroText = document.querySelector('.hero-text');
        const heroVisual = document.querySelector('.hero-visual');
        
        if (heroText) heroText.classList.add('animate-fade-in');
        if (heroVisual) heroVisual.classList.add('animate-slide-up');
    }, 100);
});