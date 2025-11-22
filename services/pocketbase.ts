import PocketBase from 'pocketbase';

// @ts-ignore - Vite env variables
const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(PB_URL);

// Enable auto cancellation for pending requests
pb.autoCancellation(false);

// Debug: Log all requests (only in development, if VITE_DEBUG_POCKETBASE=true)
if (typeof window !== 'undefined') {
  // @ts-ignore - Vite env variables
  const debugEnabled = import.meta.env?.VITE_DEBUG_POCKETBASE === 'true';
  if (debugEnabled) {
    pb.beforeSend = function (url, options) {
      console.log('[PocketBase] Request:', {
        url,
        method: options.method || 'GET',
        hasAuth: !!(options.headers as any)?.['Authorization'] || !!(options.headers as any)?.['authorization']
      });
      return { url, options };
    };
  }
}

// Load auth data from localStorage if available
if (typeof window !== 'undefined') {
  const authData = localStorage.getItem('pocketbase_auth');
  if (authData) {
    try {
      pb.authStore.loadFromCookie(document.cookie);
    } catch (e) {
      // If cookie loading fails, try loading from localStorage
      try {
        const parsed = JSON.parse(authData);
        pb.authStore.save(parsed.token, parsed.model);
      } catch (e2) {
        // Ignore if both fail
      }
    }
  }
}

// Save auth data to localStorage and cookie on change
pb.authStore.onChange((token, model) => {
  if (typeof window !== 'undefined') {
    if (model && token) {
      // Save to localStorage
      localStorage.setItem('pocketbase_auth', JSON.stringify({ token, model }));
      // Save to cookie
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
    } else {
      // Clear both
      localStorage.removeItem('pocketbase_auth');
      document.cookie = '';
    }
  }
});

export default pb;

