import { useEffect, useCallback } from 'react';

export function useKeyboard(
  key: string,
  callback: () => void,
  meta = false,
) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (meta && !(e.metaKey || e.ctrlKey)) return;
      if (e.key === key) {
        e.preventDefault();
        callback();
      }
    },
    [key, callback, meta],
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
