document.addEventListener('DOMContentLoaded', () => {
  // 1. Smooth page load
  document.body.classList.add('loaded');

  // DOM Elements
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const tabs = document.querySelectorAll('.services-tabs .tab');
  const panels = document.querySelectorAll('.tab-panel');
  const aboutTabs = document.querySelectorAll('.about-tabs .about-tab');
  const aboutPanels = document.querySelectorAll('.about-panel');
  const carouselTrack = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-btn.left');
  const nextBtn = document.querySelector('.carousel-btn.right');
  const contactForm = document.querySelector('.contact-form');
  const thankYouModal = document.getElementById('thank-you-modal');
  const closeModalBtn = document.querySelector('.close-modal');

  // 2. Smooth scroll for anchor nav links

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 3. Analog theme toggle

  const setTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const toggleTheme = () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  toggle?.addEventListener('click', toggleTheme);

  // 4. Initialize saved preference
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);

  // 5. Tab switching in Services section

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Skip if already active
      if (tab.classList.contains('active')) return;

      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Hide all panels and remove active/fade classes
      panels.forEach(panel => {
        panel.classList.remove('active', 'fade-out', 'fade-in');
        panel.style.display = 'none';
      });

      // Show new panel instantly
      const targetId = tab.dataset.tab;
      const newPanel = document.getElementById(targetId);
      if (newPanel) {
        newPanel.style.display = 'flex';
        newPanel.classList.add('active');
      }
    });
  });

  // 5b. Tab switching in About section

  aboutTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = tab.dataset.tab;
      const targetPanel = document.getElementById(targetId);
      if (!targetPanel) return;

      // Deactivate all tabs and panels
      aboutTabs.forEach(t => t.classList.remove('active'));
      aboutPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
      });

      // Activate clicked tab and panel
      tab.classList.add('active');
      targetPanel.classList.add('active');
      targetPanel.style.display = 'flex';
    });
  });

  // On load, hide all but the first active panel
  aboutPanels.forEach((panel, index) => {
    panel.style.display = panel.classList.contains('active') || index === 0 ? 'flex' : 'none';
  });
  
  // Carousel
  let currentIndex = 0;
  let slideInterval;

  let lastDirection = 'right';

  const updateCarousel = (index) => {
    if (!carouselTrack) return;

    const currentSlide = document.querySelector('.carousel-slide.current-slide');
    const newSlide = slides[index];

    if (currentSlide === newSlide) return;

    const incomingClass = lastDirection === 'right' ? 'slide-in-right' : 'slide-in-left';
    const outgoingClass = lastDirection === 'right' ? 'slide-out-left' : 'slide-out-right';

    // Reset animation classes on all slides
    slides.forEach(slide => {
      slide.classList.remove('slide-in-right', 'slide-in-left', 'slide-out-left', 'slide-out-right');
    });

    // Prepare new slide
    newSlide.style.removeProperty('display'); // reset any inline display:none
    void newSlide.offsetWidth; // Force reflow to restart animation

    // Animate outgoing slide
    if (currentSlide) {
      currentSlide.classList.add(outgoingClass);

      currentSlide.addEventListener('animationend', function handleOut() {
        currentSlide.classList.remove('current-slide', outgoingClass);
        currentSlide.style.display = 'none';
        currentSlide.removeEventListener('animationend', handleOut);

        newSlide.classList.add('current-slide');
        newSlide.classList.add(incomingClass);
      });
    }
  };

  const showNextSlide = () => {
    lastDirection = 'right';
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel(currentIndex);
  };

  const showPrevSlide = () => {
    lastDirection = 'left';
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel(currentIndex);
  };

  const startAutoSlide = () => {
    slideInterval = setInterval(showNextSlide, 15000);
  };

  const stopAutoSlide = () => {
    clearInterval(slideInterval);
  };

  nextBtn?.addEventListener('click', () => {
    stopAutoSlide();
    showNextSlide();
    startAutoSlide();
  });

  prevBtn?.addEventListener('click', () => {
    stopAutoSlide();
    showPrevSlide();
    startAutoSlide();
  });

  if (carouselTrack && slides.length > 0) {
    updateCarousel(currentIndex);
    startAutoSlide();
  }

  // Contact Form
  if (contactForm && thankYouModal) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(contactForm);
      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(() => {
        thankYouModal.classList.remove('hidden');
        contactForm.reset();
      }).catch(() => {
        alert('There was an error sending your message.');
      });
    });

    closeModalBtn?.addEventListener('click', () => {
      thankYouModal.classList.add('hidden');
    });
  }
});