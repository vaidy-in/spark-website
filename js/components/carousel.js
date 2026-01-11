/**
 * Lightweight, reusable 1-pane carousel for marketing pages.
 *
 * Usage:
 * - Wrap the carousel root with: data-carousel
 * - Add a scroll container with: data-carousel-track
 * - Add slides with: data-carousel-slide
 * - Add controls with: data-carousel-prev / data-carousel-next
 * - Add dot buttons with: data-carousel-dot="0..n-1"
 *
 * Captions can be any HTML (including <a href="..."> links).
 */

function initCarousel(carouselRoot) {
  const carouselId = carouselRoot.id || '(no-id)';
  const track = carouselRoot.querySelector('[data-carousel-track]');
  const slides = Array.from(carouselRoot.querySelectorAll('[data-carousel-slide]'));
  const prevBtn = carouselRoot.querySelector('[data-carousel-prev]');
  const nextBtn = carouselRoot.querySelector('[data-carousel-next]');
  const dotButtons = Array.from(carouselRoot.querySelectorAll('[data-carousel-dot]'));
  const enableFullscreen = carouselRoot.hasAttribute('data-carousel-fullscreen') && !carouselRoot.hasAttribute('data-carousel-in-fullscreen');

  console.log('[spark-marketing][carousel] init', {
    carouselId,
    slideCount: slides.length,
    hasTrack: !!track,
    hasPrev: !!prevBtn,
    hasNext: !!nextBtn,
    dotCount: dotButtons.length,
    enableFullscreen
  });

  if (!track || slides.length === 0) {
    console.log('[spark-marketing][carousel] skip init (missing track/slides)', { carouselId });
    return;
  }

  let activeIndex = 0;

  function setButtonDisabledStates() {
    if (prevBtn) prevBtn.disabled = activeIndex <= 0;
    if (nextBtn) nextBtn.disabled = activeIndex >= slides.length - 1;
  }

  function setDotActiveStates() {
    dotButtons.forEach((btn, idx) => {
      const isActive = idx === activeIndex;
      btn.classList.toggle('bg-brand-600', isActive);
      btn.classList.toggle('bg-slate-300', !isActive);
      btn.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function setActiveIndex(nextIndex, reason) {
    const clamped = Math.max(0, Math.min(nextIndex, slides.length - 1));
    if (clamped === activeIndex) return;
    activeIndex = clamped;
    carouselRoot.dataset.carouselActiveIndex = String(activeIndex);

    setButtonDisabledStates();
    setDotActiveStates();

    console.log('[spark-marketing][carousel] active slide changed', {
      carouselId,
      activeIndex,
      reason
    });
  }

  function scrollToIndex(index, reason, behavior = 'smooth') {
    const target = slides[index];
    if (!target) return;

    const left = target.offsetLeft - track.offsetLeft;
    console.log('[spark-marketing][carousel] scrollToIndex', {
      carouselId,
      fromIndex: activeIndex,
      toIndex: index,
      left,
      reason,
      behavior
    });

    track.scrollTo({ left, behavior });
    // Optimistically update; the observer will correct if needed.
    setActiveIndex(index, `scrollTo(${reason})`);
  }

  function getNearestIndex() {
    const trackLeft = track.scrollLeft;
    let bestIdx = 0;
    let bestDist = Infinity;
    slides.forEach((slide, idx) => {
      const left = slide.offsetLeft - track.offsetLeft;
      const dist = Math.abs(left - trackLeft);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }

  // Expose a tiny API for reuse (e.g., fullscreen viewer)
  carouselRoot._carouselApi = {
    scrollToIndex,
    getActiveIndex: () => activeIndex
  };

  // Reduce "over-scroll" across multiple slides: when scrolling ends, snap to nearest slide.
  let scrollEndTimer = null;
  track.addEventListener(
    'scroll',
    () => {
      if (scrollEndTimer) window.clearTimeout(scrollEndTimer);

      scrollEndTimer = window.setTimeout(() => {
        const nearest = getNearestIndex();
        const current = carouselRoot._carouselApi?.getActiveIndex?.() ?? activeIndex;
        const trackLeft = Math.round(track.scrollLeft);

        console.log('[spark-marketing][carousel] scroll end', {
          carouselId,
          trackLeft,
          current,
          nearest
        });

        if (nearest !== current) {
          scrollToIndex(nearest, 'scroll-end', 'smooth');
        }
      }, 120);
    },
    { passive: true }
  );

  // Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => scrollToIndex(activeIndex - 1, 'prev'));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => scrollToIndex(activeIndex + 1, 'next'));
  }
  dotButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const raw = btn.getAttribute('data-carousel-dot');
      const idx = raw == null ? NaN : parseInt(raw, 10);
      if (Number.isNaN(idx)) return;
      scrollToIndex(idx, 'dot');
    });
  });

  // Observe which slide is "active"
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = slides.indexOf(entry.target);
          if (idx >= 0) {
            setActiveIndex(idx, 'intersection');
          }
        });
      },
      { root: track, threshold: 0.6 }
    );

    slides.forEach((slide) => observer.observe(slide));
  } else {
    // Fallback: approximate active index from scroll position
    let scrollRaf = null;
    track.addEventListener('scroll', () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = null;
        const approx = track.clientWidth ? Math.round(track.scrollLeft / track.clientWidth) : 0;
        setActiveIndex(approx, 'scroll-fallback');
      });
    });
  }

  // Initial state
  carouselRoot.dataset.carouselActiveIndex = String(activeIndex);
  setButtonDisabledStates();
  setDotActiveStates();

  // Fullscreen (tap-to-open) support
  if (enableFullscreen) {
    let pointerDown = null;

    function isEventFromControls(evtTarget) {
      if (!evtTarget) return false;
      return (
        !!evtTarget.closest?.('[data-carousel-prev]') ||
        !!evtTarget.closest?.('[data-carousel-next]') ||
        !!evtTarget.closest?.('[data-carousel-dot]')
      );
    }

    function buildFullscreenOverlay() {
      const overlay = document.createElement('div');
      overlay.className = 'carousel-fs-overlay';
      overlay.hidden = true;
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Image preview');

      const dialog = document.createElement('div');
      dialog.className = 'carousel-fs-dialog';

      const header = document.createElement('div');
      header.className = 'carousel-fs-header';

      const title = document.createElement('div');
      title.className = 'carousel-fs-title';
      title.textContent = 'Preview';

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'carousel-fs-close';
      closeBtn.setAttribute('aria-label', 'Close preview');
      closeBtn.innerHTML = '<span class="material-symbols-rounded text-slate-700">close</span>';

      header.appendChild(title);
      header.appendChild(closeBtn);

      const body = document.createElement('div');
      body.className = 'carousel-fs-body';

      // Build a carousel inside fullscreen
      const fsCarousel = document.createElement('div');
      fsCarousel.setAttribute('data-carousel', '');
      fsCarousel.setAttribute('data-carousel-in-fullscreen', '');
      fsCarousel.className = 'relative';

      const fsTrack = document.createElement('div');
      fsTrack.setAttribute('data-carousel-track', '');
      fsTrack.className = 'overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar carousel-fs-frame';

      const fsRow = document.createElement('div');
      fsRow.className = 'flex gap-3';

      const sourceFigures = slides.map((s) => {
        const img = s.querySelector('img');
        const cap = s.querySelector('figcaption');
        return {
          src: img?.getAttribute('src') || '',
          alt: img?.getAttribute('alt') || '',
          captionHtml: cap ? cap.innerHTML : ''
        };
      });

      sourceFigures.forEach((item) => {
        const fig = document.createElement('figure');
        fig.setAttribute('data-carousel-slide', '');
        fig.className = 'min-w-full snap-center carousel-snap-stop';

        const wrap = document.createElement('div');
        wrap.className = 'bg-white rounded-xl border border-slate-200 overflow-hidden';

        const imgEl = document.createElement('img');
        imgEl.src = item.src;
        imgEl.alt = item.alt;
        imgEl.className = 'carousel-fs-img';

        wrap.appendChild(imgEl);

        const capEl = document.createElement('figcaption');
        capEl.className = 'p-4 bg-slate-50 border-t border-slate-200';
        capEl.innerHTML = item.captionHtml;

        fig.appendChild(wrap);
        fig.appendChild(capEl);
        fsRow.appendChild(fig);
      });

      fsTrack.appendChild(fsRow);
      fsCarousel.appendChild(fsTrack);

      const fsDots = document.createElement('div');
      fsDots.setAttribute('data-carousel-dots', '');
      fsDots.className = 'mt-3 flex items-center justify-center gap-2';

      for (let i = 0; i < slides.length; i += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('data-carousel-dot', String(i));
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.className = `w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-brand-600' : 'bg-slate-300'}`;
        fsDots.appendChild(dot);
      }

      body.appendChild(fsCarousel);
      body.appendChild(fsDots);

      dialog.appendChild(header);
      dialog.appendChild(body);
      overlay.appendChild(dialog);

      document.body.appendChild(overlay);

      function closeOverlay(reason) {
        overlay.hidden = true;
        document.body.style.overflow = '';
        console.log('[spark-marketing][carousel] fullscreen closed', { carouselId, reason });
      }

      closeBtn.addEventListener('click', () => closeOverlay('close-button'));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay('backdrop');
      });

      document.addEventListener('keydown', (e) => {
        if (!overlay.hidden && e.key === 'Escape') {
          closeOverlay('escape');
        }
      });

      // init inner carousel when first opened (so it can measure offsets)
      let inited = false;
      function openAt(index) {
        if (!inited) {
          initCarousel(fsCarousel);
          inited = true;
        }
        overlay.hidden = false;
        document.body.style.overflow = 'hidden';

        console.log('[spark-marketing][carousel] fullscreen opened', { carouselId, index });
        fsCarousel._carouselApi?.scrollToIndex(index, 'open', 'auto');
      }

      return { openAt };
    }

    let overlayApi = null;

    track.addEventListener('pointerdown', (e) => {
      if (isEventFromControls(e.target)) return;
      pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() };
    });

    track.addEventListener('pointerup', (e) => {
      if (isEventFromControls(e.target)) return;
      if (!pointerDown) return;

      const dx = Math.abs(e.clientX - pointerDown.x);
      const dy = Math.abs(e.clientY - pointerDown.y);
      const dt = Math.round(performance.now() - pointerDown.t);
      pointerDown = null;

      console.log('[spark-marketing][carousel] pointerup', { carouselId, dx, dy, dt });

      // If it looks like a tap (not a swipe), open fullscreen
      if (dx <= 8 && dy <= 8) {
        if (!overlayApi) overlayApi = buildFullscreenOverlay();
        const idx = carouselRoot._carouselApi?.getActiveIndex?.() ?? 0;
        overlayApi.openAt(idx);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const carousels = Array.from(document.querySelectorAll('[data-carousel]'));
  console.log('[spark-marketing][carousel] DOMContentLoaded', { carouselCount: carousels.length });
  carousels.forEach(initCarousel);
});


