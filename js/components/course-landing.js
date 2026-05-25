/**
 * Course landing page: sticky mobile CTA, desktop enroll sidebar, carousel active slide glow.
 */
(function initCourseLanding() {
  function setupStickyCta() {
    const bar = document.getElementById('course-landing-sticky-cta');
    if (!bar) return;

    const showAfterPx = 420;

    function updateVisibility() {
      const shouldShow = window.scrollY > showAfterPx;
      bar.classList.toggle('is-visible', shouldShow);
      bar.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    }

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  }

  function setupStickySidebar() {
    const sidebar = document.getElementById('course-landing-sidebar');
    const pricing = document.getElementById('pricing');
    if (!sidebar || !pricing) return;

    const hero = document.querySelector('.course-landing-hero');
    let sidebarVisible = false;

    function updateSidebar() {
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      const pricingTop = pricing.getBoundingClientRect().top;
      const pastHero = heroBottom < window.innerHeight * 0.35;
      const pricingInView = pricingTop < window.innerHeight * 0.85;

      sidebarVisible = pastHero && !pricingInView;
      sidebar.classList.toggle('is-visible', sidebarVisible);
      sidebar.classList.toggle('is-hidden-pricing', pricingInView);
      sidebar.setAttribute('aria-hidden', sidebarVisible ? 'false' : 'true');
    }

    window.addEventListener('scroll', updateSidebar, { passive: true });
    window.addEventListener('resize', updateSidebar, { passive: true });
    updateSidebar();
  }

  function setupCarouselActiveGlow() {
    const carousel = document.getElementById('pranayam-slide-carousel');
    if (!carousel) return;

    const frames = () => Array.from(carousel.querySelectorAll('.course-landing-slide-frame'));

    function syncActive(index) {
      frames().forEach((frame, idx) => {
        frame.classList.toggle('is-active', idx === index);
      });
    }

    carousel.addEventListener('carousel:change', (event) => {
      const idx = event.detail && typeof event.detail.activeIndex === 'number'
        ? event.detail.activeIndex
        : 0;
      syncActive(idx);
    });

    const initial = Number(carousel.dataset.carouselActiveIndex || 0);
    syncActive(initial);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupStickyCta();
    setupStickySidebar();
    setupCarouselActiveGlow();
  });
})();
