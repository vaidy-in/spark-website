/*
  Spark Reels pricing, the 10-slide story, and the plan wizard.
  Edit a number here, save, and reload marketing/spark-reels.html.
  Founding partner pricing applies to 3, 6, and 12 month terms.
  Term and founding discounts stack by multiplication, not by adding percents.
  Included lecture hours = max(6, reels per month x videoHoursPerReelRatio).
  The page opens in rupees, on 20 reels and 12 months, on the full column.
  Page state lives in the URL hash. No browser storage.
  INR shows rupees only. USD shows dollars only, at fxRateInrPerUsd.
  Keep the rupee rates in step with docs/Vaidy/spark-reels-pricing-config.js.
*/
(function (root) {
  function slide(num, filter, group, title, image, alt, story, on, off, partial) {
    var row = {
      num: num, filter: filter, group: group, title: title,
      image: "images/spark-reels/" + image, alt: alt, story: story, on: on || ""
    };
    if (off) row.off = off;
    if (partial) row.partial = partial;
    return row;
  }

  var cfg = {
    fxRateInrPerUsd: 93.4,
    defaultCurrency: "inr",
    defaultReelsPerMonth: 20,
    defaultDurationMonths: 12,
    defaultTierId: "reel_cover_caption",
    foundingDiscountPct: 25,
    applyFoundingToMonthly: false,
    videoHoursPerReelRatio: 0.5,
    minLectureHours: 6,
    extraVideoHourInr: 500,
    whatsappPhone: "917899156587",
    reelsPerMonthOptions: [
      { reels: 12, label: "12", hint: "About 3 a week" },
      { reels: 20, label: "20", hint: "About 5 a week" },
      { reels: 28, label: "28", hint: "About 7 a week" },
      { reels: 30, label: "30", hint: "A full month" }
    ],
    durationMonthsOptions: [
      { months: 1, label: "1 month", termDiscountPct: 0, bestValue: false },
      { months: 3, label: "3 months", termDiscountPct: 15, bestValue: false },
      { months: 6, label: "6 months", termDiscountPct: 20, bestValue: false },
      { months: 12, label: "12 months", termDiscountPct: 33.3333, bestValue: true }
    ],
    tiers: [
      {
        id: "reel_only", name: "Reel", fold: "reel", basePerReelInr: 1000, recommended: false,
        fits: "You want the class posted for you, and you will handle how the page looks.",
        notIncluded: "A cover, a caption, carousels, and Stories.",
        benefits: ["A real class, not a performance", "One complete story in every reel", "Arrives on WhatsApp, ready to schedule"]
      },
      {
        id: "reel_cover", name: "Reel + cover", fold: "cover", basePerReelInr: 1250, recommended: false,
        fits: "The grid has to read as a menu of lessons in the first few seconds.",
        notIncluded: "A caption, carousels, and Stories.",
        benefits: ["The grid reads as a menu of lessons", "Short titles someone can scan", "The same look, week to week"]
      },
      {
        id: "reel_cover_caption", name: "Reel + cover + caption", fold: "caption", basePerReelInr: 1500, recommended: true,
        fits: "The page has to reach people who do not follow you yet, in your voice.",
        notIncluded: "Quizzes, YouTube chapters, multi-platform publishing, and student email nurture are still being built. A 12-month term includes early access as they launch. Shorter terms do not.",
        benefits: ["Found by people who do not follow you yet", "The words stay in your voice", "Carousels and Stories from the same class"]
      }
    ],
    storySlides: [
      slide("01", "long", "The long game", "Attention or nurture.", "attention.jpg", "A megaphone scatters a cloud labeled Attention. An arrow points to a seedling watered by drops, labeled Nurture.", "A loud hook fades in a day. Real teaching from your actual classroom waters trust every week without turning you into a performer.", "Included: Your reels are cut from real classes with live students, not scripted solo takes."),
      slide("02", "long", "The long game", "Depth + consistency = trust.", "consistency.jpg", "An iceberg labeled Depth, plus a checked calendar labeled Consistency, equals a seedling labeled Trust.", "Posting 5 to 7 times a week usually burns a teacher out or thins the teaching. Because reels come from classes you already taught and arrive on WhatsApp ready to schedule, the calendar holds through festivals, batches, and travel.", "Included: Your pace keeps the weekly calendar full without a second filming job.", "At a lighter pace or a 1-month trial, the weekly habit is too brief or too sparse to compound."),
      slide("03", "long", "The long game", "About 7 hours before a serious yes.", "hours.jpg", "About 7 hours. Two reels a week takes 1 to 2 years to reach 90 reels. Seven a week reaches about 5 hours in 3 months and about 10 hours in 6 months.", "Google's research shows a high-trust buyer spends about 7 hours with your teaching before committing. Twice a week takes 1 to 2 years. At 5 to 7 reels a week, a prospective student can sit with 5 to 10 hours of your teaching in 3 to 6 months. A 12-month plan sustains that library across every intake.", "Included: Your term builds the multi-hour library a serious student needs.", "Shortfall: Fewer than 6 months or under 20 reels a month does not build enough hours on the page for a cold prospect to reach 7 hours."),
      slide("04", "long", "The long game", "Guide them before the first call.", "journey.jpg", "A guide points a traveler up free steps toward an open gate labeled Your program.", "Think of enrollment as a 1,000-step walk. Your page gives the first 200 steps generously for free so that when someone finally messages you, they already trust how you teach.", "Included: Enough runway for strangers to walk the first free steps on your page.", "Left out on 1 month: A single month puts out too few steps to guide a stranger before your next batch."),
      slide("05", "cover", "The cover & brand", "Three seconds on the grid.", "grid.jpg", "3 seconds. A nine-frame grid. One person leaves. Another stays and touches the grid.", "When someone taps your profile, they decide in about 3 seconds whether to leave or stay. Custom covers with short scannable titles turn nine frames into a menu of lessons.", "Included: Custom covers and short titles make your profile grid read as a menu of lessons.", "Left out on Reel only: Raw video frames look repetitive on the grid, so profile visitors cannot scan topics in 3 seconds."),
      slide("06", "cover", "The cover & brand", "A brand is trust, built on purpose.", "brand.jpg", "A brick wall with a path rising through it. A brand is trust. Built on purpose. Not by accident.", "Rotating colour palettes, subject framing, and multi-faculty variety make your studio look deliberate week after week, brick by brick.", "Included: Multi-month visual and curriculum coherence across your grid.", "Left out: Requires the Cover tier (Reel + cover or full tier) over at least 6 months so the visual system compounds."),
      slide("07", "cover", "The caption & reach", "Interest media reaches non-followers.", "interest.jpg", "Social media reaches people who already follow you. Interest media reaches people who care, even if they do not follow you yet.", "Followers already know you. Long-form SEO captions written in your lineage-accurate voice carry the lesson to people who care about the subject but do not follow you yet.", "Included: Teacher-voice SEO captions built for non-follower discovery and repeat reading.", "Left out without Caption: You get the video, but miss search discovery from non-followers and study-note captions in your voice."),
      slide("08", "cover", "The caption & reach", "Do it with intent: Carousels and Stories.", "intent.jpg", "A path through a field toward one person. The line reads: who it is for, what it is for, and the promise.", "Every piece states who it is for, what it teaches, and the promise. In the full column, the same class also gives you Carousels and Stories for learners who read and swipe.", "Included: Carousels and Stories cut from the same class, aligned to serious students.", "Left out without Caption: Carousels and Stories are only included in Reel + cover + caption."),
      slide("09", "roadmap", "Roadmap & founding window", "One class. More formats next.", "upcoming-formats.jpg", "One open book fans out to Quizzes, YouTube, multi-platform, and email nurture. Built from the same recording. Early access on 12 months.", "Because Spark maps your actual course rather than slicing a flat transcript, the same recording will soon power Interactive Quizzes, YouTube Chapters and Shorts, Multi-Platform Publishing, and Student Email Nurture.", "Included on 12 months: Early access to Quizzes, YouTube chapters, multi-platform publishing, and email nurture as they launch.", "12-month full-plan advantage missed: Early access to Quizzes, YouTube chapters, multi-platform publishing, and email nurture is included when you lock the full Reel + cover + caption plan for 12 months."),
      slide("10", "roadmap", "Roadmap & founding window", "Why the 25% Founding Partner price exists.", "founding-window.jpg", "Stairs rise from a locked 12-month rate and today's 25% Founding Partner discount toward full price as Quizzes and YouTube ship.", "The 25% Founding Partner discount is offered today because those upcoming formats are still being built. As each capability ships and the product matures, the founding discount steps down for newer cohorts. Paying for 12 months upfront stacks the 33.3% annual discount with the 25% founding discount, locking half the monthly price for a full year.", "Locked at best rate: 33.3% annual + 25% founding = 50% off the monthly price for all 12 months.", "Left out on 1 month: The 25% Founding Partner discount does not apply to a 1-month trial.", "Founding 25% applied for this term, but your rate renews after {months} months as the discount steps down.")
    ],
    craftSlides: [
      slide("11", "how", "Above the waterline", "Five craft jobs in one reel.", "reel-above-waterline.jpg", "A vertical classroom reel surrounded by 5 numbered callouts: 1. Pre-roll hook, 2. Pause-protected clip, 3. 3-second grid cover, 4. Studio end card, 5. Teacher-voice SEO caption.", "A single post is five separate jobs: a Coming Up pre-roll hook where your face is clear, a teaching clip with real pauses kept in, a 3-second grid cover with a short scannable title, a clean studio end card, and a study-note SEO caption in your voice. Miss one and the post sits in drafts.", ""),
      slide("12", "how", "Beneath the waterline", "Beneath the waterline: 300 checks replace a 5-person team.", "reel-under-waterline.jpg", "An iceberg pipeline from Teach once through Transcribe & clean, Chapter boundaries, Course map & notes, Pause judge, and Portrait frame & cover to Ready on WhatsApp.", "You teach once and upload the recording. Beneath the surface, Spark runs the work usually split across a transcriptionist, subject-matter assistant, instructional designer, video editor, and copywriter: time-coded transcription with Sanskrit and anatomy intact, maker-checker chapter boundaries that never cut mid-thought, a structured course map, an acoustic and LLM pause judge that protects pranayama holds and demonstrations while cutting dead air, and portrait face reframing with blur-focus depth.", ""),
      slide("13", "how", "One-shot quality", "How a reel earns Recommended vs Okay.", "reel-grading-rubric.jpg", "Three-stage grading diagram: 9 Hard Gates filter out weak clips, 7 Teaching Axes score 0 to 100, sorting into Recommended (70+), Okay (50 to 69), or Retired.", "Why 9 out of 10 reels work on the first shot: every candidate chapter must first pass 9 hard gates (at most 150 seconds after dead air, dead air at most 30%, traffic/background noise below 4/5, room echo contrast at least 19 dB, real teaching rather than class logistics or homework, stands alone for a stranger, one finishable idea, right audience, and delivery floor). Passing clips are then scored 0 to 100 across 7 weighted teaching axes (Interest match 3x, One claim 3x, Delivery 3x, Mastery signal 2x, Complete arc 2x, Said not performed 2x, Cold standalone 1x) plus a peer respect test, slide-opening check, and other-speaker check.", ""),
      slide("14", "how", "Sustainable depth", "Nine layers of consistency held at once.", "consistency-nine-layers.jpg", "A 3x3 grid of 9 consistency layers (Weekly pace, Story arc, Grid cover, SEO caption, Live classroom, Full syllabus, Every teacher, Right student, Exact terms) feeding a Sustainable brand tree.", "Posting once a week is easy; posting 5 to 7 times a week usually forces a teacher to drop quality or burn out. Spark holds nine layers of consistency at the same time: (1) weekly frequency through festivals and travel, (2) complete story arcs, (3) 3-second grid cover variety, (4) interest-media SEO captions, (5) live classroom energy on home ground, (6) full syllabus breadth across modules, (7) every faculty member visible without solo camera acting, (8) 100% serious-student intent, and (9) exact Sanskrit and anatomical terminology.", "")
    ],
    faqSlides: [
      slide("15", "faq", "Visual FAQ", "Why not use a clipping app or a social media agency? (Done-For-You vs Done-With-You)", "faq-dfy-vs-dwy.jpg", "Done for you, from class you already taught. Clipping apps leave 70% of the work. Agencies wait on you to film. Spark is ready on WhatsApp, from daily practice, 130+ teachers, and a 5-year pipeline.", "AI clipping apps slice flat podcast transcripts: on a class they cut mid-thought, chop teaching pauses, and leave 70% of the work to you or your team (scrubbing 90-minute recordings, picking clips, making covers, writing captions) - so busy teachers quit in week 2. Agencies and editors are Done-With-You disguised as Done-For-You: they still wait on you to script and film solo camera videos every week, and general editors miss Sanskrit and anatomical nuances. Spark is built at the intersection of three circles - daily personal practice, 9 years alongside 130+ teachers, and 5 years of pipeline engineering - turning classes you already taught into finished posts on WhatsApp. For a family member or coordinator on your team, a 15-hour weekly editing burden becomes a 2-minute phone post.", ""),
      slide("16", "faq", "Visual FAQ", "Which Instagram numbers actually matter, and when do enquiries convert?", "faq-quality-per-eyeball.jpg", "Quality per eyeball, two horizons. The metrics that matter are a 1.5x repeat watch, Saves, Shares, and over 50% non-followers. Months 1 to 3: warm enquiries convert. Months 3 to 6+: strangers trust and join.", "Instagram puts Views and Likes at the top to sell ads, while a generic viral reel can bring millions of views and zero serious students. For a high-trust course, look at Quality per Eyeball in Instagram Insights: a 1.5x repeat watch ratio (views vs viewers), Saves, Shares, and over 50% non-follower reach. At 20 to 30 reels a month, expect two distinct horizons: in Months 1 to 3 (about 90 reels / 5 hours of attention), warm referrals and enquiries who check your profile before your next batch see a deep library and stop hesitating. In Months 3 to 6+ (180+ reels / 10 hours of attention), complete strangers who discover one reel can binge hours of your teaching and apply.", ""),
      slide("17", "faq", "Visual FAQ", "What if a clip has a student-specific modification or a verbal slip? How do credits work?", "faq-accuracy-buffer.jpg", "You approve every clip, with a 20% pass buffer. A watermarked draft goes to the teacher. Approve 9 of 10: watermark off, one credit used. Pass 1 in 5: retired free, zero credits used.", "In a real class, you might cue a modification for one wobbly student that looks wrong out of context, or a teacher may have a 3-second verbal slip. Nothing is ever published without your approval. Drafts arrive on WhatsApp with a preview watermark (and can be routed directly to the faculty member who taught that session). At least 9 out of 10 clips meet the bar. When you give a thumbs-up, 1 credit is used and the watermark comes off. If you pass on a clip (up to our 20% replacement buffer - 1 in 5), that file is permanently retired at zero credit cost and the next Recommended clip moves up.", ""),
      slide("18", "faq", "Visual FAQ", "Should we run paid Meta ads or boost our reels right away?", "faq-paid-ads-library.jpg", "Fill the library before you boost. Paid ads on 6 reels leak out. At 60 to 90+ reels, every click lands on hours of teaching.", "Running paid ads when your page only has 6 reels (15 minutes of teaching) pours paid clicks into a leaky bucket: people tap your profile, see a thin grid, and leave. Once your page has 60 to 90+ classroom reels (3 to 5+ hours of teaching across your syllabus), every rupee of ad spend or boosting lands on a bingeable library that can actually earn a high-ticket enrolment.", "")
    ]
  };

  cfg.allSlides = cfg.storySlides.concat(cfg.craftSlides, cfg.faqSlides);

  function durationByMonths(months) {
    var i;
    for (i = 0; i < cfg.durationMonthsOptions.length; i++) {
      if (cfg.durationMonthsOptions[i].months === months) return cfg.durationMonthsOptions[i];
    }
    return cfg.durationMonthsOptions[0];
  }

  function tierById(id) {
    var i;
    for (i = 0; i < cfg.tiers.length; i++) {
      if (cfg.tiers[i].id === id) return cfg.tiers[i];
    }
    return cfg.tiers[cfg.tiers.length - 1];
  }

  function quoteTier(tier, reels, months) {
    var termPct = durationByMonths(months).termDiscountPct;
    var foundingPct = 0;
    var factor;
    var perReelInr;
    if (cfg.applyFoundingToMonthly || months >= 3) foundingPct = cfg.foundingDiscountPct;
    factor = (1 - termPct / 100) * (1 - foundingPct / 100);
    perReelInr = Math.round(tier.basePerReelInr * factor);
    return { perReelInr: perReelInr, monthlyInr: perReelInr * reels, upfrontInr: perReelInr * reels * months };
  }

  function hasCover(tierId) {
    return tierId === "reel_cover" || tierId === "reel_cover_caption";
  }

  function pack(level, reason, actions) {
    return { level: level, reason: reason, actions: actions || [], pill: level ? pillFor(level) : "" };
  }

  function tieCraft(slideRow, ctx) {
    var caption = ctx.tierId === "reel_cover_caption";
    var cover = hasCover(ctx.tierId);
    var full = [{ label: "Select Reel + cover + caption", tierId: "reel_cover_caption" }];
    var gaps = [];
    var actions = [];
    var pace = ctx.reels >= 20 && ctx.months >= 6;
    if (slideRow.num === "11") {
      if (caption) return pack("included", "Included in your choice: All 5 craft jobs arrive together on WhatsApp, plus Carousels and Stories from the same class.");
      if (cover) return pack("partial", "Partially unlocked: Includes jobs 1, 2, 3, and 4 (reel + grid cover), but leaves out job 5 (teacher-voice SEO caption, Carousels, and Stories).", full);
      return pack("partial", "Partially unlocked: Includes jobs 1, 2, and 4 (the reel only), and leaves out job 3 (grid cover) and job 5 (SEO caption, Carousels, and Stories).", full);
    }
    if (slideRow.num === "12") return pack("included", "Included in every plan: Built over 5 years (~250 to 300 automated checks, with 3 to 4 days of engineering invested per check) so posting takes under 3 minutes on your phone.");
    if (slideRow.num === "13") return pack("included", "Included in every plan: Clips scoring 70+ land in Recommended (sent first). Clips scoring 50 to 69 land in Okay (your backup library). Anything under 50 or failing a gate is retired before you ever see it.");
    if (caption && pace) return pack("included", "Included in your choice: All 9 layers of consistency hold across your page.");
    if (!cover) gaps.push("Layer 3 requires Cover");
    if (!caption) gaps.push("Layer 4 requires Caption");
    if (!pace) gaps.push("Layer 1 requires 20+ reels/month over 6 to 12 months");
    if (!caption) actions.push(full[0]);
    if (ctx.reels < 20) actions.push({ label: "Set 20 reels / month", reels: 20 });
    if (ctx.months < 6) actions.push({ label: "Switch to 6 months", months: 6 });
    return pack("partial", "Partially unlocked: " + gaps.join("; ") + ".", actions);
  }

  function statusFor(slideRow, ctx) {
    var n = parseInt(slideRow.num, 10);
    var months = ctx.months;
    var reels = ctx.reels;
    var cover = hasCover(ctx.tierId);
    var caption = ctx.tierId === "reel_cover_caption";
    var level = "included";
    var reason = slideRow.on;
    var actions = [];
    if (n >= 15) return { level: "included", reason: "", actions: [], pill: "" };
    if (n >= 11) return tieCraft(slideRow, ctx);
    if (slideRow.num === "02" && !(reels >= 20 && months >= 3)) {
      level = "missed";
      reason = slideRow.off;
      if (reels < 20) actions.push({ label: "Set 20 reels / month", reels: 20 });
      if (months < 3) actions.push({ label: "Switch to 3 months", months: 3 });
    } else if (slideRow.num === "03" && !(months >= 6 && reels >= 20)) {
      level = "missed";
      reason = slideRow.off;
      if (months < 6) actions.push({ label: "Switch to 6 months", months: 6 });
      if (reels < 20) actions.push({ label: "Set 20 reels / month", reels: 20 });
    } else if (slideRow.num === "04" && months < 3) {
      level = "missed";
      reason = slideRow.off;
      actions.push({ label: "Switch to 3 months", months: 3 });
    } else if (slideRow.num === "05" && !cover) {
      level = "missed";
      reason = slideRow.off;
      actions.push({ label: "Select Reel + cover", tierId: "reel_cover" });
    } else if (slideRow.num === "06" && !(cover && months >= 6)) {
      level = "missed";
      reason = slideRow.off;
      if (!cover) actions.push({ label: "Select Reel + cover", tierId: "reel_cover" });
      if (months < 6) actions.push({ label: "Switch to 6 months", months: 6 });
    } else if ((slideRow.num === "07" || slideRow.num === "08") && !caption) {
      level = "missed";
      reason = slideRow.off;
      actions.push({ label: "Select Reel + cover + caption", tierId: "reel_cover_caption" });
    } else if (slideRow.num === "09" && !(months === 12 && caption)) {
      level = "missed";
      reason = slideRow.off;
      if (!caption) actions.push({ label: "Select Reel + cover + caption", tierId: "reel_cover_caption" });
      if (months !== 12) actions.push({ label: "Switch to 12 months", months: 12 });
    } else if (slideRow.num === "10") {
      if (months === 12) {
        level = "included";
        reason = slideRow.on;
      } else if (months >= 3) {
        level = "partial";
        reason = slideRow.partial.replace("{months}", String(months));
        actions.push({ label: "Switch to 12 months", months: 12 });
      } else {
        level = "missed";
        reason = slideRow.off;
        actions.push({ label: "Switch to 12 months", months: 12 });
      }
    }
    return { level: level, reason: reason, actions: actions, pill: pillFor(level) };
  }

  function pillFor(level) {
    if (level === "included") return "Included";
    if (level === "partial") return "Optional upgrade";
    return "Not in current choice";
  }

  function tone(level) {
    if (level === "included") return "in";
    if (level === "partial") return "part";
    return "out";
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }


  cfg.quoteTier = quoteTier;
  cfg.quotePerReelInr = function (tierId, months) {
    return quoteTier(tierById(tierId), 1, months).perReelInr;
  };
  cfg.statusFor = statusFor;
  root.SPARK_REELS_PRICING = cfg;

  function mount() {
    var missing = document.getElementById("pricing-missing");
    var state;
    var flashToken = 0;
    var lastWizard = 0;
    var storySig = "";
    var craftSig = "";
    var faqDone = false;
    if (!cfg.tiers || cfg.storySlides.length !== 10 || cfg.allSlides.length !== 18) {
      if (missing) missing.classList.remove("hidden");
      return;
    }
    state = {
      reels: cfg.defaultReelsPerMonth,
      months: cfg.defaultDurationMonths,
      currency: cfg.defaultCurrency === "usd" ? "usd" : "inr",
      tierId: cfg.defaultTierId,
      storyIndex: 0,
      craftIndex: 0,
      wizardStep: 1,
      storyMode: "single",
      craftMode: "single",
      wizardMode: "stepped",
      lightbox: 0,
      summaryText: ""
    };
    function byId(id) { return document.getElementById(id); }
    function dbg(step, detail) {
      if (typeof console !== "undefined" && console.debug) console.debug("[SparkReels]", step, detail || "");
    }
    function esc(value) {
      return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    function readHash() {
      var raw = String(window.location.hash || "").replace(/^#/, "");
      var bits, i, pair, out;
      if (raw.indexOf("=") === -1) return null;
      bits = raw.split("&");
      out = {};
      for (i = 0; i < bits.length; i++) {
        pair = bits[i].split("=");
        out[decodeURIComponent(pair[0] || "")] = decodeURIComponent(pair.slice(1).join("="));
      }
      return out;
    }
    function applyHash() {
      var data = readHash();
      var tiers = { reel_only: 1, reel_cover: 1, reel_cover_caption: 1 };
      var monthOk = { 1: 1, 3: 1, 6: 1, 12: 1 };
      var reels, months, story, step;
      if (!data) return;
      if (data.c === "inr" || data.c === "usd") state.currency = data.c;
      reels = parseInt(data.r, 10);
      if (String(reels) === data.r && reels >= 1 && reels <= 90) {
        state.reels = reels;
        if (reels !== 12 && reels !== 20 && reels !== 28 && reels !== 30 && byId("reels-custom")) {
          byId("reels-custom").value = String(reels);
        }
      }
      months = parseInt(data.m, 10);
      if (String(months) === data.m && monthOk[months]) state.months = months;
      if (tiers[data.t]) state.tierId = data.t;
      story = parseInt(data.s, 10);
      if (String(story) === data.s && story >= 1 && story <= 10) state.storyIndex = story - 1;
      step = parseInt(data.w, 10);
      if (String(step) === data.w && step >= 1 && step <= 3) state.wizardStep = step;
      dbg("applyHash:done", state);
    }
    function stateHash() {
      return "#c=" + state.currency + "&r=" + state.reels + "&m=" + state.months + "&t=" + state.tierId + "&s=" + (state.storyIndex + 1) + "&w=" + state.wizardStep;
    }
    function syncHash() {
      var next = stateHash();
      if (window.location.hash !== next) window.history.replaceState(null, "", next);
    }
    function formatInr(inr) { return "₹" + Math.round(inr).toLocaleString("en-IN"); }
    function formatUsd(inr, reel) {
      var usd = Math.round(inr) / cfg.fxRateInrPerUsd;
      if (reel || usd < 100) return "$" + usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return "$" + Math.round(usd).toLocaleString("en-US");
    }
    function money(inr, reel) {
      if (state.currency === "usd") return formatUsd(inr, reel);
      return formatInr(inr);
    }
    function plural(n, one, many) { return n === 1 ? one : many; }
    function includedHours(reels) { return Math.max(cfg.minLectureHours, reels * cfg.videoHoursPerReelRatio); }
    function hoursText(hours) {
      var rounded = Math.round(hours * 10) / 10;
      if (Math.abs(rounded - Math.round(rounded)) < 0.001) return String(Math.round(rounded));
      return rounded.toFixed(1);
    }
    function hourPhrase(hours) {
      var label = hoursText(hours);
      return label + " " + plural(Number(label) === 1 ? 1 : 2, "hour", "hours");
    }
    function ratePhrase(tier, months) {
      var perReel = quoteTier(tier, 1, months).perReelInr;
      var pct;
      if (perReel === tier.basePerReelInr) return "the full monthly price";
      if (perReel * 2 === tier.basePerReelInr) return "half the monthly price";
      pct = Math.round((1 - perReel / tier.basePerReelInr) * 100);
      return pct + "% under the monthly price";
    }
    function offPct(months) {
      var opt = durationByMonths(months);
      var factor = (1 - opt.termDiscountPct / 100) * (1 - cfg.foundingDiscountPct / 100);
      return Math.round((1 - factor) * 100);
    }
    function discountLabel(months) {
      if (months < 3) return "None (1-month trial)";
      if (months === 12) return "50% off (33.3% annual + 25% Founding Partner)";
      return offPct(months) + "% off";
    }
    function durationButtonLabel(opt) {
      if (opt.months === 12) return "12 months - Best value 50% off";
      return opt.label;
    }
    function termSub() {
      if (state.months === 12) return "12 months · 50% off";
      if (state.months === 1) return "1 month · full price";
      return state.months + " months · " + offPct(state.months) + "% off";
    }
    function buttonClass(on) {
      return on
        ? "px-4 py-2 rounded-full bg-brand-600 text-white text-base font-semibold cursor-pointer"
        : "px-4 py-2 rounded-full bg-white text-slate-800 text-base font-semibold border border-slate-300 hover:bg-slate-50 cursor-pointer";
    }
    function ctxNow() { return { tierId: state.tierId, reels: state.reels, months: state.months }; }
    function setText(id, text) {
      var node = byId(id);
      if (node) node.textContent = text;
    }
    function paceSentence() {
      var total = state.reels * state.months;
      var minutes = Math.round(total * 2 * 1.5);
      var watch = minutes < 60 ? "about " + minutes + " " + plural(minutes, "minute", "minutes") : "about " + hourPhrase(minutes / 60);
      return total + " " + plural(total, "reel", "reels") + " over " + state.months + " " + plural(state.months, "month", "months") + " - " + watch + " of classroom teaching on your page. Each reel is about 2 minutes, and serious students often watch about 1.5 times.";
    }
    function shot(slideRow, index) {
      return '<button type="button" class="reels-shot" data-open-slide="' + index + '" aria-label="Open diagram ' + slideRow.num + ", " + esc(slideRow.title) + '"><img src="' + esc(slideRow.image) + '" width="1280" height="720" alt="' + esc(slideRow.alt) + '" loading="lazy"></button>';
    }
    function stageBody(slideRow, index, navHtml) {
      return '<div class="reels-stage reels-stage-anim"><div>' + shot(slideRow, index) + '</div><div><p class="reels-kicker">' + esc(slideRow.group) + '</p><h3 class="text-2xl font-bold text-slate-900 mt-1">' + esc(slideRow.title) + '</h3><p class="text-base text-slate-700 mt-3 leading-relaxed">' + esc(slideRow.story) + "</p>" + navHtml + "</div></div>";
    }
    function quietCard(slideRow, index, meta) {
      return '<article class="reels-quiet">' + shot(slideRow, index) + '<p class="text-base font-semibold text-slate-500 mt-3">' + esc(meta) + '</p><h3 class="text-2xl font-bold text-slate-900 mt-1">' + esc(slideRow.title) + '</h3><p class="text-base text-slate-700 mt-3 leading-relaxed">' + esc(slideRow.story) + "</p></article>";
    }
    function storyNav() {
      var html = '<div class="reels-navrow"><button type="button" class="reels-navbtn" id="story-prev"' + (state.storyIndex === 0 ? " disabled" : "") + ">Previous slide</button>";
      html += '<button type="button" class="reels-navbtn" id="story-next"' + (state.storyIndex === 9 ? " disabled" : "") + ">Next slide</button>";
      if (state.storyIndex === 9) {
        html += '<button type="button" class="reels-navbtn reels-navbtn-primary" data-scroll="how-it-works">Continue to How a reel is made →</button>';
        html += '<button type="button" class="reels-navbtn" data-scroll="prices">Build your plan in 3 steps →</button>';
      }
      return html + "</div>";
    }
    function craftNav() {
      return '<div class="reels-navrow"><button type="button" class="reels-navbtn" id="craft-prev"' + (state.craftIndex === 0 ? " disabled" : "") + '>Previous</button><button type="button" class="reels-navbtn" id="craft-next"' + (state.craftIndex === 3 ? " disabled" : "") + ">Next</button></div>";
    }
    function renderButtons(items, attr, idPrefix, pressed, labelFor) {
      var html = "";
      var i, on;
      for (i = 0; i < items.length; i++) {
        on = pressed(items[i]);
        html += '<button type="button" id="' + idPrefix + items[i].attr + '" class="' + buttonClass(on) + '" ' + attr + '="' + items[i].attr + '" aria-pressed="' + on + '">' + labelFor(items[i]) + "</button>";
      }
      return html;
    }
    function renderHero() {
      var tier = tierById("reel_cover_caption");
      var year = quoteTier(tier, 1, 12).perReelInr;
      byId("hero-rate-line").textContent = money(year, true) + " a reel on the 12-month complete plan (half the " + money(tier.basePerReelInr, true) + " monthly price).";
    }
    function renderSticky() {
      var q = quoteTier(tierById(state.tierId), state.reels, state.months);
      byId("sticky-plan-pill").textContent = state.reels + " " + plural(state.reels, "reel", "reels") + "/mo · " + state.months + "m · " + money(q.perReelInr, true) + "/reel · Review plan →";
    }
    function renderControls() {
      var currencies = [{ attr: "inr" }, { attr: "usd" }];
      var reels = [];
      var durations = [];
      var i;
      for (i = 0; i < cfg.reelsPerMonthOptions.length; i++) reels.push({ attr: cfg.reelsPerMonthOptions[i].reels, opt: cfg.reelsPerMonthOptions[i] });
      for (i = 0; i < cfg.durationMonthsOptions.length; i++) durations.push({ attr: cfg.durationMonthsOptions[i].months, opt: cfg.durationMonthsOptions[i] });
      byId("currency-switch").innerHTML = renderButtons(currencies, "data-currency", "currency-", function (item) { return state.currency === item.attr; }, function (item) { return item.attr === "usd" ? "USD" : "INR"; });
      byId("reels-controls").innerHTML = renderButtons(reels, "data-reels", "reels-opt-", function (item) { return state.reels === item.opt.reels; }, function (item) { return esc(item.opt.label) + ' <span class="reels-hint">(' + esc(item.opt.hint) + ")</span>"; });
      byId("duration-controls").innerHTML = renderButtons(durations, "data-months", "months-opt-", function (item) { return state.months === item.opt.months; }, function (item) { return esc(durationButtonLabel(item.opt)); });
      byId("pace-line").textContent = paceSentence();
    }
    function renderModes() {
      var labels = ["Step 1 · Monthly pace", "Step 2 · Weekly workflow", "Step 3 · Term & confirm"];
      var subs = [state.reels + " " + plural(state.reels, "reel", "reels") + " / month", tierById(state.tierId).name, termSub()];
      var html = "";
      var i;
      byId("story-mode-toggle").textContent = state.storyMode === "single" ? "Show all 10 at once" : "Step through one at a time";
      byId("craft-mode-toggle").textContent = state.craftMode === "single" ? "Show all 4 diagrams" : "Step through one by one";
      byId("wizard-mode-toggle").textContent = state.wizardMode === "stepped" ? "Show all 3 steps at once" : "One step at a time";
      for (i = 0; i < 3; i++) {
        html += '<button type="button" id="wiz-tab-' + (i + 1) + '" class="reels-stepbtn' + (state.wizardStep === i + 1 ? " is-on" : "") + '" data-wizard-step="' + (i + 1) + '" aria-pressed="' + (state.wizardStep === i + 1) + '"><span class="reels-step-label">' + labels[i] + '</span><span class="reels-step-sub">' + esc(subs[i]) + "</span></button>";
      }
      byId("wizard-steps-bar").innerHTML = html;
      for (i = 1; i <= 3; i++) byId("wizard-panel-" + i).hidden = state.wizardMode === "stepped" && state.wizardStep !== i;
      if (state.wizardStep !== lastWizard) {
        lastWizard = state.wizardStep;
        animate(byId("wizard-panel-" + state.wizardStep));
      }
    }
    function animate(node) {
      if (!node) return;
      node.classList.remove("reels-stage-anim");
      void node.offsetWidth;
      node.classList.add("reels-stage-anim");
    }
    function renderPlans() {
      var html = "";
      var i, j, tier, q, selected, rate;
      for (i = 0; i < cfg.tiers.length; i++) {
        tier = cfg.tiers[i];
        q = quoteTier(tier, state.reels, state.months);
        selected = tier.id === state.tierId;
        rate = ratePhrase(tier, state.months);
        html += '<article id="tier-' + esc(tier.id) + '" data-tier="' + esc(tier.id) + '" data-recommended="' + (tier.recommended ? "true" : "false") + '" class="rounded-2xl border p-6 flex flex-col ' + (selected ? "reels-chosen" : "border-slate-200") + '">';
        html += '<p class="reels-kicker reels-eyebrow mb-2">' + (tier.recommended ? "Start here - Complete system" : "") + "</p>";
        html += '<h3 class="text-2xl font-bold text-slate-900">' + esc(tier.name) + "</h3>";
        html += '<p class="mt-4 text-4xl font-extrabold text-slate-900">' + esc(money(q.perReelInr, true)) + '</p><p class="text-base text-slate-600">a reel</p>';
        if (q.perReelInr < tier.basePerReelInr) html += '<p class="mt-2 text-base reels-was">' + esc(money(tier.basePerReelInr, true)) + " on a monthly plan</p>";
        html += '<p class="mt-4 text-base font-semibold text-brand-700">' + esc(rate.charAt(0).toUpperCase() + rate.slice(1)) + "</p>";
        html += '<p class="mt-3 text-base text-slate-900 font-semibold">' + esc(money(q.monthlyInr, false)) + " a month</p>";
        html += '<p class="mt-1 text-base text-slate-900 font-semibold">' + esc(money(q.upfrontInr, false)) + " upfront</p>";
        html += '<p class="text-base text-slate-600">for ' + state.reels + " " + plural(state.reels, "reel", "reels") + " × " + state.months + " " + plural(state.months, "month", "months") + "</p>";
        html += '<p class="mt-4 text-base font-semibold text-slate-900">What you get</p><ul class="reels-benefits mt-2 space-y-2 text-base text-slate-700">';
        for (j = 0; j < tier.benefits.length; j++) html += "<li>" + esc(tier.benefits[j]) + "</li>";
        html += '</ul><p class="mt-4 text-base text-slate-700"><span class="font-semibold text-slate-900">Not included.</span> ' + esc(tier.notIncluded) + "</p>";
        html += '<div class="mt-5"><button type="button" class="' + buttonClass(selected) + '" data-choose="1" data-tier="' + esc(tier.id) + '" aria-pressed="' + selected + '">' + (selected ? "Chosen" : "Choose this") + "</button>";
        html += '<p class="mt-4"><button type="button" class="reels-textlink" data-open-fold="' + esc(tier.fold) + '">See craft details</button></p></div></article>';
      }
      byId("plan-grid").innerHTML = html;
    }
    function renderStory() {
      var single = state.storyMode === "single";
      var html = "";
      var i, row;
      if (state.storyIndex < 0 || state.storyIndex > 9) state.storyIndex = 0;
      if (state.storyMode + ":" + state.storyIndex === storySig) return;
      storySig = state.storyMode + ":" + state.storyIndex;
      byId("story-stage").hidden = !single;
      byId("story-grid").hidden = single;
      if (!single) {
        byId("story-card-host").innerHTML = "";
        for (i = 0; i < cfg.storySlides.length; i++) {
          row = cfg.storySlides[i];
          html += quietCard(row, i, row.num + " / 10 · " + row.group);
        }
        byId("story-grid").innerHTML = html;
        return;
      }
      byId("story-grid").innerHTML = "";
      row = cfg.storySlides[state.storyIndex];
      byId("story-step-meta").textContent = "Slide " + row.num + " of 10 · " + row.group;
      for (i = 0; i < cfg.storySlides.length; i++) html += '<button type="button" class="reels-dot" data-story-index="' + i + '" aria-pressed="' + (i === state.storyIndex) + '">' + cfg.storySlides[i].num + "</button>";
      byId("story-dots").innerHTML = html;
      byId("story-card-host").innerHTML = stageBody(row, state.storyIndex, storyNav());
    }
    function renderCraft() {
      var labels = ["11. Five craft jobs", "12. 300 checks beneath", "13. 9 gates & 7 axes", "14. 9 layers of consistency"];
      var single = state.craftMode === "single";
      var html = "";
      var i, row;
      if (state.craftIndex < 0 || state.craftIndex > 3) state.craftIndex = 0;
      if (state.craftMode + ":" + state.craftIndex === craftSig) return;
      craftSig = state.craftMode + ":" + state.craftIndex;
      byId("craft-tabs").hidden = !single;
      byId("craft-stage").hidden = !single;
      byId("craft-grid").hidden = single;
      if (!single) {
        byId("craft-stage").innerHTML = "";
        for (i = 0; i < cfg.craftSlides.length; i++) {
          row = cfg.craftSlides[i];
          html += quietCard(row, cfg.storySlides.length + i, row.num + " / 18 · " + row.group);
        }
        byId("craft-grid").innerHTML = html;
        return;
      }
      byId("craft-grid").innerHTML = "";
      for (i = 0; i < labels.length; i++) html += '<button type="button" class="reels-craft-tab" data-craft-index="' + i + '" aria-pressed="' + (i === state.craftIndex) + '">' + esc(labels[i]) + "</button>";
      byId("craft-tabs").innerHTML = html;
      row = cfg.craftSlides[state.craftIndex];
      byId("craft-stage").innerHTML = stageBody(row, cfg.storySlides.length + state.craftIndex, craftNav());
    }
    function renderFaq() {
      if (faqDone) return;
      faqDone = true;
      var takes = [
        "Spark finishes the post from classes you already taught, instead of leaving the weekly edit on you or an agency.",
        "Repeat watches, Saves, Shares, and non-follower reach matter more than likes, and serious enquiries show up after the library has hours of teaching.",
        "You approve every watermarked draft: a thumbs-up spends one credit, and a pass retires the clip for free.",
        "Fill the page to 60 to 90 classroom reels before you spend on ads, so each click lands on hours of teaching."
      ];
      var html = "";
      var i, row, index;
      var base = cfg.storySlides.length + cfg.craftSlides.length;
      for (i = 0; i < cfg.faqSlides.length; i++) {
        row = cfg.faqSlides[i];
        index = base + i;
        html += '<details id="faq-visual-' + i + '" class="reels-fold"><summary><span class="reels-q">' + esc(row.title) + '</span><span class="reels-take">' + esc(takes[i]) + "</span></summary>";
        html += '<div class="reels-faq-body">' + shot(row, index) + '<p class="text-base text-slate-700 leading-relaxed">' + esc(row.story) + "</p></div></details>";
      }
      byId("faq-grid").innerHTML = html;
    }
    function pillarStates() {
      var cover = hasCover(state.tierId);
      var caption = state.tierId === "reel_cover_caption";
      var habit = "missed";
      var rate = "missed";
      if (state.reels >= 20 && state.months >= 6) habit = "included";
      else if (state.reels >= 20 && state.months >= 3) habit = "partial";
      if (state.months === 12) rate = "included";
      else if (state.months === 3 || state.months === 6) rate = "partial";
      return [
        { name: "Weekly habit & 7-hour student trust library", level: habit, fix: habit === "included" ? null : { label: "Set 20 reels/mo & 6 months", reels: 20, months: 6 } },
        { name: "3-second scannable profile grid", level: cover ? "included" : "missed", fix: cover ? null : { label: "Select Reel + cover", tierId: "reel_cover" } },
        { name: "Non-follower search reach + Carousels & Stories", level: caption ? "included" : "missed", fix: caption ? null : { label: "Select Reel + cover + caption", tierId: "reel_cover_caption" } },
        { name: "Founding Partner + Annual 50% rate lock", level: rate, fix: rate === "included" ? null : { label: "Switch to 12 months", months: 12 } },
        { name: "Early access to Quizzes, YouTube Chapters, Multi-Platform & Email Nurture", level: state.months === 12 && caption ? "included" : "missed", fix: state.months === 12 && caption ? null : { label: "Select 12 months on Reel + cover + caption", months: 12, tierId: "reel_cover_caption" } }
      ];
    }
    function badgeLabel(level) {
      if (level === "included") return "Included";
      if (level === "partial") return "Optional upgrade";
      return "Not in current choice";
    }
    function renderPillars() {
      var rows = pillarStates();
      var html = "";
      var includedCount = 0;
      var i, row, fix;
      for (i = 0; i < rows.length; i++) if (rows[i].level === "included") includedCount += 1;
      byId("choice-kicker").textContent = includedCount === 5
        ? "All 5 core pillars are included in your current setup."
        : includedCount + " of 5 core pillars included - use any button on the right to add what is missing.";
      for (i = 0; i < rows.length; i++) {
        row = rows[i];
        html += '<div class="reels-pillar"><p class="text-base text-slate-900">' + esc(row.name) + '</p><span class="' + (row.level === "included" ? "reels-badge reels-badge-in" : "reels-badge reels-badge-gap") + '">' + badgeLabel(row.level) + "</span>";
        fix = row.fix;
        if (fix) {
          html += '<button type="button" class="reels-fix" data-fix="1" data-from="pillars"';
          if (fix.months) html += ' data-months="' + fix.months + '"';
          if (fix.reels) html += ' data-reels="' + fix.reels + '"';
          if (fix.tierId) html += ' data-tier="' + esc(fix.tierId) + '"';
          html += ">" + esc(fix.label) + "</button>";
        }
        html += "</div>";
      }
      byId("pillars-list").innerHTML = html;
    }
    function pillarsLine() {
      var rows = pillarStates();
      var n = 0;
      var i;
      for (i = 0; i < rows.length; i++) if (rows[i].level === "included") n += 1;
      return n + " of 5 core pillars included";
    }
    function renderHours() {
      var line = "At " + state.reels + " " + plural(state.reels, "reel", "reels") + " a month, " + hourPhrase(includedHours(state.reels)) + " of your lecture are included each month.";
      var extra = "Extra video is " + money(cfg.extraVideoHourInr, true) + " an hour.";
      setText("included-hours", line);
      setText("extra-hour", extra);
      setText("credits-hours", line);
      setText("credits-extra", extra);
    }
    function renderRoadmap() {
      var tier = tierById("reel_cover_caption");
      var year = quoteTier(tier, 1, 12).perReelInr;
      byId("roadmap-rate").textContent = "A 12-month commitment combines the 33.3% annual discount with the 25% Founding Partner discount. Reel + cover + caption moves from " + money(tier.basePerReelInr, true) + " to " + money(year, true) + " per reel for the entire year, with early access to each new format as it ships.";
    }
    function currentUrl() {
      var href = window.location.href;
      var cut = href.indexOf("#");
      return (cut === -1 ? href : href.slice(0, cut)) + stateHash();
    }
    function summaryRows() {
      var tier = tierById(state.tierId);
      var q = quoteTier(tier, state.reels, state.months);
      var total = state.reels * state.months;
      var watch = hourPhrase(Math.round(total * 2 * 1.5) / 60);
      return [
        ["Selected plan", tier.name],
        ["Monthly pace", state.reels + " " + plural(state.reels, "reel", "reels") + " / month (" + total + " " + plural(total, "reel", "reels") + " over " + state.months + " " + plural(state.months, "month", "months") + ", ~" + watch + " of classroom teaching)"],
        ["Commitment term", state.months + " " + plural(state.months, "month", "months") + " paid upfront"],
        ["1-month list rate", money(tier.basePerReelInr, true) + " / reel"],
        ["Discount applied", discountLabel(state.months)],
        ["Your rate", money(q.perReelInr, true) + " / reel · " + money(q.monthlyInr, false) + " / month"],
        ["Total due upfront", money(q.upfrontInr, false)],
        ["Included lecture processing", hourPhrase(includedHours(state.reels)) + " / month (extra video " + money(cfg.extraVideoHourInr, true) + " / hour)"],
        ["Value pillars unlocked", pillarsLine()]
      ];
    }
    function renderNudge() {
      var box = byId("checkout-nudge");
      var nowRate, nextRate, save, msg;
      if (state.tierId === "reel_cover_caption" && state.months === 12) { box.innerHTML = ""; return; }
      nowRate = quoteTier(tierById(state.tierId), 1, state.months).perReelInr;
      nextRate = quoteTier(tierById("reel_cover_caption"), 1, 12).perReelInr;
      save = nowRate - nextRate;
      if (save > 0) msg = "12 months on Reel + cover + caption is " + money(nextRate, true) + " / reel, which is " + money(save, true) + " less per reel, and it covers all 5 pillars.";
      else msg = "12 months on Reel + cover + caption is " + money(nextRate, true) + " / reel, and it covers all 5 pillars, including early access.";
      box.innerHTML = '<p class="text-base text-slate-800 mb-3">' + esc(msg) + '</p><p><button type="button" class="reels-fix" data-fix="1" data-from="checkout" data-months="12" data-tier="reel_cover_caption">Switch to 12 months, Reel + cover + caption</button></p>';
    }
    function renderCheckout() {
      var rows = summaryRows();
      var html = "";
      var lines = [];
      var i, text, subject;
      for (i = 0; i < rows.length; i++) {
        html += '<div class="reels-kv"><p class="font-semibold text-slate-900">' + esc(rows[i][0]) + "</p><p>" + esc(rows[i][1]) + "</p></div>";
        lines.push(rows[i][0] + ": " + rows[i][1]);
      }
      lines.push("Setup link: " + currentUrl());
      text = lines.join("\n");
      state.summaryText = text;
      subject = "Spark Reels plan: " + tierById(state.tierId).name + ", " + state.reels + " " + plural(state.reels, "reel", "reels") + ", " + state.months + " " + plural(state.months, "month", "months");
      byId("checkout-summary").innerHTML = html;
      byId("whatsapp-choice").href = "https://wa.me/" + cfg.whatsappPhone + "?text=" + encodeURIComponent(text);
      byId("email-choice").href = "mailto:support@sparktutor.ai?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      renderNudge();
    }
    function render() {
      syncHash();
      renderHero();
      renderSticky();
      renderControls();
      renderModes();
      renderPlans();
      renderStory();
      renderCraft();
      renderFaq();
      renderPillars();
      renderHours();
      renderRoadmap();
      renderCheckout();
      if (!byId("story-lightbox").hidden) paintLightbox();
    }
    function setReels(n, fromCustom) {
      var error = byId("reels-error");
      if (!isFinite(n) || Math.floor(n) !== n || n < 1 || n > 90) {
        error.textContent = "Use a whole number from 1 to 90.";
        return;
      }
      error.textContent = "";
      state.reels = n;
      if (!fromCustom) byId("reels-custom").value = "";
      render();
    }
    function openFold(id) {
      var node = byId(id);
      if (!node || node.tagName !== "DETAILS") return;
      node.open = true;
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function scrollToId(id) {
      var node = byId(id);
      if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function gotoStep(n) {
      if (n < 1 || n > 3) return;
      dbg("gotoStep:before", { from: state.wizardStep, to: n });
      state.wizardStep = n;
      render();
      dbg("gotoStep:after", { step: state.wizardStep });
      scrollToId("wizard-panel-" + n);
    }
    function moveStory(delta) {
      var next = state.storyIndex + delta;
      if (next < 0 || next > 9) return;
      dbg("moveStory", { from: state.storyIndex, to: next });
      state.storyIndex = next;
      render();
    }
    function moveCraft(delta) {
      var next = state.craftIndex + delta;
      if (next < 0 || next > 3) return;
      dbg("moveCraft", { from: state.craftIndex, to: next });
      state.craftIndex = next;
      render();
    }
    function applyFix(btn) {
      var patch = {};
      dbg("applyFix:before", state);
      if (btn.hasAttribute("data-months")) {
        patch.months = parseInt(btn.getAttribute("data-months"), 10);
        state.months = patch.months;
      }
      if (btn.hasAttribute("data-reels")) {
        patch.reels = parseInt(btn.getAttribute("data-reels"), 10);
        state.reels = patch.reels;
        byId("reels-custom").value = "";
        byId("reels-error").textContent = "";
      }
      if (btn.hasAttribute("data-tier")) {
        patch.tierId = btn.getAttribute("data-tier");
        state.tierId = patch.tierId;
      }
      render();
      dbg("applyFix:after", patch);
      flash(patch);
    }
    function flash(patch) {
      var nodes = [];
      var token, i;
      function add(node) { if (node) nodes.push(node); }
      flashToken += 1;
      token = flashToken;
      if (patch.months) { add(byId("months-opt-" + patch.months)); add(byId("wiz-tab-3")); }
      if (patch.reels) { add(byId("reels-opt-" + patch.reels)); add(byId("wiz-tab-1")); }
      if (patch.tierId) { add(byId("tier-" + patch.tierId)); add(byId("wiz-tab-2")); }
      add(byId("choice"));
      for (i = 0; i < nodes.length; i++) nodes[i].classList.add("reels-flash");
      window.setTimeout(function () {
        var j;
        if (token !== flashToken) return;
        for (j = 0; j < nodes.length; j++) nodes[j].classList.remove("reels-flash");
      }, 1800);
    }
    function paintLightbox() {
      var slideRow = cfg.allSlides[state.lightbox];
      var st = statusFor(slideRow, ctxNow());
      var img = byId("lightbox-img");
      var status = byId("lightbox-status");
      img.src = slideRow.image;
      img.alt = slideRow.alt;
      byId("lightbox-step").textContent = slideRow.num + " / " + pad(cfg.allSlides.length) + " · " + slideRow.group;
      status.hidden = !st.pill;
      status.textContent = st.pill || "";
      status.className = "reels-status reels-status-" + tone(st.level);
      byId("lightbox-title").textContent = slideRow.title;
      byId("lightbox-story").textContent = slideRow.story;
      byId("lightbox-reason").textContent = st.reason || "";
    }
    function openLightbox(index) {
      var dlg = byId("story-lightbox");
      if (!cfg.allSlides[index]) return;
      state.lightbox = index;
      paintLightbox();
      dlg.hidden = false;
      dlg.setAttribute("aria-hidden", "false");
      byId("lightbox-close").focus();
    }
    function closeLightbox() {
      var dlg = byId("story-lightbox");
      dlg.hidden = true;
      dlg.setAttribute("aria-hidden", "true");
    }
    function stepLightbox(delta) {
      var n = cfg.allSlides.length;
      state.lightbox = (state.lightbox + delta + n) % n;
      paintLightbox();
    }
    function copyText(text, button, done) {
      var idle = button.getAttribute("data-idle") || button.textContent;
      var token = String(Date.now()) + Math.random();
      button.setAttribute("data-idle", idle);
      button.setAttribute("data-copy-token", token);
      function show(ok) {
        button.textContent = ok ? done : "Select the text and copy it";
        window.setTimeout(function () {
          if (button.getAttribute("data-copy-token") !== token) return;
          button.textContent = idle;
        }, 2000);
      }
      function fallback() {
        var area = document.createElement("textarea");
        var ok = false;
        area.value = text;
        document.body.appendChild(area);
        area.select();
        try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
        document.body.removeChild(area);
        return ok;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { show(true); }, function () { show(fallback()); });
      else show(fallback());
    }
    function setActiveTab(href) {
      var pairs = [["nav-tab-story", "#story"], ["nav-tab-craft", "#how-it-works"], ["nav-tab-prices", "#prices"]];
      var i, tab;
      for (i = 0; i < pairs.length; i++) {
        tab = byId(pairs[i][0]);
        if (!tab) continue;
        if (pairs[i][1] === href) tab.setAttribute("aria-current", "true");
        else tab.removeAttribute("aria-current");
      }
    }
    function bindSpy() {
      var ids = ["story", "how-it-works", "faq", "roadmap", "prices"];
      var map = { story: "#story", "how-it-works": "#how-it-works", faq: "#how-it-works", roadmap: "#how-it-works", prices: "#prices" };
      var i;
      if (!("IntersectionObserver" in window)) return;
      var obs = new IntersectionObserver(function (entries) {
        var j;
        for (j = 0; j < entries.length; j++) if (entries[j].isIntersecting) setActiveTab(map[entries[j].target.id]);
      }, { rootMargin: "-25% 0px -55% 0px", threshold: 0.01 });
      for (i = 0; i < ids.length; i++) obs.observe(byId(ids[i]));
    }
    applyHash();
    byId("reels-custom").addEventListener("input", function (e) {
      var raw = e.target.value;
      if (raw === "") { byId("reels-error").textContent = ""; return; }
      if (!/^\d+$/.test(raw)) { byId("reels-error").textContent = "Use a whole number from 1 to 90."; return; }
      setReels(parseInt(raw, 10), true);
    });
    document.addEventListener("click", function (e) {
      var origin = e.target;
      var btn, doorId;
      if (origin && origin.nodeType !== 1) origin = origin.parentElement;
      if (!origin || !origin.closest) return;
      if (origin.id === "story-lightbox") { closeLightbox(); return; }
      if (origin.closest("#lightbox-close")) { closeLightbox(); return; }
      if (origin.closest("#lightbox-prev")) { stepLightbox(-1); return; }
      if (origin.closest("#lightbox-next")) { stepLightbox(1); return; }
      if (origin.closest("#copy-choice")) { copyText(state.summaryText || "", byId("copy-choice"), "Copied plan summary"); return; }
      if (origin.closest("#copy-link-choice")) { syncHash(); copyText(window.location.href, byId("copy-link-choice"), "Copied link"); return; }
      if (origin.closest("#story-mode-toggle")) { state.storyMode = state.storyMode === "single" ? "grid" : "single"; render(); return; }
      if (origin.closest("#craft-mode-toggle")) { state.craftMode = state.craftMode === "single" ? "grid" : "single"; render(); return; }
      if (origin.closest("#wizard-mode-toggle")) { state.wizardMode = state.wizardMode === "stepped" ? "all" : "stepped"; render(); return; }
      if (origin.closest("#sticky-plan-pill")) { scrollToId("prices"); return; }
      btn = origin.closest("[data-door]");
      if (btn) {
        doorId = { story: "story", craft: "how-it-works", wizard: "prices" };
        scrollToId(doorId[btn.getAttribute("data-door")] || "story");
        return;
      }
      btn = origin.closest("a.reels-tab");
      if (btn) { e.preventDefault(); scrollToId(btn.getAttribute("href").replace("#", "")); return; }
      btn = origin.closest("[data-scroll]");
      if (btn) { scrollToId(btn.getAttribute("data-scroll")); return; }
      btn = origin.closest("[data-goto-step], [data-wizard-step]");
      if (btn) { gotoStep(parseInt(btn.getAttribute("data-goto-step") || btn.getAttribute("data-wizard-step"), 10)); return; }
      btn = origin.closest("[data-story-index]");
      if (btn) { state.storyIndex = parseInt(btn.getAttribute("data-story-index"), 10); render(); return; }
      btn = origin.closest("[data-craft-index]");
      if (btn) { state.craftIndex = parseInt(btn.getAttribute("data-craft-index"), 10); render(); return; }
      if (origin.closest("#story-prev")) { moveStory(-1); return; }
      if (origin.closest("#story-next")) { moveStory(1); return; }
      if (origin.closest("#craft-prev")) { moveCraft(-1); return; }
      if (origin.closest("#craft-next")) { moveCraft(1); return; }
      btn = origin.closest("[data-fix]");
      if (btn) { applyFix(btn); return; }
      btn = origin.closest("[data-open-slide]");
      if (btn) { openLightbox(parseInt(btn.getAttribute("data-open-slide"), 10)); return; }
      btn = origin.closest("button[data-choose]");
      if (btn) { state.tierId = btn.getAttribute("data-tier"); render(); return; }
      btn = origin.closest("[data-open-fold]");
      if (btn) { openFold(btn.getAttribute("data-open-fold")); return; }
      btn = origin.closest("button[data-currency]");
      if (btn) { state.currency = btn.getAttribute("data-currency") === "usd" ? "usd" : "inr"; render(); return; }
      btn = origin.closest("#reels-controls button[data-reels]");
      if (btn) { setReels(parseInt(btn.getAttribute("data-reels"), 10), false); return; }
      btn = origin.closest("#duration-controls button[data-months]");
      if (btn) { state.months = parseInt(btn.getAttribute("data-months"), 10); render(); return; }
    });
    document.addEventListener("keydown", function (e) {
      var dlg = byId("story-lightbox");
      if (!dlg || dlg.hidden) return;
      if (e.key === "Escape") { closeLightbox(); e.preventDefault(); }
      else if (e.key === "ArrowRight") { stepLightbox(1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stepLightbox(-1); e.preventDefault(); }
    });
    bindSpy();
    render();
  }
  root.SparkReelsPage = { mount: mount };
})(typeof window !== "undefined" ? window : globalThis);
