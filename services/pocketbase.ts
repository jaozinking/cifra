import PocketBase from 'pocketbase';

// Support both Vite (import.meta.env) and Next.js (process.env)
// In Next.js, use NEXT_PUBLIC_ prefix for client-side env vars
const getPBUrl = () => {
  // Check if we're in Next.js environment
  if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__) {
    return process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  }
  // Check if we're in Vite environment
  // @ts-ignore - Vite env variables
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POCKETBASE_URL) {
    // @ts-ignore - Vite env variables
    return import.meta.env.VITE_POCKETBASE_URL;
  }
  // Fallback
  return process.env.NEXT_PUBLIC_POCKETBASE_URL || process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
};

const PB_URL = getPBUrl();

export const pb = new PocketBase(PB_URL);

// Enable auto cancellation for pending requests
pb.autoCancellation(false);

// Debug: Log all requests (only in development, if VITE_DEBUG_POCKETBASE=true)
if (typeof window !== 'undefined') {
  // Support both Vite and Next.js env vars
  let debugEnabled = false;
  try {
    // @ts-ignore - Vite env variables
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEBUG_POCKETBASE === 'true') {
      debugEnabled = true;
    }
  } catch {
    // Ignore if import.meta is not available
  }
  debugEnabled = debugEnabled || 
    process.env.NEXT_PUBLIC_DEBUG_POCKETBASE === 'true' ||
    process.env.VITE_DEBUG_POCKETBASE === 'true';
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

