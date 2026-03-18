import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EventMediaItem } from '../types';

export interface MediaSelectionState {
  selectedIds: number[];
  hasSelection: boolean;
  selectedCount: number;
  isSelected: (id: number) => boolean;
  toggle: (id: number) => void;
  select: (id: number) => void;
  deselect: (id: number) => void;
  clear: () => void;
  selectAll: (items: EventMediaItem[]) => void;
}

export const useMediaSelection = (initialSelected: number[] = []): MediaSelectionState => {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelected);

  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.length === initialSelected.length && prev.every((id, idx) => id === initialSelected[idx])) {
        return prev;
      }
      return initialSelected;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const deselect = useCallback((id: number) => {
    setSelectedIds((prev) => prev.filter((value) => value !== id));
  }, []);

  const toggle = useCallback(
    (id: number) => {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
    },
    []
  );

  const clear = useCallback(() => setSelectedIds([]), []);

  const selectAll = useCallback((items: EventMediaItem[]) => {
    setSelectedIds(items.map((item) => item.id));
  }, []);

  const isSelected = useCallback((id: number) => selectedIds.includes(id), [selectedIds]);

  const state = useMemo(
    () => ({
      selectedIds,
      hasSelection: selectedIds.length > 0,
      selectedCount: selectedIds.length,
      isSelected,
      toggle,
      select,
      deselect,
      clear,
      selectAll,
    }),
    [clear, deselect, isSelected, select, selectAll, selectedIds, toggle]
  );

  return state;
};
