/**
 * Yogapreneurship mega-course: program map → session accordion drill-down.
 */
(function initMegaCurriculum() {
  function openSession(sessionNumber) {
    const item = document.getElementById(`session-${sessionNumber}`);
    if (!item) return;

    const toggle = item.querySelector('[data-accordion-toggle]');
    if (toggle && toggle.getAttribute('aria-expanded') !== 'true') {
      toggle.click();
    }

    window.requestAnimationFrame(() => {
      item.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function parseSessionFromHash() {
    const hash = window.location.hash || '';
    const match = hash.match(/^#session-(\d+)$/i);
    return match ? Number(match[1]) : null;
  }

  function setupProgramMap() {
    document.querySelectorAll('[data-program-session]').forEach((card) => {
      card.addEventListener('click', (event) => {
        const num = Number(card.getAttribute('data-program-session'));
        if (!num) return;
        event.preventDefault();
        openSession(num);
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', `#session-${num}`);
        } else {
          window.location.hash = `session-${num}`;
        }
      });
    });
  }

  function setupHashOnLoad() {
    const session = parseSessionFromHash();
    if (session) {
      window.setTimeout(() => openSession(session), 120);
    }
  }

  window.addEventListener('hashchange', () => {
    const session = parseSessionFromHash();
    if (session) openSession(session);
  });

  document.addEventListener('DOMContentLoaded', () => {
    setupProgramMap();
    setupHashOnLoad();
  });
})();
