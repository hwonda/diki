import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InterviewRoleClient from '@/components/interview/InterviewRoleClient';
import { interviewRoles } from '@/content/interview';
import { getRoleSummaries } from '@/content/terms';

interface Props {
  params: { role: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return interviewRoles.map((role) => ({ role: role.id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const role = interviewRoles.find((r) => r.id === params.role);
  return {
    title: role ? `${ role.fullLabel } 면접 준비` : '면접 준비',
    description: role ? `${ role.fullLabel }(${ role.label }) 면접 질문을 Phase별로 연습합니다. ${ role.description }` : undefined,
  };
}

export default function InterviewRolePage({ params }: Props) {
  const role = getRoleSummaries().find((r) => r.id === params.role);
  if (!role) notFound();
  return <InterviewRoleClient role={role} />;
}
