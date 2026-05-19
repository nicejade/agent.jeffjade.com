import type { AstroIntegration } from 'astro';
import { rehypeWrapTables } from '../plugins/rehype-wrap-tables.ts';

/** Appends table-wrap rehype plugin after Starlight registers its markdown pipeline. */
export function tableWrapIntegration(): AstroIntegration {
  return {
    name: 'agent-docs-table-wrap',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        updateConfig({
          markdown: {
            ...config.markdown,
            rehypePlugins: [...(config.markdown?.rehypePlugins ?? []), rehypeWrapTables],
          },
        });
      },
    },
  };
}
