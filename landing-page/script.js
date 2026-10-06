/**
 * THE DOG 2in1 Foot Bubble Cleanser - Landing Page Script
 * Features:
 *  1. GA4 Tracking: section_view (IntersectionObserver) & cta_click
 *  2. CTA Button Handlers & Navigation
 *  3. Accordion interaction for FAQ section
 *  4. Smooth scrolling for internal navigation & hero hook
 *  5. Back to top button
 *  6. Image error fallback handling
 */

// Global guard flags to avoid duplicate listener/observer registration if script re-executes
window.__gaTrackingInitialized = window.__gaTrackingInitialized || false;

document.addEventListener('DOMContentLoaded', () => {
  initGaTracking();
  initCtaButtons();
  initFaqAccordion();
  initSmoothScroll();
  initBackToTop();
  initImageFallbacks();
});

/**
 * GA4 Event Tracking Helper
 * Safely forwards events via gtag without throwing errors if gtag is blocked or unavailable.
 */
function sendGaEvent(eventName, params) {
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch (err) {
      console.warn('[GA4] Event dispatch failed:', err);
    }
  } else {
    // Fallback when gtag script is blocked or not loaded yet
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params
    });
  }
}

/**
 * GA4 Tracking Setup
 * 1) section_view:
 *    - Observes #hero-title (hero), #detail-space-title (detail), #purchase-title (cta)
 *    - 50% visibility threshold
 *    - Root margin excludes sticky header (-68px top)
 *    - Only fires when document is visible (document.visibilityState === 'visible')
 *    - Fires exactly once per section_name per page load
 *    - Handles tab return (visibilitychange) for titles currently in viewport
 * 2) cta_click:
 *    - #cta-hero / data-cta-location="hero" -> button_location: "hero"
 *    - #cta-final-btn / data-cta-location="final" -> button_location: "final"
 *    - Fires on click and keyboard Enter activation
 *    - Single event per physical click/enter, re-clickable
 *    - Does NOT prevent or delay default link navigation
 */
function initGaTracking() {
  if (window.__gaTrackingInitialized) {
    return;
  }
  window.__gaTrackingInitialized = true;

  // ================= 1. section_view =================
  const sectionTargets = [
    { id: 'hero-title', section_name: 'hero' },
    { id: 'detail-space-title', section_name: 'detail' },
    { id: 'purchase-title', section_name: 'cta' }
  ];

  const sentSections = new Set();
  const observerMap = new Map();

  // Sticky header height offset: top -68px
  const headerEl = document.getElementById('header') || document.querySelector('.site-header');
  const headerHeight = headerEl ? headerEl.offsetHeight : 68;
  const rootMargin = `-${headerHeight}px 0px 0px 0px`;

  // Function to check if target qualifies and send event
  function triggerSectionView(targetElement, sectionName) {
    if (sentSections.has(sectionName)) return;
    if (document.visibilityState !== 'visible') return;

    sentSections.add(sectionName);
    sendGaEvent('section_view', {
      section_name: sectionName
    });

    // Unobserve immediately after sending once
    if (observer && targetElement) {
      observer.unobserve(targetElement);
    }
  }

  // Helper to check if an element currently meets >50% visibility in viewport below header
  function isElementVisible50(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const visibleTop = Math.max(rect.top, headerHeight);
    const visibleBottom = Math.min(rect.bottom, window.innerHeight || document.documentElement.clientHeight);
    const visibleHeight = visibleBottom - visibleTop;

    if (visibleHeight <= 0 || rect.height <= 0) return false;
    const visibleRatio = visibleHeight / rect.height;
    return visibleRatio >= 0.5;
  }

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const sectionName = observerMap.get(entry.target);
          if (sectionName) {
            triggerSectionView(entry.target, sectionName);
          }
        }
      });
    }, {
      root: null,
      rootMargin: rootMargin,
      threshold: [0.5]
    });

    sectionTargets.forEach(({ id, section_name }) => {
      const el = document.getElementById(id);
      if (el) {
        observerMap.set(el, section_name);
        observer.observe(el);
      }
    });
  }

  // Handle visibilitychange: when user switches back to this tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      sectionTargets.forEach(({ id, section_name }) => {
        if (!sentSections.has(section_name)) {
          const el = document.getElementById(id);
          if (el && isElementVisible50(el)) {
            triggerSectionView(el, section_name);
          }
        }
      });
    }
  });

  // ================= 2. cta_click =================
  // Select hero and final CTA elements uniquely
  const heroCta = document.querySelector('#cta-hero, [data-cta-location="hero"]');
  const finalCta = document.querySelector('#cta-final-btn, #cta-final a.btn-primary-cta, [data-cta-location="final"]');

  const ctaButtons = [];
  if (heroCta) ctaButtons.push({ element: heroCta, location: 'hero' });
  if (finalCta && finalCta !== heroCta) ctaButtons.push({ element: finalCta, location: 'final' });

  ctaButtons.forEach(({ element, location }) => {
    // Avoid duplicate event listener binding on the element
    if (element.__gaCtaBound) return;
    element.__gaCtaBound = true;

    // Normal click handler (also triggers on keyboard Enter/Space for <a> elements in standard browsers)
    element.addEventListener('click', () => {
      sendGaEvent('cta_click', {
        button_location: location
      });
    });
  });
}

/**
 * CTA Button Handlers & Navigation
 * Keeps console logging and nav mock button scroll without blocking outbound links.
 */
function initCtaButtons() {
  const mockButtons = document.querySelectorAll('.btn-cta-nav:not([href])');
  mockButtons.forEach(btn => {
    if (btn.__bound) return;
    btn.__bound = true;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const finalCta = document.getElementById('cta-final');
      if (finalCta) {
        finalCta.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * FAQ Accordion Interaction
 * Toggles question panels and updates ARIA attributes for accessibility.
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-answer-panel');
    const icon = item.querySelector('.faq-icon');
    
    if (!trigger || !panel) return;
    if (trigger.__bound) return;
    trigger.__bound = true;

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
 * Smooth Scroll Navigation
 * Scrolls smoothly to target section on clicking hero button or nav links.
 */
function initSmoothScroll() {
  // Hero Curiosity Hook Scroll
  const heroScrollBtn = document.getElementById('hero-scroll-btn');
  if (heroScrollBtn && !heroScrollBtn.__bound) {
    heroScrollBtn.__bound = true;
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
    if (link.__bound) return;
    link.__bound = true;
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
 * Back To Top Button
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn && !backToTopBtn.__bound) {
    backToTopBtn.__bound = true;
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
 * Image Fallbacks
 * Applies visual fallback if an image fails to load.
 */
function initImageFallbacks() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.__fallbackBound) return;
    img.__fallbackBound = true;
    img.addEventListener('error', function() {
      const parent = this.parentElement;
      if (parent) {
        parent.classList.add('img-fallback');
      }
      this.style.display = 'none';
    });
  });
}
