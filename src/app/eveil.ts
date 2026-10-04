import { useEffect } from 'preact/hooks';

// L'écran ne s'éteint pas pendant une séance active (Screen Wake Lock).
// Le verrou tombe quand la page est masquée : il est redemandé au retour.
// Sans l'API (ou sur iPhone avant iOS 18.4 en application installée), rien ne casse.

export function useEcranAllume(actif: boolean): void {
  useEffect(() => {
    if (!actif || !('wakeLock' in navigator)) return undefined;
    let verrou: WakeLockSentinel | null = null;
    let fini = false;
    const demander = async (): Promise<void> => {
      if (fini || document.visibilityState !== 'visible') return;
      try {
        verrou = await navigator.wakeLock.request('screen');
      } catch {
        verrou = null;
      }
    };
    void demander();
    const auRetour = (): void => {
      if (document.visibilityState === 'visible') void demander();
    };
    document.addEventListener('visibilitychange', auRetour);
    return () => {
      fini = true;
      document.removeEventListener('visibilitychange', auRetour);
      void verrou?.release().catch(() => undefined);
    };
  }, [actif]);
}
