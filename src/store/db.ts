// Persistance locale : IndexedDB, schéma versionné avec migrations (D.10).
// Magasins : réglages, séance en cours, journal des séances, historique par
// mouvement, décalages et sauts. Aucun serveur, aucune requête réseau.
//
// Sur iPhone, la connexion peut être perdue (« Connection to Indexed Database
// server lost », iOS 17.4 à 18) : la base est rouverte et l'opération rejouée.

const NOM = 'programme';
const VERSION = 1;

export type NomMagasin = 'reglages' | 'seance' | 'journal' | 'historique' | 'ajustements';

let ouverture: Promise<IDBDatabase> | null = null;

/** Chaque version du schéma ajoute ses changements, dans l'ordre. */
function migrer(db: IDBDatabase, ancienne: number): void {
  if (ancienne < 1) {
    db.createObjectStore('reglages');
    db.createObjectStore('seance');
    db.createObjectStore('journal', { keyPath: 'id' });
    const historique = db.createObjectStore('historique', { keyPath: ['seance', 'mouvement', 'date'] });
    historique.createIndex('parMouvement', ['seance', 'mouvement']);
    db.createObjectStore('ajustements', { keyPath: 'dateOrigine' });
  }
}

function ouvrir(): Promise<IDBDatabase> {
  ouverture ??= new Promise<IDBDatabase>((ok, ko) => {
    if (typeof indexedDB === 'undefined') {
      ko(new Error('IndexedDB indisponible'));
      return;
    }
    const requete = indexedDB.open(NOM, VERSION);
    requete.onupgradeneeded = (ev) => migrer(requete.result, ev.oldVersion);
    requete.onsuccess = () => {
      const db = requete.result;
      db.onversionchange = () => {
        db.close();
        ouverture = null;
      };
      db.onclose = () => {
        ouverture = null;
      };
      ok(db);
    };
    requete.onerror = () => {
      ouverture = null;
      ko(requete.error ?? new Error('Ouverture impossible'));
    };
  });
  return ouverture;
}

const connexionPerdue = (e: unknown): boolean =>
  e instanceof DOMException && (e.name === 'UnknownError' || e.name === 'InvalidStateError' || /connection/i.test(e.message));

async function operation<T>(
  magasin: NomMagasin,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest | null,
): Promise<T | undefined> {
  for (let essai = 0; ; essai++) {
    try {
      const db = await ouvrir();
      return await new Promise<T | undefined>((ok, ko) => {
        const tx = db.transaction(magasin, mode);
        const requete = action(tx.objectStore(magasin));
        tx.oncomplete = () => ok(requete ? (requete.result as T) : undefined);
        tx.onerror = () => ko(tx.error);
        tx.onabort = () => ko(tx.error ?? new Error('Transaction annulée'));
      });
    } catch (e) {
      if (essai === 0 && connexionPerdue(e)) {
        ouverture = null;
        continue;
      }
      throw e;
    }
  }
}

export const db = {
  async tout<T>(magasin: NomMagasin): Promise<T[]> {
    return (await operation<T[]>(magasin, 'readonly', (s) => s.getAll())) ?? [];
  },
  lire<T>(magasin: NomMagasin, cle: IDBValidKey): Promise<T | undefined> {
    return operation<T>(magasin, 'readonly', (s) => s.get(cle));
  },
  async ecrire(magasin: NomMagasin, valeur: unknown, cle?: IDBValidKey): Promise<void> {
    await operation(magasin, 'readwrite', (s) => (cle === undefined ? s.put(valeur) : s.put(valeur, cle)));
  },
  async supprimer(magasin: NomMagasin, cle: IDBValidKey): Promise<void> {
    await operation(magasin, 'readwrite', (s) => s.delete(cle));
  },
};

/** Demande au navigateur de ne pas effacer les données (Safari 15.2+, Chrome 55+). */
export function demanderPersistance(): void {
  try {
    void navigator.storage?.persist?.().catch(() => undefined);
  } catch {
    /* non disponible */
  }
}
