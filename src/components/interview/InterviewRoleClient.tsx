'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CourseMap, { CourseActivity } from '@/components/course/CourseMap';
import { RoleSummary } from '@/content/types';
import { computePhaseStates } from '@/content/progress';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { roleAccent } from './InterviewClient';

const activities: CourseActivity[] = [
  { label: '질문 확인', description: '실제 면접에서 나올 법한 질문을 읽습니다', minutes: 1 },
  { label: '답변 작성', description: '내 말로 답변을 적어 봅니다', minutes: 5 },
  { label: '평가 기준 확인', description: '핵심 항목과 참고 자료를 비교합니다', minutes: 2 },
  { label: '자기 점검', description: '빠뜨린 항목을 체크하고 보완합니다', minutes: 2 },
];

export default function InterviewRoleClient({ role }: { role: RoleSummary }) {
  const { ready, state } = useCourseProgress();
  const phases = computePhaseStates(role.phases, role.id, state.interview);

  return (
    <div className="py-8">
      <Link href="/interview" className="flex w-fit items-center gap-1 text-sm text-gray1 transition-colors hover:text-primary">
        <ArrowLeft className="size-4" />
        {'면접 준비'}
      </Link>

      <div className="mb-8 mt-4 flex items-center gap-4">
        <span className={`flex size-14 items-center justify-center rounded-2xl text-xl font-bold text-background ${ roleAccent[role.id].bg }`}>
          {role.label}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-main">{role.fullLabel}</h1>
          <p className="mt-0.5 text-sm text-gray1">{role.description}</p>
        </div>
      </div>

      <CourseMap
        key={`${ role.id }-${ ready }`}
        phases={phases}
        activities={activities}
        basePath={`/interview/${ role.id }`}
        startLabel="답변 연습하기"
      />
    </div>
  );
}
