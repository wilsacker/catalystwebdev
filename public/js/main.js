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
  // 6. Portfolio carousel
  const carouselTrack = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  let currentIndex = 0;
  let slideInterval;

  const updateCarousel = (index) => {
    if (!carouselTrack) return;
    const offset = -index * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;
  };

  const showNextSlide = () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel(currentIndex);
  };

  const showPrevSlide = () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel(currentIndex);
  };

  const startAutoSlide = () => {
    slideInterval = setInterval(showNextSlide, 5000);
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