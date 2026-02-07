/**
 * Lightweight, reusable accordion component for marketing pages.
 *
 * Usage:
 * - Wrap accordion items with: data-accordion
 * - Add toggle button with: data-accordion-toggle
 * - Add content container with: data-accordion-content
 * - Add chevron icon with: data-accordion-chevron (optional, will auto-rotate)
 *
 * Supports:
 * - Smooth expand/collapse animations
 * - ARIA attributes for accessibility
 * - Keyboard navigation (Enter/Space on toggle)
 * - Optional: allow multiple items open or single-item mode
 */

function initAccordion(accordionRoot) {
  const accordionId = accordionRoot.id || '(no-id)';
  const items = Array.from(accordionRoot.querySelectorAll('[data-accordion-item]'));
  const allowMultiple = accordionRoot.hasAttribute('data-accordion-multiple');

  console.log('[spark-marketing][accordion] init', {
    accordionId,
    itemCount: items.length,
    allowMultiple
  });

  if (items.length === 0) {
    console.log('[spark-marketing][accordion] skip init (no items)', { accordionId });
    return;
  }

  function toggleItem(item, forceOpen = null) {
    const toggle = item.querySelector('[data-accordion-toggle]');
    const content = item.querySelector('[data-accordion-content]');
    const chevron = item.querySelector('[data-accordion-chevron]');

    if (!toggle || !content) {
      console.warn('[spark-marketing][accordion] missing toggle/content', { accordionId });
      return;
    }

    const isCurrentlyOpen = toggle.getAttribute('aria-expanded') === 'true';
    const shouldOpen = forceOpen !== null ? forceOpen : !isCurrentlyOpen;

    // Update ARIA
    toggle.setAttribute('aria-expanded', String(shouldOpen));
    item.classList.toggle('accordion-item-open', shouldOpen);

    // Rotate chevron if present
    if (chevron) {
      chevron.classList.toggle('rotate-180', shouldOpen);
    }

    // Handle content visibility via CSS classes only
    if (shouldOpen) {
      content.classList.remove('hidden');
      content.offsetHeight;
      content.classList.add('accordion-content-open');
    } else {
      content.classList.remove('accordion-content-open');
      setTimeout(() => {
        if (toggle.getAttribute('aria-expanded') === 'false') {
          content.classList.add('hidden');
        }
      }, 300);
    }

    // If single-item mode, close other items
    if (shouldOpen && !allowMultiple) {
      items.forEach((otherItem) => {
        if (otherItem !== item) {
          const otherToggle = otherItem.querySelector('[data-accordion-toggle]');
          if (otherToggle?.getAttribute('aria-expanded') === 'true') {
            toggleItem(otherItem, false);
          }
        }
      });
    }

    console.log('[spark-marketing][accordion] toggled', {
      accordionId,
      shouldOpen,
      wasOpen: isCurrentlyOpen
    });
  }

  // Initialize each item
  items.forEach((item, index) => {
    const toggle = item.querySelector('[data-accordion-toggle]');
    const content = item.querySelector('[data-accordion-content]');

    if (!toggle || !content) return;

    // Set initial ARIA state
    const isInitiallyOpen = item.hasAttribute('data-accordion-open');
    toggle.setAttribute('aria-expanded', String(isInitiallyOpen));
    toggle.setAttribute('aria-controls', `accordion-content-${accordionId}-${index}`);
    content.id = `accordion-content-${accordionId}-${index}`;
    content.setAttribute('aria-labelledby', toggle.id || `accordion-toggle-${accordionId}-${index}`);

    // Set initial content state
    if (isInitiallyOpen) {
      item.classList.add('accordion-item-open');
      content.classList.remove('hidden');
      content.classList.add('accordion-content-open');
    } else {
      content.classList.add('hidden');
    }

    // Click handler
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleItem(item);
      // Blur after click to remove focus ring (only needed for mouse clicks, not keyboard)
      toggle.blur();
    });

    // Keyboard handler
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleItem(item);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const accordions = Array.from(document.querySelectorAll('[data-accordion]'));
  console.log('[spark-marketing][accordion] DOMContentLoaded', { accordionCount: accordions.length });
  accordions.forEach(initAccordion);
});

