'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// 페이지를 떠나는 내부 링크인지 판별한다
function isInternalNavigation(anchor: HTMLAnchorElement, event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickle = useRef<ReturnType<typeof setInterval>>();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeRef = useRef(false);

  const clearTimers = () => {
    clearInterval(trickle.current);
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const done = useCallback(() => {
    clearInterval(trickle.current);
    activeRef.current = false;
    setProgress(1);
    timers.current.push(setTimeout(() => setVisible(false), 250));
    timers.current.push(setTimeout(() => setProgress(0), 500));
  }, []);

  const start = useCallback(() => {
    clearTimers();
    activeRef.current = true;
    setVisible(true);
    setProgress(0.08);
    trickle.current = setInterval(() => {
      setProgress((p) => (p < 0.9 ? p + ((0.9 - p) * 0.1) : p));
    }, 200);
    // 이동이 취소되거나 실패해도 진행 바가 남지 않도록 한다
    timers.current.push(setTimeout(done, 10000));
  }, [done]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (anchor && isInternalNavigation(anchor, event)) start();
    };
    const onPopState = () => start();
    // Next Link가 기본 동작을 막기 전에 감지하도록 캡처 단계에서 듣는다
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
      clearTimers();
    };
  }, [start]);

  useEffect(() => {
    if (activeRef.current) done();
  }, [pathname, searchParams, done]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 transition-opacity duration-300 ${ visible ? 'opacity-100' : 'opacity-0' }`}
    >
      <div
        className="h-full bg-primary shadow-md transition-all duration-200 ease-out"
        style={{ width: `${ progress * 100 }%` }}
      />
    </div>
  );
}
