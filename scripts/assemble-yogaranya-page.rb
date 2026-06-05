#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'

ROOT = File.expand_path('../..', __dir__)
curriculum = File.read(File.join(ROOT, 'marketing/data/yogaranya-curriculum-fragment.html'), encoding: 'UTF-8')
program_map = File.read(File.join(ROOT, 'marketing/data/yogaranya-program-map-fragment.html'), encoding: 'UTF-8')
manifest = JSON.parse(File.read(File.join(ROOT, 'marketing/data/yogaranya-curriculum.json'), encoding: 'UTF-8'))
t = manifest['totals']
sessions = manifest['sessions']

def slide_carousel(id, label, slides)
  figures = slides.each_with_index.map do |src, idx|
    active = idx.zero? ? ' is-active' : ''
    alt = File.basename(src, '.*').tr('-', ' ')
    <<~FIG.strip
      <figure data-carousel-slide class="min-w-full snap-center carousel-snap-stop"><div class="course-landing-slide-frame#{active}"><div class="course-landing-slide-frame__media"><img src="#{src}" alt="#{alt}"></div></div></figure>
    FIG
  end.join("\n")
  dots = slides.each_index.map { |i| %(<button type="button" data-carousel-dot="#{i}" aria-label="Go to slide #{i + 1}"></button>) }.join("\n")

  <<~HTML
            <div class="mb-12">
                <p class="course-landing-slide-carousel-label">#{label}</p>
                <div id="#{id}" data-carousel data-carousel-fullscreen class="course-landing-slide-carousel relative">
                    <div data-carousel-track class="overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
                        <div class="flex gap-3">
                                #{figures}
                        </div>
                    </div>
                    <div class="course-landing-slide-carousel__controls">
                        <button type="button" data-carousel-prev aria-label="Previous slide" class="course-landing-slide-carousel__btn">←</button>
                        <div data-carousel-dots class="flex items-center justify-center gap-2">#{dots}</div>
                        <button type="button" data-carousel-next aria-label="Next slide" class="course-landing-slide-carousel__btn">→</button>
                    </div>
                </div>
            </div>
  HTML
end

def slides_for(session_num)
  (1..4).map { |i| format('../images/courses/yogaranya-video-workshops/slides/session-%02d/slide-%02d.jpg', session_num, i) }
end

slide_labels = {
  1 => 'Session 1 · Understanding Scoliosis',
  5 => 'Session 5 · Dietary strategies for chronic conditions',
  10 => 'Session 10 · Fatty liver disease'
}

slide_section = [1, 5, 10].map do |n|
  sess = sessions.find { |s| s['number'] == n }
  label = slide_labels[n] || "Session #{n} · #{sess&.dig('shortTitle')}"
  slide_carousel("yogaranya-slides-session-#{n}", label, slides_for(n))
end.join

html = <<~HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yogaranya Video Workshops - Ramya Siddamsetty · Yogaranya</title>
    <meta name="description" content="Ten health-focused workshop recordings from Yogaranya teachers: #{t['chapters']} chapters, slides, quizzes, and AI tutor on Spark. Curated by Ramya Siddamsetty.">
    <meta property="og:title" content="Yogaranya Video Workshops - Health workshops on Spark">
    <meta property="og:description" content="#{t['sessions']} sessions · #{t['chapters']} chapters · #{t['hoursLabel']} of structured teaching.">
    <meta property="og:image" content="../images/courses/yogaranya-video-workshops/thumbnail.jpg">
    <link rel="icon" href="../images/courses/yogaranya-video-workshops/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../css/tailwind.css">
    <link rel="stylesheet" href="../css/components/accordion.css">
    <link rel="stylesheet" href="../css/components/course-landing.css">
    <link rel="stylesheet" href="../css/components/course-landing-yogaranya.css">
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0,0" rel="stylesheet">
</head>
<body class="course-landing-page course-landing-page--yogaranya course-landing-page-with-sidebar antialiased">

