'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import CourseMap, { CourseActivity } from '@/components/course/CourseMap';
import { StageSummary } from '@/content/types';
import { computePhaseStates, isCourseComplete } from '@/content/progress';
import { useCourseProgress } from '@/hooks/useCourseProgress';

const activities: CourseActivity[] = [
  { label: '개념 설명', description: '핵심 정의와 필요한 이유를 읽습니다', minutes: 3 },
  { label: '예시', description: '실제 데이터 상황에서 개념을 확인합니다', minutes: 2 },
  { label: '확인 문제', description: '이해한 내용을 문제로 점검합니다', minutes: 3 },
  { label: '해설', description: '정답과 오답 이유, 연결 용어를 봅니다', minutes: 2 },
];

export default function LearnClient({ stages }: { stages: StageSummary[] }) {
  const { ready, state } = useCourseProgress();
  const searchParams = useSearchParams();
  const [chosenStage, setSelectedStage] = useState<string | null>(searchParams.get('stage'));

  // 앞 단계를 모두 완료해야 다음 단계가 열린다
  const unlocked = useMemo(() => stages.map((_, i) =>
    i === 0 || isCourseComplete(stages[i - 1].phases, stages[i - 1].id, state.learn)
  ), [stages, state.learn]);

  const selectedStage = chosenStage ?? stages[Math.max(0, unlocked.lastIndexOf(true))].id;
  const stageIndex = Math.max(0, stages.findIndex((s) => s.id === selectedStage));
  const stage = stages[stageIndex];
  const phases = computePhaseStates(stage.phases, stage.id, state.learn, unlocked[stageIndex]);

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-main">{'학습하기'}</h1>
      <p className="mt-1 text-sm text-gray1">{'입문부터 마스터까지, 한 Step에 한 개념씩 쌓아갑니다'}</p>

      <ol className="mt-8 flex w-full items-start pb-2">
        {stages.map((s, i) => {
          const isSelected = s.id === stage.id;
          const locked = !unlocked[i];
          return (
            <li key={s.id} className={`flex items-start ${ i < stages.length - 1 ? 'flex-1' : '' }`}>
              <button
                onClick={() => setSelectedStage(s.id)}
                aria-current={isSelected ? 'step' : undefined}
                aria-label={`${ s.label }${ locked ? ' (잠김)' : '' }`}
                className="group flex min-w-12 flex-col items-center gap-2"
              >
                <span className={`flex size-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-200
                  ${ isSelected
              ? locked ? 'bg-gray4 text-gray1 shadow-md' : 'bg-primary text-background shadow-md'
              : locked
                ? 'bg-extreme-light text-gray1 group-hover:bg-gray4'
                : 'bg-extreme-light text-sub group-hover:bg-secondary group-hover:text-accent' }`}
                >
                  {locked ? <Lock className="size-4" /> : i + 1}
                </span>
                <span className={`whitespace-nowrap text-sm ${ isSelected ? 'font-semibold text-primary' : locked ? 'text-gray1' : 'text-sub' }`}>
                  {s.label}
                </span>
              </button>
              {i < stages.length - 1 && <span className="mx-1 mt-5 h-0.5 min-w-3 flex-1 rounded-full bg-gray4 sm:mx-2" />}
            </li>
          );
        })}
      </ol>

      <div className="mb-6 mt-4 rounded-xl bg-extreme-light px-4 py-3">
        <p className="text-sm text-sub">
          <span className="mr-2 font-semibold text-primary">{`${ stage.label } 목표`}</span>
          {stage.description}
        </p>
        {!unlocked[stageIndex] && (
          <p className="mt-1 flex items-center gap-1 text-xs text-gray1">
            <Lock className="size-3" />
            {`${ stages[stageIndex - 1]?.label } 단계를 모두 완료하면 열립니다. 잠긴 Step도 목표는 미리 볼 수 있습니다.`}
          </p>
        )}
      </div>

      <CourseMap
        key={`${ stage.id }-${ ready }`}
        phases={phases}
        activities={activities}
        basePath={`/learn/${ stage.id }`}
        startLabel="학습 시작하기"
      />
    </div>
  );
}
