<script>
  import SocialIcon from './footer/SocialIcon.svelte';

  const socialLinks = [
    { href: 'https://github.com/nicejade', icon: 'github', label: 'Github' },
    { href: 'https://x.com/MarshalXuan', icon: 'x', label: 'X | Twitter' },
    { href: 'https://www.facebook.com/nice.jade.yang/', icon: 'facebook', label: 'Facebook | 脸书' },
    { href: 'https://www.threads.com/@turingmind', icon: 'threads', label: 'Threads' },
    { href: 'https://www.youtube.com/@MarshalXuan', icon: 'youtube', label: 'YouTube | 油管' },
    { href: 'https://space.bilibili.com/690989854', icon: 'bilibili', label: 'Bilibili | 哔哩哔哩' },
    { href: 'https://mastodon.social/@nicejade', icon: 'mastodon', label: 'Mastodon | 长毛象' },
    { href: 'https://www.jeffjade.com/', icon: 'blogger', label: 'Blog | 博客' },
  ];

  const footerInfoArr = [
    {
      title: '开源项目',
      branch: [
        { title: '生财有迹', url: 'https://github.com/nicejade/wealth-tracker' },
        { title: '个人主页', url: 'https://github.com/nicejade/homepage' },
        { title: '倾城之链', url: 'https://github.com/nicejade/nicelinks-vue-client' },
        { title: '曼妙句子', url: 'https://github.com/nicejade/read.lovejade.cn' },
        { title: '人生已过', url: 'https://github.com/nicejade/life-spent' },
      ]
    },
    {
      title: '友情链接',
      branch: [
        { title: '逍遥自在轩', url: 'https://www.niceshare.site' },
        { title: '慧悟万象阁', url: 'https://meta.niceshare.site/zh' },
        { title: '晚晴幽草轩', url: 'https://www.jeffjade.com/' },
        { title: '玉桃文飨轩', url: 'https://share.lovejade.cn/' },
        { title: '智析单词书', url: 'https://word.lovejade.cn/' },
      ]
    }
  ];

  const currentYear = new Date().getFullYear();
</script>

<footer class="custom-footer w-full flex flex-col justify-center items-center mt-16! not-prose not-content" aria-label="网站页脚">
  <div class="rounded-[2rem] w-full mx-auto border border-white/[0.08] bg-white/[0.02] backdrop-blur-md [:root[data-theme='light']_&]:bg-black/[0.01] [:root[data-theme='light']_&]:border-black/[0.04]">
    <div class="px-6 sm:px-10! py-8">
      <div class="flex flex-col lg:flex-row! gap-12 lg:gap-16!">
        <!-- Brand & Social -->
        <div class="flex flex-col items-start gap-0 w-full lg:w-1/3!">
          <div class="footer-brand flex items-center gap-4 select-none pb-0! mb-0!">
            <img class="block h-9 w-9 shrink-0 opacity-90" src="/favicon.svg" alt="Logo" />
            <span class="text-2xl font-bold leading-none tracking-tight bg-clip-text pb-0! text-transparent bg-gradient-to-br from-[var(--sl-color-text-accent)] to-[#d1d5db] [:root[data-theme='light']_&]:to-[#6b7280]">
              智能体漫游
            </span>
          </div>

          <div class="w-full mt-3">
            <p class="text-sm m-0! mb-4! text-[var(--sl-color-gray-3)] leading-relaxed max-w-sm">
              “智能体漫游”专注于快速掌握主流 AI Agent，如 Claude Code、Hermes Agent 等。通过实用教程、案例演示和最新资讯，让开发者和 AI 爱好者轻松上手，探索智能体应用潜力，提升学习效率与实践能力。
            </p>

            <div class="flex flex-wrap gap-1.5 items-center" role="list" aria-label="社交媒体">
              {#each socialLinks as social (social.href)}
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="listitem"
                  class="footer-social-link footer-hover group flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-[var(--sl-color-gray-3)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-color-gray-4)] no-underline border-none"
                  title={social.label}
                  aria-label={social.label}
                >
                  <SocialIcon
                    name={social.icon}
                    class="h-5 w-5 opacity-65 transition-opacity duration-200 group-hover:opacity-100"
                  />
                </a>
              {/each}
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="grid grid-cols-2 flex-1 gap-10 lg:gap-12! justify-items-start">
          {#each footerInfoArr as item (item.title)}
            <div class="flex w-full flex-col items-start text-left">
              <h3 class="text-sm m-0! font-bold tracking-[0.1em] text-[var(--sl-color-gray-2)] uppercase opacity-80 px-2 py-1">
                {item.title}
              </h3>

              <ul class="m-0! mt-2.5! list-none! p-0! flex flex-col gap-1">
                {#each item.branch as citem}
                  <li class="m-0! p-0!">
                    <a
                      href={citem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="footer-hover footer-nav-link inline-flex items-center rounded-md px-2 py-2 text-sm leading-snug text-[var(--sl-color-gray-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-color-gray-4)] no-underline border-none"
                    >
                      {citem.title}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      </div>

      <!-- Bottom -->
      <div class="w-full pt-4 !mt-4 md:!mt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left [:root[data-theme='light']_&]:border-black/[0.05]">
        <p class="text-[var(--sl-color-gray-4)] text-[13px] font-medium tracking-wide">
          © {currentYear}
          <a
            href="https://agent.jeffjade.com/"
            class="footer-hover footer-nav-link mx-1 inline-flex items-center rounded-md px-2 py-1 text-[13px] leading-snug text-[var(--sl-color-gray-3)] decoration-none no-underline border-none"
          >agent.jeffjade.com</a>
          · 保留所有权利
        </p>
      </div>
    </div>
  </div>
</footer>

<style>
  .custom-footer :global(.footer-brand) {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .custom-footer :global(.footer-nav-link) {
    min-height: 0;
  }

  .custom-footer :global(.footer-hover) {
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }

  .custom-footer :global(.footer-hover:hover) {
    background-color: rgba(161, 161, 170, 0.18);
    color: var(--sl-color-gray-2);
  }

  :global(:root[data-theme='light']) .custom-footer :global(.footer-hover:hover) {
    background-color: #e8e8e8;
    color: var(--sl-color-gray-2);
  }

  .custom-footer :global(.footer-social-link:hover) {
    color: var(--sl-color-gray-2);
  }
</style>
