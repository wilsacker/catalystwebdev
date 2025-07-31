document.addEventListener('DOMContentLoaded', () => {
  // 1. Smooth page load
  document.body.classList.add('loaded');

  // 2. Smooth scroll for anchor nav links
  const navLinks = document.querySelectorAll('a[href^="#"]');

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
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

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
  const tabs = document.querySelectorAll('.services-tabs .tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Skip if already active
      if (tab.classList.contains('active')) return;

      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Hide current panel with fade-out
      panels.forEach(panel => {
        if (panel.classList.contains('active')) {
          panel.classList.add('fade-out');
          setTimeout(() => {
            panel.classList.remove('active', 'fade-out');
          }, 300);
        }
      });

      // Show new panel with fade-in
      const targetId = tab.dataset.tab;
      const newPanel = document.getElementById(targetId);
      if (newPanel) {
        setTimeout(() => {
          newPanel.classList.add('active', 'fade-in');
          setTimeout(() => {
            newPanel.classList.remove('fade-in');
          }, 300);
        }, 300);
      }
    });
  });

  // 5b. Tab switching in About section
  const aboutTabs = document.querySelectorAll('.about-tabs .tab');
  const aboutPanels = document.querySelectorAll('.about-panel');

  aboutTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;

      // Deactivate all tabs and panels
      aboutTabs.forEach(t => t.classList.remove('active'));
      aboutPanels.forEach(panel => panel.classList.remove('active'));

      // Activate selected tab and panel
      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
  
  // 6. Portfolio carousel
  const carouselTrack = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-btn.left');
  const nextBtn = document.querySelector('.carousel-btn.right');

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
});