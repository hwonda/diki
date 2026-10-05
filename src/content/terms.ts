import fs from 'fs';
import path from 'path';
import { TermData } from '@/types';
import { learnStages } from './learn';
import { interviewRoles } from './interview';
import { PhaseDefinition, PhaseSummary, RoleSummary, StageSummary, StepLink } from './types';

let cache: Map<string, TermData> | null = null;

export function termSlug(term: TermData): string {
  return term.url?.split('/').pop() ?? '';
}

// Redux 등 부수 효과 없이 terms.json만 읽는다
export function getTermMap(): Map<string, TermData> {
  if (cache) return cache;
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'terms.json');
    const terms = JSON.parse(fs.readFileSync(filePath, 'utf8')) as TermData[];
    cache = new Map(terms.filter((t) => t.publish !== false).map((t) => [termSlug(t), t]));
  } catch (error) {
    console.error('terms.json 읽기 오류:', error);
    cache = new Map();
  }
  return cache;
}

export function getTerm(slug: string): TermData | undefined {
  return getTermMap().get(slug);
}

function summarizePhases(phases: PhaseDefinition[]): PhaseSummary[] {
  const terms = getTermMap();
  return phases.map((phase) => ({
    id: phase.id,
    title: phase.title,
    steps: phase.steps
      .filter((slug) => terms.has(slug))
      .map((slug) => {
        const term = terms.get(slug)!;
        return { id: slug, title: term.title?.ko ?? slug, summary: term.description?.short ?? '' };
      }),
  }));
}

export function getStageSummaries(): StageSummary[] {
  return learnStages.map((stage) => ({
    id: stage.id,
    label: stage.label,
    description: stage.description,
    phases: summarizePhases(stage.phases),
  }));
}

export function getRoleSummaries(): RoleSummary[] {
  return interviewRoles.map((role) => ({
    id: role.id,
    label: role.label,
    fullLabel: role.fullLabel,
    description: role.description,
    phases: summarizePhases(role.phases),
  }));
}

export function getNeighborSteps(phases: PhaseSummary[], phaseId: string, stepId: string, basePath: string) {
  const flat = phases.flatMap((phase) => phase.steps.map((step) => ({ phaseId: phase.id, step })));
  const index = flat.findIndex((item) => item.phaseId === phaseId && item.step.id === stepId);
  const toLink = (item?: (typeof flat)[number]): StepLink | null =>
    item ? { href: `${ basePath }/${ item.phaseId }/${ item.step.id }`, title: item.step.title } : null;
  return { prev: toLink(flat[index - 1]), next: toLink(flat[index + 1]) };
}