<header class="course-landing-header fixed top-0 inset-x-0 z-40">
    <div class="cl-container h-full flex items-center justify-between gap-4">
        <a href="#top" class="min-w-0 flex items-center gap-3">
            <img src="../images/courses/yogaranya-video-workshops/logo.jpg" alt="Yogaranya" class="course-landing-header__logo hidden sm:block" width="80" height="40">
            <span class="min-w-0">
                <p class="course-landing-header__title truncate">Yogaranya Video Workshops</p>
                <p class="course-landing-header__sub truncate">Ramya Siddamsetty · Yogaranya</p>
            </span>
        </a>
        <a href="#pricing" class="course-landing-cta course-landing-cta--outline hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">View pricing</a>
        <a href="#pricing" class="course-landing-cta sm:hidden inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">Pricing</a>
    </div>
</header>

<main id="top">
    <section class="course-landing-hero course-landing-section-anchor">
        <div class="course-landing-hero__bg" aria-hidden="true">
            <div class="course-landing-hero__bg-image"></div>
            <div class="course-landing-hero__bg-gradient"></div>
            <div class="course-landing-hero__grain"></div>
        </div>
        <div class="course-landing-hero__inner cl-container">
            <div class="course-landing-hero-layout-with-sidebar">
                <div class="course-landing-hero__layout">
                    <div>
                        <p class="course-landing-eyebrow mb-3">Yogaranya · Into the forest, find your practice</p>
                        <h1 class="course-landing-hero__headline">Health workshops your students can return to, chapter by chapter</h1>
                        <p class="course-landing-hero__sub">Yogaranya Video Workshops bundles ten live recordings from Yogaranya's teacher team - scoliosis, diabetes, gut health, menopause, joint anatomy, and more - into one structured Spark course. Ramya Siddamsetty curates the library; inside Spark you get #{t['hoursLabel']} of chapterized video, presentation slides on all #{t['sessionsWithSlides']} sessions, study notes, quizzes, and an AI tutor grounded in each workshop.</p>
                        <div class="course-landing-mega-stats">
                            <span class="course-landing-mega-stat"><strong>#{t['sessions']}</strong> sessions</span>
                            <span class="course-landing-mega-stat"><strong>#{t['chapters']}</strong> chapters</span>
                            <span class="course-landing-mega-stat"><strong>#{t['hoursLabel']}</strong> video</span>
                            <span class="course-landing-mega-stat"><strong>10/10</strong> with slides</span>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-3 mb-2 mt-6">
                            <a href="#curriculum" class="course-landing-cta inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold">View full program</a>
                            <a href="#pricing" class="course-landing-cta-secondary inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold">Pricing</a>
                        </div>
                        <div class="course-landing-hero__instructor-row lg:hidden">
                            <img src="../images/courses/yogaranya-video-workshops/ramya-siddamsetty.jpg" alt="Ramya Siddamsetty" class="w-12 h-12 rounded-full object-cover border-2 border-[var(--cl-gold)]">
                            <div>
                                <p class="course-landing-hero__instructor-name">Ramya Siddamsetty</p>
                                <p class="course-landing-hero__instructor-role">Founder, Yogaranya · RYT 500</p>
                            </div>
                        </div>
                    </div>
                    <div class="course-landing-hero__visual">
                        <div class="course-landing-hero__thumb">
                            <img src="../images/courses/yogaranya-video-workshops/thumbnail.jpg" alt="Yogaranya Video Workshops">
                        </div>
                        <img src="../images/courses/yogaranya-video-workshops/ramya-siddamsetty.jpg" alt="Ramya Siddamsetty" class="course-landing-hero__portrait course-landing-instructor-photo">
                    </div>
                </div>
                <aside class="course-landing-sidebar-wrap" aria-label="Program summary">
                    <div id="course-landing-sidebar" class="course-landing-sidebar" aria-hidden="true">
                        <p class="course-landing-eyebrow mb-2">The library</p>
                        <p class="course-landing-sidebar__price" style="font-size:1.25rem">Pricing TBD</p>
                        <p class="course-landing-sidebar__note">Ten workshops · async on Spark</p>
                        <a href="#pricing" class="course-landing-cta w-full inline-flex items-center justify-center px-5 py-3 rounded-full text-sm font-semibold mb-3">View pricing</a>
                        <ul class="course-landing-sidebar__list">
                            <li><span style="color:var(--cl-cyan)">✓</span><span>#{t['sessions']} sessions · #{t['chapters']} chapters</span></li>
                            <li><span style="color:var(--cl-cyan)">✓</span><span>Slides on every session</span></li>
                            <li><span style="color:var(--cl-cyan)">✓</span><span>#{t['hoursLabel']} structured video</span></li>
                        </ul>
                        <p class="course-landing-sidebar__guarantee">For students and teachers who want condition-specific depth, not a single generic yoga playlist.</p>
                    </div>
                </aside>
            </div>
        </div>
    </section>

    <section class="course-landing-trust-strip course-landing-section--dark">
        <div class="cl-container">
            <div class="course-landing-trust-pills">
                <span class="course-landing-trust-pill"><span class="course-landing-trust-pill__dot"></span><strong>#{t['sessions']}</strong> workshops</span>
                <span class="course-landing-trust-pill"><span class="course-landing-trust-pill__dot"></span><strong>#{t['chapters']}</strong> chapters</span>
                <span class="course-landing-trust-pill"><span class="course-landing-trust-pill__dot"></span><strong>#{t['hoursLabel']}</strong> video</span>
                <span class="course-landing-trust-pill"><span class="course-landing-trust-pill__dot"></span><strong>Slides</strong> on #{t['sessionsWithSlides']}/#{t['sessions']}</span>
            </div>
        </div>
    </section>

    <section id="learn" class="course-landing-section--dark py-14 sm:py-16">
        <div class="cl-container">
            <div class="max-w-3xl mb-10">
                <p class="course-landing-eyebrow mb-3">What you get</p>
                <h2 class="course-landing-section-title mb-4">Ten workshops, one navigable course</h2>
                <p class="course-landing-section-lead">Each session is a full teacher-led workshop recording, chapterized for study. Topics span clinical nutrition, orthopedics, women's health, and anatomy - the kind of depth Yogaranya's live studio is known for.</p>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Spine and joint health</h3><p class="course-landing-learn-card__text">Scoliosis management, knee anatomy, and movement terminology for safe teaching.</p></article>
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Metabolic and gut health</h3><p class="course-landing-learn-card__text">Diabetes overview, fatty liver, gut health, and Ayurvedic healing contexts.</p></article>
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Women's health</h3><p class="course-landing-learn-card__text">Menopause stages, HRT context, and yoga-based management frameworks.</p></article>
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Clinical nutrition</h3><p class="course-landing-learn-card__text">Dietary strategies for skin, migraine, cholesterol, IBS, and insulin resistance.</p></article>
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Chronic conditions</h3><p class="course-landing-learn-card__text">Varicose veins, fibromyalgia, and condition-specific yoga therapy approaches.</p></article>
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Teacher-ready structure</h3><p class="course-landing-learn-card__text">Slides, notes, quizzes, and AI tutor on every session - built for replay and reference.</p></article>
            </div>
        </div>
    </section>

    <section id="program-map" class="course-landing-section--dark py-14 sm:py-16 border-t border-white/5">
        <div class="cl-container">
            <div class="max-w-3xl mb-8">
                <p class="course-landing-eyebrow mb-3">Program map</p>
                <h2 class="course-landing-section-title mb-4">Course → Session → Chapters</h2>
                <p class="course-landing-section-lead">Tap a workshop to jump to its full chapter list. Inside Spark, students use the same hierarchy: one course, ten sessions, #{t['chapters']} navigable chapters.</p>
            </div>
            <div class="course-landing-program-map">
