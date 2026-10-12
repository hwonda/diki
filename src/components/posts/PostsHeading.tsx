'use client';

import { useSearchParams } from 'next/navigation';

export function PostsHeadingView({ search }: { search: boolean }) {
  if (search) {
    return <h1 className="text-2xl font-bold text-main">{'검색'}</h1>;
  }
  return (
    <>
      <h1 className="text-2xl font-bold text-main">{'용어사전'}</h1>
      <p className="mt-1 text-sm text-gray1">{'데이터 용어의 뜻과 쓰임을 한곳에서 찾아봅니다'}</p>
    </>
  );
}

// 헤더 검색으로 들어왔거나(mode=search) 검색어가 있으면 '검색' 제목만 보여준다
export default function PostsHeading() {
  const searchParams = useSearchParams();
  const search = searchParams.get('mode') === 'search' || !!searchParams.get('q');
  return <PostsHeadingView search={search} />;
}
