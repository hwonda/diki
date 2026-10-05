'use client';

import { Fragment, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, PartyPopper, RotateCcw, X } from 'lucide-react';
import StepShell from '@/components/course/StepShell';
import MarkdownContent from '@/components/posts/MarkdownContent';
import { LessonCard, LessonChoice, LessonItem, LessonMatch, LessonQuestion, StageSummary, StepLink } from '@/content/types';
import { computePhaseStates, isCourseComplete, stepKey } from '@/content/progress';
import { useCourseProgress } from '@/hooks/useCourseProgress';

interface LearnStepClientProps {
  stage: StageSummary;
  previousStage: StageSummary | null;
  phaseId: string;
  stepId: string;
  term: { title: string; titleEn: string };
  related: { name: string; description: string; href: string | null }[];
  lesson: LessonItem[];
  neighbors: { prev: StepLink | null; next: StepLink | null };
}

interface Checked {
  correct: boolean;
  chosen?: string;
}

interface AnswerRecord {
  selected: string | null;
  assigned: Record<number, number>;
  checked: Checked;
}

const optionKeys = ['A', 'B', 'C', 'D'];

function ScrollArea({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (el) setMoreBelow(el.scrollTop + el.clientHeight < el.scrollHeight - 8);
  }, []);

  useEffect(() => {
    update();
    const observer = new ResizeObserver(update);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [update]);

  return (
    <div className="relative mt-3">
      <div ref={ref} onScroll={update} className="overflow-y-auto pr-2" style={{ maxHeight: 'max(240px, calc(100vh - 500px))' }}>
        {children}
      </div>
      {moreBelow && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end justify-center bg-gradient-to-t from-background to-transparent">
          <span className="flex items-center gap-1 rounded-full bg-extreme-light px-3 py-1 text-xs text-gray1">
            <ChevronDown className="size-3" />
            {'스크롤해서 더 읽기'}
          </span>
        </div>
      )}
    </div>
  );
}

function CardView({ card }: { card: LessonCard }) {
  return (
    <div>
      <p className="text-xs font-semibold text-primary">{card.label}</p>
      {card.markdown ? (
        <ScrollArea>
          <div className="prose max-w-none text-justify">
            <MarkdownContent content={card.body} />
          </div>
        </ScrollArea>
      ) : (
        <p className="mt-3 text-lg font-semibold leading-relaxed text-main">{card.body}</p>
      )}
      {card.tags && card.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {card.tags.map((tag) => <span key={tag} className="rounded-full bg-extreme-light px-2.5 py-1 text-xs text-gray1">{tag}</span>)}
        </div>
      )}
    </div>
  );
}

function QuestionTag({ tag }: { tag?: string }) {
  if (!tag) return null;
  return <span className="mb-2 inline-block rounded-full bg-extreme-light px-2.5 py-1 text-xs font-medium text-primary">{tag}</span>;
}

