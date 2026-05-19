<script>
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
        { title: '清风明月轩', url: 'https://www.lovejade.cn/' },
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

            <div class="flex flex-wrap gap-1.5 items-center">
              {#each [
                { href: "https://github.com/nicejade", img: "github", alt: "Github" },
                { href: "https://x.com/MarshalXuan", img: "x", alt: "X | Twitter" },
                { href: "https://www.facebook.com/nice.jade.yang/", img: "facebook", alt: "Facebook | 脸书" },
                { href: "https://www.threads.com/@turingmind", img: "threads", alt: "Threads" },
                { href: "https://www.youtube.com/@MarshalXuan", img: "youtube", alt: "YouTube | 油管" },
                { href: "https://space.bilibili.com/690989854", img: "bilibili", alt: "Bilibili | 哔哩哔哩" },
                { href: "https://mastodon.social/@nicejade", img: "mastodon", alt: "Mastodon | 长毛象" },
                { href: "https://www.jeffjade.com/", img: "blogger", alt: "Blog | 博客" }
              ] as social}
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="footer-hover group flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-[var(--sl-color-gray-3)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-color-gray-4)] no-underline border-none"
                  title={social.alt}
                >
                  <img
                    class="h-5 w-5 opacity-65 transition-opacity duration-200 group-hover:opacity-100"
                    src="https://www.niceshare.site/svgs/{social.img}.svg"
                    alt={social.alt}
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
              <h3 class="text-sm m-0! font-bold tracking-[0.1em] text-[var(--sl-color-gray-2)] uppercase opacity-80 px-2.5 py-1.5">
                {item.title}
              </h3>

              <ul class="m-0! mt-4! list-none! p-0! space-y-3">
                {#each item.branch as citem}
                  <li class="m-0! p-0!">
                    <a
                      href={citem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="footer-hover inline-flex min-h-9 items-center rounded-lg px-2.5 py-1.5 text-sm text-[var(--sl-color-gray-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-color-gray-4)] no-underline border-none"
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
            href="https://www.niceshare.site/"
            class="footer-hover mx-1 inline-flex min-h-9 items-center rounded-lg px-2.5 py-1.5 text-[var(--sl-color-gray-3)] decoration-none no-underline border-none"
          >niceshare.site</a>
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
</style>