#{program_map}
            </div>
        </div>
    </section>

    <section id="slides" class="course-landing-section-anchor course-landing-slide-band course-landing-section--theater">
        <div class="cl-container">
            <div class="max-w-3xl mb-8">
                <p class="course-landing-eyebrow mb-3">Inside the classroom</p>
                <h2 class="course-landing-section-title mb-4">Real slides from Yogaranya workshops</h2>
                <p class="course-landing-section-lead">Every session includes presentation decks synced to chapterized video. Samples below are from Sessions 1, 5, and 10.</p>
            </div>
#{slide_section}
            <div class="mt-4 text-center">
                <a href="#curriculum" class="course-landing-cta inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold">Explore all sessions</a>
            </div>
        </div>
    </section>

    <section id="curriculum" class="course-landing-section-anchor course-landing-section--cream py-14 sm:py-16">
        <div class="cl-container">
            <div class="max-w-3xl mb-8">
                <p class="course-landing-eyebrow mb-3" style="color:var(--cl-cyan-ink)">Full curriculum</p>
                <h2 class="course-landing-section-title mb-4" style="color:var(--cl-ink)">Ten sessions · #{t['chapters']} chapters</h2>
                <p class="course-landing-section-lead" style="color:var(--cl-ink-soft)">Expand any session to see every chapter title from production. Module groupings mirror how each workshop was taught live.</p>
            </div>
            <div class="course-landing-curriculum-wrap"><div id="yogaranya-curriculum-accordion" data-accordion class="space-y-3">
