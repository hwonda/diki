import { Suspense } from 'react';
import { Metadata } from 'next';
import LearnClient from '@/components/learn/LearnClient';
import { getStageSummaries } from '@/content/terms';

export function generateMetadata(): Metadata {
  return {
    title: '학습하기',
    description: '데이터 개념을 입문부터 마스터까지 단계별로 학습합니다.',
  };
}

export default function LearnPage() {
  return (
    <Suspense>
      <LearnClient stages={getStageSummaries()} />
    </Suspense>
  );
}
