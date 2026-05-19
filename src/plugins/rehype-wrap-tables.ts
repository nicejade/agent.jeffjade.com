type HastElement = {
  type: 'element';
  tagName: string;
  properties?: { className?: string[] };
  children?: HastNode[];
};

type HastNode = HastElement | { type: string; [key: string]: unknown };

type HastRoot = { type: 'root'; children: HastNode[] };

/**
 * Wraps markdown tables in a scroll container so horizontal overflow
 * does not require `display: block` on the table element.
 */
export function rehypeWrapTables() {
  return (tree: HastRoot) => {
    walk(tree.children);
  };
}

function walk(nodes: HastNode[]) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type !== 'element') continue;

    const el = node as HastElement;

    if (el.tagName === 'table') {
      const wrapper: HastElement = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['doc-table-wrap'] },
        children: [el],
      };
      nodes[i] = wrapper;
      continue;
    }

    if (el.children?.length) {
      walk(el.children);
    }
  }
}
