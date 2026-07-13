// public/js/animations.js
// Centralized animation handling for premium global graphics

document.addEventListener('DOMContentLoaded', () => {
  // Scroll reveal using IntersectionObserver
  const revealElements = document.querySelectorAll('[data-anim]');
  const observerOptions = {
    threshold: 0.1,
  };
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    // Add the animation class based on data-anim attribute
    const animClass = `reveal-${el.getAttribute('data-anim')}`;
    el.classList.add(animClass);
    revealObserver.observe(el);
  });

  // Initialize low‑opacity network canvas (reuse existing bg-network.js if present)
  if (typeof initBackgroundNetwork === 'function') {
    initBackgroundNetwork();
  }
});
