/**
 * THE DOG 2in1 Foot Bubble Cleanser - Landing Page Script
 * Features:
 *  1. Smooth scrolling for internal navigation & hero hook
 *  2. Accordion interaction for FAQ section
 *  3. CTA button click handling ('아직 준비 중입니다.' modal alert)
 *  4. Image error fallback handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initCtaButtons();
  initFaqAccordion();
  initSmoothScroll();
  initBackToTop();
  initImageFallbacks();
});

/**
 * 1. CTA Button Handlers
 * Shows '아직 준비 중입니다.' alert as requested in specifications.
 * Tracks distinct locations (hero, final, nav) via data attributes.
 */
function initCtaButtons() {
  const ctaLinks = document.querySelectorAll('#cta-hero, #cta-final-btn');
  ctaLinks.forEach(link => {
    link.addEventListener('click', () => {
      const location = link.getAttribute('data-cta-location') || 'unknown';
      console.log(`[CTA Clicked] Location: ${location} -> https://link.coupang.com/a/hCfCKAFszc`);
    });
  });

  const mockButtons = document.querySelectorAll('.btn-cta-nav:not([href])');
  mockButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Scroll to final CTA or navigate directly
      const finalCta = document.getElementById('cta-final');
      if (finalCta) {
        finalCta.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * 2. FAQ Accordion Interaction
 * Toggles question panels and updates ARIA attributes for accessibility.
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-answer-panel');
    const icon = item.querySelector('.faq-icon');
    
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close other items for a cleaner editorial feel
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          const otherPanel = otherItem.querySelector('.faq-answer-panel');
          const otherIcon = otherItem.querySelector('.faq-icon');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.setAttribute('hidden', '');
          if (otherIcon) otherIcon.textContent = '+';
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('hidden', '');
        if (icon) icon.textContent = '+';
      } else {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('hidden');
        if (icon) icon.textContent = '−';
      }
    });
  });
}

/**
 * 3. Smooth Scroll Navigation
 * Scrolls smoothly to target section on clicking hero button or nav links.
 */
function initSmoothScroll() {
  // Hero Curiosity Hook Scroll
  const heroScrollBtn = document.getElementById('hero-scroll-btn');
  if (heroScrollBtn) {
    heroScrollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const solutionSection = document.getElementById('solution');
      if (solutionSection) {
        solutionSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Anchor Links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/**
 * 4. Back To Top Button
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * 5. Image Fallbacks
 * Applies visual fallback if an image fails to load.
 */
function initImageFallbacks() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', function() {
      const parent = this.parentElement;
      if (parent) {
        parent.classList.add('img-fallback');
      }
      this.style.display = 'none';
    });
  });
}
