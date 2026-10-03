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

export default function HowItWorks() {
  return (
    <section className="mx-auto mt-32 max-w-5xl px-4 md:mt-40">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-main">{'한 번에 하나씩, 끝까지'}</h2>
        <p className="mt-2 whitespace-nowrap text-sm text-gray1">{'모든 코스는 Phase 안의 Step을 순서대로 진행합니다'}</p>
      </div>

      <div className="mt-12 space-y-14">
        {flows.map((flow) => (
          <div key={flow.title} className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
            <div>
              <p className={`text-lg font-bold ${ flow.text }`}>{flow.title}</p>
              <p className="mt-1 whitespace-nowrap text-base text-gray1">{flow.summary}</p>
            </div>
            <ol className="grid grid-cols-4 md:col-span-2">
              {flow.steps.map((step, i) => (
                <li key={step} className="relative flex flex-col items-center gap-2">
                  {i > 0 && <span className="absolute right-1/2 top-4 h-px w-full bg-gray4" />}
                  <span className={`relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-bold text-background ${ flow.bg }`}>{i + 1}</span>
                  <span className="whitespace-nowrap text-sm font-medium text-sub md:text-base">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
