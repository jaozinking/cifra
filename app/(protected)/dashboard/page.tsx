'use client';

import Dashboard from '@/components/Dashboard';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';

export default function DashboardPage() {
  const router = useRouter();

  const handleCreateClick = () => {
    router.push('/products/new');
  };

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleEditClick = (product: Product) => {
    router.push(`/products/${product.id}/edit`);
  };

  return (
    <Dashboard
      onCreateClick={handleCreateClick}
      onProductClick={handleProductClick}
      onEditClick={handleEditClick}
    />
  );
}

