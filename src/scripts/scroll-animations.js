/* eslint-env browser */
/* global window, document, IntersectionObserver, setTimeout */
// Scroll-triggered animations using Intersection Observer
class ScrollAnimations {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately
      this.showAllElements();
      return;
    }

    // Create intersection observer
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            // Unobserve after animation to prevent re-triggering
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // Observe all elements with scroll-animate class
    this.observeElements();
  }

  observeElements() {
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(element => {
      this.observer.observe(element);
    });
  }

  showAllElements() {
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(element => {
      element.classList.add('animate-in');
    });
  }

  // Method to add new elements to observe
  observe(element) {
    if (this.observer && element) {
      this.observer.observe(element);
    }
  }

  // Method to refresh observer (useful for dynamic content)
  refresh() {
    if (this.observer) {
      this.observer.disconnect();
      this.observeElements();
    }
  }
}

// Enhanced button interactions
class ButtonEnhancements {
  constructor() {
    this.init();
  }

  init() {
    // Add enhanced button classes to all buttons
    const buttons = document.querySelectorAll('button, .btn, a[role="button"]');
    buttons.forEach(button => {
      button.classList.add('btn-enhanced');

      // Add ripple effect on click
      button.addEventListener('click', e => {
        this.createRipple(e, button);
      });
    });
  }

  createRipple(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    // Add ripple styles if not already present
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple-animation 0.6s linear;
          pointer-events: none;
        }
        
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    button.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
}

// Smooth scrolling utility
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    // Add smooth scrolling to all anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    });
  }
}

// Initialize all enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ScrollAnimations();
  new ButtonEnhancements();
  new SmoothScroll();
});

// Export for use in other scripts
window.ScrollAnimations = ScrollAnimations;
window.ButtonEnhancements = ButtonEnhancements;
window.SmoothScroll = SmoothScroll;
