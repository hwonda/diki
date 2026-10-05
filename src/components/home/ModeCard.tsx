'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ArrowRight, BookOpen, MessageSquare, Search } from 'lucide-react';

interface ModeCardProps {
  mode: 'learn' | 'interview' | 'dictionary';
}

interface TrailItem {
  label: string;
  title: string;
}

const modeConfig = {
  learn: {
    href: '/learn',
    icon: BookOpen,
    name: '학습하기',
    question: '데이터 개념을\n처음부터 쌓고 싶다면',
    button: '학습 시작하기',
    text: 'text-level-1',
    bg: 'bg-level-1',
    from: 'from-level-1',
    border: 'hover:border-level-1',
    trail: [
      { label: '입문', title: 'AI와 머신러닝의 큰 그림' },
      { label: '기초', title: '모델이 배우는 방식' },
      { label: '중급', title: '딥러닝 아키텍처' },
      { label: '고급 · 마스터', title: '생성형 AI와 LLM' },
    ],
  },
  interview: {
    href: '/interview',
    icon: MessageSquare,
    name: '면접 준비',
    question: '직무 면접 답변을\n다듬고 싶다면',
    button: '면접 연습하기',
    text: 'text-primary',
    bg: 'bg-primary',
    from: 'from-primary',
    border: 'hover:border-primary',
    trail: [
      { label: 'DS', title: '과대적합 감지와 방지' },
      { label: 'DE', title: '캐싱 전략' },
      { label: 'DA', title: 'EDA 수행 과정' },
      { label: '공통', title: '꼬리 질문 대비' },
    ],
  },
  dictionary: {
    href: '/posts',
    icon: Search,
    name: '용어사전',
    question: '모르는 용어를\n바로 찾고 싶다면',
    button: '용어 검색하기',
    text: 'text-level-4',
    bg: 'bg-level-4',
    from: 'from-level-4',
    border: 'hover:border-level-4',
    trail: [] as TrailItem[],
  },
};

export default function ModeCard({ mode }: ModeCardProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;
  const { terms } = useSelector((state: RootState) => state.terms);

  const trail: TrailItem[] = mode === 'dictionary'
    ? terms.slice(0, 4).map((term) => ({ label: term.title?.en ?? '', title: term.title?.ko ?? '' }))
    : config.trail;

  return (
    <Link
      href={config.href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-background p-6 transition-all duration-300 hover:scale-105"
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b to-transparent opacity-15 ${ config.from }`} />

      <div className="relative flex items-center gap-2">
        <span className={`flex size-8 items-center justify-center rounded-lg text-background ${ config.bg }`}>
          <Icon className="size-4" />
        </span>
        <span className={`text-sm font-semibold ${ config.text }`}>{config.name}</span>
      </div>

      <h2 className="relative mt-4 whitespace-pre-line text-xl font-bold leading-snug text-main">{config.question}</h2>

      <ol className="relative mt-6 flex-1">
        {trail.map((item, i) => (
          <li key={`${ item.label }-${ i }`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                style={{ transitionDelay: `${ i * 90 }ms` }}
                className={`mt-1.5 size-2 shrink-0 rounded-full transition-all duration-300 ${ config.bg } ${ i === 0 ? '' : 'opacity-40 group-hover:opacity-100' }`}
              />
              {i < trail.length - 1 && <span className="my-1 w-px flex-1 bg-gray4" />}
            </div>
            <div className="min-w-0 pb-4">
              <p className={`truncate text-xs font-medium ${ config.text }`}>{item.label}</p>
              <p className="truncate text-sm text-sub">{item.title}</p>
            </div>
          </li>
        ))}
      </ol>

      <span className={`relative mt-2 flex items-center justify-between border-t border-extreme-light pt-4 text-sm font-semibold ${ config.text }`}>
        {config.button}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
