'use client';

import Reveal from '@/components/common/Reveal';
import { useInView } from '@/hooks/useInView';

const flows = [
  {
    title: '학습 Step',
    summary: '문제로 이해했는지 바로 확인합니다',
    text: 'text-level-1',
    bg: 'bg-level-1',
    steps: ['개념 설명', '예시', '확인 문제', '해설'],
  },
  {
    title: '면접 Step',
    summary: '핵심 항목을 빠짐없이 말하는 연습입니다',
    text: 'text-primary',
    bg: 'bg-primary',
    steps: ['질문', '답변 작성', '평가 기준 확인', '자기 점검'],
  },
];

type Flow = (typeof flows)[number];

function FlowRow({ flow }: { flow: Flow }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);

  return (
    <div ref={ref} className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
      <div className={`transition-all duration-700 ease-out motion-reduce:transition-none ${ inView ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0 motion-reduce:translate-x-0 motion-reduce:opacity-100' }`}>
        <p className={`text-lg font-bold ${ flow.text }`}>{flow.title}</p>
        <p className="mt-1 whitespace-nowrap text-base text-gray1">{flow.summary}</p>
      </div>
      <ol className="grid grid-cols-4 md:col-span-2">
        {flow.steps.map((step, i) => (
          <li key={step} className="relative flex flex-col items-center gap-2">
            {i > 0 && (
              <span
                style={{ transitionDelay: `${ i * 180 }ms` }}
                className={`absolute right-1/2 top-4 h-px w-full origin-left bg-gray4 transition-transform duration-500 ease-out motion-reduce:transition-none ${ inView ? 'scale-x-100' : 'scale-x-0 motion-reduce:scale-x-100' }`}
              />
            )}
            <span
              style={{ transitionDelay: `${ (i * 180) + 120 }ms` }}
              className={`relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-bold text-background transition-all duration-500 ease-out motion-reduce:transition-none ${ flow.bg }
                ${ inView ? 'scale-100 opacity-100' : 'scale-50 opacity-0 motion-reduce:scale-100 motion-reduce:opacity-100' }`}
            >
              {i + 1}
            </span>
            <span
              style={{ transitionDelay: `${ (i * 180) + 200 }ms` }}
              className={`whitespace-nowrap text-sm font-medium text-sub transition-opacity duration-500 motion-reduce:transition-none md:text-base ${ inView ? 'opacity-100' : 'opacity-0 motion-reduce:opacity-100' }`}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="mx-auto mt-32 max-w-5xl px-4 md:mt-40">
      <Reveal className="text-center">
        <h2 className="text-2xl font-bold text-main">{'한 번에 하나씩, 끝까지'}</h2>
        <p className="mt-2 whitespace-nowrap text-sm text-gray1">{'모든 코스는 Phase 안의 Step을 순서대로 진행합니다'}</p>
      </Reveal>

      <div className="mt-12 space-y-14">
        {flows.map((flow) => <FlowRow key={flow.title} flow={flow} />)}
      </div>
    </section>
  );
}
