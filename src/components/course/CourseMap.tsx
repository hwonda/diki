'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Lock, Check, ArrowRight, Clock, Construction, RotateCcw, BookOpen } from 'lucide-react';
import { PhaseState, StepStatus } from '@/content/progress';

export interface CourseActivity {
  label: string;
  description: string;
  minutes: number;
}

interface CourseMapProps {
  phases: PhaseState[];
  activities: CourseActivity[];
  basePath: string;
  startLabel: string;
}

const zigzag = ['translate-x-0', 'translate-x-10', 'translate-x-0', '-translate-x-10'];

const statusLabel: Record<StepStatus, string> = {
  completed: '완료',
  available: '시작 가능',
  locked: '잠김',
  draft: '준비 중',
};

function StepNode({ index, status, selected }: { index: number; status: StepStatus; selected: boolean }) {
  const base = 'flex size-14 items-center justify-center rounded-2xl text-lg font-bold transition-all duration-200';

  if (status === 'completed') {
    return <div className={`${ base } bg-primary text-background`}><Check className="size-6" /></div>;
  }
  if (status === 'available') {
    return <div className={`${ base } bg-secondary text-accent ${ selected ? 'shadow-lg' : '' }`}>{index}</div>;
  }
  if (status === 'draft') {
    return <div className={`${ base } bg-extreme-light text-gray1 opacity-50`}>{index}</div>;
  }
  return <div className={`${ base } bg-extreme-light text-gray1`}>{index}</div>;
}

