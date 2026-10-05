'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RoleId, RoleSummary } from '@/content/types';
import { stepKey } from '@/content/progress';
import { useCourseProgress } from '@/hooks/useCourseProgress';

export const roleAccent: Record<RoleId, { text: string; bg: string; from: string; border: string }> = {
  ds: { text: 'text-level-1', bg: 'bg-level-1', from: 'from-level-1', border: 'hover:border-level-1' },
  de: { text: 'text-level-2', bg: 'bg-level-2', from: 'from-level-2', border: 'hover:border-level-2' },
  da: { text: 'text-level-4', bg: 'bg-level-4', from: 'from-level-4', border: 'hover:border-level-4' },
};

export default function InterviewClient({ roles }: { roles: RoleSummary[] }) {
  const { state } = useCourseProgress();

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-main">{'면접 준비'}</h1>
      <p className="mt-1 text-sm text-gray1">{'직무를 선택하고 질문 하나씩 답변을 다듬어 갑니다'}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const steps = role.phases.flatMap((phase) => phase.steps.map((step) => ({ phase, step })));
          const done = steps.filter(({ phase, step }) => state.interview[stepKey(role.id, phase.id, step.id)]?.completed).length;
          const preview = role.phases[0]?.steps.slice(0, 3) ?? [];
          const accent = roleAccent[role.id];
          return (
            <Link
              key={role.id}
              href={`/interview/${ role.id }`}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-light bg-background p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${ accent.border }`}
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b to-transparent opacity-15 ${ accent.from }`} />
              <span className={`relative text-3xl font-bold ${ accent.text }`}>{role.label}</span>
              <span className="relative mt-1 font-semibold text-main">{role.fullLabel}</span>
              <span className="relative mt-1 text-xs text-gray1">{role.description}</span>

              <ol className="relative mt-6 flex-1">
                {preview.map((step, i) => (
                  <li key={step.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${ accent.bg }`} />
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
                <span className="text-xs text-gray2">{`${ done } / ${ steps.length } 질문 · ${ role.phases.length } Phase`}</span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${ accent.text }`}>
                  {done > 0 ? '이어서 하기' : '시작하기'}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
