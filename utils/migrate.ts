import { StorageService } from '../services/storage';
import { pbService } from '../services/pbService';
import { Product, PromoCode, Sale, Payout, UserSettings } from '../types';

/**
 * Экспорт данных из localStorage
 */
export const exportFromLocalStorage = () => {
  const data = {
    products: StorageService.getProducts(),
    promos: StorageService.getPromos(),
    sales: StorageService.getSales(),
    payouts: StorageService.getPayouts(),
    settings: StorageService.getSettings(),
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cifra-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return data;
};

/**
 * Импорт данных в PocketBase
 * Требует аутентификации пользователя
 */
export const importToPocketBase = async (data: {
  products?: Product[];
  promos?: PromoCode[];
  sales?: Sale[];
  payouts?: Payout[];
  settings?: UserSettings;
}) => {
  const results = {
    products: { imported: 0, failed: 0 },
    promos: { imported: 0, failed: 0 },
    sales: { imported: 0, failed: 0 },
    payouts: { imported: 0, failed: 0 },
    settings: { imported: false, failed: false }
  };

  // Check authentication
  if (!pbService.auth.isAuthenticated()) {
    throw new Error('Требуется аутентификация для импорта данных');
  }

  // Import products
  if (data.products && data.products.length > 0) {
    for (const product of data.products) {
      try {
        const productData: Omit<Product, 'id' | 'createdAt'> = {
          title: product.title,
          description: product.description,
          category: product.category,
          priceRub: product.priceRub,
          coverImage: product.coverImage,
          sales: product.sales,
          revenue: product.revenue,
          status: product.status,
          files: product.files
        };
        await pbService.products.createProduct(productData);
        results.products.imported++;
      } catch (error) {
        console.error('Failed to import product:', product.title, error);
        results.products.failed++;
      }
    }
  }

  // Import promos
  if (data.promos && data.promos.length > 0) {
    for (const promo of data.promos) {
      try {
        await pbService.promos.createPromo(promo.code, promo.discountPercent);
        results.promos.imported++;
      } catch (error) {
        console.error('Failed to import promo:', promo.code, error);
        results.promos.failed++;
      }
    }
  }

  // Import sales
  if (data.sales && data.sales.length > 0) {
    for (const sale of data.sales) {
      try {
        await pbService.sales.createSale(sale.productId, sale.amount, sale.customerEmail);
        results.sales.imported++;
      } catch (error) {
        console.error('Failed to import sale:', sale.id, error);
        results.sales.failed++;
      }
    }
  }

  // Import payouts
  if (data.payouts && data.payouts.length > 0) {
    for (const payout of data.payouts) {
      try {
        await pbService.payouts.createPayout(payout.amount, payout.method || 'Карта');
        results.payouts.imported++;
      } catch (error) {
        console.error('Failed to import payout:', payout.id, error);
        results.payouts.failed++;
      }
    }
  }

  // Import settings
  if (data.settings) {
    try {
      await pbService.settings.updateSettings(data.settings);
      results.settings.imported = true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      results.settings.failed = true;
    }
  }

  return results;
};

/**
 * Автоматическая миграция из localStorage в PocketBase
 */
export const migrateFromLocalStorage = async () => {
  if (!pbService.auth.isAuthenticated()) {
    throw new Error('Требуется аутентификация для миграции данных');
  }

  // Export first as backup
  const data = exportFromLocalStorage();

  // Import to PocketBase
  const results = await importToPocketBase(data);

  return {
    backup: data,
    results
  };
};

/**
 * Загрузка данных из JSON файла
 */
export const loadFromFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Неверный формат файла'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
};

