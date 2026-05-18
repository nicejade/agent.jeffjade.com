<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Bot,
    Boxes,
    BrainCircuit,
    Check,
    Clipboard,
    Code2,
    Cpu,
    ExternalLink,
    History,
    Network,
    RotateCcw,
    ShieldCheck,
    Sparkles,
    TerminalSquare,
    UserRound,
    Workflow,
  } from '@lucide/svelte';

  import {
    agentDomains,
    agentDomainsBySlug,
    type AgentDomain,
    type AgentDomainIcon,
    type DomainStatus,
  } from '../data/agent-domains';

  type DomainSession = {
    prompt: string;
    lastVisitedAt: number;
    dirty: boolean;
  };

  const STORAGE_KEY = 'agent-lab.sessions.v1';
  const SELECTED_KEY = 'agent-lab.selected.v1';

  const iconMap: Record<AgentDomainIcon, typeof Code2> = {
    Code2,
    Network,
    UserRound,
    TerminalSquare,
    Boxes,
    Workflow,
    Cpu,
    Bot,
  };

  const statusLabel: Record<DomainStatus, string> = {
    stable: '稳定',
    beta: 'Beta',
    preview: '预览',
  };

  function createInitialSessions(): Record<string, DomainSession> {
    return Object.fromEntries(
      agentDomains.map((domain) => [
        domain.slug,
        { prompt: domain.defaultPrompt, lastVisitedAt: 0, dirty: false },
      ]),
    );
  }

  /**
   * Per-domain isolated state. Switching tabs never touches another domain's
   * draft, scroll position, or copy state.
   */
  let sessions = $state<Record<string, DomainSession>>(createInitialSessions());
  let selectedSlug = $state<string>(agentDomains[0].slug);
  let copiedSlug = $state<string | null>(null);
  let hydrated = $state(false);

  let tablistEl: HTMLDivElement | undefined = $state();

  let currentDomain = $derived<AgentDomain>(
    agentDomainsBySlug[selectedSlug] ?? agentDomains[0],
  );
  let currentSession = $derived<DomainSession>(sessions[currentDomain.slug]);
  let currentIcon = $derived(iconMap[currentDomain.iconName] ?? Bot);
  let isCopied = $derived(copiedSlug === currentDomain.slug);

  onMount(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Partial<DomainSession>>;
        for (const domain of agentDomains) {
          const stored = parsed?.[domain.slug];
          if (stored && typeof stored.prompt === 'string') {
            sessions[domain.slug] = {
              prompt: stored.prompt,
              lastVisitedAt: Number(stored.lastVisitedAt) || 0,
              dirty: Boolean(stored.dirty),
            };
          }
        }
      }
      const storedSlug = localStorage.getItem(SELECTED_KEY);
      if (storedSlug && agentDomainsBySlug[storedSlug]) {
        selectedSlug = storedSlug;
      }
    } catch {
      // localStorage may be disabled (private mode, embedded contexts).
      // Default sessions remain functional.
    } finally {
      sessions[selectedSlug].lastVisitedAt = Date.now();
      hydrated = true;
    }
  });

  $effect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      localStorage.setItem(SELECTED_KEY, selectedSlug);
    } catch {
      // Ignore quota / privacy errors silently.
    }
  });

  function selectDomain(slug: string) {
    if (!agentDomainsBySlug[slug] || slug === selectedSlug) return;
    selectedSlug = slug;
    copiedSlug = null;
    sessions[slug].lastVisitedAt = Date.now();
  }

  function shiftDomain(offset: number) {
    const index = agentDomains.findIndex((d) => d.slug === selectedSlug);
    if (index < 0) return;
    const next = (index + offset + agentDomains.length) % agentDomains.length;
    selectDomain(agentDomains[next].slug);
  }

  function onTabsKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        shiftDomain(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        shiftDomain(-1);
        break;
      case 'Home':
        event.preventDefault();
        selectDomain(agentDomains[0].slug);
        break;
      case 'End':
        event.preventDefault();
        selectDomain(agentDomains[agentDomains.length - 1].slug);
        break;
    }
  }

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(currentDomain.command);
      copiedSlug = currentDomain.slug;
      window.setTimeout(() => {
        if (copiedSlug === currentDomain.slug) {
          copiedSlug = null;
        }
      }, 1400);
    } catch {
      copiedSlug = null;
    }
  }

  function resetCurrentDraft() {
    const fresh = currentDomain.defaultPrompt;
    sessions[currentDomain.slug] = {
      prompt: fresh,
      lastVisitedAt: Date.now(),
      dirty: false,
    };
  }

  function handlePromptInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    sessions[currentDomain.slug] = {
      prompt: value,
      lastVisitedAt: Date.now(),
      dirty: value.trim() !== currentDomain.defaultPrompt.trim(),
    };
  }

  function formatRelativeTime(timestamp: number): string {
    if (!timestamp) return '未探索';
    const diff = Date.now() - timestamp;
    if (diff < 60_000) return '刚刚';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
    return `${Math.floor(diff / 86_400_000)} 天前`;
  }
