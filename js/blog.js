/**
 * Blog Integration
 * Fetches and displays recent posts from Beehiiv via Firebase Function
 */

const FIREBASE_FUNCTION_URL = 'https://getblogposts-eyyuwkjlza-uc.a.run.app';

// Store all posts globally for navigation
let allPosts = [];

/**
 * Format date string to readable format
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Calculate elapsed time (e.g., "2 days ago")
 */
function getElapsedTime(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
            }
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffDays === 1) {
            return '1 day ago';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return months === 1 ? '1 month ago' : `${months} months ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return years === 1 ? '1 year ago' : `${years} years ago`;
        }
    } catch (e) {
        return '';
    }
}

/**
 * Extract text content from HTML string (for excerpts)
 * Removes all HTML tags, style blocks, and script blocks
 */
function stripHtml(html) {
    if (!html) return '';
    
    // Remove style and script tags and their content
    let cleaned = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove HTML comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
    
    // Create temporary element to extract text
    const tmp = document.createElement('div');
    tmp.innerHTML = cleaned;
    
    // Get text content and clean up whitespace
    let text = tmp.textContent || tmp.innerText || '';
    
    // Remove excessive whitespace and newlines
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
}

/**
 * Clean HTML content for display (removes style/script but keeps structure)
 */
function cleanHtmlForDisplay(html) {
    if (!html || typeof DOMPurify === 'undefined') return '';
    
    // Configure DOMPurify to allow semantic HTML but remove dangerous/unwanted elements
    const config = {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 
                       'blockquote', 'ul', 'ol', 'li', 'a', 'em', 'strong', 'i', 'b', 
                       'img', 'div', 'span', 'pre', 'code', 'table', 'thead', 'tbody', 
                       'tr', 'td', 'th', 'small', 'sup', 'sub', 'mark', 'del', 'strike',
                       'abbr', 'kbd', 'cite', 'q', 'ins', 'u', 's'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'title'],
        KEEP_CONTENT: true,
        RETURN_DOM: true
    };
    
    // Use DOMPurify to sanitize and get clean DOM
    const cleanDom = DOMPurify.sanitize(html, config);
    
    // Extract body content if this is a full HTML document
    let bodyContent = cleanDom.querySelector('body') || cleanDom;
    
    // Convert Beehiiv's quote divs to blockquotes AFTER sanitization
    // Look for divs that contain quote patterns
    const divsToConvert = [];
    
    bodyContent.querySelectorAll('div').forEach(div => {
        const text = div.textContent.trim();
        const hasQuotes = text.includes('"') || text.includes('"') || text.includes('"') || text.includes('❝');
        const hasAttribution = text.includes('—') || text.includes('–');
        const hasSmallTag = div.querySelector('small');
        const hasParagraph = div.querySelector('p');
        
        // Pattern 1: div contains p with quotes AND small with attribution
        const quotePara = div.querySelector('p');
        const smallTag = div.querySelector('small');
        const isQuotePattern1 = quotePara && smallTag && 
                                (quotePara.textContent.includes('"') || quotePara.textContent.includes('"'));
        
        // Pattern 2: div contains quotes symbol (❝) and paragraph
        const hasQuoteSymbol = text.includes('❝');
        const isQuotePattern2 = hasQuoteSymbol && hasParagraph;
        
        // General pattern: has quotes, paragraph, and reasonable length
        const isQuoteGeneral = hasQuotes && hasParagraph && text.length < 500 && text.length > 20;
        
        // Check if this div looks like a quote block
        if ((isQuotePattern1 || isQuotePattern2 || isQuoteGeneral) && 
            !div.querySelector('h1, h2, h3, h4, h5, h6, ul, ol, table')) {
            divsToConvert.push(div);
        }
    });
    
    // Convert collected divs to blockquotes (do this after iteration to avoid DOM modification issues)
    divsToConvert.forEach(div => {
        const blockquote = document.createElement('blockquote');
        blockquote.innerHTML = div.innerHTML;
        div.replaceWith(blockquote);
    });
    
    // Remove the first h1 (title - we display separately)
    const firstH1 = bodyContent.querySelector('h1');
    if (firstH1) firstH1.remove();
    
    // Remove the first h2 if it's short (likely a subtitle)
    const firstH2 = bodyContent.querySelector('h2');
    if (firstH2 && firstH2.textContent.trim().length < 100) {
        firstH2.remove();
    }
    
    // Remove author info, dates, and social elements
    const unwantedSelectors = [
        'img[src*="profile_picture"]',
        'img[alt="Author"]',
        'a[href*="facebook.com/sharer"]',
        'a[href*="twitter.com/intent"]',
        'a[href*="linkedin.com/sharing"]',
        'a[href*="threads.net/intent"]',
        'a[href*="mailto:?"]'
    ];
    
    unwantedSelectors.forEach(selector => {
        bodyContent.querySelectorAll(selector).forEach(el => {
            // Try to remove parent containers if they only have this element
            let parent = el.parentElement;
            while (parent && parent !== bodyContent && parent.children.length === 1) {
                const nextParent = parent.parentElement;
                parent.remove();
                parent = nextParent;
            }
            if (el.parentElement) el.remove();
        });
    });
    
    // Get the HTML content
    let cleaned = bodyContent.innerHTML || '';
    
    // Final cleanup: remove empty elements
    cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
    cleaned = cleaned.replace(/<div>\s*<\/div>/gi, '');
    cleaned = cleaned.replace(/<span>\s*<\/span>/gi, '');
    
    return cleaned.trim();
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}


/**
 * Render posts to the DOM
 */
function renderPosts(posts) {
    const contentContainer = document.getElementById('blog-content');
    const latestPostContainer = document.getElementById('blog-latest-post');
    const sidebarContainer = document.getElementById('blog-sidebar-posts');
    const mobilePostsContainer = document.getElementById('blog-mobile-posts');
    const loadingEl = document.getElementById('blog-loading');
    const errorEl = document.getElementById('blog-error');

    // Hide error and loading states FIRST, before any other logic
    console.log('[spark-marketing][blog][DEBUG] renderPosts called', {
        postsCount: posts ? posts.length : 0,
        hasContentContainer: !!contentContainer,
        hasErrorEl: !!errorEl,
        errorElDisplay: errorEl ? window.getComputedStyle(errorEl).display : 'N/A',
        errorElHidden: errorEl ? errorEl.classList.contains('hidden') : 'N/A',
        isMobile: window.innerWidth < 1024
    });
    
    if (errorEl) {
        errorEl.classList.add('hidden');
        errorEl.style.display = 'none';
        console.log('[spark-marketing][blog][DEBUG] Error element hidden', {
            display: errorEl.style.display,
            hasHiddenClass: errorEl.classList.contains('hidden')
        });
    }
    if (loadingEl) {
        loadingEl.classList.add('hidden');
        loadingEl.style.display = 'none';
    }

    if (!contentContainer || !latestPostContainer || !sidebarContainer || !mobilePostsContainer) {
        console.error('[spark-marketing][blog] Required containers not found');
        console.log('[spark-marketing][blog][DEBUG] Showing error - containers missing', {
            contentContainer: !!contentContainer,
            latestPostContainer: !!latestPostContainer,
            sidebarContainer: !!sidebarContainer,
            mobilePostsContainer: !!mobilePostsContainer
        });
        if (errorEl) {
            errorEl.classList.remove('hidden');
            errorEl.style.display = 'block';
        }
        return;
    }

    if (!posts || posts.length === 0) {
        console.log('[spark-marketing][blog][DEBUG] Showing error - no posts', {
            posts: posts,
            postsLength: posts ? posts.length : 0
        });
        if (errorEl) {
            errorEl.classList.remove('hidden');
            errorEl.style.display = 'block';
        }
        return;
    }

    // Store posts globally
    allPosts = posts;

    // Show content container
    contentContainer.classList.remove('hidden');
    console.log('[spark-marketing][blog][DEBUG] Content container shown', {
        hasHiddenClass: contentContainer.classList.contains('hidden'),
        display: window.getComputedStyle(contentContainer).display
    });

    // Clear existing content
    latestPostContainer.innerHTML = '';
    sidebarContainer.innerHTML = '';
    mobilePostsContainer.innerHTML = '';

    // Render all posts in sidebar and mobile (including latest)
    renderPostLists(posts, sidebarContainer, mobilePostsContainer);
    
    // Check if a specific post is requested via URL hash
    const hash = window.location.hash;
    const postMatch = hash.match(/^#post-(\d+)$/);
    if (postMatch) {
        const postIndex = parseInt(postMatch[1], 10);
        if (postIndex >= 0 && postIndex < posts.length) {
            handleHashChange();
            return;
        }
    }

    // Render latest post (first post) in full on desktop only
    if (window.innerWidth >= 1024) {
        const latestPost = posts[0];
        if (latestPost) {
            renderPostInMain(latestPost, latestPostContainer);
        }
    }
}

/**
 * Render a single post in the main content area
 */
function renderPostInMain(post, container) {
    if (!post || !container) return;

    const elapsed = getElapsedTime(post.date);
    const dateStr = formatDate(post.date);
    
    const postEl = document.createElement('article');
    postEl.className = 'bg-white rounded-xl border border-slate-200 overflow-hidden';
    
    postEl.innerHTML = `
        <div class="p-8 lg:p-12">
            <div class="text-sm text-slate-500 mb-4">
                <div class="flex items-center gap-2">
                    <span>${dateStr}</span>
                    ${elapsed ? `<span class="text-slate-400">•</span><span>${elapsed}</span>` : ''}
                </div>
                ${post.author ? `<div class="mt-1">${post.author}</div>` : ''}
            </div>
            <h1 class="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6">
                ${post.title}
            </h1>
            <div class="prose prose-lg max-w-none blog-post-content text-slate-700">
                ${post.fullContent || post.excerpt}
            </div>
            <div class="mt-8 pt-6 border-t border-slate-200">
                <a 
                    href="${post.link}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
                >
                    Read on beehiiv
                    <span class="material-symbols-rounded text-[18px]">open_in_new</span>
                </a>
            </div>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(postEl);
}

