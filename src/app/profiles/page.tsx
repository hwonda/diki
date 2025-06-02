import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

export default function ProfilesPage() {
  return notFound();
}