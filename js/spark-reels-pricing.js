/*
  Spark Reels public pricing, the 10-slide story, and diagrams 11 to 18.

  Edit a number here, save, and reload marketing/spark-reels.html.
  Founding partner pricing applies to 3, 6, and 12 month terms.
  It does not apply to the 1-month price.
  Term and founding discounts stack by multiplication, not by adding percents.
  Included lecture hours = max(6, reels per month x videoHoursPerReelRatio).
  The page opens in rupees, on 20 reels and 12 months, on the full column.
  Currency choice stays in memory for this page view. No browser storage.
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
    if (level === "included") return "Included in your choice";
    if (level === "partial") return "Partially unlocked";
    return "Missed on current choice";
  }

  function tone(level) {
    if (level === "included") return "in";
    if (level === "partial") return "part";
    return "out";
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function numsAtLevel(tierId, reels, months, level) {
    var nums = [];
    var i;
    var st;
    for (i = 0; i < cfg.storySlides.length; i++) {
      st = statusFor(cfg.storySlides[i], { tierId: tierId, reels: reels, months: months });
      if (st.level === level) nums.push(parseInt(cfg.storySlides[i].num, 10));
    }
    return nums;
  }

  function groupRanges(nums) {
    var parts = [];
    var start = nums[0];
    var prev = nums[0];
    var i;
    for (i = 1; i <= nums.length; i++) {
      if (i < nums.length && nums[i] === prev + 1) {
        prev = nums[i];
        continue;
      }
      parts.push(start === prev ? pad(start) : pad(start) + " - " + pad(prev));
      if (i < nums.length) {
        start = nums[i];
        prev = nums[i];
      }
    }
    return parts.join(", ");
  }

  function planSlideBadge(tierId, reels, months) {
    var unlocked = numsAtLevel(tierId, reels, months, "included");
    var missed = numsAtLevel(tierId, reels, months, "missed");
    var partial = numsAtLevel(tierId, reels, months, "partial");
    var text;
    if (unlocked.length === 10) return "Unlocks all 10 of 10 slides (01 - 10)";
    text = "Unlocks " + unlocked.length + " of 10 slides (" + groupRanges(unlocked) + ")";
    if (missed.length) text += " - misses " + groupRanges(missed);
    if (partial.length) text += " - partial " + groupRanges(partial);
    return text;
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
    var copyToken = 0;
    if (!cfg.tiers || cfg.storySlides.length !== 10 || cfg.allSlides.length !== 18) {
      if (missing) missing.classList.remove("hidden");
      return;
    }

    state = {
      reels: cfg.defaultReelsPerMonth,
      months: cfg.defaultDurationMonths,
      currency: cfg.defaultCurrency === "usd" ? "usd" : "inr",
      tierId: cfg.defaultTierId,
      filter: "all",
      lightbox: 0,
      summaryText: ""
    };

    function esc(value) {
      return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function formatInr(inr) {
      return "₹" + Math.round(inr).toLocaleString("en-IN");
    }

    function formatUsd(inr, reel) {
      var usd = Math.round(inr) / cfg.fxRateInrPerUsd;
      if (reel || usd < 100) return "$" + usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return "$" + Math.round(usd).toLocaleString("en-US");
    }

    function money(inr, reel) {
      if (state.currency === "usd") return formatUsd(inr, reel);
      return formatInr(inr);
    }

    function plural(n, one, many) {
      return n === 1 ? one : many;
    }

    function includedHours(reels) {
      return Math.max(cfg.minLectureHours, reels * cfg.videoHoursPerReelRatio);
    }

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

    function durationHint(opt) {
      var factor;
      if (opt.months === 1) return "Full monthly price";
      if (opt.bestValue) return "Best value - 50% off";
      factor = (1 - opt.termDiscountPct / 100) * (1 - cfg.foundingDiscountPct / 100);
      return Math.round((1 - factor) * 100) + "% off";
    }

    function discountLabel(months) {
      var opt = durationByMonths(months);
      var factor;
      var pct;
      if (months < 3) return "None (1-month trial)";
      factor = (1 - opt.termDiscountPct / 100) * (1 - cfg.foundingDiscountPct / 100);
      pct = Math.round((1 - factor) * 100);
      if (months === 12) return pct + "% off (33.3% annual + 25% Founding Partner)";
      return pct + "% off";
    }

    function buttonClass(on) {
      return on
        ? "px-4 py-2 rounded-full bg-brand-600 text-white text-base font-semibold cursor-pointer"
        : "px-4 py-2 rounded-full bg-white text-slate-800 text-base font-semibold border border-slate-300 hover:bg-slate-50 cursor-pointer";
    }

    function ctxNow() {
      return { tierId: state.tierId, reels: state.reels, months: state.months };
    }

    function setText(id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text;
    }

    function actionsHtml(actions, fromId) {
      var html = "";
      var i;
      var action;
      if (!actions || !actions.length) return "";
      html += '<div class="reels-fixrow">';
      for (i = 0; i < actions.length; i++) {
        action = actions[i];
        html += '<button type="button" class="reels-fix" data-fix="1" data-from="' + esc(fromId) + '"';
        if (action.months) html += ' data-months="' + action.months + '"';
        if (action.reels) html += ' data-reels="' + action.reels + '"';
        if (action.tierId) html += ' data-tier="' + esc(action.tierId) + '"';
        html += ">" + esc(action.label) + "</button>";
      }
      return html + "</div>";
    }

    function paceSentence() {
      var total = state.reels * state.months;
      var minutes = Math.round(total * 2 * 1.5);
      var watch;
      if (minutes < 60) watch = "about " + minutes + " " + plural(minutes, "minute", "minutes");
      else watch = "about " + hourPhrase(minutes / 60);
      return total + " " + plural(total, "reel", "reels") + " over " + state.months + " " + plural(state.months, "month", "months") + " - " + watch + " of classroom teaching on your page. Each reel is about 2 minutes, and serious students often watch about 1.5 times.";
    }

    function slideCard(slideRow, index, withTie) {
      var st = withTie ? statusFor(slideRow, ctxNow()) : null;
      var html = '<article class="reels-slide" id="slide-' + slideRow.num + '" data-index="' + index + '">';
      html += '<div class="reels-slide-top"><span class="reels-step">' + slideRow.num + " / " + pad(cfg.allSlides.length) + "</span>";
      html += '<span class="reels-grouptag">' + esc(slideRow.group) + "</span>";
      if (st) html += '<span class="reels-status reels-status-' + tone(st.level) + '">' + esc(st.pill) + "</span>";
      html += "</div>";
      html += '<button type="button" class="reels-shot" data-open-slide="' + index + '" aria-label="Open diagram ' + slideRow.num + ", " + esc(slideRow.title) + '">';
      html += '<img src="' + esc(slideRow.image) + '" width="1280" height="720" alt="' + esc(slideRow.alt) + '" loading="lazy"></button>';
      html += '<h3 class="text-2xl font-bold text-slate-900 mt-4">' + esc(slideRow.title) + "</h3>";
      html += '<p class="mt-3 text-base text-slate-700">' + esc(slideRow.story) + "</p>";
      if (st) {
        html += '<div class="reels-tie"><div class="reels-tie-box"><p class="text-base text-slate-800">' + esc(st.reason) + "</p>";
        html += actionsHtml(st.actions, "slide-" + slideRow.num) + "</div></div>";
      }
      return html + "</article>";
    }

    function renderButtons(items, attr, pressed, labelFor) {
      var html = "";
      var i;
      var on;
      for (i = 0; i < items.length; i++) {
        on = pressed(items[i]);
        html += '<button type="button" class="' + buttonClass(on) + '" ' + attr + '="' + items[i].attr + '" aria-pressed="' + on + '">' + labelFor(items[i]) + "</button>";
      }
      return html;
    }

    function renderControls() {
      var currencies = [{ attr: "inr", label: "INR" }, { attr: "usd", label: "USD" }];
      var reels = [];
      var durations = [];
      var i;
      for (i = 0; i < cfg.reelsPerMonthOptions.length; i++) {
        reels.push({ attr: cfg.reelsPerMonthOptions[i].reels, opt: cfg.reelsPerMonthOptions[i] });
      }
      for (i = 0; i < cfg.durationMonthsOptions.length; i++) {
        durations.push({ attr: cfg.durationMonthsOptions[i].months, opt: cfg.durationMonthsOptions[i] });
      }
      document.getElementById("currency-switch").innerHTML = renderButtons(currencies, "data-currency", function (item) { return state.currency === item.attr; }, function (item) { return item.label; });
      document.getElementById("reels-controls").innerHTML = renderButtons(reels, "data-reels", function (item) { return state.reels === item.opt.reels; }, function (item) { return esc(item.opt.label) + ' <span class="reels-hint">(' + esc(item.opt.hint) + ")</span>"; });
      document.getElementById("duration-controls").innerHTML = renderButtons(durations, "data-months", function (item) { return state.months === item.opt.months; }, function (item) { return esc(item.opt.label) + ' <span class="reels-hint">(' + esc(durationHint(item.opt)) + ")</span>"; });
      document.getElementById("pace-line").textContent = paceSentence();
    }

    function renderPlans() {
      var html = "";
      var i;
      var j;
      var tier;
      var q;
      var selected;
      var rate;
      for (i = 0; i < cfg.tiers.length; i++) {
        tier = cfg.tiers[i];
        q = quoteTier(tier, state.reels, state.months);
        selected = tier.id === state.tierId;
        rate = ratePhrase(tier, state.months);
        html += '<article data-tier="' + esc(tier.id) + '" data-recommended="' + (tier.recommended ? "true" : "false") + '" class="rounded-2xl border p-6 flex flex-col ' + (selected ? "border-brand-600 reels-start reels-chosen" : "border-slate-200") + '">';
        html += '<p class="reels-eyebrow text-base font-semibold text-brand-700 mb-2">' + (tier.recommended ? "Start here - Complete system" : "") + "</p>";
        html += '<h3 class="text-2xl font-bold text-slate-900">' + esc(tier.name) + "</h3>";
        html += '<p class="mt-4 text-4xl font-extrabold text-slate-900">' + esc(money(q.perReelInr, true)) + "</p>";
        html += '<p class="text-base text-slate-600">a reel</p>';
        if (q.perReelInr < tier.basePerReelInr) html += '<p class="mt-2 text-base reels-was">' + esc(money(tier.basePerReelInr, true)) + " on a monthly plan</p>";
        html += '<p class="mt-4 text-base font-semibold text-brand-700">' + esc(rate.charAt(0).toUpperCase() + rate.slice(1)) + "</p>";
        html += '<p class="mt-3 text-base text-slate-900 font-semibold">' + esc(money(q.monthlyInr, false)) + " a month</p>";
        html += '<p class="mt-1 text-base text-slate-900 font-semibold">' + esc(money(q.upfrontInr, false)) + " upfront</p>";
        html += '<p class="text-base text-slate-600">for ' + state.reels + " " + plural(state.reels, "reel", "reels") + " × " + state.months + " " + plural(state.months, "month", "months") + "</p>";
        html += '<p class="mt-3 text-base font-semibold text-slate-900">' + esc(planSlideBadge(tier.id, state.reels, state.months)) + "</p>";
        html += '<p class="mt-4 text-base font-semibold text-slate-900">What you get</p><ul class="reels-benefits mt-2 space-y-2 text-base text-slate-700">';
        for (j = 0; j < tier.benefits.length; j++) html += "<li>" + esc(tier.benefits[j]) + "</li>";
        html += '</ul><p class="mt-4 text-base text-slate-700"><span class="font-semibold text-slate-900">Not included.</span> ' + esc(tier.notIncluded) + "</p>";
        html += '<div class="reels-card-foot"><p><button type="button" class="' + buttonClass(selected) + '" data-choose="1" data-tier="' + esc(tier.id) + '" aria-pressed="' + selected + '">';
        html += (selected ? "Chosen" : "Choose this") + "</button></p>";
        html += '<p class="mt-4"><button type="button" class="reels-textlink" data-open-fold="' + esc(tier.fold) + '">See details below</button></p></div></article>';
      }
      document.getElementById("plan-grid").innerHTML = html;
    }

    function renderStoryBar() {
      var termLabel = { 1: "1m", 3: "3m", 6: "6m", 12: "12m · 50% off" };
      var tiers = [];
      var terms = [];
      var paces = [];
      var i;
      var tier;
      var q;
      var unlocked;
      for (i = 0; i < cfg.tiers.length; i++) tiers.push({ attr: cfg.tiers[i].id, name: cfg.tiers[i].name });
      for (i = 0; i < cfg.durationMonthsOptions.length; i++) terms.push({ attr: String(cfg.durationMonthsOptions[i].months), months: cfg.durationMonthsOptions[i].months });
      for (i = 0; i < cfg.reelsPerMonthOptions.length; i++) paces.push({ attr: String(cfg.reelsPerMonthOptions[i].reels), reels: cfg.reelsPerMonthOptions[i].reels });
      document.getElementById("story-tier").innerHTML = renderButtons(tiers, "data-story-tier", function (item) { return state.tierId === item.attr; }, function (item) { return esc(item.name); });
      document.getElementById("story-term").innerHTML = renderButtons(terms, "data-story-months", function (item) { return state.months === item.months; }, function (item) { return termLabel[item.months]; });
      document.getElementById("story-pace").innerHTML = renderButtons(paces, "data-story-reels", function (item) { return state.reels === item.reels; }, function (item) { return String(item.reels); });
      tier = tierById(state.tierId);
      q = quoteTier(tier, state.reels, state.months);
      unlocked = numsAtLevel(state.tierId, state.reels, state.months, "included").length;
      document.getElementById("story-plan-summary").textContent = tier.name + " · " + state.reels + " " + plural(state.reels, "reel", "reels") + "/mo · " + state.months + " " + plural(state.months, "month", "months") + ": " + money(q.perReelInr, true) + "/reel (" + money(q.monthlyInr, false) + "/mo) · " + unlocked + " of 10 slides unlocked";
    }

    function renderStory() {
      var html = "";
      var filters;
      var i;
      var slideRow;
      var st;
      var missedCount = 0;
      var tier;
      var show;
      for (i = 0; i < cfg.storySlides.length; i++) {
        if (statusFor(cfg.storySlides[i], ctxNow()).level === "missed") missedCount += 1;
      }
      if (state.filter === "missed" && missedCount === 0) {
        tier = tierById(state.tierId);
        html = '<div class="reels-tie-box"><p class="text-base text-slate-800">All 10 slides are unlocked in your current choice (' + esc(tier.name) + ", " + state.reels + " " + plural(state.reels, "reel", "reels") + "/month, " + state.months + " " + plural(state.months, "month", "months") + ').</p><p class="mt-3"><button type="button" class="reels-fix" data-show-all="1">Show all 10 slides</button></p></div>';
      }
      for (i = 0; i < cfg.storySlides.length && html.indexOf("data-show-all") === -1; i++) {
        slideRow = cfg.storySlides[i];
        st = statusFor(slideRow, ctxNow());
        if (state.filter === "missed") show = st.level === "missed";
        else if (state.filter === "all") show = true;
        else show = slideRow.filter === state.filter;
        if (show) html += slideCard(slideRow, i, true);
      }
      document.getElementById("story-grid").innerHTML = html;
      filters = document.querySelectorAll("#story-filters [data-filter]");
      for (i = 0; i < filters.length; i++) {
        filters[i].setAttribute("aria-pressed", filters[i].getAttribute("data-filter") === state.filter ? "true" : "false");
        if (filters[i].getAttribute("data-filter") === "missed") filters[i].textContent = "Missed on current choice (" + missedCount + ")";
      }
    }

    function renderBand(id, slides, offset, withTie) {
      var html = "";
      var i;
      for (i = 0; i < slides.length; i++) html += slideCard(slides[i], offset + i, withTie);
      document.getElementById(id).innerHTML = html;
    }

    function renderChoice() {
      var tier = tierById(state.tierId);
      var q = quoteTier(tier, state.reels, state.months);
      var total = state.reels * state.months;
      var got = "";
      var missed = "";
      var missCount = 0;
      var chips = "";
      var i;
      var slideRow;
      var st;
      for (i = 0; i < cfg.storySlides.length; i++) {
        slideRow = cfg.storySlides[i];
        st = statusFor(slideRow, ctxNow());
        if (st.level === "included") got += '<li class="reels-gap"><span class="font-semibold">' + slideRow.num + ".</span> " + esc(st.reason) + "</li>";
        else {
          missCount += 1;
          missed += '<li class="reels-gap"><span class="font-semibold">' + slideRow.num + ".</span> " + esc(st.reason) + actionsHtml(st.actions, "choice") + "</li>";
        }
        chips += '<button type="button" class="reels-chip reels-chip-' + tone(st.level) + '" data-jump-slide="' + slideRow.num + '" aria-label="Go to slide ' + slideRow.num + '">' + slideRow.num + "</button>";
      }
      document.getElementById("choice-kicker").textContent = tier.name + " · " + state.reels + " " + plural(state.reels, "reel", "reels") + "/month · " + state.months + " " + plural(state.months, "month", "months") + " upfront";
      document.getElementById("choice-price").textContent = money(q.perReelInr, true) + " a reel. " + money(q.monthlyInr, false) + " a month. " + money(q.upfrontInr, false) + " upfront for " + total + " " + plural(total, "reel", "reels") + ".";
      document.getElementById("choice-hours").textContent = hourPhrase(includedHours(state.reels)) + " of lecture included each month. Extra video is " + money(cfg.extraVideoHourInr, true) + " an hour.";
      document.getElementById("coverage-bar").innerHTML = chips;
      document.getElementById("choice-got").innerHTML = got;
      document.getElementById("choice-miss").innerHTML = missCount === 0
        ? "<p>Nothing left out. You have the full classroom-to-trust system, half the monthly price locked for a year, and early access as new formats ship.</p>"
        : '<ul class="reels-miss">' + missed + "</ul>";
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
      document.getElementById("roadmap-rate").textContent = "A 12-month commitment combines the 33.3% annual discount with the 25% Founding Partner discount. Reel + cover + caption moves from " + money(tier.basePerReelInr, true) + " to " + money(year, true) + " per reel for the entire year, with early access to each new format as it ships.";
    }

    function pillarsLine() {
      var n = numsAtLevel(state.tierId, state.reels, state.months, "included").length;
      var text = n + " of 10 story slides unlocked";
      if (state.months === 12 && state.tierId === "reel_cover_caption") {
        text += " + early access to Quizzes, YouTube chapters, multi-platform, and email nurture";
      }
      return text;
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
      var box = document.getElementById("checkout-nudge");
      var nowRate;
      var nextRate;
      var save;
      var msg;
      if (!box) return;
      if (state.tierId === "reel_cover_caption" && state.months === 12) {
        box.innerHTML = "";
        return;
      }
      nowRate = quoteTier(tierById(state.tierId), 1, state.months).perReelInr;
      nextRate = quoteTier(tierById("reel_cover_caption"), 1, 12).perReelInr;
      save = nowRate - nextRate;
      if (save > 0) msg = "12 months on Reel + cover + caption is " + money(nextRate, true) + " / reel, which is " + money(save, true) + " less per reel, and it unlocks all 10 story slides plus early access.";
      else msg = "12 months on Reel + cover + caption is " + money(nextRate, true) + " / reel. It unlocks all 10 story slides plus early access to Quizzes, YouTube chapters, multi-platform, and email nurture.";
      box.innerHTML = '<p class="text-base text-slate-800 mb-3">' + esc(msg) + '</p><p><button type="button" class="reels-fix" data-fix="1" data-from="checkout" data-months="12" data-tier="reel_cover_caption">Switch to 12 months, Reel + cover + caption</button></p>';
    }

    function renderCheckout() {
      var rows = summaryRows();
      var html = "";
      var lines = [];
      var i;
      var text;
      var subject;
      for (i = 0; i < rows.length; i++) {
        html += '<div class="reels-kv"><p class="font-semibold text-slate-900">' + esc(rows[i][0]) + "</p><p>" + esc(rows[i][1]) + "</p></div>";
        lines.push(rows[i][0] + ": " + rows[i][1]);
      }
      text = lines.join("\n");
      state.summaryText = text;
      subject = "Spark Reels plan: " + tierById(state.tierId).name + ", " + state.reels + " " + plural(state.reels, "reel", "reels") + ", " + state.months + " " + plural(state.months, "month", "months");
      document.getElementById("checkout-summary").innerHTML = html;
      document.getElementById("whatsapp-choice").href = "https://wa.me/" + cfg.whatsappPhone + "?text=" + encodeURIComponent(text);
      document.getElementById("email-choice").href = "mailto:support@sparktutor.ai?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      renderNudge();
    }

    function render() {
      renderControls();
      renderStoryBar();
      renderPlans();
      renderStory();
      renderBand("how-grid", cfg.craftSlides, cfg.storySlides.length, true);
      renderBand("faq-grid", cfg.faqSlides, cfg.storySlides.length + cfg.craftSlides.length, false);
      renderChoice();
      renderHours();
      renderRoadmap();
      renderCheckout();
      if (!document.getElementById("story-lightbox").hidden) paintLightbox();
    }

    function setReels(n, fromCustom) {
      var error = document.getElementById("reels-error");
      if (!isFinite(n) || Math.floor(n) !== n || n < 1 || n > 90) {
        error.textContent = "Use a whole number from 1 to 90.";
        return;
      }
      error.textContent = "";
      state.reels = n;
      if (!fromCustom) document.getElementById("reels-custom").value = "";
      render();
    }

    function openFold(id) {
      var el = document.getElementById(id);
      if (!el || el.tagName !== "DETAILS") return;
      el.open = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function jumpToSlide(num) {
      var el;
      state.filter = "all";
      render();
      el = document.getElementById("slide-" + num);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function applyFix(btn) {
      var patch = {};
      var fromId = btn.getAttribute("data-from") || "";
      if (btn.hasAttribute("data-months")) {
        patch.months = parseInt(btn.getAttribute("data-months"), 10);
        state.months = patch.months;
      }
      if (btn.hasAttribute("data-reels")) {
        patch.reels = parseInt(btn.getAttribute("data-reels"), 10);
        state.reels = patch.reels;
        document.getElementById("reels-custom").value = "";
        document.getElementById("reels-error").textContent = "";
      }
      if (btn.hasAttribute("data-tier")) {
        patch.tierId = btn.getAttribute("data-tier");
        state.tierId = patch.tierId;
      }
      render();
      flash(patch, fromId);
    }

    function flash(patch, fromId) {
      var nodes = [];
      var token;
      var card;
      var button;
      var i;
      flashToken += 1;
      token = flashToken;
      if (fromId.indexOf("slide-") === 0) {
        card = document.getElementById(fromId);
        if (card) nodes.push(card);
      }
      if (patch.months) {
        button = document.querySelector('#duration-controls [data-months="' + patch.months + '"]');
        if (button) nodes.push(button);
      }
      if (patch.reels) {
        button = document.querySelector('#reels-controls [data-reels="' + patch.reels + '"]');
        if (button) nodes.push(button);
      }
      if (patch.tierId) {
        card = document.querySelector('#plan-grid article[data-tier="' + patch.tierId + '"]');
        if (card) nodes.push(card);
      }
      for (i = 0; i < nodes.length; i++) nodes[i].classList.add("reels-flash");
      if ((fromId === "choice" || fromId === "checkout") && nodes.length) nodes[0].scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(function () {
        var j;
        if (token !== flashToken) return;
        for (j = 0; j < nodes.length; j++) nodes[j].classList.remove("reels-flash");
      }, 1800);
    }

    function paintLightbox() {
      var slideRow = cfg.allSlides[state.lightbox];
      var st = statusFor(slideRow, ctxNow());
      var img = document.getElementById("lightbox-img");
      var status = document.getElementById("lightbox-status");
      img.src = slideRow.image;
      img.alt = slideRow.alt;
      document.getElementById("lightbox-step").textContent = slideRow.num + " / " + pad(cfg.allSlides.length) + " · " + slideRow.group;
      status.hidden = !st.pill;
      status.textContent = st.pill;
      status.className = "reels-status reels-status-" + tone(st.level);
      document.getElementById("lightbox-title").textContent = slideRow.title;
      document.getElementById("lightbox-story").textContent = slideRow.story;
      document.getElementById("lightbox-reason").textContent = st.reason || "";
    }

    function openLightbox(index) {
      var dlg = document.getElementById("story-lightbox");
      if (!cfg.allSlides[index]) return;
      state.lightbox = index;
      paintLightbox();
      dlg.hidden = false;
      dlg.setAttribute("aria-hidden", "false");
      document.getElementById("lightbox-close").focus();
    }

    function closeLightbox() {
      var dlg = document.getElementById("story-lightbox");
      dlg.hidden = true;
      dlg.setAttribute("aria-hidden", "true");
    }

    function stepLightbox(delta) {
      var n = cfg.allSlides.length;
      state.lightbox = (state.lightbox + delta + n) % n;
      paintLightbox();
    }

    function copySummary() {
      var text = state.summaryText || "";
      var btn = document.getElementById("copy-choice");
      var token;
      function show(ok) {
        btn.textContent = ok ? "Copied plan summary" : "Select the summary and copy it";
        window.setTimeout(function () {
          if (token !== copyToken) return;
          btn.textContent = "Copy plan summary";
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
      copyToken += 1;
      token = copyToken;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { show(true); }, function () { show(fallback()); });
      } else show(fallback());
    }

    document.getElementById("reels-custom").addEventListener("input", function (e) {
      var raw = e.target.value;
      if (raw === "") {
        document.getElementById("reels-error").textContent = "";
        return;
      }
      if (!/^\d+$/.test(raw)) {
        document.getElementById("reels-error").textContent = "Use a whole number from 1 to 90.";
        return;
      }
      setReels(parseInt(raw, 10), true);
    });

    document.addEventListener("click", function (e) {
      var btn;
      if (e.target.id === "story-lightbox") { closeLightbox(); return; }
      if (e.target.closest("#lightbox-close")) { closeLightbox(); return; }
      if (e.target.closest("#lightbox-prev")) { stepLightbox(-1); return; }
      if (e.target.closest("#lightbox-next")) { stepLightbox(1); return; }
      if (e.target.closest("#copy-choice")) { copySummary(); return; }
      if (e.target.closest("[data-show-all]")) { state.filter = "all"; render(); return; }
      btn = e.target.closest("[data-fix]");
      if (btn) { applyFix(btn); return; }
      btn = e.target.closest("[data-jump-slide]");
      if (btn) { jumpToSlide(btn.getAttribute("data-jump-slide")); return; }
      btn = e.target.closest("[data-open-slide]");
      if (btn) { openLightbox(parseInt(btn.getAttribute("data-open-slide"), 10)); return; }
      btn = e.target.closest("button[data-choose]");
      if (btn) { state.tierId = btn.getAttribute("data-tier"); render(); flash({ tierId: state.tierId }, ""); return; }
      btn = e.target.closest("[data-open-fold]");
      if (btn) { openFold(btn.getAttribute("data-open-fold")); return; }
      btn = e.target.closest("[data-filter]");
      if (btn) { state.filter = btn.getAttribute("data-filter"); render(); return; }
      btn = e.target.closest("button[data-currency]");
      if (btn) { state.currency = btn.getAttribute("data-currency") === "usd" ? "usd" : "inr"; render(); return; }
      btn = e.target.closest("button[data-story-tier]");
      if (btn) { state.tierId = btn.getAttribute("data-story-tier"); render(); return; }
      btn = e.target.closest("button[data-story-months]");
      if (btn) { state.months = parseInt(btn.getAttribute("data-story-months"), 10); render(); return; }
      btn = e.target.closest("button[data-story-reels]");
      if (btn) { setReels(parseInt(btn.getAttribute("data-story-reels"), 10), false); return; }
      btn = e.target.closest("#reels-controls button[data-reels]");
      if (btn) { setReels(parseInt(btn.getAttribute("data-reels"), 10), false); return; }
      btn = e.target.closest("#duration-controls button[data-months]");
      if (btn) { state.months = parseInt(btn.getAttribute("data-months"), 10); render(); return; }
      btn = e.target.closest("#story-grid .reels-slide, #how-grid .reels-slide, #faq-grid .reels-slide");
      if (btn && !e.target.closest("button, a")) openLightbox(parseInt(btn.getAttribute("data-index"), 10));
    });

    document.addEventListener("keydown", function (e) {
      var dlg = document.getElementById("story-lightbox");
      if (dlg.hidden) return;
      if (e.key === "Escape") { closeLightbox(); e.preventDefault(); }
      else if (e.key === "ArrowRight") { stepLightbox(1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stepLightbox(-1); e.preventDefault(); }
    });

    render();
  }

  root.SparkReelsPage = { mount: mount };
})(typeof window !== "undefined" ? window : globalThis);
