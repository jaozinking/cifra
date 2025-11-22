'use client';

import { useRouter } from 'next/navigation';
import PublicStore from '@/components/PublicStore';
import { Product, UserSettings } from '@/types';

export default function PublicStoreClient({
  product,
  sellerSettings,
}: {
  product: Product;
  sellerSettings: UserSettings;
}) {
  const router = useRouter();

  return (
    <PublicStore
      product={product}
      sellerSettings={sellerSettings}
      onClose={() => {
        router.push('/');
      }}
    />
  );
}

