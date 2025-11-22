'use client';

import { useRouter } from 'next/navigation';
import ProductEditor from '@/components/ProductEditor';
import type { Product } from '@/types';

export default function NewProductPage() {
	const router = useRouter();

	const handleBack = () => {
		router.push('/dashboard');
	};

	const handleSave = (_product: Product) => {
		router.push('/dashboard');
	};

	return <ProductEditor initialProduct={null} onBack={handleBack} onSave={handleSave} />;
}
