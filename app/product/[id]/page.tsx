import { notFound } from 'next/navigation';
import PublicStoreClient from './PublicStoreClient';
import { getPublicProduct } from '@/lib/pocketbase-server';
import type { Metadata } from 'next';
import { Product, UserSettings } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const serverProduct = await getPublicProduct(id);
    if (!serverProduct) {
      return {
        title: 'Товар не найден | Cifra',
      };
    }

    return {
      title: `${serverProduct.title} | Купить на Cifra`,
      description: serverProduct.description.substring(0, 160),
      openGraph: {
        title: serverProduct.title,
        description: serverProduct.description.substring(0, 160),
        images: serverProduct.coverImage ? [serverProduct.coverImage] : [],
      },
    };
  } catch {
    return {
      title: 'Товар не найден | Cifra',
    };
  }
}

// Helper to convert server product to client Product type
function serverProductToProduct(serverProduct: any): Product {
  // Определяем файлы: приоритет S3, затем PocketBase
  const fileKeys = serverProduct.s3FileKeys || serverProduct.productFiles || [];
  
  return {
    id: serverProduct.id,
    title: serverProduct.title,
    description: serverProduct.description,
    priceRub: serverProduct.priceRub,
    category: serverProduct.category,
    coverImage: serverProduct.coverImage || '', // Уже обработан в getPublicProduct
    sales: serverProduct.sales || 0,
    revenue: serverProduct.revenue || 0,
    status: serverProduct.status,
    files: fileKeys, // S3 ключи или старые имена файлов
    createdAt: new Date(serverProduct.created).getTime(),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  let product: Product | null = null;
  let sellerSettings: UserSettings;

  try {
    // Try to get product from PocketBase (server-side)
    const serverProduct = await getPublicProduct(id);
    
    if (serverProduct) {
      product = serverProductToProduct(serverProduct);
      // Use default settings for public pages (StorageService uses localStorage, so we provide defaults)
      sellerSettings = {
        displayName: 'Продавец',
        bio: '',
        avatarUrl: '',
        accentColor: '#8b5cf6',
        emailNotifications: true,
      };
    } else {
      // Fallback to localStorage (client-side only, but we'll handle it in client component)
      // For SSR, we'll just return not found
      notFound();
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  if (product.status === 'draft') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Товар не опубликован</h1>
        <p className="text-zinc-400 mb-8">
          Этот товар еще не опубликован автором.
        </p>
      </div>
    );
  }

  return (
    <PublicStoreClient
      product={product}
      sellerSettings={sellerSettings}
    />
  );
}