/**
 * Render post lists for sidebar and mobile
 */
function renderPostLists(posts, sidebarContainer, mobilePostsContainer) {
    // Render all posts (including latest) in sidebar and mobile
    
    function renderPostItem(post, postIndex, isMobile = false) {
        const elapsed = getElapsedTime(post.date);
        const dateStr = formatDate(post.date);
        
        const postEl = document.createElement('div');
        postEl.setAttribute('data-post-index', postIndex);
        postEl.className = isMobile 
            ? 'bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer'
            : 'pb-6 border-b border-slate-200 last:border-0 last:pb-0 cursor-pointer';
        
        // Add click handler to open post within site
        postEl.addEventListener('click', (e) => {
            // Don't trigger if clicking on a link
            if (e.target.tagName === 'A') return;
            
            e.preventDefault();
            window.location.hash = `post-${postIndex}`;
            // Trigger hash change manually if already on the same hash
            if (window.location.hash === `#post-${postIndex}`) {
                window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
        });
        
        postEl.innerHTML = `
            <div class="text-xs text-slate-500 mb-2">
                <div class="flex items-center gap-2">
                    <span>${dateStr}</span>
                    ${elapsed ? `<span class="text-slate-400">•</span><span>${elapsed}</span>` : ''}
                </div>
                ${post.author ? `<div class="mt-1">${post.author}</div>` : ''}
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-2 ${isMobile ? '' : 'line-clamp-2'}">
                <a 
                    href="#post-${postIndex}" 
                    class="hover:text-brand-600 transition-colors"
                    onclick="event.stopPropagation(); return true;"
                >
                    ${post.title}
                </a>
            </h3>
            <p class="text-sm text-slate-600 ${isMobile ? 'line-clamp-3' : 'line-clamp-2'} mb-3">
                ${post.excerpt}
            </p>
            <a 
                href="#post-${postIndex}" 
                class="text-xs text-brand-600 hover:text-brand-700 font-medium"
                onclick="event.stopPropagation(); return true;"
            >
                Read more →
            </a>
        `;

        return postEl;
    }

    // Render for sidebar (desktop/tablet) - all posts including latest
    if (posts.length === 0) {
        sidebarContainer.innerHTML = '<p class="text-sm text-slate-500">No posts available.</p>';
    } else {
        posts.forEach((post, index) => {
            sidebarContainer.appendChild(renderPostItem(post, index, false));
        });
    }

    // Render for mobile - all posts including latest
    if (posts.length === 0) {
        mobilePostsContainer.innerHTML = '<p class="text-sm text-slate-500">No posts available.</p>';
    } else {
        posts.forEach((post, index) => {
            mobilePostsContainer.appendChild(renderPostItem(post, index, true));
        });
    }

    console.log('[spark-marketing][blog] Rendered posts', { 
        total: posts.length
    });
}

/**
 * Fetch blog posts from Firebase Function
 */
async function fetchBlogPosts() {
    const loadingEl = document.getElementById('blog-loading');
    const errorEl = document.getElementById('blog-error');

    try {
        console.log('[spark-marketing][blog] Fetching posts from Firebase Function');
        const response = await fetch(FIREBASE_FUNCTION_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.posts && data.posts.length > 0) {
            console.log('[spark-marketing][blog] Posts fetched successfully', {
                count: data.posts.length,
                cached: data.cached,
                stale: data.stale || false
            });
            
            // Process posts to ensure fullContent is cleaned
            const processedPosts = data.posts.map((post, idx) => {
                if (idx === 0) {
                    const original = post.fullContent || '';
                    console.log('[spark-marketing][blog][DEBUG] Original content check:');
                    console.log('  Has <blockquote> tags:', original.includes('<blockquote'));
                    
                    // Check for Steve Jobs quote structure
                    const jobsQuoteIndex = original.indexOf('Steve Jobs');
                    if (jobsQuoteIndex > -1) {
                        const contextStart = Math.max(0, jobsQuoteIndex - 500);
                        const contextEnd = Math.min(original.length, jobsQuoteIndex + 200);
                        console.log('  Steve Jobs quote context:', original.substring(contextStart, contextEnd));
                    }
                }
                
                const cleaned = cleanHtmlForDisplay(post.fullContent || '');
                if (idx === 0) {
                    console.log('[spark-marketing][blog][DEBUG] Cleaned content:');
                    console.log('  Cleaned length:', cleaned.length);
                    console.log('  Has h2 tags:', cleaned.includes('<h2'));
                    console.log('  Has blockquote:', cleaned.includes('<blockquote'));
                    console.log('  Sample HTML:', cleaned.substring(0, 800));
                }
                return {
                    ...post,
                    fullContent: cleaned
                };
            });
            
            renderPosts(processedPosts);
        } else {
            throw new Error('No posts returned from API');
        }

    } catch (error) {
        console.error('[spark-marketing][blog] Error fetching blog posts:', error);
        console.log('[spark-marketing][blog][DEBUG] Showing error - fetch failed', {
            error: error.message,
            isMobile: window.innerWidth < 1024
        });
        if (loadingEl) {
            loadingEl.classList.add('hidden');
            loadingEl.style.display = 'none';
        }
        if (errorEl) {
            errorEl.classList.remove('hidden');
            errorEl.style.display = 'block';
            console.log('[spark-marketing][blog][DEBUG] Error element displayed', {
                display: errorEl.style.display,
                hasHiddenClass: errorEl.classList.contains('hidden'),
                computedDisplay: window.getComputedStyle(errorEl).display
            });
        }
    }
}

// Handle hash changes to show different posts
function handleHashChange() {
    if (!allPosts || allPosts.length === 0) return;
    
    // Ensure error element is hidden when showing content
    const errorEl = document.getElementById('blog-error');
    if (errorEl) {
        errorEl.classList.add('hidden');
        errorEl.style.display = 'none';
    }
    
    const hash = window.location.hash;
    const postMatch = hash.match(/^#post-(\d+)$/);
    const latestPostContainer = document.getElementById('blog-latest-post');
    const mobilePostContainer = document.getElementById('blog-mobile-selected-post');
    const mobilePostsContainer = document.getElementById('blog-mobile-posts');
    const sidebarContainer = document.getElementById('blog-sidebar-posts');
    
    if (!latestPostContainer) return;
    
    if (postMatch) {
        const postIndex = parseInt(postMatch[1], 10);
        if (postIndex >= 0 && postIndex < allPosts.length) {
            const post = allPosts[postIndex];
            
            // Show on desktop
            renderPostInMain(post, latestPostContainer);
            
            // Show on mobile
            if (mobilePostContainer) {
                renderPostInMain(post, mobilePostContainer);
                mobilePostContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Highlight active post in lists
            const highlightActive = (container) => {
                if (!container) return;
                const items = container.querySelectorAll('[data-post-index]');
                items.forEach((item) => {
                    const idx = parseInt(item.getAttribute('data-post-index'), 10);
                    if (idx === postIndex) {
                        item.classList.add('ring-2', 'ring-brand-500', 'border-brand-500');
                    } else {
                        item.classList.remove('ring-2', 'ring-brand-500', 'border-brand-500');
                    }
                });
            };
            
            highlightActive(mobilePostsContainer);
            highlightActive(sidebarContainer);
            
            return;
        }
    }
    
    // Default: show latest post (only on desktop)
    if (window.innerWidth >= 1024) {
        const latestPost = allPosts[0];
        if (latestPost) {
            renderPostInMain(latestPost, latestPostContainer);
        }
    } else {
        // On mobile, clear the main content areas
        latestPostContainer.innerHTML = '';
        if (mobilePostContainer) {
            mobilePostContainer.innerHTML = '';
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Only run on blog page
    if (window.location.pathname.includes('blog.html') || window.location.pathname.endsWith('/blog')) {
        console.log('[spark-marketing][blog] Initializing blog');
        fetchBlogPosts();
        
        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
        
        // Handle initial hash if present
        setTimeout(() => {
            if (window.location.hash) {
                handleHashChange();
            }
        }, 100);
    }
});

