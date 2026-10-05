import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InterviewStepClient from '@/components/interview/InterviewStepClient';
import { interviewRoles } from '@/content/interview';
import { getNeighborSteps, getRoleSummaries, getTerm } from '@/content/terms';
import { buildInterview } from '@/content/generators';
import { RoleId } from '@/content/types';

interface Props {
  params: { role: string; phaseId: string; stepId: string };
}

export const dynamicParams = false;

const relevanceKey: Record<RoleId, 'scientist' | 'engineer' | 'analyst'> = { ds: 'scientist', de: 'engineer', da: 'analyst' };

export function generateStaticParams() {
  return interviewRoles.flatMap((role) => role.phases.flatMap((phase) =>
    phase.steps.filter((slug) => getTerm(slug)).map((slug) => ({ role: role.id, phaseId: phase.id, stepId: slug }))
  ));
}

export function generateMetadata({ params }: Props): Metadata {
  const term = getTerm(params.stepId);
  const role = interviewRoles.find((r) => r.id === params.role);
  return {
    title: term && role ? `${ term.title?.ko } ${ role.label } 면접 질문` : '면접 준비',
    description: term && role ? buildInterview(term, role.id).question : undefined,
  };
}

export default function InterviewStepPage({ params }: Props) {
  const role = getRoleSummaries().find((r) => r.id === params.role);
  const phase = role?.phases.find((p) => p.id === params.phaseId);
  const term = getTerm(params.stepId);
  if (!role || !phase || !term || !phase.steps.some((s) => s.id === params.stepId)) notFound();

  return (
    <InterviewStepClient
      role={role}
      phaseId={phase.id}
      stepId={params.stepId}
      termTitle={term.title?.ko ?? ''}
      reference={{
        short: term.description?.short ?? '',
        relevance: term.relevance?.[relevanceKey[role.id]]?.description ?? '',
        example: term.usecase?.example ?? '',
      }}
      content={buildInterview(term, role.id)}
      neighbors={getNeighborSteps(role.phases, phase.id, params.stepId, `/interview/${ role.id }`)}
    />
  );
}
