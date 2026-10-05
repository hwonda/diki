import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LearnStepClient from '@/components/learn/LearnStepClient';
import { learnStages } from '@/content/learn';
import { getNeighborSteps, getStageSummaries, getTerm, getTermMap } from '@/content/terms';
import { buildLesson } from '@/content/generators';
import { transformToSlug } from '@/utils/filters';
import { TermData } from '@/types';

interface Props {
  params: { stage: string; phaseId: string; stepId: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return learnStages.flatMap((stage) => stage.phases.flatMap((phase) =>
    phase.steps.filter((slug) => getTerm(slug)).map((slug) => ({ stage: stage.id, phaseId: phase.id, stepId: slug }))
  ));
}

export function generateMetadata({ params }: Props): Metadata {
  const term = getTerm(params.stepId);
  return {
    title: term ? `${ term.title?.ko } 학습` : '학습하기',
    description: term?.description?.short,
    robots: { index: false, follow: true },
  };
}

export default function LearnStepPage({ params }: Props) {
  const stages = getStageSummaries();
  const stageIndex = stages.findIndex((s) => s.id === params.stage);
  const stage = stages[stageIndex];
  const phase = stage?.phases.find((p) => p.id === params.phaseId);
  const term = getTerm(params.stepId);
  if (!stage || !phase || !term || !phase.steps.some((s) => s.id === params.stepId)) notFound();

  const termMap = getTermMap();
  const courseOrder = stages.flatMap((s) => s.phases.flatMap((p) => p.steps.map((step) => step.id)));
  const earlier = courseOrder.slice(0, courseOrder.indexOf(params.stepId)).map((slug) => termMap.get(slug)).filter((t): t is TermData => !!t);
  const related = (term.terms ?? []).map((item) => {
    const slug = item.internal_link ? transformToSlug(item.internal_link) : '';
    return { name: item.term ?? '', description: item.description ?? '', href: termMap.has(slug) ? `/posts/${ slug }` : null };
  }).filter((item) => item.name);

  return (
    <LearnStepClient
      stage={stage}
      previousStage={stages[stageIndex - 1] ?? null}
      phaseId={phase.id}
      stepId={params.stepId}
      term={{ title: term.title?.ko ?? '', titleEn: term.title?.en ?? '' }}
      related={related}
      lesson={buildLesson(term, earlier)}
      neighbors={getNeighborSteps(stage.phases, phase.id, params.stepId, `/learn/${ stage.id }`)}
    />
  );
}
