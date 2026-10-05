'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronLeft, Lock } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { StepLink } from '@/content/types';
import { StepStatus } from '@/content/progress';

interface StepShellProps {
  ready: boolean;
  status: StepStatus | undefined;
  mapHref: string;
  mapLabel: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  activities?: string[];
  currentActivity?: number;
  progress?: number;
  neighbors: { prev: StepLink | null; next: StepLink | null };
  firstAvailable?: StepLink | null;
  narrow?: boolean;
  hideNav?: boolean;
  children: ReactNode;
}

export default function StepShell({
  ready, status, mapHref, mapLabel, eyebrow, title, subtitle, activities, currentActivity = 0, progress, neighbors, firstAvailable, narrow = false, hideNav = false, children,
}: StepShellProps) {
  return (
    <div className="py-8">
      <Link href={mapHref} className="flex w-fit items-center gap-1 text-sm text-gray1 transition-colors hover:text-primary">
        <ChevronLeft className="size-4" />
        {mapLabel}
      </Link>

      <p className="mt-6 text-xs text-gray2">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-bold text-main">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray1">{subtitle}</p>}

      {progress !== undefined && (
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray4" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${ progress * 100 }%` }} />
        </div>
      )}

      {activities && (
        <ol className="mt-6 grid grid-cols-4 gap-2">
          {activities.map((label, i) => (
            <li key={label} className="flex flex-col gap-1.5">
              <span className={`h-1 rounded-full transition-colors duration-300 ${ i <= currentActivity ? 'bg-primary' : 'bg-gray4' }`} />
              <span className={`truncate text-xs ${ i === currentActivity ? 'font-semibold text-primary' : i < currentActivity ? 'text-sub' : 'text-gray2' }`}>
                {label}
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className={`mt-8 ${ narrow ? 'mx-auto max-w-3xl' : '' }`}>
        {!ready ? (
          <LoadingSpinner fixed={false} />
        ) : status === 'locked' ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-extreme-light px-6 py-12 text-center">
            <Lock className="size-8 text-gray3" />
            <p className="font-semibold text-main">{'아직 열리지 않은 Step입니다'}</p>
            <p className="text-sm text-gray1">{'앞 Step을 완료하면 순서대로 열립니다'}</p>
            {firstAvailable && (
              <Link
                href={firstAvailable.href}
                className="mt-2 flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90"
              >
                {`이어서 하기: ${ firstAvailable.title }`}
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        ) : (
          children
        )}
      </div>

      {!hideNav && (
        <nav className={`mt-16 flex justify-between gap-4 text-sm ${ narrow ? 'mx-auto max-w-3xl' : '' }`}>
          {neighbors.prev ? (
            <Link href={neighbors.prev.href} className="flex min-w-0 items-center gap-1 text-gray1 hover:text-primary">
              <ArrowLeft className="size-4 shrink-0" />
              <span className="truncate">{neighbors.prev.title}</span>
            </Link>
          ) : <span />}
          {neighbors.next && (
            <Link href={neighbors.next.href} className="flex min-w-0 items-center gap-1 text-gray1 hover:text-primary">
              <span className="truncate">{neighbors.next.title}</span>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
