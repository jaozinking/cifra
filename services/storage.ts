
import { Product, PromoCode, Sale, UserSettings, Payout } from '../types';
import { MOCK_PRODUCTS, MOCK_PROMOS } from '../constants';

const KEYS = {
  PRODUCTS: 'cifra_products',
  PROMOS: 'cifra_promos',
  SALES: 'cifra_sales',
  SETTINGS: 'cifra_settings',
  PAYOUTS: 'cifra_payouts',
};

// Initial Defaults
const DEFAULT_SETTINGS: UserSettings = {
  displayName: 'Алексей Кодер',
  bio: 'Создаю полезные инструменты для React разработчиков. Пилю контент с 2020 года.',
  avatarUrl: '', // empty means default placeholder
  accentColor: '#8b5cf6',
  emailNotifications: true,
};

export const StorageService = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    if (!data) {
      // Initialize with mock data if empty
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(MOCK_PRODUCTS));
      return MOCK_PRODUCTS;
    }
    return JSON.parse(data);
  },

  saveProduct: (product: Product): void => {
    const products = StorageService.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.unshift(product);
    }
    
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: (id: string): void => {
    const products = StorageService.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(filtered));
  },

  getPromos: (): PromoCode[] => {
    const data = localStorage.getItem(KEYS.PROMOS);
    if (!data) {
      localStorage.setItem(KEYS.PROMOS, JSON.stringify(MOCK_PROMOS));
      return MOCK_PROMOS;
    }
    return JSON.parse(data);
  },

  savePromos: (promos: PromoCode[]): void => {
    localStorage.setItem(KEYS.PROMOS, JSON.stringify(promos));
  },

  getSales: (): Sale[] => {
    const data = localStorage.getItem(KEYS.SALES);
    return data ? JSON.parse(data) : [];
  },

  recordSale: (productId: string, price: number, customerEmail: string): Sale => {
    const products = StorageService.getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) throw new Error("Product not found");

    // Monetization Logic: 5% + 30 RUB fee
    const platformFee = Math.round(price * 0.05 + 30);
    const netAmount = price - platformFee;

    const newSale: Sale = {
      id: Date.now().toString(),
      productId,
      productTitle: products[productIndex].title,
      amount: price,
      platformFee,
      netAmount,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' }),
      customerEmail
    };

    // Update Sales History
    const sales = StorageService.getSales();
    sales.push(newSale);
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));

    // Update Product Stats
    products[productIndex].sales += 1;
    products[productIndex].revenue += netAmount; // Only add net revenue to product stats
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));

    return newSale;
  },

  getSettings: (): UserSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (data) {
        const settings = JSON.parse(data);
        // Migration support for old data
        if (settings.emailNotifications === undefined) settings.emailNotifications = true;
        return settings;
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings: (settings: UserSettings): void => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getPayouts: (): Payout[] => {
    const data = localStorage.getItem(KEYS.PAYOUTS);
    return data ? JSON.parse(data) : [];
  },

  requestPayout: (amount: number): Payout => {
    const payouts = StorageService.getPayouts();
    const newPayout: Payout = {
      id: Date.now().toString(),
      amount,
      status: 'completed', // Instant simulation
      date: new Date().toLocaleDateString('ru-RU'),
      method: 'Карта •••• 4582'
    };
    payouts.unshift(newPayout);
    localStorage.setItem(KEYS.PAYOUTS, JSON.stringify(payouts));
    return newPayout;
  },

  getAvailableBalance: (): number => {
    const products = StorageService.getProducts();
    const totalNetRevenue = products.reduce((acc, p) => acc + p.revenue, 0);
    
    const payouts = StorageService.getPayouts();
    const totalWithdrawn = payouts.reduce((acc, p) => acc + p.amount, 0);

    return Math.max(0, totalNetRevenue - totalWithdrawn);
  },
  
  // Helper to clear data for testing
  reset: () => {
    localStorage.clear();
    window.location.reload();
  }
};
