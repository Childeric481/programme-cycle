// Enregistrement du service worker et détection d'une nouvelle version.
// L'application ne recharge jamais seule : elle signale la version en attente,
// et c'est un geste (« Recharger ») qui l'active.

type Ecouteur = (disponible: boolean) => void;

let enAttente: ServiceWorker | null = null;
const ecouteurs = new Set<Ecouteur>();

function signaler(sw: ServiceWorker | null): void {
  enAttente = sw;
  for (const e of ecouteurs) e(sw !== null);
}

export function enregistrerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  const base = import.meta.env.BASE_URL;
  void (async () => {
    const reg = await navigator.serviceWorker.register(`${base}sw.js`, { scope: base });
    if (reg.waiting && navigator.serviceWorker.controller) signaler(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nouveau = reg.installing;
      nouveau?.addEventListener('statechange', () => {
        if (nouveau.state === 'installed' && navigator.serviceWorker.controller) signaler(nouveau);
      });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void reg.update().catch(() => undefined);
    });
  })().catch(() => undefined);
}

export function surNouvelleVersion(e: Ecouteur): () => void {
  ecouteurs.add(e);
  e(enAttente !== null);
  return () => {
    ecouteurs.delete(e);
  };
}

export function installerNouvelleVersion(): void {
  const sw = enAttente;
  if (!sw) return;
  let recharge = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recharge) return;
    recharge = true;
    window.location.reload();
  });
  sw.postMessage({ type: 'activer' });
}
