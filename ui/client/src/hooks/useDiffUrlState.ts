import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TimelineEntry } from '../types';

export type DiffViewMode = 'diff' | 'file';

/**
 * Diffs page URL state:
 * - consume URL once on mount for deep-link restore
 * - afterwards, page state is source of truth
 * - sync state back to URL with replace()
 */
export function useDiffUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initial = useMemo(() => ({
    file: searchParams.get('file') || '',
    iter: searchParams.get('iter') || '',
    step: searchParams.get('step') || '',
    view: (searchParams.get('view') === 'diff' ? 'diff' : 'file') as DiffViewMode,
  }), []);

  const [selectedSlug, setSelectedSlug] = useState(initial.file);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [viewMode, setViewMode] = useState<DiffViewMode>(initial.view);
  const initialConsumedRef = useRef(false);
  const pendingLatestSelectionRef = useRef(false);

  const syncUrl = useCallback((slug: string, entry?: Pick<TimelineEntry, 'iteration' | 'step'>, view?: DiffViewMode) => {
    const params = new URLSearchParams();
    if (slug) params.set('file', slug);
    if (entry) {
      params.set('iter', entry.iteration);
      params.set('step', String(entry.step));
    }
    if (view) params.set('view', view);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const resolveInitialPosition = useCallback((timeline: TimelineEntry[]) => {
    if (pendingLatestSelectionRef.current) {
      pendingLatestSelectionRef.current = false;
      return Math.max(timeline.length - 1, 0);
    }
    if (initialConsumedRef.current) return null;
    initialConsumedRef.current = true;
    if (initial.iter && initial.step) {
      const idx = timeline.findIndex(e => e.iteration === initial.iter && e.step === parseInt(initial.step, 10));
      if (idx >= 0) return idx;
    }
    return Math.max(timeline.length - 1, 0);
  }, [initial]);

  const selectFile = useCallback((slug: string) => {
    initialConsumedRef.current = true;
    pendingLatestSelectionRef.current = true;
    setSelectedSlug(slug);
  }, []);

  useEffect(() => {
    if (!selectedSlug && initial.file) setSelectedSlug(initial.file);
  }, [selectedSlug, initial.file]);

  return {
    selectedSlug,
    setSelectedSlug,
    currentIdx,
    setCurrentIdx,
    viewMode,
    setViewMode,
    selectFile,
    syncUrl,
    resolveInitialPosition,
  };
}
