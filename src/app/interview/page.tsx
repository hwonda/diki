import { Metadata } from 'next';
import InterviewClient from '@/components/interview/InterviewClient';

export function generateMetadata(): Metadata {
  return {
    title: '면접 준비 | Diki',
    description: 'DS · DE · DA 직무별 데이터 면접을 연습합니다.',
  };
}

export default function InterviewPage() {
  return <InterviewClient />;
}
