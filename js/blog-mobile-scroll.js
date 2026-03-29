/**
 * On mobile, blog post pages show the list above and the article below (lg:hidden / lg:grid).
 * After navigating to blog/<slug>.html, scroll the article into view (not on blog.html index).
 */
function isBlogPostDetailPage() {
    const path = (window.location.pathname || '').replace(/\/$/, '');
    return /blog\/[^/]+\.html$/i.test(path) && !/\/blog\.html$/i.test(path);
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.matchMedia('(max-width: 1023px)').matches) {
        return;
    }
    if (!isBlogPostDetailPage()) {
        return;
    }
    const target = document.getElementById('blog-mobile-selected-post');
    if (!target || !target.querySelector('article')) {
        return;
    }
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            target.scrollIntoView({ behavior: 'auto', block: 'start' });
            console.log('[spark-marketing][blog-mobile-scroll] Scrolled to mobile article', {
                id: 'blog-mobile-selected-post',
            });
        });
    });
});
