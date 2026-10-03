'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import CourseMap, { CourseActivity, CoursePhase } from '@/components/course/CourseMap';

interface Stage {
  id: string;
  label: string;
  description: string;
  locked: boolean;
}

const stages: Stage[] = [
  { id: 'beginner', label: '입문', description: '데이터와 AI의 기초 개념을 이해합니다', locked: false },
  { id: 'basic', label: '기초', description: '주요 알고리즘과 도구의 원리를 설명할 수 있습니다', locked: false },
  { id: 'intermediate', label: '중급', description: '개념 간 관계를 파악하고 적절한 기법을 선택할 수 있습니다', locked: false },
  { id: 'advanced', label: '고급', description: '복잡한 문제에 여러 개념을 조합해 해결 방안을 설계할 수 있습니다', locked: true },
  { id: 'master', label: '마스터', description: '개념을 연결해 판단하고, 트레이드오프를 설명할 수 있습니다', locked: true },
];

const samplePhases: Record<string, CoursePhase[]> = {
  beginner: [
    {
      id: 'p1',
      title: 'Phase 1: 데이터와 AI의 기초',
      steps: [
        { title: '데이터', status: 'available' },
        { title: '데이터셋', status: 'locked' },
        { title: '알고리즘', status: 'locked' },
        { title: '인공지능', status: 'locked' },
        { title: '모델', status: 'locked' },
        { title: '학습', status: 'draft' },
        { title: '예측', status: 'draft' },
        { title: '텐서', status: 'locked' },
        { title: '토큰화', status: 'locked' },
        { title: '혼동 행렬', status: 'locked' },
      ],
    },
  ],
  basic: [
    {
      id: 'p1',
      title: 'Phase 1: 머신러닝 핵심 개념',
      steps: [
        { title: '머신러닝', status: 'locked' },
        { title: '지도 학습', status: 'locked' },
        { title: '비지도 학습', status: 'locked' },
        { title: '분류', status: 'locked' },
        { title: '회귀', status: 'locked' },
        { title: '모델 성능 평가 지표', status: 'locked' },
        { title: '교차 검증', status: 'locked' },
      ],
    },
    {
      id: 'p2',
      title: 'Phase 2: 신경망 기초',
      steps: [
        { title: '신경망', status: 'locked' },
        { title: '가중치', status: 'locked' },
        { title: '편향', status: 'locked' },
        { title: '활성화 함수', status: 'locked' },
        { title: '순전파', status: 'locked' },
        { title: '손실 함수', status: 'locked' },
        { title: '딥러닝', status: 'locked' },
      ],
    },
  ],
  intermediate: [],
  advanced: [],
  master: [],
};

const activities: CourseActivity[] = [
  { label: '개념 설명', description: '핵심 정의와 필요한 이유를 읽습니다', minutes: 3 },
  { label: '예시', description: '실제 데이터 상황에서 개념을 확인합니다', minutes: 2 },
  { label: '확인 문제', description: '이해한 내용을 문제로 점검합니다', minutes: 3 },
  { label: '해설', description: '정답과 오답 이유, 연결 용어를 봅니다', minutes: 2 },
];

export default function LearnClient() {
  const [selectedStage, setSelectedStage] = useState('beginner');
  const phases = samplePhases[selectedStage] || [];
  const stage = stages.find((s) => s.id === selectedStage);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-main">{'학습하기'}</h1>
      <p className="mt-1 text-sm text-gray1">{'입문부터 마스터까지, 한 Step에 한 개념씩 쌓아갑니다'}</p>

      <ol className="mt-8 flex items-start overflow-x-auto pb-2">
        {stages.map((s, i) => {
          const isSelected = s.id === selectedStage;
          return (
            <li key={s.id} className="flex flex-1 items-start">
              <button
                onClick={() => !s.locked && setSelectedStage(s.id)}
                disabled={s.locked}
                aria-current={isSelected ? 'step' : undefined}
                className="group flex min-w-12 flex-col items-center gap-2 disabled:cursor-not-allowed"
              >
                <span className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-200
                  ${ isSelected
              ? 'border-primary bg-primary text-background shadow-md'
              : s.locked
                ? 'border-gray4 bg-gray5 text-gray3'
                : 'border-light bg-background text-sub group-hover:border-primary group-hover:text-primary' }`}
                >
                  {s.locked ? <Lock className="size-4" /> : i + 1}
                </span>
                <span className={`whitespace-nowrap text-sm ${ isSelected ? 'font-semibold text-primary' : s.locked ? 'text-gray3' : 'text-sub' }`}>
                  {s.label}
                </span>
              </button>
              {i < stages.length - 1 && <span className="mx-1 mt-5 h-0.5 min-w-3 sm:mx-2 flex-1 rounded-full bg-gray4" />}
            </li>
          );
        })}
      </ol>

      <div className="mb-6 mt-4 rounded-xl bg-gray5 px-4 py-3">
        <p className="text-sm text-sub">
          <span className="mr-2 font-semibold text-primary">{`${ stage?.label } 목표`}</span>
          {stage?.description}
        </p>
      </div>

      <CourseMap
        key={selectedStage}
        phases={phases}
        activities={activities}
        basePath={`/learn/${ selectedStage }`}
        startLabel="학습 시작하기"
        goalOf={(step) => `${ step.title }의 뜻과 쓰임을 설명하고, 확인 문제로 이해도를 점검합니다.`}
      />
    </div>
  );
}
