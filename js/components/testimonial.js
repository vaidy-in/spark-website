/**
 * Reusable Testimonial component for marketing pages.
 * 
 * Minimal JS - primarily for future enhancements like:
 * - Multiple testimonials with rotation
 * - Analytics tracking
 * - Lazy loading images
 * 
 * Current implementation is mostly CSS-driven.
 */

function initTestimonials() {
    const testimonials = document.querySelectorAll('[data-testimonial]');
    
    console.log('[spark-marketing] initializing testimonials', {
        count: testimonials.length
    });
    
    testimonials.forEach((testimonial, index) => {
        const linkedinLink = testimonial.querySelector('.testimonial-linkedin-link');
        
        if (linkedinLink) {
            // Ensure LinkedIn links open in new tab with proper security
            linkedinLink.setAttribute('target', '_blank');
            linkedinLink.setAttribute('rel', 'noopener noreferrer');
            
            // Add hover cursor indication
            linkedinLink.style.cursor = 'pointer';
        }
        
        // Set up accessibility
        const quoteEl = testimonial.querySelector('.testimonial-quote');
        if (quoteEl) {
            quoteEl.setAttribute('role', 'blockquote');
        }
        
        console.log('[spark-marketing] testimonial initialized', {
            index,
            hasLinkedIn: !!linkedinLink
        });
    });
}

document.addEventListener('DOMContentLoaded', initTestimonials);
