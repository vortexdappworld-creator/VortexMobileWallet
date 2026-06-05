import { useCallback, useEffect, useState } from 'react';

import { readTreeNodes } from '../lib/reads';

import type { VortexTreeNode } from '../lib/reads';
import type { Address } from 'viem';

const lower = (a: string) => a.toLowerCase();

export type ReferralTreeState = {
  nodes: Map<string, VortexTreeNode>;
  expanded: Set<string>;
  loading: boolean;
  error: string | null;
  expand: (a: Address) => Promise<void>;
  collapse: (a: Address) => void;
};

export function useReferralTree(
  root: Address | undefined,
  directRefs: Address[],
): ReferralTreeState {
  const [nodes, setNodes] = useState<Map<string, VortexTreeNode>>(new Map());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refsKey = directRefs.map(lower).sort().join(',');

  useEffect(() => {
    if (!root || directRefs.length === 0) {
      setNodes(new Map());
      setExpanded(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const level1 = await readTreeNodes(directRefs);
        if (cancelled) return;
        const map = new Map<string, VortexTreeNode>();
        level1.forEach((n) => map.set(lower(n.address), n));
        setNodes(map);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [root, refsKey]);

  const expand = useCallback(
    async (a: Address) => {
      const node = nodes.get(lower(a));
      if (!node || node.children.length === 0) return;
      const missing = node.children.filter((c) => !nodes.has(lower(c)));
      if (missing.length > 0) {
        try {
          const fetched = await readTreeNodes(missing);
          setNodes((prev) => {
            const next = new Map(prev);
            fetched.forEach((n) => next.set(lower(n.address), n));
            return next;
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          return;
        }
      }
      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(lower(a));
        return next;
      });
    },
    [nodes],
  );

  const collapse = useCallback((a: Address) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(lower(a));
      return next;
    });
  }, []);

  return { nodes, expanded, loading, error, expand, collapse };
}
