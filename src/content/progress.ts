import { PhaseSummary } from './types';

export type StepStatus = 'completed' | 'available' | 'locked' | 'draft';

export interface ProgressRecord {
  completed: boolean;
  review: boolean;
}

export interface StepState {
  id: string;
  title: string;
  summary: string;
  status: StepStatus;
  review: boolean;
}

export interface PhaseState {
  id: string;
  title: string;
  locked: boolean;
  completed: boolean;
  steps: StepState[];
}

export const stepKey = (scope: string, phaseId: string, stepId: string) => `${ scope }/${ phaseId }/${ stepId }`;

// 앞 Phase를 모두 완료해야 다음 Phase가, 앞 Step을 완료해야 다음 Step이 열린다
export function computePhaseStates(
  phases: PhaseSummary[],
  scope: string,
  records: Record<string, ProgressRecord>,
  courseUnlocked = true
): PhaseState[] {
  let previousPhaseDone = courseUnlocked;

  return phases.map((phase) => {
    const locked = !previousPhaseDone;
    let previousStepDone = !locked;

    const steps = phase.steps.map((step) => {
      const record = records[stepKey(scope, phase.id, step.id)];
      const completed = !!record?.completed;
      const status: StepStatus = completed ? 'completed' : previousStepDone ? 'available' : 'locked';
      previousStepDone = completed;
      return { ...step, status, review: !!record?.review };
    });

    const completed = steps.length > 0 && steps.every((s) => s.status === 'completed');
    previousPhaseDone = completed;
    return { id: phase.id, title: phase.title, locked, completed, steps };
  });
}

export function isCourseComplete(phases: PhaseSummary[], scope: string, records: Record<string, ProgressRecord>) {
  return phases.every((phase) => phase.steps.every((step) => records[stepKey(scope, phase.id, step.id)]?.completed));
}
