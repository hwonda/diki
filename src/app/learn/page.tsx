import { Metadata } from 'next';
import LearnClient from '@/components/learn/LearnClient';

export function generateMetadata(): Metadata {
  return {
    title: '학습하기 | Diki',
    description: '데이터 개념을 입문부터 마스터까지 단계별로 학습합니다.',
  };
}

export default function LearnPage() {
  return <LearnClient />;
}
