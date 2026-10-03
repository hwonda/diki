import LogoAnimation from '@/components/common/LogoAnimation';
import RecentTerms from '@/components/posts/RecentTerms';
import ModeCard from '@/components/home/ModeCard';
import HowItWorks from '@/components/home/HowItWorks';
import { Metadata } from 'next';
import { dikiMetadata } from '@/constants';
import JsonLdSchema, { generateWebSiteSchema, generateOrganizationSchema } from '@/components/meta/JsonLdSchema';

export function generateMetadata(): Metadata {
  return {
    title: dikiMetadata.title,
    description: dikiMetadata.description,
    alternates: {
      canonical: dikiMetadata.url,
    },
    openGraph: {
      title: dikiMetadata.title,
      description: dikiMetadata.description,
      url: dikiMetadata.url,
      siteName: dikiMetadata.title,
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: dikiMetadata.thumbnailURL,
          width: 1200,
          height: 630,
          alt: dikiMetadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dikiMetadata.title,
      description: dikiMetadata.description,
      images: [dikiMetadata.thumbnailURL],
    },
  };
}

export default async function Home() {
  return (
    <>
      <JsonLdSchema
        id="website-schema"
        schema={generateWebSiteSchema()}
      />
      <JsonLdSchema
        id="organization-schema"
        schema={generateOrganizationSchema()}
      />
      <section className="relative flex flex-col items-center overflow-x-clip px-4 pt-8 text-center md:pt-12">
        <div className="pointer-events-none absolute left-1/2 top-16 size-72 -translate-x-1/2 md:size-96 rounded-full bg-primary opacity-10 blur-3xl" />
        <LogoAnimation fontSize='7vw' />
        <h1 className="relative mt-6 text-2xl font-bold leading-tight text-main sm:text-3xl md:text-4xl">
          {'데이터 개념부터 직무 면접까지'}
        </h1>
        <p className="relative mt-3 whitespace-nowrap text-gray1 md:text-lg">
          {'용어를 찾고, 익히고, 면접에서 설명하세요.'}
        </p>
      </section>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 px-4 md:mt-20 md:grid-cols-3 md:gap-6">
        <ModeCard mode="learn" />
        <ModeCard mode="interview" />
        <ModeCard mode="dictionary" />
      </div>

      <HowItWorks />

      <div className="mx-auto mb-16 mt-32 max-w-5xl px-4 md:mb-24 md:mt-40">
        <RecentTerms />
      </div>
    </>
  );
}
