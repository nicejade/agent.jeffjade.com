# CLAUDE.md

## Project scope

`agent.jeffjade.com` is a Chinese-language documentation site focused on AI agents and Claude Code. The stack is Astro, Starlight, Svelte, Tailwind CSS, and pnpm.

Project goal: produce high-quality tutorial docs so readers understand mechanisms, complete real tasks, and recognize tool limits.

## Repository map

1. `src/content/docs/claude-code/`: Claude Code tutorial chapters.
2. `src/pages/claude-code/index.astro`: Claude Code guide landing at `/claude-code/`.
3. `src/pages/index.astro`: Site home at `/`.
4. `src/config/claude-code-sidebar.ts`: Claude Code guide sidebar order.
5. `astro.config.mjs`: Starlight config, redirects, site metadata, global sidebar.
6. `src/styles/global.css`: Global styles.
7. `README.md`: Project overview and commands.
8. `content.md`: Claude Code series chapter plan and topic intent.

Read relevant local files before writing. Prefer citing existing file paths; avoid copying large blocks of context.

## Common commands

Use pnpm.

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
pnpm preview
```

When changing docs only, run `pnpm build` when practical. When changing config, components, or types, run `pnpm check` and `pnpm build`.

## Content contract

Default body text is Simplified Chinese.

A solid tutorial must pass three checks:

1. Facts exist: conclusions trace to local code, official docs, reproducible commands, or are clearly labeled as inference.
2. Logic closes: each section has a question, answer, mechanism, and boundary.
3. Experience is falsifiable: readers can run commands, inspect files, compare behavior, or recognize failure symptoms.

Do not treat slogans as conclusions. Do not treat tool marketing as fact. When evidence is thin, say so directly.

## Source discipline

For current products, versions, APIs, pricing, limits, install steps, or behavior changes, search the web first. Prefer official docs and primary sources.

When using external material:

1. Keep quotations short.
2. Restate mechanisms in your own words.
3. Separate verified facts from inference.
4. Add links in docs when traceability matters.

## Tutorial methods

Internalize the following as writing habits.

### Socratic questioning

Before each chapter, identify:

1. The specific problem the reader must solve.
2. Which hidden premise could invalidate the answer.
3. Which concept is easiest to equivocate.
4. Which evidence would change the conclusion.
5. Which boundary tells the reader to stop using the current approach.

Use questions to expose structure. Do not pad length with rhetorical question chains.

### Feynman technique

For key concepts:

1. Explain in plain language first.
2. Give a concrete example before abstract summary.
3. Define terms on first use.
4. Replace vague adjectives with observable behavior.
5. If you cannot explain simply, return to sources and compress the concept further.

Readers should be able to paraphrase meaning without memorizing exact wording.

### Simon learning model

Treat learning as chunking, goal backtracking, and feedback correction.

1. Split the topic into small dependent chunks.
2. Backtrack required concepts from the task the reader wants to finish.
3. Move from minimal examples to full workflows.
4. Compress repeated patterns into reusable mental models.
5. Provide feedback loops: command output, file diffs, screenshots, tests, checklists.

## Article structure

Unless an existing chapter already has a stronger local pattern, use:

1. Frontmatter: `title`, `description`, `sidebar.order`.
2. Opening scene: one concrete situation, one reader pain point.
3. Core concepts: plain explanation first, then mechanism.
4. Minimal path: precise steps or commands.
5. Why it works: variables, causality, constraints.
6. Failure modes: symptoms, likely causes, next checks.
7. Decision boundaries: when to use and when to misuse.
8. Practice prompts or checklists as needed.
9. In a series, link to the next related chapter.

## Tutorial depth review

When reviewing or revising docs, check three dimensions together:

1. Learning progression: give readers one small runnable success path before advanced variants, command catalogs, provider matrices, or architecture internals. For long or dense chapters, add a route map near the top and label optional or deep sections.
2. Narrative clarity: every table, command block, and prompt example needs a setup sentence explaining when to use it and an expected signal or output. Prefer one running scenario across a chapter over many unrelated snippets. Define mixed English terms on first use.
3. Content rigor: volatile claims about products, model names, defaults, limits, permissions, pricing, storage paths, and security behavior need current official sources or local code evidence. Separate verified facts, recommendations, and inference. If not rechecked, say readers should verify against official docs before publishing.

Also mark commands that can discard state, alter credentials, push, deploy, or change permissions as risky, and pair them with snapshot, confirmation, or rollback guidance.

## Writing style

1. Direct, specific, calm.
2. Start from examples, commands, files, observable behavior.
3. Keep paragraphs short.
4. Use tables for tool comparison, tradeoffs, permissions, and flows.
5. Put commands and config in code blocks.
6. Avoid empty praise, buzzword stacking, and emotional rallying.
7. Explain mechanisms; skip decorative metaphors when mechanism suffices.
8. Do not use em dashes.
9. Do not use binary contrast sentences that negate the first clause then pivot.
10. Do not use ellipses.
11. Do not use parenthetical asides.

## Reader levels

One article should serve three levels in one flow:

1. New readers: complete basic tasks without guessing steps.
2. Experienced developers: understand tradeoffs and debug errors.
3. Advanced readers: see boundaries, incentives, and system design impact.

Do not split into parallel reader tracks. Layer depth into a single reading path.

## Quality bar

Before finishing a tutorial, check:

1. Title matches actual content.
2. Description states concrete benefit.
3. Important conclusions have sources, local evidence, or falsifiable examples.
4. Each section answers one real question.
5. Commands match the current repo.
6. Examples use real filenames, routes, and Claude Code workflows.
7. At least one limit or misuse case is stated.
8. End with a next action, not vague reflection.

## Local conventions

1. Existing docs live under `/claude-code/` as Starlight Markdown.
2. Guide landing lives at `/claude-code/` as a custom Astro page.
3. Sidebar order matches `src/config/claude-code-sidebar.ts`.
4. Chinese body text uses Chinese punctuation.
5. Keep existing routes and redirects unless the task touches navigation.
6. When adding a chapter, update the sidebar and prev or next links.
7. When editing one chapter, do not rewrite unrelated chapters.

## Workflow

For documentation tasks:

1. Read the target chapter and adjacent chapters.
2. Read `content.md` when the task affects chapter intent.
3. Search official sources when the topic may be stale.
4. Draft an outline from questions and failure modes.
5. Write the body.
6. Run the appropriate validation commands.
7. Summarize changes and verification results.

Keep `CLAUDE.md` short, stable, and general. Put task-specific research in the target doc or separate notes.
