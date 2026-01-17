# Editing Guidelines: "Who is it for?" Page

## Core Principles

### 1. Problem-Focused, Not Feature-Focused
- **Do NOT** list features or capabilities of Spark
- **DO** identify 3-5 daily problems each teacher type faces
- Each problem should feel relatable and specific to that persona's reality
- Problems should be the pain points they experience regularly, not abstract challenges

### 2. Conversational Second-Person Tone
- Write directly to the reader: "You're teaching..." not "Teachers teach..."
- Use conversational language that feels like you're talking to them
- Avoid formal, academic, or marketing-speak
- Make it feel personal and empathetic

### 3. Solution Clarity
- After describing each problem, clearly explain how Spark solves it
- Solutions should directly address the stated problem
- Keep solutions practical and concrete - avoid vague promises
- Solutions should be in the same conversational tone

## Content Structure

### For Each Teacher Type Section

**Header Section:**
- Icon (Material Symbols Rounded)
- Title (Teacher type name)
- Opening paragraph: Set the scene in 2-3 sentences
  - Who they are
  - What their teaching context is
  - What daily struggle they're facing

**Problem-Solution Format (3-5 per section):**
Each problem follows this structure:

```
<div class="border-l-4 border-red-200 pl-6">
    <h3>Problem Title (Specific, relatable)</h3>
    <p>Problem description (2-3 sentences, second-person, conversational)</p>
    <div class="bg-emerald-50...">
        <p><strong>How Spark fixes this:</strong></p>
        <p>Solution (2-3 sentences, practical and direct)</p>
    </div>
</div>
```

**Problem Titles Should:**
- Be specific and concrete (not "Time management issues")
- Use "You" statements when possible
- Capture the frustration they feel
- Examples: "You're spending more time editing than teaching" ✅
- Not: "Video editing challenges" ❌

## Writing Style Guidelines

### Tone
- **Conversational**: Write like you're explaining to a friend
- **Empathetic**: Show you understand their pain
- **Direct**: Get to the point without fluff
- **Confident**: Solutions should feel achievable, not theoretical

### Language
- Use contractions naturally ("you're", "don't", "can't")
- Avoid jargon unless it's industry-specific and necessary
- Use specific examples when helpful (grade levels, subject names, exam types)
- Keep sentences clear and relatively short

### Examples of Good Problem Descriptions:
✅ "Every weekend, you're manually splitting recordings, writing timestamps, and creating study notes. You started teaching because you love helping students, but now you're drowning in video editing work. Sound familiar?"

❌ "Teachers face challenges with video editing and content management."

### Examples of Good Solutions:
✅ "Upload your Zoom recording (or connect it automatically), and Spark turns it into a structured course with chapters, study notes, and quizzes - all without you touching a single video editor. Your weekends are yours again."

❌ "Spark automates the course creation process."

## Design & Technical Guidelines

### Table of Contents (ToC)
- Always keep ToC in sync with actual sections on the page
- Order must match the order of sections below
- Each ToC item needs:
  - Correct `href="#section-id"`
  - Matching `data-section="section-id"`
  - Appropriate Material Symbol icon
  - Short descriptive subtitle (1 line)

### Section IDs
- Use kebab-case: `online-teachers-trainers`, `competitive-exam-coaches`
- Keep IDs consistent with ToC `data-section` attributes
- Use `scroll-mt-24` class for proper scroll offset

### Styling Classes
- Problem boxes: `border-l-4 border-red-200 pl-6`
- Solution boxes: `bg-emerald-50 border border-emerald-100 rounded-lg p-4`
- Section containers: `bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm`
- Keep existing color scheme (brand-600 for icons, slate colors for text)

### Grid Layout
- ToC uses: `grid sm:grid-cols-2 lg:grid-cols-3` (for 6 items)
- If adding/removing sections, adjust grid columns accordingly

## Quality Checklist

Before considering edits complete, verify:

- [ ] Each section has 3-5 problems (no more, no less)
- [ ] All problems are written in second-person ("You...")
- [ ] Problem descriptions are conversational and specific
- [ ] Each problem has a clear solution in emerald box
- [ ] Solutions directly address the stated problem
- [ ] No feature lists or capabilities lists
- [ ] ToC matches section order exactly
- [ ] All section IDs are unique and match ToC links
- [ ] Icons are appropriate for each teacher type
- [ ] Opening paragraph sets scene without being generic

## Adding New Teacher Types

If adding a new teacher type:

1. **Research the persona first:**
   - What's their daily routine?
   - What are their biggest pain points?
   - What's their teaching context (students, schedule, tools)?

2. **Identify 3-5 specific problems:**
   - Problems should be daily frustrations, not abstract challenges
   - Each should be relatable to someone in that role
   - Problems should be distinct from each other

3. **Add to ToC:**
   - Insert in the correct position based on desired order
   - Choose appropriate icon (Material Symbols Rounded)
   - Write short descriptive subtitle

4. **Create section:**
   - Use same structure as existing sections
   - Follow problem-solution format exactly
   - Keep opening paragraph to 2-3 sentences

5. **Verify:**
   - Section ID matches ToC
   - All links work
   - Styling is consistent
   - Content follows tone guidelines

## Common Mistakes to Avoid

❌ **Feature focus**: "Spark generates quizzes" → ✅ "You spend hours writing questions"

❌ **Third person**: "Teachers face challenges" → ✅ "You're struggling with..."

❌ **Vague problems**: "Time management issues" → ✅ "Your entire weekend disappears into video editing"

❌ **Generic solutions**: "Spark helps automate work" → ✅ "Spark turns your recordings into structured courses automatically - no video editor needed"

❌ **Too many problems**: Keep it to 3-5. If you have more, prioritize the most painful/frequent ones.

❌ **Academic language**: Avoid formal, corporate, or overly professional tone

## Final Note

Remember: The goal is to make each teacher type feel **heard and understood**. They should read their section and think "Yes, that's exactly my problem!" - not "This could apply to anyone." Be specific, be empathetic, be conversational.