export default function CourseMap({ phases, activities, basePath, startLabel }: CourseMapProps) {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const firstAvailable = phases.flatMap((p) => p.steps.map((s, i) => ({ phaseId: p.id, index: i, status: s.status })))
    .find((s) => s.status === 'available');
  const [selected, setSelected] = useState({ phaseId: firstAvailable?.phaseId ?? phases[0]?.id, index: firstAvailable?.index ?? 0 });
  const detailRef = useRef<HTMLElement>(null);

  const selectStep = (phaseId: string, index: number) => {
    setSelected({ phaseId, index });
    // 모바일에서는 상세 패널이 지도 아래에 있으므로 스크롤한다
    if (window.matchMedia('(max-width: 1023px)').matches) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const requiredSteps = phases.flatMap((p) => p.steps).filter((s) => s.status !== 'draft');
  const completedCount = requiredSteps.filter((s) => s.status === 'completed').length;
  const progress = requiredSteps.length ? Math.round((completedCount / requiredSteps.length) * 100) : 0;

  const selectedPhase = phases.find((p) => p.id === selected.phaseId);
  const selectedStep = selectedPhase?.steps[selected.index];
  const totalMinutes = activities.reduce((sum, a) => sum + a.minutes, 0);

  if (phases.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-extreme-light py-16 text-center">
        <Construction className="size-8 text-gray1" />
        <p className="font-medium text-gray1">{'준비 중인 콘텐츠입니다'}</p>
        <p className="text-sm text-gray1">{'콘텐츠가 공개되면 이곳에서 바로 시작할 수 있습니다'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-extreme-light p-4">
          <p className="text-xs text-gray1">{'진행률'}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xl font-bold text-main">{`${ progress }%`}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray4">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${ progress }%` }} />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-extreme-light p-4">
          <p className="text-xs text-gray1">{'완료한 Step'}</p>
          <p className="mt-2 text-xl font-bold text-main">
            {completedCount}
            <span className="text-sm font-normal text-gray1">{` / ${ requiredSteps.length }`}</span>
          </p>
        </div>
        <div className="col-span-2 rounded-xl bg-extreme-light p-4 sm:col-span-1">
          <p className="text-xs text-gray1">{'기록 저장'}</p>
          {isLoggedIn ? (
            <p className="mt-2 text-sm font-medium text-main">{'진행 기록이 계정에 저장됩니다'}</p>
          ) : (
            <p className="mt-2 text-sm text-main">
              {'맛보기 중 · '}
              <Link href="/login" className="font-medium text-primary hover:underline">{'로그인'}</Link>
              {'하면 기록이 저장됩니다'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-8 rounded-2xl border border-light px-4 py-6 lg:col-span-2">
          {phases.map((phase) => (
            <section key={phase.id}>
              <div className="mb-6 flex justify-center">
                <span className={`flex items-center gap-1.5 rounded-full bg-extreme-light px-4 py-1.5 text-sm font-semibold
                  ${ phase.locked ? 'text-gray1' : 'text-primary' }`}
                >
                  {phase.locked && <Lock className="size-3.5" />}
                  {phase.title}
                </span>
              </div>
              <ol className="flex flex-col items-center gap-5">
                {phase.steps.map((step, i) => {
                  const isSelected = selected.phaseId === phase.id && selected.index === i;
                  return (
                    <li key={step.id} className={`transition-transform ${ zigzag[i % zigzag.length] }`}>
                      <button
                        onClick={() => selectStep(phase.id, i)}
                        aria-current={isSelected ? 'step' : undefined}
                        aria-label={`Step ${ i + 1 } ${ step.title } (${ statusLabel[step.status] })`}
                        className={`group flex flex-col items-center gap-1.5 rounded-2xl p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary
                          ${ isSelected ? '' : 'opacity-90 hover:opacity-100' }`}
                      >
                        <div className={`rounded-2xl p-1 ${ isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : '' }`}>
                          <StepNode index={i + 1} status={step.status} selected={isSelected} />
                        </div>
                        <span className={`max-w-32 truncate text-xs ${ isSelected ? 'font-semibold text-main' : step.status === 'available' || step.status === 'completed' ? 'text-sub' : 'text-gray1' }`}>
                          {step.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>

        {selectedPhase && selectedStep && (
          <aside ref={detailRef} className="h-fit scroll-mt-4 rounded-2xl border border-light p-6 lg:sticky lg:top-6 lg:col-span-3">
            <p className="text-xs text-gray1">{`${ selectedPhase.title } · Step ${ selected.index + 1 }`}</p>
            <div className="mt-1 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold text-main">{selectedStep.title}</h2>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium
                ${ selectedStep.status === 'available' || selectedStep.status === 'completed' ? 'bg-secondary text-accent' : 'bg-gray4 text-gray1' }`}
              >
                {statusLabel[selectedStep.status]}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray1">{selectedStep.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {selectedStep.review && (
                <span className="flex items-center gap-1 rounded-full bg-gray4 px-2.5 py-1 text-xs font-medium text-level-4">
                  <RotateCcw className="size-3" />
                  {'복습 필요'}
                </span>
              )}
              <Link href={`/posts/${ selectedStep.id }`} className="flex items-center gap-1 text-xs text-gray1 hover:text-primary">
                <BookOpen className="size-3" />
                {'용어사전에서 보기'}
              </Link>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between text-xs text-gray1">
                <span>{'진행 순서'}</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {`약 ${ totalMinutes }분`}
                </span>
              </div>
              <ol className="space-y-3">
                {activities.map((activity, i) => (
                  <li key={activity.label} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-extreme-light text-xs font-semibold text-gray1">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-main">{activity.label}</p>
                      <p className="text-xs text-gray1">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray1">{`${ activity.minutes }분`}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6">
              {selectedStep.status === 'available' || selectedStep.status === 'completed' ? (
                <Link
                  href={`${ basePath }/${ selectedPhase.id }/${ selectedStep.id }`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-background transition-opacity hover:opacity-90"
                >
                  {selectedStep.status === 'completed' ? '다시 풀어보기' : startLabel}
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray4 py-3 text-sm font-medium text-gray1">
                  {selectedStep.status === 'draft' ? (
                    <>
                      <Construction className="size-4" />
                      {'콘텐츠를 준비하고 있습니다'}
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      {selectedPhase.locked ? '이전 Phase를 완료하면 해제됩니다' : '이전 Step을 완료하면 해제됩니다'}
                    </>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