#{curriculum}
            </div></div>
        </div>
    </section>

    <section id="instructor" class="course-landing-section--dark py-14 sm:py-16">
        <div class="cl-container">
            <div class="course-landing-instructor-grid">
                <img src="../images/courses/yogaranya-video-workshops/ramya-siddamsetty.jpg" alt="Ramya Siddamsetty" class="course-landing-instructor-photo w-full max-w-sm rounded-2xl object-cover border border-[var(--cl-border-dark)]">
                <div>
                    <p class="course-landing-eyebrow mb-3">Your host</p>
                    <h2 class="course-landing-section-title mb-4">Ramya Siddamsetty</h2>
                    <p class="course-landing-section-lead mb-6">RYT 500-certified Ashtanga and Hatha teacher with 6,000+ teaching hours. Ramya founded Yogaranya in 2020 and built it through COVID with online classes that now reach students in India and internationally. She curates this workshop library from Yogaranya's contributing teachers - the same clinical depth her studio is known for, now structured on Spark.</p>
                    <ul class="space-y-3 text-base" style="color:var(--cl-cream-muted)">
                        <li>Founder of <a href="https://yogaranya.in" target="_blank" rel="noopener" class="underline" style="color:var(--cl-gold)">Yogaranya</a>, Bangalore</li>
                        <li>Hatha and Ashtanga · health-focused workshops and live classes</li>
                        <li>Former Deloitte tax consultant; GST-registered studio operator</li>
                        <li>Early Spark pilot partner building async courses on PracticeNow</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <section id="experience" class="course-landing-section--cream py-14 sm:py-16">
        <div class="cl-container">
            <h2 class="course-landing-section-title mb-8" style="color:var(--cl-ink)">How you learn on Spark</h2>
            <div class="course-landing-bento">
                <div class="course-landing-bento__tile course-landing-bento__tile--large">
                    <div class="course-landing-bento__content">
                        <h3>Mega-course navigation</h3>
                        <p>Course → session → chapter - the same hierarchy on this page and inside the player.</p>
                    </div>
                </div>
                <div class="course-landing-bento__tile"><h3>#{t['chapters']} micro-chapters</h3><p>Jump to the condition or concept you need instead of scrubbing full workshops.</p></div>
                <div class="course-landing-bento__tile"><h3>Slides + video</h3><p>Presentation decks on every session, synced to teaching moments.</p></div>
                <div class="course-landing-bento__tile"><h3>Quizzes and notes</h3><p>Study notes and quizzes generated from each workshop's teaching.</p></div>
                <div class="course-landing-bento__tile"><h3>AI tutor</h3><p>Ask questions grounded in the session you are studying.</p></div>
            </div>
        </div>
    </section>

    <section id="pricing" class="course-landing-section-anchor course-landing-section--dark py-14 sm:py-16">
        <div class="cl-container">
            <div class="max-w-3xl mx-auto text-center mb-8">
                <p class="course-landing-eyebrow mb-3">Pricing</p>
                <h2 class="course-landing-section-title mb-4">Pricing to be announced</h2>
                <p class="course-landing-section-lead">Checkout and final price will be published when enrollment opens on Spark.</p>
            </div>
            <div class="course-landing-pricing-tbd">
                <p class="course-landing-pricing-tbd__label">Coming soon</p>
                <p class="course-landing-pricing-tbd__title">Enrollment opens on Spark</p>
                <p class="course-landing-pricing-tbd__text">#{t['sessions']} sessions · #{t['chapters']} chapters · #{t['hoursLabel']} of structured content. No checkout link on this page yet.</p>
            </div>
        </div>
    </section>

    <section id="faq" class="course-landing-section-anchor course-landing-section--cream py-14 sm:py-16">
        <div class="cl-container">
            <p class="course-landing-eyebrow mb-3" style="color:var(--cl-cyan-ink)">FAQ</p>
            <h2 class="course-landing-section-title mb-8" style="color:var(--cl-ink)">Questions</h2>
            <div id="course-faq-accordion" data-accordion data-accordion-multiple class="space-y-3">
                <div class="course-landing-faq-item" data-accordion-item data-accordion-open>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">Who is this course for?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">Yoga teachers and serious students who want condition-specific workshop depth - orthopedics, nutrition, women's health, and chronic conditions - in a structured, replayable format.</p></div>
                </div>
                <div class="course-landing-faq-item" data-accordion-item>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">Who teaches the sessions?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">Each session is a recording from a Yogaranya contributing teacher. Ramya Siddamsetty curates the bundle; session titles and chapters reflect the original live workshops.</p></div>
                </div>
                <div class="course-landing-faq-item" data-accordion-item>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">Do all sessions include slides?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">Yes. All #{t['sessionsWithSlides']} sessions include presentation slides in the Spark player, synced to video.</p></div>
                </div>
                <div class="course-landing-faq-item" data-accordion-item>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">Is this live or self-paced?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">Self-paced async access to recorded workshops. You move session by session, chapter by chapter, with quizzes and an AI tutor on Spark.</p></div>
                </div>
                <div class="course-landing-faq-item" data-accordion-item>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">How does pricing work?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">Pricing is not published on this landing page yet. When enrollment opens, checkout will be on Spark.</p></div>
                </div>
            </div>
        </div>
    </section>

    <section class="course-landing-final-cta">
        <div class="cl-container">
            <h2>Ten workshops. One forest of learning.</h2>
            <p>#{t['sessions']} sessions · #{t['chapters']} chapters · #{t['hoursLabel']} · slides, quizzes, notes, and AI tutor on Spark.</p>
            <a href="#pricing" class="course-landing-cta inline-flex items-center justify-center px-8 py-3 rounded-full text-base font-semibold">View pricing</a>
        </div>
    </section>
</main>

<footer class="course-landing-footer">
    <div class="cl-container flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <p>© Ramya Siddamsetty · Yogaranya. Course hosted on Spark.</p>
        <p>Yogaranya Video Workshops · Async mega-course</p>
    </div>
</footer>

<div id="course-landing-sticky-cta" class="course-landing-sticky-cta fixed inset-x-0 bottom-0 md:hidden px-4 py-3" aria-hidden="true">
    <div class="cl-container flex items-center gap-3">
        <div class="min-w-0 flex-1">
            <p class="course-landing-sticky-cta__price truncate">Pricing TBD</p>
            <p class="course-landing-sticky-cta__note truncate">Yogaranya on Spark</p>
        </div>
        <a href="#pricing" class="course-landing-cta inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap">Pricing</a>
    </div>
</div>

<script src="../js/components/carousel.js" defer></script>
<script src="../js/components/accordion.js" defer></script>
<script src="../js/components/course-landing.js" defer></script>
<script src="../js/components/course-landing-mega-curriculum.js" defer></script>
</body>
</html>
HTML

out = File.join(ROOT, 'marketing/courses/yogaranya-video-workshops.html')
File.write(out, html)
puts "Wrote #{out} (#{html.bytesize} bytes)"
