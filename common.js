// Common JavaScript for all pages
document.addEventListener('DOMContentLoaded', function() {
    initializeCommon();
});

function initializeCommon() {
    console.log('Ghana Budget Planner - Common JS Loaded');
    
    // Setup scroll animations
    setupScrollAnimations();
    
    // Add loading animation
    addLoadingAnimation();
    
    // Setup navbar behavior
    setupNavbar();
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

function addLoadingAnimation() {
    // Add loaded class to body for CSS transitions
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
}

function setupNavbar() {
    // Navbar scroll behavior
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add background on scroll
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Utility functions
function formatCurrency(amount) {
    return '₵ ' + Math.round(amount).toLocaleString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Add CSS for navbar scroll behavior
const style = document.createElement('style');
style.textContent = `
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .loaded .animate-fade-in {
        animation: fadeInUp 1s ease;
    }
    
    .loaded .animate-slide-up {
        animation: slideInRight 1s ease 0.3s both;
    }
    
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .animate-on-scroll.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);