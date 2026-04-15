'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackCampaignPageView } from '@/lib/campaignTracking';

export default function CampaignTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackCampaignPageView();
  }, [pathname, searchParams]);

  return null;
}