</script>

<section class="lab-shell" aria-label="Agent 探索实验室">
  <header class="lab-top">
    <div class="live">
      <span aria-hidden="true"></span>
      <p>Agent Routing Lab</p>
    </div>
    <div class="lab-meta">
      <span class="meta-pill" title="该领域被探索的次数轨迹">
        <History size={14} strokeWidth={2.2} />
        {formatRelativeTime(currentSession?.lastVisitedAt ?? 0)}
      </span>
      <button
        class="icon-button"
        type="button"
        title="重置当前领域的草稿"
        aria-label="重置当前领域的草稿"
        onclick={resetCurrentDraft}
      >
        <RotateCcw size={16} strokeWidth={2.2} />
      </button>
    </div>
  </header>

  <div
    class="segmented"
    role="tablist"
    aria-label="选择 Agent 领域"
    tabindex="0"
    onkeydown={onTabsKeydown}
    bind:this={tablistEl}
  >
    {#each agentDomains as item (item.slug)}
      {@const Icon = iconMap[item.iconName] ?? Bot}
      {@const session = sessions[item.slug]}
      {@const active = item.slug === selectedSlug}
      <button
        type="button"
        role="tab"
        class="tab"
        class:active
        aria-selected={active}
        aria-controls="agent-domain-panel"
        data-status={item.status}
        tabindex={active ? 0 : -1}
        onclick={() => selectDomain(item.slug)}
      >
        <Icon size={16} strokeWidth={2.2} />
        <span class="tab-label">{item.label}</span>
        <span class="tab-status" aria-hidden="true">{statusLabel[item.status]}</span>
        {#if session?.dirty}
          <span class="dirty-dot" aria-label="存在未提交的草稿"></span>
        {/if}
      </button>
    {/each}
  </div>

  <div
    id="agent-domain-panel"
    class="domain-panel"
    role="tabpanel"
    aria-labelledby={`tab-${currentDomain.slug}`}
  >
    <div class="prompt-box">
      <div class="prompt-head">
        <label for={`agent-goal-${currentDomain.slug}`}>任务目标 · {currentDomain.label}</label>
        <span class="prompt-hint">独立草稿，切换领域不会丢失</span>
      </div>
      <textarea
        id={`agent-goal-${currentDomain.slug}`}
        value={currentSession?.prompt ?? ''}
        oninput={handlePromptInput}
        rows="3"
        placeholder={currentDomain.defaultPrompt}
      ></textarea>
    </div>

    <article class="route-card">
      <div class="route-head">
        <div class="route-icon" aria-hidden="true">
          <svelte:component this={currentIcon} size={20} strokeWidth={2.2} />
        </div>
        <div>
          <p class="route-label">{currentDomain.audience}</p>
          <h2>{currentDomain.goal}</h2>
        </div>
      </div>
      <p class="route-summary">{currentDomain.summary}</p>

      <div class="command-row">
        <TerminalSquare size={18} strokeWidth={2.2} />
        <code>{currentDomain.command}</code>
        <button
          type="button"
          title="复制命令"
          aria-label="复制命令"
          onclick={copyCommand}
        >
          {#if isCopied}
            <Check size={16} strokeWidth={2.4} />
          {:else}
            <Clipboard size={16} strokeWidth={2.2} />
          {/if}
        </button>
      </div>

      {#if currentDomain.href || currentDomain.externalHref}
        <div class="route-links">
          {#if currentDomain.href}
            <a class="route-link" href={currentDomain.href}>
              查看路线
            </a>
          {/if}
          {#if currentDomain.externalHref}
            <a
              class="route-link ghost"
              href={currentDomain.externalHref}
              target="_blank"
              rel="noopener"
            >
              官方文档
              <ExternalLink size={13} strokeWidth={2.2} />
            </a>
          {/if}
        </div>
      {/if}
    </article>

    <div class="insight-grid">
      <div class="insight">
        <div class="insight-title">
          <Sparkles size={16} strokeWidth={2.2} />
          <span>产出形态</span>
        </div>
        <ul>
          {#each currentDomain.outputs as output}
            <li>{output}</li>
          {/each}
        </ul>
      </div>

      <div class="insight">
        <div class="insight-title">
          <ShieldCheck size={16} strokeWidth={2.2} />
          <span>边界设计</span>
        </div>
        <ul>
          {#each currentDomain.safeguards as item}
            <li>{item}</li>
          {/each}
        </ul>
      </div>
    </div>

    <div class="score-panel" aria-label="路线评分">
      {#each currentDomain.scores as score}
        <div class="score-row">
          <span>{score.label}</span>
          <div class="meter" aria-hidden="true">
            <i style={`width: ${score.value}%`}></i>
          </div>
          <b>{score.value}</b>
        </div>
      {/each}
    </div>
  </div>

  <div class="ambient-node node-a" aria-hidden="true"><BrainCircuit size={18} /></div>
  <div class="ambient-node node-b" aria-hidden="true"><Network size={18} /></div>
</section>

<style>
  .lab-shell {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0.85rem;
    padding: 0.85rem;
    border: 1px solid rgba(17, 17, 20, 0.1);
    border-radius: 8px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.66)),
      linear-gradient(135deg, rgba(0, 113, 227, 0.1), transparent 38%, rgba(20, 184, 166, 0.1));
    box-shadow: 0 28px 90px rgba(17, 17, 20, 0.14);
    backdrop-filter: blur(22px);
  }

  .lab-top,
  .live,
  .lab-meta,
  .command-row,
  .insight-title,
  .score-row {
    display: flex;
    align-items: center;
  }

  .lab-top {
    justify-content: space-between;
    gap: 0.8rem;
  }

  .live {
    gap: 0.52rem;
    color: rgba(17, 17, 20, 0.66);
    font-size: 0.78rem;
    font-weight: 680;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .live p {
    margin: 0;
  }

  .live span {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #14b8a6;
    box-shadow: 0 0 0 5px rgba(20, 184, 166, 0.12);
  }

  .lab-meta {
    gap: 0.5rem;
  }

  .meta-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.32rem;
    padding: 0.28rem 0.6rem;
    border: 1px solid rgba(17, 17, 20, 0.08);
    border-radius: 999px;
    color: rgba(17, 17, 20, 0.62);
    background: rgba(255, 255, 255, 0.66);
    font-size: 0.74rem;
    font-weight: 620;
  }

  button {
    font: inherit;
  }

  .icon-button {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border: 1px solid rgba(17, 17, 20, 0.1);
    border-radius: 8px;
    color: rgba(17, 17, 20, 0.75);
    background: rgba(255, 255, 255, 0.66);
    cursor: pointer;
    transition: transform 0.18s ease, background 0.18s ease;
  }

  .icon-button:hover {
    background: rgba(255, 255, 255, 0.92);
    transform: translateY(-1px);
  }

  .segmented {
    display: flex;
    gap: 0.3rem;
    padding: 0.28rem;
    border: 1px solid rgba(17, 17, 20, 0.08);
    border-radius: 8px;
    background: rgba(17, 17, 20, 0.045);
    overflow-x: auto;
    scrollbar-width: none;
    scroll-snap-type: x proximity;
  }

  .segmented::-webkit-scrollbar {
    display: none;
  }

  .segmented:focus-visible {
    outline: 2px solid rgba(0, 113, 227, 0.42);
    outline-offset: 2px;
  }

  .tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.42rem;
    flex: 0 0 auto;
    min-height: 38px;
    padding: 0 0.8rem;
    border: 0;
    border-radius: 7px;
    color: rgba(17, 17, 20, 0.58);
    background: transparent;
    cursor: pointer;
    font-size: 0.86rem;
    font-weight: 650;
    scroll-snap-align: start;
    transition: color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  }

  .tab-label {
    white-space: nowrap;
  }

  .tab-status {
    padding: 0.08rem 0.42rem;
    border-radius: 999px;
    color: rgba(17, 17, 20, 0.55);
    background: rgba(17, 17, 20, 0.07);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .tab[data-status='beta'] .tab-status {
    color: #b25e00;
    background: rgba(246, 195, 67, 0.22);
  }

  .tab[data-status='preview'] .tab-status {
    color: #8a3ca8;
    background: rgba(168, 85, 247, 0.16);
  }

  .tab.active {
    color: #111114;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 8px 22px rgba(17, 17, 20, 0.08);
  }

  .tab.active .tab-status {
    background: rgba(17, 17, 20, 0.06);
  }

  .dirty-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #0071e3;
    box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.18);
  }

  .domain-panel {
    display: grid;
    gap: 0.85rem;
  }

  .prompt-box {
    display: grid;
    gap: 0.5rem;
    padding: 0.78rem;
    border: 1px solid rgba(17, 17, 20, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.64);
  }

  .prompt-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .prompt-box label {
    color: rgba(17, 17, 20, 0.62);
    font-size: 0.78rem;
    font-weight: 680;
  }

  .prompt-hint {
    color: rgba(17, 17, 20, 0.5);
    font-size: 0.72rem;
    font-weight: 580;
  }

  .prompt-box textarea {
    width: 100%;
    min-height: 84px;
    resize: vertical;
    border: 0;
    outline: 0;
    color: #111114;
    background: transparent;
    font-size: 0.98rem;
    line-height: 1.55;
  }

  .route-card {
    display: grid;
    gap: 1rem;
    padding: 1.05rem;
    border: 1px solid rgba(17, 17, 20, 0.08);
    border-radius: 8px;
    background:
      linear-gradient(135deg, rgba(17, 17, 20, 0.94), rgba(28, 43, 58, 0.92)),
      linear-gradient(90deg, rgba(0, 113, 227, 0.25), transparent);
    color: #fff;
  }

  .route-head {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .route-icon {
    display: grid;
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.92);
    background: rgba(255, 255, 255, 0.06);
  }

  .route-label {
    margin: 0 0 0.32rem;
    color: rgba(255, 255, 255, 0.62);
    font-size: 0.78rem;
    font-weight: 680;
  }

  .route-card h2 {
    margin: 0;
    color: #fff;
    font-size: 1.34rem;
    letter-spacing: 0;
  }

  .route-summary {
    margin: 0;
    color: rgba(255, 255, 255, 0.72);
    line-height: 1.62;
  }

  .command-row {
    gap: 0.55rem;
    min-height: 46px;
    padding: 0.58rem;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.08);
  }

  .command-row code {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.86);
    font-family: var(--font-mono, monospace);
    font-size: 0.78rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .command-row button {
    display: grid;
    width: 30px;
    height: 30px;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 7px;
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition: background 0.18s ease;
  }

  .command-row button:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  .route-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .route-link {
    display: inline-flex;
    align-items: center;
    gap: 0.32rem;
    padding: 0.45rem 0.78rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 7px;
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
    font-size: 0.82rem;
    font-weight: 620;
    text-decoration: none;
    transition: background 0.18s ease, transform 0.18s ease;
  }

  .route-link:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: translateY(-1px);
  }

  .route-link.ghost {
    color: rgba(255, 255, 255, 0.78);
    background: transparent;
  }

  .insight-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .insight {
    padding: 0.9rem;
    border: 1px solid rgba(17, 17, 20, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.64);
  }

  .insight-title {
    gap: 0.45rem;
    color: rgba(17, 17, 20, 0.82);
    font-size: 0.86rem;
    font-weight: 700;
  }

  .insight ul {
    display: grid;
    gap: 0.42rem;
    margin: 0.7rem 0 0;
    padding: 0;
    list-style: none;
  }

  .insight li {
    color: rgba(17, 17, 20, 0.64);
    font-size: 0.88rem;
    line-height: 1.45;
  }

  .insight li::before {
    color: #14b8a6;
    content: '• ';
  }

  .score-panel {
    display: grid;
    gap: 0.62rem;
    padding: 0.88rem;
    border: 1px solid rgba(17, 17, 20, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.64);
  }

  .score-row {
    gap: 0.7rem;
  }

  .score-row span {
    width: 4.8rem;
    color: rgba(17, 17, 20, 0.62);
    font-size: 0.8rem;
    font-weight: 650;
  }

  .score-row b {
    width: 2rem;
    color: rgba(17, 17, 20, 0.74);
    font-size: 0.82rem;
    text-align: right;
  }

  .meter {
    position: relative;
    height: 8px;
    flex: 1;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(17, 17, 20, 0.08);
  }

  .meter i {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: inherit;
    background: linear-gradient(90deg, #0071e3, #14b8a6);
    transition: width 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .ambient-node {
    position: absolute;
    display: grid;
    width: 36px;
    height: 36px;
    place-items: center;
    border: 1px solid rgba(17, 17, 20, 0.08);
    border-radius: 8px;
    color: rgba(0, 113, 227, 0.78);
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0 14px 40px rgba(17, 17, 20, 0.12);
  }

  .node-a {
    top: -18px;
    right: 9%;
  }

  .node-b {
    left: -18px;
    bottom: 18%;
  }

  @media (max-width: 640px) {
    .insight-grid {
      grid-template-columns: 1fr;
    }

    .command-row code {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .tab-status {
      display: none;
    }
  }

  @media (prefers-color-scheme: dark) {
    .lab-shell {
      border-color: rgba(255, 255, 255, 0.12);
      background:
        linear-gradient(180deg, rgba(28, 29, 33, 0.84), rgba(20, 21, 25, 0.7)),
        linear-gradient(135deg, rgba(0, 113, 227, 0.14), transparent 38%, rgba(20, 184, 166, 0.12));
    }

    .live,
    .tab,
    .prompt-box label,
    .prompt-hint,
    .meta-pill,
    .score-row span,
    .score-row b,
    .insight li {
      color: rgba(245, 245, 247, 0.66);
    }

    .segmented,
    .prompt-box,
    .insight,
    .score-panel,
    .icon-button,
    .meta-pill {
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.06);
    }

    .tab.active {
      color: #fff;
      background: rgba(255, 255, 255, 0.12);
    }

    .tab-status {
      color: rgba(245, 245, 247, 0.66);
      background: rgba(255, 255, 255, 0.08);
    }

    .tab[data-status='beta'] .tab-status {
      color: #ffd089;
      background: rgba(246, 195, 67, 0.22);
    }

    .tab[data-status='preview'] .tab-status {
      color: #d5b1ff;
      background: rgba(168, 85, 247, 0.22);
    }

    .prompt-box textarea,
    .insight-title {
      color: #f5f5f7;
    }

    .ambient-node {
      border-color: rgba(255, 255, 255, 0.12);
      background: rgba(28, 29, 33, 0.82);
    }
  }
</style>
