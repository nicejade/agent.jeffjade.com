<script lang="ts">
  import { socialIconPaths, type SocialIconName } from '../../data/social-icon-paths';

  interface Props {
    name: SocialIconName;
    class?: string;
  }

  let { name, class: className = 'h-5 w-5 shrink-0' }: Props = $props();

  const path = $derived(socialIconPaths[name]);
</script>

<svg
  class={className}
  viewBox="0 0 24 24"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
>
  <path d={path} />
</svg>
