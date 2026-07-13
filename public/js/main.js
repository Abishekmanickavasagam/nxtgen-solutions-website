// main.js - NxtGen-Solutions Interactive Features

// 1. Scroll animations using IntersectionObserver
document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach((el) => observer.observe(el));

  // Staggered reveal for grid cards
  const revealCards = document.querySelectorAll('.reveal-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  revealCards.forEach((card) => cardObserver.observe(card));
});

// 2. Counter animation
function animateCounters() {
  const counters = document.querySelectorAll('.counter-card');
  counters.forEach((counter) => {
    const targetVal = parseInt(counter.getAttribute('data-target'), 10);
    if (isNaN(targetVal)) return;

    const spanElement = counter.querySelector('span');
    const spanText = spanElement ? spanElement.outerHTML : '';
    const suffix = counter.getAttribute('data-suffix') || '';
    const duration = 1500; // ms
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * targetVal);
      
      counter.innerHTML = currentValue + suffix + spanText;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.innerHTML = targetVal + suffix + spanText;
      }
    }
    requestAnimationFrame(update);
  });
}

// Trigger counters when scrolled into view
const counterSection = document.querySelector('.counters');
if (counterSection) {
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCounters();
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  counterObserver.observe(counterSection);
}

// 3. Sticky Navigation & Mobile Menu Setup
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });

    // Close mobile menu on clicking any link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('active');
      });
    });
  }
}

// 4. FAQ Accordion
function initAccordion() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Optional: Close other FAQs
        document.querySelectorAll('.faq-item.active').forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });

        item.classList.toggle('active');
      });
    }
  });
}

// 5. Generic Tab Switching (using data-target and IDs)
function initGenericTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;

      // Find parent container or target context to scope tab group
      const parentSection = btn.closest('.tabs') || btn.closest('section');
      if (!parentSection) return;

      // Deactivate all buttons in this tab group
      parentSection.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      // Activate this button
      btn.classList.add('active');

      // Deactivate all panels in this tab group (supports .tab-panel and .tab-content)
      const allPanels = parentSection.querySelectorAll('.tab-panel, .tab-content, .tab-panels > div, .tab-content-wrapper > div');
      allPanels.forEach((panel) => {
        panel.classList.remove('active');
        panel.classList.add('hidden'); // default hidden state
      });

      // Activate corresponding panel by ID
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
        targetPanel.classList.remove('hidden');
      }
    });
  });
}

// 6. Form validation
function validateField(field) {
  const parent = field.parentElement;
  let errorMsg = parent.querySelector('.error-msg');
  let valid = true;

  if (field.hasAttribute('required') && !field.value.trim()) {
    valid = false;
    field.classList.add('error');
    if (!errorMsg) {
      errorMsg = document.createElement('span');
      errorMsg.className = 'error-msg';
      errorMsg.textContent = 'This field is required';
      parent.appendChild(errorMsg);
    }
  } else if (field.type === 'email' && field.value.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value.trim())) {
      valid = false;
      field.classList.add('error');
      if (!errorMsg) {
        errorMsg = document.createElement('span');
        errorMsg.className = 'error-msg';
        errorMsg.textContent = 'Please enter a valid email address';
        parent.appendChild(errorMsg);
      } else {
        errorMsg.textContent = 'Please enter a valid email address';
      }
    } else {
      field.classList.remove('error');
      if (errorMsg) errorMsg.remove();
    }
  } else if (field.type === 'tel' && field.value.trim()) {
    const phoneRegex = /^\+?[0-9\s\-]{8,20}$/;
    if (!phoneRegex.test(field.value.trim())) {
      valid = false;
      field.classList.add('error');
      if (!errorMsg) {
        errorMsg = document.createElement('span');
        errorMsg.className = 'error-msg';
        errorMsg.textContent = 'Please enter a valid phone number';
        parent.appendChild(errorMsg);
      } else {
        errorMsg.textContent = 'Please enter a valid phone number';
      }
    } else {
      field.classList.remove('error');
      if (errorMsg) errorMsg.remove();
    }
  } else if (field.type === 'file' && field.value) {
    const file = field.files[0];
    if (file) {
      const allowedExtensions = /(\.pdf|\.doc|\.docx)$/i;
      if (!allowedExtensions.exec(file.name)) {
        valid = false;
        field.classList.add('error');
        if (!errorMsg) {
          errorMsg = document.createElement('span');
          errorMsg.className = 'error-msg';
          errorMsg.textContent = 'Only .pdf, .doc, and .docx files are allowed';
          parent.appendChild(errorMsg);
        } else {
          errorMsg.textContent = 'Only .pdf, .doc, and .docx files are allowed';
        }
      } else {
        field.classList.remove('error');
        if (errorMsg) errorMsg.remove();
      }
    }
  } else {
    field.classList.remove('error');
    if (errorMsg) errorMsg.remove();
  }

  return valid;
}

