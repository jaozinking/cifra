/**
 * Server-side PocketBase utilities
 * For SSR/SSG pages that need to fetch data from PocketBase
 */

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

export interface ServerProduct {
  id: string;
  title: string;
  description: string;
  priceRub: number;
  category: string;
  coverImage: string;
  sales: number;
  revenue: number;
  status: string;
  productFiles: string[];
  created: string;
  owner: string;
}

/**
 * Fetch a public product from PocketBase (server-side)
 * This works without authentication for published products
 */
export async function getPublicProduct(id: string): Promise<ServerProduct | null> {
  try {
    const response = await fetch(`${PB_URL}/api/collections/products/records/${id}`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Check if product is published
    if (data.status !== 'published') {
      return null;
    }

    // Build cover image URL if exists
    let coverImage = '';
    if (data.coverImage) {
      coverImage = `${PB_URL}/api/files/${data.collectionId}/${data.id}/${data.coverImage}`;
    }

    return {
      ...data,
      coverImage,
    };
  } catch (error) {
    console.error('Error fetching public product:', error);
    return null;
  }
}

