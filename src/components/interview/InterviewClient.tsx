'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import CourseMap, { CourseActivity, CoursePhase } from '@/components/course/CourseMap';

type Role = 'ds' | 'de' | 'da';

interface RoleConfig {
  id: Role;
  label: string;
  fullLabel: string;
  description: string;
  totalSteps: number;
}

const roles: RoleConfig[] = [
  { id: 'ds', label: 'DS', fullLabel: '데이터 과학자', description: 'ML/DL 알고리즘 원리, 모델 선택·평가, 실험 설계', totalSteps: 18 },
  { id: 'de', label: 'DE', fullLabel: '데이터 엔지니어', description: '데이터 파이프라인, 저장소, 인프라 설계', totalSteps: 11 },
  { id: 'da', label: 'DA', fullLabel: '데이터 분석가', description: '데이터 탐색, 지표 해석, 분석 결과 전달', totalSteps: 12 },
];

const samplePhases: Record<Role, CoursePhase[]> = {
  ds: [
    {
      id: 'p1',
      title: 'Phase 1: ML 기초 개념',
      locked: false,
      steps: [
        { title: '머신러닝이란', status: 'available' },
        { title: '지도 학습 vs 비지도 학습', status: 'locked' },
        { title: '손실 함수의 역할', status: 'locked' },
        { title: '과대적합 감지와 방지', status: 'locked' },
        { title: '교차 검증', status: 'locked' },
        { title: '정밀도와 재현율의 트레이드오프', status: 'locked' },
      ],
    },
    {
      id: 'p2',
      title: 'Phase 2: 모델 학습과 최적화',
      locked: true,
      steps: [
        { title: '경사 하강법', status: 'locked' },
        { title: '학습률', status: 'locked' },
        { title: 'L1/L2 정칙화', status: 'locked' },
        { title: '하이퍼파라미터 튜닝', status: 'locked' },
        { title: '배깅과 부스팅', status: 'locked' },
        { title: '특징 엔지니어링', status: 'locked' },
      ],
    },
  ],
  de: [
    {
      id: 'p1',
      title: 'Phase 1: 데이터 기초 인프라',
      locked: false,
      steps: [
        { title: 'RESTful API 설계', status: 'available' },
        { title: '캐싱 전략', status: 'locked' },
        { title: '지연 시간 최적화', status: 'locked' },
        { title: '로드 밸런싱', status: 'locked' },
        { title: '데이터 처리 최적화', status: 'locked' },
      ],
    },
  ],
  da: [
    {
      id: 'p1',
      title: 'Phase 1: 분석 기초',
      locked: false,
      steps: [
        { title: 'EDA 수행 과정', status: 'available' },
        { title: '데이터 분석가의 역할', status: 'locked' },
        { title: '혼동 행렬 활용', status: 'locked' },
        { title: '고객 세분화와 군집화', status: 'locked' },
        { title: '파생 변수와 특징 엔지니어링', status: 'locked' },
      ],
    },
  ],
};

const accent: Record<Role, { text: string; bg: string; from: string; border: string }> = {
  ds: { text: 'text-level-1', bg: 'bg-level-1', from: 'from-level-1', border: 'hover:border-level-1' },
  de: { text: 'text-level-2', bg: 'bg-level-2', from: 'from-level-2', border: 'hover:border-level-2' },
  da: { text: 'text-level-4', bg: 'bg-level-4', from: 'from-level-4', border: 'hover:border-level-4' },
};

const activities: CourseActivity[] = [
  { label: '질문 확인', description: '실제 면접에서 나올 법한 질문을 읽습니다', minutes: 1 },
  { label: '답변 작성', description: '내 말로 답변을 적어 봅니다', minutes: 5 },
  { label: '평가 기준 확인', description: '핵심 항목과 예시 답변을 비교합니다', minutes: 2 },
  { label: '자기 점검', description: '빠뜨린 항목을 체크하고 보완합니다', minutes: 2 },
];

export default function InterviewClient() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  if (selectedRole) {
    const role = roles.find((r) => r.id === selectedRole)!;

    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <button
          onClick={() => setSelectedRole(null)}
          className="flex items-center gap-1 text-sm text-gray1 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          {'면접 준비'}
        </button>

        <div className="mb-8 mt-4 flex items-center gap-4">
          <span className={`flex size-14 items-center justify-center rounded-2xl text-xl font-bold text-background ${ accent[role.id].bg }`}>
            {role.label}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-main">{role.fullLabel}</h1>
            <p className="mt-0.5 text-sm text-gray1">{role.description}</p>
          </div>
        </div>

        <CourseMap
          key={role.id}
          phases={samplePhases[role.id]}
          activities={activities}
          basePath={`/interview/${ role.id }`}
          startLabel="답변 연습하기"
          goalOf={(step) => `"${ step.title }"에 대해 면접관이 기대하는 핵심 항목을 빠짐없이 설명합니다.`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-main">{'면접 준비'}</h1>
      <p className="mt-1 text-sm text-gray1">{'직무를 선택하고 질문 하나씩 답변을 다듬어 갑니다'}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const preview = samplePhases[role.id][0]?.steps.slice(0, 3) ?? [];
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-light bg-background p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${ accent[role.id].border }`}
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b to-transparent opacity-15 ${ accent[role.id].from }`} />
              <span className={`relative text-3xl font-bold ${ accent[role.id].text }`}>{role.label}</span>
              <span className="relative mt-1 font-semibold text-main">{role.fullLabel}</span>
              <span className="relative mt-1 text-xs text-gray1">{role.description}</span>

              <ol className="relative mt-6 flex-1">
                {preview.map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${ accent[role.id].bg }`} />
                      {i < preview.length - 1 && <span className="my-1 w-px flex-1 bg-gray4" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-gray2">{`Q${ i + 1 }`}</p>
                      <p className="text-sm text-sub">{step.title}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="relative flex items-center justify-between border-t border-extreme-light pt-4">
                <span className="text-xs text-gray2">{`0 / ${ role.totalSteps } 질문`}</span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${ accent[role.id].text }`}>
                  {'시작하기'}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
