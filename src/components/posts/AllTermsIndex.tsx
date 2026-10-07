import Link from 'next/link';
import { TermData } from '@/types';

const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const MERGE: Record<string, string> = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' };
const LATIN_GROUP = 'A-Z';

function groupKey(title: string): string {
  const code = title.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const initial = CHOSEONG[Math.floor((code - 0xac00) / 588)];
    return MERGE[initial] ?? initial;
  }
  return LATIN_GROUP;
}

// 모든 용어를 서버 HTML의 링크로 노출해 검색엔진이 각 용어 페이지를 찾을 수 있게 한다
export default function AllTermsIndex({ terms }: { terms: TermData[] }) {
  const sorted = terms
    .filter((term) => term.title?.ko && term.url)
    .sort((a, b) => (a.title?.ko ?? '').localeCompare(b.title?.ko ?? '', 'ko'));

  const groups = new Map<string, TermData[]>();
  sorted.forEach((term) => {
    const key = groupKey(term.title?.ko ?? '');
    groups.set(key, [...(groups.get(key) ?? []), term]);
  });
  const orderedKeys = [...CHOSEONG.filter((c) => groups.has(c)), ...(groups.has(LATIN_GROUP) ? [LATIN_GROUP] : [])];

  return (
    <section aria-labelledby="all-terms-heading" className="mt-12">
      <h2 id="all-terms-heading" className="text-lg font-bold text-main">
        {'전체 용어 '}
        <span className="text-sm font-normal text-gray1">{`${ sorted.length }개`}</span>
      </h2>
      <p className="mt-1 text-sm text-gray1">{'가나다순으로 모든 데이터 용어를 찾아볼 수 있습니다'}</p>
      <dl className="mt-6 space-y-3">
        {orderedKeys.map((key) => (
          <div key={key} className="flex gap-4">
            <dt className="w-10 shrink-0 text-sm font-bold text-primary">{key}</dt>
            <dd className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {groups.get(key)?.map((term) => (
                <Link key={term.url} href={term.url ?? ''} className="text-sub hover:text-primary hover:underline">
                  {term.title?.ko}
                </Link>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