function ChoiceView({ question, selected, checked, onSelect }: {
  question: LessonChoice;
  selected: string | null;
  checked: Checked | null;
  onSelect: (slug: string)=> void;
}) {
  return (
    <div>
      <QuestionTag tag={question.tag} />
      <p className="text-lg font-semibold text-main">{question.prompt}</p>
      {question.context && <p className="mt-3 rounded-xl bg-extreme-light px-4 py-3 text-sm leading-relaxed text-sub">{question.context}</p>}
      <div className="mt-4 space-y-2" role="radiogroup">
        {question.options.map((option, i) => {
          const isSelected = selected === option.slug;
          const isAnswer = option.slug === question.answer;
          const tone = !checked
            ? isSelected ? 'ring-2 ring-primary' : 'hover:bg-gray4'
            : isAnswer ? 'ring-2 ring-level-2' : isSelected ? 'ring-2 ring-level-5' : 'opacity-40';
          return (
            <button
              key={option.slug}
              role="radio"
              aria-checked={isSelected}
              disabled={!!checked}
              onClick={() => onSelect(option.slug)}
              className={`flex w-full items-start gap-3 rounded-xl bg-extreme-light px-4 py-3 text-left text-sm transition-all ${ tone }`}
            >
              <span className={`flex size-6 shrink-0 items-center justify-center rounded-md bg-background text-xs font-bold ${ isSelected ? 'text-primary' : 'text-gray2' }`}>
                {optionKeys[i]}
              </span>
              <span className="flex-1 leading-relaxed text-sub">{option.text}</span>
              {checked && isAnswer && <Check className="size-4 shrink-0 text-level-2" />}
              {checked && isSelected && !isAnswer && <X className="size-4 shrink-0 text-level-5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchView({ question, assigned, activeLeft, activeRight, checked, onLeft, onRight }: {
  question: LessonMatch;
  assigned: Record<number, number>;
  activeLeft: number | null;
  activeRight: number | null;
  checked: Checked | null;
  onLeft: (i: number)=> void;
  onRight: (i: number)=> void;
}) {
  const rightToLeft = Object.fromEntries(Object.entries(assigned).map(([l, r]) => [r, Number(l)]));
  return (
    <div>
      <QuestionTag tag={question.tag} />
      <p className="text-lg font-semibold text-main">{question.prompt}</p>
      <p className="mt-1 text-xs text-gray2">{'용어와 설명을 하나씩 눌러 연결하세요'}</p>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {question.pairs.map((pair, i) => {
          const linked = assigned[i] !== undefined;
          const ok = checked && assigned[i] === i;
          const pairIndex = question.rightOrder[i];
          const owner = rightToLeft[pairIndex];
          return (
            <Fragment key={pair.left}>
              <button
                disabled={!!checked}
                onClick={() => onLeft(i)}
                className={`col-span-2 flex size-full items-center gap-2 rounded-xl bg-extreme-light p-3 text-left text-sm font-semibold transition-all sm:px-4
                  ${ checked ? ok ? 'text-level-2 ring-2 ring-level-2' : 'text-level-5 ring-2 ring-level-5'
              : activeLeft === i ? 'text-primary ring-2 ring-primary' : 'text-main hover:bg-gray4' }`}
              >
                <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs ${ linked || activeLeft === i ? 'bg-primary text-background' : 'bg-gray4 text-gray1' }`}>{i + 1}</span>
                {pair.left}
              </button>
              <button
                disabled={!!checked}
                onClick={() => onRight(pairIndex)}
                className={`col-span-3 flex size-full items-center gap-2 rounded-xl bg-extreme-light p-3 text-left text-sm transition-all sm:px-4
                  ${ activeRight === pairIndex ? 'ring-2 ring-primary' : 'hover:bg-gray4' }`}
              >
                <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs ${ owner !== undefined ? 'bg-primary text-background' : 'bg-background text-gray3' }`}>
                  {owner !== undefined ? owner + 1 : ''}
                </span>
                <span className="flex-1 leading-relaxed text-sub">{question.pairs[pairIndex].right}</span>
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function LearnStepClient({ stage, previousStage, phaseId, stepId, term, related, lesson, neighbors }: LearnStepClientProps) {
  const { ready, state, recordAttempt } = useCourseProgress();
  const items = useMemo(() => new Map(lesson.map((item) => [item.id, item])), [lesson]);
  const questionIds = lesson.filter((item) => item.kind !== 'card').map((item) => item.id);

  const [queue, setQueue] = useState<string[]>(() => lesson.map((item) => item.id));
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Record<number, number>>({});
  const [activeLeft, setActiveLeft] = useState<number | null>(null);
  const [activeRight, setActiveRight] = useState<number | null>(null);
  const [checked, setChecked] = useState<Checked | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [history, setHistory] = useState<Record<number, AnswerRecord>>({});
  const [finished, setFinished] = useState(false);
  const recorded = useRef(false);

  const key = stepKey(stage.id, phaseId, stepId);
  const phases = useMemo(() => computePhaseStates(
    stage.phases,
    stage.id,
    state.learn,
    !previousStage || isCourseComplete(previousStage.phases, previousStage.id, state.learn)
  ), [stage, previousStage, state.learn]);
  const phase = phases.find((p) => p.id === phaseId);
  const stepIndex = phase?.steps.findIndex((s) => s.id === stepId) ?? -1;
  const step = phase?.steps[stepIndex];
  const playable = ready && (step?.status === 'available' || step?.status === 'completed');
  const firstAvailable = phases.flatMap((p) => p.steps.map((s) => ({ p, s }))).find(({ s }) => s.status === 'available');

  const current = items.get(queue[position]);
  const isRetry = position >= lesson.length;
  const canCheck = current?.kind === 'choice' ? !!selected
    : current?.kind === 'match' ? Object.keys(assigned).length === current.pairs.length : false;

  const check = useCallback(() => {
    if (!current || current.kind === 'card' || !canCheck) return;
    const correct = current.kind === 'choice'
      ? selected === current.answer
      : current.pairs.every((_, i) => assigned[i] === i);
    const result = { correct, chosen: selected ?? undefined };
    setChecked(result);
    setHistory((prev) => ({ ...prev, [position]: { selected, assigned, checked: result } }));
    if (!correct) {
      setMistakes((prev) => (prev.includes(current.id) ? prev : [...prev, current.id]));
      setQueue((prev) => [...prev, current.id]);
    }
  }, [current, canCheck, selected, assigned, position]);

  // 이미 푼 문제로 돌아가면 당시 답과 채점 결과를 그대로 보여준다
  const goTo = useCallback((target: number) => {
    const saved = history[target];
    setSelected(saved?.selected ?? null);
    setAssigned(saved?.assigned ?? {});
    setChecked(saved?.checked ?? null);
    setActiveLeft(null);
    setActiveRight(null);
    setPosition(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [history]);

  const next = useCallback(() => {
    if (position + 1 < queue.length) {
      goTo(position + 1);
      return;
    }
    setFinished(true);
    if (!recorded.current) {
      recorded.current = true;
      recordAttempt('learn', key, { completed: true, review: mistakes.length > 0 });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [position, queue.length, goTo, recordAttempt, key, mistakes.length]);

  const back = useCallback(() => {
    if (position > 0) goTo(position - 1);
  }, [position, goTo]);

  const link = (left: number, right: number) => {
    setAssigned((prev) => {
      const cleaned = Object.fromEntries(Object.entries(prev).filter(([key, value]) => Number(key) !== left && value !== right));
      return { ...cleaned, [left]: right };
    });
    setActiveLeft(null);
    setActiveRight(null);
  };

  const restart = () => {
    setQueue(lesson.map((item) => item.id));
    setPosition(0);
    setHistory({});
    setSelected(null);
    setAssigned({});
    setChecked(null);
    setMistakes([]);
    setFinished(false);
    recorded.current = false;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished || !current || !playable) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (current.kind === 'card' || checked) next();
        else check();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
      }
      const index = ['1', '2', '3', '4'].indexOf(e.key);
      if (index >= 0 && current.kind === 'choice' && !checked && current.options[index]) setSelected(current.options[index].slug);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, checked, finished, next, check, back, playable]);

  const progress = finished ? 1 : position / queue.length;
  const firstTryCorrect = questionIds.filter((id) => !mistakes.includes(id)).length;

  return (
    <StepShell
      ready={ready}
      status={step?.status}
      mapHref={`/learn?stage=${ stage.id }`}
      mapLabel={`${ stage.label } 코스 지도`}
      eyebrow={`${ stage.label } · ${ phase?.title } · Step ${ stepIndex + 1 }/${ phase?.steps.length }`}
      title={term.title}
      subtitle={term.titleEn}
      progress={progress}
      narrow
      hideNav={playable}
      neighbors={neighbors}
      firstAvailable={firstAvailable ? { href: `/learn/${ stage.id }/${ firstAvailable.p.id }/${ firstAvailable.s.id }`, title: firstAvailable.s.title } : null}
    >
      {finished ? (
        <div className="animate-slideDown">
          <div className="flex flex-col items-center py-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-background">
              <PartyPopper className="size-7" />
            </span>
            <p className="mt-4 text-2xl font-bold text-main">{'레슨 완료!'}</p>
            <p className="mt-1 text-sm text-gray1">{`'${ term.title }' Step을 마쳤습니다`}</p>
            <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
              <div className="rounded-xl bg-extreme-light p-3">
                <p className="text-xs text-gray2">{'첫 시도 정답'}</p>
                <p className="mt-1 text-xl font-bold text-main">{`${ firstTryCorrect } / ${ questionIds.length }`}</p>
              </div>
              <div className="rounded-xl bg-extreme-light p-3">
                <p className="text-xs text-gray2">{'복습할 문제'}</p>
                <p className={`mt-1 text-xl font-bold ${ mistakes.length ? 'text-level-4' : 'text-level-2' }`}>{mistakes.length}</p>
              </div>
            </div>
          </div>

          {mistakes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-main">{'다시 볼 문제'}</p>
              <ul className="mt-2 space-y-2">
                {mistakes.map((id) => {
                  const q = items.get(id) as LessonQuestion;
                  return (
                    <li key={id} className="rounded-xl bg-extreme-light px-4 py-3 text-sm">
                      <p className="font-medium text-sub">{q.prompt}</p>
                      <p className="mt-1 text-xs text-gray1">
                        {q.kind === 'choice' ? q.explanation : q.pairs.map((p) => `${ p.left }: ${ p.right }`).join(' / ')}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-main">{'함께 보면 좋은 용어'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {related.slice(0, 6).map((item) => (item.href ? (
                  <Link key={item.name} href={item.href} className="rounded-full bg-extreme-light px-3 py-1 text-sm text-primary hover:bg-gray4">{item.name}</Link>
                ) : (
                  <span key={item.name} className="rounded-full bg-extreme-light px-3 py-1 text-sm text-gray1">{item.name}</span>
                )))}
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-2 sm:grid-cols-3">
            <button onClick={restart} className="flex items-center justify-center gap-2 rounded-xl bg-extreme-light py-3 text-sm font-semibold text-sub hover:bg-gray4 hover:text-primary">
              <RotateCcw className="size-4" />
              {'다시 하기'}
            </button>
            <Link href={`/posts/${ stepId }`} className="flex items-center justify-center gap-2 rounded-xl bg-extreme-light py-3 text-sm font-semibold text-sub hover:bg-gray4 hover:text-primary">
              <BookOpen className="size-4" />
              {'전체 설명 보기'}
            </Link>
            <Link
              href={neighbors.next?.href ?? `/learn?stage=${ stage.id }`}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              {neighbors.next ? '다음 Step' : '코스 지도로'}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      ) : current ? (
        <div>
          <div key={`${ current.id }-${ position }`} className="animate-slideDown" style={{ minHeight: 'max(360px, calc(100vh - 460px))' }}>
            {isRetry && <p className="mb-3 text-xs font-semibold text-level-4">{'틀렸던 문제를 다시 풀어 봐요'}</p>}
            {current.kind === 'card' && <CardView card={current} />}
            {current.kind === 'choice' && <ChoiceView question={current} selected={selected} checked={checked} onSelect={setSelected} />}
            {current.kind === 'match' && (
              <MatchView
                question={current}
                assigned={assigned}
                activeLeft={activeLeft}
                activeRight={activeRight}
                checked={checked}
                onLeft={(l) => {
                  if (activeRight !== null) {
                    link(l, activeRight);
                  } else {
                    setAssigned((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => Number(key) !== l)));
                    setActiveLeft(l);
                  }
                }}
                onRight={(r) => {
                  if (activeLeft !== null) link(activeLeft, r);
                  else setActiveRight(r);
                }}
              />
            )}
            {checked && current.kind !== 'card' && (
              <div className="mt-4 rounded-2xl bg-extreme-light p-4">
                <p className={`flex items-center gap-1.5 font-bold ${ checked.correct ? 'text-level-2' : 'text-level-5' }`}>
                  {checked.correct ? <Check className="size-5" /> : <X className="size-5" />}
                  {checked.correct ? '정답이에요!' : '아쉬워요, 끝에서 한 번 더 풀어 봐요'}
                </p>
                {current.kind === 'choice' ? (
                  <>
                    <p className="mt-1 text-sm text-sub">{current.explanation}</p>
                    {!checked.correct && current.linkOptions && checked.chosen && (
                      <p className="mt-1 text-xs text-gray1">
                        {`선택한 답은 '${ current.options.find((o) => o.slug === checked.chosen)?.title }'에 해당합니다. `}
                        <Link href={`/posts/${ checked.chosen }`} className="text-primary hover:underline">{'용어 보기'}</Link>
                      </p>
                    )}
                  </>
                ) : (
                  <ul className="mt-1 space-y-0.5 text-sm text-sub">
                    {current.pairs.map((p) => <li key={p.left}>{`${ p.left } — ${ p.right }`}</li>)}
                  </ul>
                )}
              </div>
            )}

          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <div>
          {!finished && current && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={back}
                  disabled={position === 0}
                  aria-label="이전"
                  className="flex shrink-0 items-center justify-center gap-1 rounded-xl bg-extreme-light px-4 py-3 text-sm font-semibold text-sub transition-colors hover:bg-gray4 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-extreme-light disabled:hover:text-sub"
                >
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">{'이전'}</span>
                </button>
                <button
                  onClick={current.kind === 'card' || checked ? next : check}
                  disabled={current.kind !== 'card' && !checked && !canCheck}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray4 disabled:text-gray2
                  ${ checked ? checked.correct ? 'bg-level-2' : 'bg-level-5' : 'bg-primary' }`}
                >
                  {current.kind === 'card' || checked ? '계속' : '확인'}
                  <ArrowRight className="size-4" />
                </button>
              </div>
              <p className="mt-2 hidden text-center text-xs text-gray3 sm:block">
                {current.kind === 'choice' && !checked ? '1~4로 선택 · ←로 이전 · →로 확인 · ←로 이전' : '←로 이전 · →로 계속'}
              </p>
            </>
          )}

          <nav className="mt-3 flex justify-between gap-4 text-sm">
            {neighbors.prev ? (
              <Link href={neighbors.prev.href} className="flex min-w-0 items-center gap-1 text-gray1 hover:text-primary">
                <ArrowLeft className="size-4 shrink-0" />
                <span className="truncate">{neighbors.prev.title}</span>
              </Link>
            ) : <span />}
            {neighbors.next && (
              <Link href={neighbors.next.href} className="flex min-w-0 items-center gap-1 text-gray1 hover:text-primary">
                <span className="truncate">{neighbors.next.title}</span>
                <ArrowRight className="size-4 shrink-0" />
              </Link>
            )}
          </nav>
        </div>
      </div>
    </StepShell>
  );
}
