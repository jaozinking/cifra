'use client';

import ProductEditor from '@/components/ProductEditor';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';

export default function NewProductPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleSave = (product: Product) => {
    router.push('/dashboard');
  };

  return <ProductEditor initialProduct={null} onBack={handleBack} onSave={handleSave} />;
}

