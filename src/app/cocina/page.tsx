import KDSPanel from '@/components/KDSPanel';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function CocinaPage() {
  return <KDSPanel />;
}