function initFormValidation() {
  document.querySelectorAll('form').forEach((form) => {
    // Add real-time validation on blur
    form.querySelectorAll('input, select, textarea').forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let formValid = true;

      form.querySelectorAll('input, select, textarea').forEach((field) => {
        if (!validateField(field)) {
          formValid = false;
        }
      });

      if (formValid) {
        // Collect form data as JSON
        const payload = {
          fullName: (form.querySelector('#c-name') ? form.querySelector('#c-name').value : '').trim(),
          phone: (form.querySelector('#c-phone') ? form.querySelector('#c-phone').value : '').trim(),
          email: (form.querySelector('#c-email') ? form.querySelector('#c-email').value : '').trim(),
          service: (form.querySelector('#c-service') ? form.querySelector('#c-service').value : '').trim(),
          message: (form.querySelector('#c-msg') ? form.querySelector('#c-msg').value : '').trim()
        };

        // If service is a hidden input, let's look for it
        if (!payload.service && form.querySelector('input[type="hidden"]#c-service')) {
          payload.service = form.querySelector('input[type="hidden"]#c-service').value.trim();
        }
        
        // Show loading state and disable button to prevent duplicate submissions
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="loading-spinner" style="display:inline-block; width:12px; height:12px; border:2px solid #ffffff; border-radius:50%; border-top-color:transparent; animation:spin 0.8s linear infinite; margin-right:8px; vertical-align:middle;"></span>Sending...';
        }

        // Clear any previous error box
        let errorContainer = form.querySelector('.form-error-msg');
        if (errorContainer) {
          errorContainer.style.display = 'none';
        }

        // Send JSON data to the Vercel contact API
        fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        .then(async (response) => {
          const data = await response.json();
          if (response.ok && data.status === 'success') {
            // Success: clear form fields, hide form, and show success message
            form.reset();
            const successContainer = form.parentElement.querySelector('.success-msg');
            if (successContainer) {
              const successText = successContainer.querySelector('p');
              if (successText) {
                successText.textContent = 'Thank you! Your enquiry has been submitted successfully. Our team will contact you within one business day.';
              }
              const successHeading = successContainer.querySelector('h3');
              if (successHeading) {
                successHeading.innerHTML = '✓ Enquiry Submitted';
              }
              successContainer.style.display = 'block';
              form.style.display = 'none';
            } else {
              const success = document.createElement('div');
              success.className = 'success-msg';
              success.innerHTML = '<h3>✓ Enquiry Submitted</h3><p>Thank you! Your enquiry has been submitted successfully. Our team will contact you within one business day.</p>';
              form.parentElement.appendChild(success);
              form.remove();
            }
          } else {
            // Error returned from server
            throw new Error(data.message || 'Something went wrong. Please try again later.');
          }
        })
        .catch(err => {
          console.error('Submission failed:', err);
          
          // Display the inline error message dynamically
          if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'form-error-msg';
            errorContainer.style.color = '#EF4444';
            errorContainer.style.background = '#FEF2F2';
            errorContainer.style.border = '1px solid #FEE2E2';
            errorContainer.style.padding = '10px 15px';
            errorContainer.style.borderRadius = '8px';
            errorContainer.style.marginTop = '15px';
            errorContainer.style.fontSize = '0.9rem';
            errorContainer.style.textAlign = 'center';
            errorContainer.style.fontWeight = '500';
            form.appendChild(errorContainer);
          }
          errorContainer.textContent = err.message || 'Something went wrong. Please try again later.';
          errorContainer.style.display = 'block';

          // Restore button state
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        });
      }
    });
  });
}

// Ripple effect helper
function initButtonRipples() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.btn, .read-more, .service-hub-card');
    if (!target) return;
    
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    const existing = target.querySelector('.ripple');
    if (existing) existing.remove();
    
    target.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

// 3D Tilt Hover Animation Helper
function init3DTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    // Initial standard transitions
    card.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.65s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      // Calculate rotation angles (subtle divisor 25)
      const angleX = -(yc - y) / 25;
      const angleY = (xc - x) / 25;
      
      // Subtle dampening transition during movement to remove jitter
      card.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.61, 0.355, 1)';
      card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
      
      // Update mouse position CSS variables for spotlight effect
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
    
    card.addEventListener('mouseleave', () => {
      // Elegant, slower transition back to flat orientation
      card.style.transition = 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.75s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.75s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}

// Magnetic Button Hover Effect
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-magnetic');
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      // Soft pull towards cursor
      btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

// Scroll Reveal observer
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-scale-in');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));
}

// Initialize components when DOM is fully loaded or header gets injected
function initAll() {
  initNavigation();
  initAccordion();
  initGenericTabs();
  initFormValidation();
  initButtonRipples();
  init3DTilt();
  initMagneticButtons();
  initScrollReveal();
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

// Add a hook to re-run navigation logic if nav is injected dynamically (as fallback)
window.addEventListener('nav-injected', () => {
  initNavigation();
});
