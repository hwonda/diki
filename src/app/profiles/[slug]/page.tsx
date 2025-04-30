import { fetchProfilesData, fetchTermsByAuthor, fetchTermsByContributor } from '@/utils/fetchData';
import { dikiMetadata } from '@/constants';
import { Metadata } from 'next';
import ProfileClient from '@/components/profiles/ProfileClient';
import Footer from '@/components/common/Footer';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const profiles = await fetchProfilesData();
  const profile = profiles.find((p) => p.username === params.slug);

  if (!profile) {
    return {
      title: '프로필을 찾을 수 없습니다',
      description: '요청하신 프로필을 찾을 수 없습니다.',
    };
  }

  return {
    title: `${ profile.name } 프로필`,
    description: `${ profile.name }님의 프로필 페이지입니다.`,
    alternates: {
      canonical: `${ dikiMetadata.url }/profiles/${ params.slug }`,
    },
    keywords: ['디키', 'Diki', profile.name, '프로필', '데이터전문가'],
    openGraph: {
      title: `${ profile.name } 프로필`,
      description: `${ profile.name }님의 프로필 페이지입니다.`,
      url: `${ dikiMetadata.url }/profiles/${ params.slug }`,
      siteName: dikiMetadata.title,
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: profile.thumbnail || dikiMetadata.thumbnailURL,
          width: 1200,
          height: 630,
          alt: `${ profile.name } 프로필`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ profile.name } 프로필`,
      description: `${ profile.name }님의 프로필 페이지입니다.`,
      images: [profile.thumbnail || dikiMetadata.thumbnailURL],
    },
  };
}

export async function generateStaticParams() {
  const profiles = await fetchProfilesData();
  return profiles.map((profile) => ({
    slug: profile.username,
  }));
}

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const profiles = await fetchProfilesData();
  const profile = profiles.find((p) => p.username === params.slug);

  if (!profile) {
    return (
      <>
        <h1 className="text-2xl font-bold">{'프로필을 찾을 수 없습니다'}</h1>
        <p>{'요청하신 프로필을 찾을 수 없습니다.'}</p>
      </>
    );
  }

  // 두 데이터를 모두 가져옵니다
  const [posts, contributions] = await Promise.all([
    fetchTermsByAuthor(params.slug),
    fetchTermsByContributor(params.slug),
  ]);

  // 중복 제거(같은 글이 작성과 기여 모두에 포함될 수 있으므로)
  const allTerms = [...posts];

  // 이미 포함되지 않은 기여 글만 추가
  contributions.forEach((term) => {
    if (!allTerms.some((existingTerm) => existingTerm.id === term.id)) {
      allTerms.push(term);
    }
  });

  return (
    <>
      <div className="flex flex-col gap-5">
        <ProfileClient
          initialTerms={allTerms}
          username={params.slug}
          activeTab="all"
          postsCount={posts.length}
          contributeCount={contributions.length}
          profile={profile}
        />
      </div>
      <div className='block sm:hidden'>
        <Footer />
      </div>
    </>
  );
}
