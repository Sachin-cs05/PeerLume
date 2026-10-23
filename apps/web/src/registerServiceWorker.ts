export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.info('PeerLume PWA service worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('PWA service worker registration failed:', err);
        });
    });
  }
}
