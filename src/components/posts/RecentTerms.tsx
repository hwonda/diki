'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Link from 'next/link';
import { TermData } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const skeleton_count = 6;

const SkeletonItem = () => (
  <div
    className="min-w-[121px] h-[34px] flex justify-center items-center rounded-lg border border-light shrink-0 bg-gray5 animate-pulse"
  />
);

export default function RecentTerms() {
  const { terms, isLoading } = useSelector((state: RootState) => state.terms);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<TermData[]>([]);

  const recentTerms = [...terms]
    .sort((a, b) => {
      const dateA = new Date(a.metadata?.created_at ?? '').getTime();
      const dateB = new Date(b.metadata?.created_at ?? '').getTime();

      if (dateB === dateA) {
        return (b.id ?? 0) - (a.id ?? 0);
      }
      return dateB - dateA;
    })
    .slice(0, 10);

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const gap = 8;

      const desiredItemWidth = 116; // 7글자와 padding을 포함한 너비
      const maxItems = Math.floor((containerWidth + gap) / (desiredItemWidth + gap));
      const calculatedItemWidth = Math.floor((containerWidth - ((maxItems - 1) * gap)) / maxItems);

      setVisibleItems((prev) => {
        const newItems = recentTerms.slice(0, maxItems);

        if (prev.length !== newItems.length) return newItems;
        const hasChanged = newItems.some((item, index) => item.url !== prev[index].url);
        return hasChanged ? newItems : prev;
      });

      containerRef.current.style.setProperty('--item-width', `${ calculatedItemWidth }px`);
    };

    // Initial calculation
    calculateVisibleItems();

    window.addEventListener('resize', calculateVisibleItems);

    return () => {
      window.removeEventListener('resize', calculateVisibleItems);
    };
  }, [recentTerms]);

  const isLocalLoading = isLoading || (terms.length === 0);

  return (
    <div className='w-full'>
      <div className='text-center'>
        <h2 className='flex items-center justify-center gap-2 text-2xl font-bold text-main'>
          <Sparkles className='size-5 text-primary' />
          {'새로 올라온 용어'}
        </h2>
        <p className='mt-2 text-sm text-gray1'>{'가장 최근에 추가된 데이터 용어를 살펴보세요'}</p>
      </div>
      <div ref={containerRef} className='mt-8 flex justify-between overflow-hidden gap-2'>
        {isLocalLoading ? (
          Array(skeleton_count).fill(0).map((_, index) => (
            <SkeletonItem key={`skeleton-${ index }`} />
          ))
        ) : (
          visibleItems.map((term) => (
            <Link
              key={term.url}
              href={`${ term.url }`}
              style={{ width: 'var(--item-width)' }}
              className='py-1.5 px-2.5 flex justify-center items-center text-sub rounded-lg border border-light hover:border-primary hover:text-primary hover:font-semibold transition-colors text-[13px] md:text-sm shrink-0 bg-background'
            >
              <span className="truncate" style={{ scrollbarGutter: 'auto' }}>
                {term.title?.ko}
              </span>
            </Link>
          ))
        )}
      </div>
      <div className='mt-6 text-center'>
        <Link href='/posts' className='inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'>
          {'전체 용어 보기'}
          <ArrowRight className='size-4' />
        </Link>
      </div>
    </div>
  );
}
