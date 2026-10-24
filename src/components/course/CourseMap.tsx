'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Lock, Check, ArrowRight, Clock, Construction, RotateCcw, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
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
  lockedReason?: string;
}

const zigzag = ['translate-x-0', 'translate-x-10', 'translate-x-0', '-translate-x-10'];

const statusLabel: Record<StepStatus, string> = {
  completed: '완료',
  available: '시작 가능',
  locked: '잠김',
  draft: '준비 중',
};

function StepNode({ index, status, selected }: { index: number; status: StepStatus; selected: boolean }) {
  const base = `flex size-14 items-center justify-center rounded-2xl text-lg font-bold transition-all duration-200 ${ selected ? 'ring-2 ring-primary' : '' }`;

  if (status === 'completed') {
    return <div className={`${ base } bg-primary text-background`}><Check className="size-6" /></div>;
  }
  if (status === 'available') {
    return <div className={`${ base } bg-secondary text-accent`}>{index}</div>;
  }
  if (status === 'draft') {
    return <div className={`${ base } bg-extreme-light text-gray1 opacity-50`}>{index}</div>;
  }
  return <div className={`${ base } bg-extreme-light text-gray1`}>{index}</div>;
}

export default function CourseMap({ phases, activities, basePath, startLabel, lockedReason }: CourseMapProps) {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const firstAvailable = phases.flatMap((p) => p.steps.map((s, i) => ({ phaseId: p.id, index: i, status: s.status })))
    .find((s) => s.status === 'available');
  const [selected, setSelected] = useState({ phaseId: firstAvailable?.phaseId ?? phases[0]?.id, index: firstAvailable?.index ?? 0 });
  const [phaseIndex, setPhaseIndex] = useState(() => Math.max(0, phases.findIndex((p) => p.id === (firstAvailable?.phaseId ?? phases[0]?.id))));
  const touchStartX = useRef<number | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailRef = useRef<HTMLElement>(null);

  // Phase를 넘기면 그 Phase에서 진행할 Step(없으면 첫 Step)을 상세 패널에 보여준다
  const goToPhase = (target: number) => {
    if (target < 0 || target >= phases.length || target === phaseIndex) return;
    setPhaseIndex(target);
    const phase = phases[target];
    const available = phase.steps.findIndex((step) => step.status === 'available');
    setSelected({ phaseId: phase.id, index: Math.max(0, available) });
  };

  const selectStep = (phaseId: string, index: number) => {
    setSelected({ phaseId, index });
    // 모바일에서는 상세 패널이 지도 아래에 있으므로 스크롤한다
    if (window.matchMedia('(max-width: 1023px)').matches) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Phase를 바꾸면 그 Phase의 스크롤 영역에서 선택된 Step이 가운데 오도록 맞춘다
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const slide = slideRefs.current[phaseIndex];
      const target = slide?.querySelector<HTMLElement>('[aria-current="step"]');
      if (!slide || !target || slide.scrollHeight <= slide.clientHeight) return;
      const offset = target.getBoundingClientRect().top - slide.getBoundingClientRect().top;
      slide.scrollTo({ top: slide.scrollTop + offset - ((slide.clientHeight - target.offsetHeight) / 2) });
    });
    return () => cancelAnimationFrame(frame);
  }, [phaseIndex]);

  const requiredSteps = phases.flatMap((p) => p.steps).filter((s) => s.status !== 'draft');
  const completedCount = requiredSteps.filter((s) => s.status === 'completed').length;
  const progress = requiredSteps.length ? Math.round((completedCount / requiredSteps.length) * 100) : 0;

  const currentPhase = phases[phaseIndex] ?? phases[0];
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
        <div className="relative lg:col-span-2 lg:min-h-[520px]">
          <div
            className="flex flex-col rounded-2xl border border-light px-4 py-5 lg:absolute lg:inset-0"
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 50) goToPhase(phaseIndex + (dx < 0 ? 1 : -1));
              touchStartX.current = null;
            }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPhase(phaseIndex - 1)}
                disabled={phaseIndex === 0}
                aria-label="이전 Phase"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-gray1 transition-colors hover:bg-extreme-light hover:text-primary disabled:invisible"
              >
                <ChevronLeft className="size-5" />
              </button>
              <div className="min-w-0 flex-1 text-center">
                <p className={`flex items-center justify-center gap-1.5 truncate text-sm font-bold ${ currentPhase.locked ? 'text-gray1' : 'text-primary' }`}>
                  {currentPhase.locked && <Lock className="size-3.5 shrink-0" />}
                  <span className="truncate">{currentPhase.title}</span>
                </p>
                <p className="mt-0.5 text-xs text-gray1">
                  {`${ phaseIndex + 1 } / ${ phases.length } · ${ currentPhase.steps.filter((step) => step.status === 'completed').length }/${ currentPhase.steps.length } 완료`}
                </p>
              </div>
              <button
                onClick={() => goToPhase(phaseIndex + 1)}
                disabled={phaseIndex === phases.length - 1}
                aria-label="다음 Phase"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-gray1 transition-colors hover:bg-extreme-light hover:text-primary disabled:invisible"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="mt-4 overflow-hidden lg:min-h-0 lg:flex-1">
              <div
                className="flex items-start transition-transform duration-500 ease-out motion-reduce:transition-none lg:h-full"
                style={{ transform: `translateX(-${ phaseIndex * 100 }%)` }}
              >
                {phases.map((phase, phaseIdx) => (
                  <div
                    key={phase.id}
                    ref={(el) => { slideRefs.current[phaseIdx] = el; }}
                    aria-hidden={phaseIdx !== phaseIndex}
                    className={`relative w-full shrink-0 lg:h-full lg:overflow-y-auto ${ phaseIdx === phaseIndex ? '' : 'h-0' }`}
                  >
                    <ol className="flex flex-col items-center gap-5 py-2">
                      {phase.steps.map((step, i) => {
                        const isSelected = selected.phaseId === phase.id && selected.index === i;
                        return (
                          <li key={step.id} className={zigzag[i % zigzag.length]}>
                            <button
                              onClick={() => selectStep(phase.id, i)}
                              tabIndex={phaseIdx === phaseIndex ? 0 : -1}
                              aria-current={isSelected ? 'step' : undefined}
                              aria-label={`Step ${ i + 1 } ${ step.title } (${ statusLabel[step.status] })`}
                              className={`group flex flex-col items-center gap-1.5 rounded-2xl p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary
                            ${ isSelected ? '' : 'opacity-90 hover:opacity-100' }`}
                            >
                              <StepNode index={i + 1} status={step.status} selected={isSelected} />
                              <span className={`max-w-32 truncate text-xs ${ isSelected ? 'font-semibold text-primary' : step.status === 'available' || step.status === 'completed' ? 'text-sub' : 'text-gray1' }`}>
                                {step.title}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-1.5" role="tablist" aria-label="Phase 선택">
              {phases.map((phase, i) => (
                <button
                  key={phase.id}
                  role="tab"
                  aria-selected={i === phaseIndex}
                  aria-label={`${ phase.title }${ phase.completed ? ' (완료)' : phase.locked ? ' (잠김)' : '' }`}
                  onClick={() => goToPhase(i)}
                  className={`h-2 rounded-full transition-all duration-300
                  ${ i === phaseIndex ? 'w-6 bg-primary' : phase.completed ? 'w-2 bg-primary opacity-50' : phase.locked ? 'w-2 bg-gray4' : 'w-2 bg-gray3' }`}
                />
              ))}
            </div>
          </div>
        </div>

        {selectedPhase && selectedStep && (
          <aside ref={detailRef} className="scroll-mt-4 rounded-2xl border border-light p-6 lg:col-span-3">
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
                      {lockedReason ?? (selectedPhase.locked ? '이전 Phase를 완료하면 해제됩니다' : '이전 Step을 완료하면 해제됩니다')}
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
