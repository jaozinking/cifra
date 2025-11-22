
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProductEditor from './components/ProductEditor';
import PublicStore from './components/PublicStore';
import Marketing from './components/Marketing';
import Settings from './components/Settings';
import Customers from './components/Customers';
import Auth from './components/Auth';
import { Product, ViewState } from './types';
import { StorageService } from './services/storage';
import { pbService } from './services/pbService';
import { useAuth } from './hooks/useAuth';
import { AlertOctagon } from 'lucide-react';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<ViewState | 'edit-product'>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicError, setPublicError] = useState('');

  useEffect(() => {
    // Check for public link simulation via URL params
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');

    if (productId) {
      // Try to get product from PocketBase first, fallback to localStorage
      pbService.products.getPublicProduct(productId)
        .then(product => {
          if (product) {
            setSelectedProduct(product);
            setActiveView('storefront');
            setLoading(false);
          } else {
            // Fallback to localStorage
            const allProducts = StorageService.getProducts();
            const product = allProducts.find(p => p.id === productId);
            if (product) {
              if (product.status === 'draft') {
                setPublicError('Этот товар еще не опубликован автором.');
              } else {
                setSelectedProduct(product);
                setActiveView('storefront');
              }
            } else {
              setPublicError('Товар не найден или был удален.');
            }
            setLoading(false);
          }
        })
        .catch(() => {
          // Fallback to localStorage on error
          const allProducts = StorageService.getProducts();
          const product = allProducts.find(p => p.id === productId);
          if (product) {
            if (product.status === 'draft') {
              setPublicError('Этот товар еще не опубликован автором.');
            } else {
              setSelectedProduct(product);
              setActiveView('storefront');
            }
          } else {
            setPublicError('Товар не найден или был удален.');
          }
          setLoading(false);
        });
    } else {
      // Simulate App Load
      setTimeout(() => setLoading(false), 600);
    }
  }, []);

  // Effect for Document Title management
  useEffect(() => {
    if (activeView === 'storefront' && selectedProduct) {
        document.title = `${selectedProduct.title} | Купить на Cifra`;
    } else if (activeView === 'dashboard') {
        document.title = `Дашборд | Cifra`;
    } else if (activeView === 'create-product') {
        document.title = `Новый продукт | Cifra`;
    } else {
        document.title = `Cifra | Digital Distribution`;
    }
  }, [activeView, selectedProduct]);

  const handleCreateProduct = (newProduct: Product) => {
    setActiveView('dashboard');
    setSelectedProduct(null);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setActiveView('storefront');
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveView('edit-product');
  }

  // Show auth screen if not authenticated (except for public product view)
  if (!isLoading && !isAuthenticated && activeView !== 'storefront' && !publicError) {
    return <Auth onSuccess={() => setLoading(false)} />;
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-zinc-500 font-mono text-sm animate-pulse">Загрузка Cifra...</div>
        </div>
      </div>
    );
  }

  // Public View Error State
  if (publicError) {
      return (
          <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
              <AlertOctagon className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Ошибка доступа</h1>
              <p className="text-zinc-400 mb-8">{publicError}</p>
              <button 
                onClick={() => {
                    window.history.pushState({}, '', window.location.pathname);
                    window.location.reload();
                }}
                className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
              >
                  Перейти на главную
              </button>
          </div>
      )
  }

  // Public View Mode (Simplified layout for customers)
  if (activeView === 'storefront' && selectedProduct) {
    // Get seller settings from PocketBase or localStorage fallback
    const getSellerSettings = async () => {
      try {
        if (isAuthenticated) {
          return await pbService.settings.getSettings();
        }
      } catch {
        // Fallback to localStorage
      }
      return StorageService.getSettings();
    };

    return (
      <PublicStore 
        product={selectedProduct} 
        sellerSettings={StorageService.getSettings()} // Will be updated when we migrate PublicStore
        onClose={() => {
            // If we are in "Public Link" mode (URL param exists), we might want to just reload to root, 
            // but for SPA behavior we just go back to dashboard and clear param
            window.history.pushState({}, '', window.location.pathname);
            if (isAuthenticated) {
              setActiveView('dashboard');
            }
            setSelectedProduct(null);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500/30">
      <Navbar 
        activeView={activeView === 'edit-product' ? 'create-product' : activeView} 
        onNavigate={(view) => {
          setActiveView(view);
          setSelectedProduct(null);
        }} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <Dashboard 
            onCreateClick={() => {
              setSelectedProduct(null);
              setActiveView('create-product');
            }}
            onProductClick={handleProductClick}
            onEditClick={handleEditProduct}
          />
        )}

        {(activeView === 'create-product' || activeView === 'edit-product') && (
          <ProductEditor 
            initialProduct={activeView === 'edit-product' ? selectedProduct : null}
            onBack={() => {
              setActiveView('dashboard');
              setSelectedProduct(null);
            }}
            onSave={handleCreateProduct}
          />
        )}

        {activeView === 'marketing' && (
          <Marketing />
        )}

        {activeView === 'customers' && (
          <Customers />
        )}

        {activeView === 'settings' && (
          <Settings />
        )}
      </main>
    </div>
  );
};

export default App;
