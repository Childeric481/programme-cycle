// Sons synthétisés avec Web Audio, aucun fichier audio (E.6).
// Le contexte se déverrouille au premier toucher de la séance. Sur iPhone, la
// session audio « ambient » mêle les sons à la musique sans l'interrompre.
// Le réglage son coupe les sons, jamais la vibration.

interface SessionAudio {
  type: string;
}

let ctx: AudioContext | null = null;
let actif = true;
let bruitCache: AudioBuffer | null = null;

export function sonActif(): boolean {
  return actif;
}

export function reglerSon(on: boolean): void {
  actif = on;
}

export function deverrouillerAudio(): void {
  try {
    if (!ctx) {
      const session = (navigator as Navigator & { audioSession?: SessionAudio }).audioSession;
      if (session) session.type = 'ambient';
      ctx = new AudioContext({ latencyHint: 'interactive' });
    }
    if (ctx.state !== 'running') void ctx.resume();
  } catch {
    ctx = null;
  }
}

function contexte(): AudioContext | null {
  if (!actif || !ctx) return null;
  if (ctx.state !== 'running') void ctx.resume();
  return ctx;
}

function bruit(c: AudioContext): AudioBuffer {
  if (bruitCache && bruitCache.sampleRate === c.sampleRate) return bruitCache;
  const b = c.createBuffer(1, Math.floor(c.sampleRate * 0.25), c.sampleRate);
  const d = b.getChannelData(0);
  let x = 0x51f3a7;
  for (let i = 0; i < d.length; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    d[i] = ((x >>> 0) / 0xffffffff) * 2 - 1;
  }
  bruitCache = b;
  return b;
}

function enveloppe(c: AudioContext, t: number, crete: number, attaque: number, declin: number): GainNode {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(crete, t + attaque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attaque + declin);
  return g;
}

/** Clic de série : bref et discret, un disque qui se plaque contre l'autre. */
export function clic(retardS = 0): void {
  const c = contexte();
  if (!c) return;
  const t = c.currentTime + retardS;
  const src = c.createBufferSource();
  src.buffer = bruit(c);
  const filtre = c.createBiquadFilter();
  filtre.type = 'bandpass';
  filtre.frequency.value = 2200;
  filtre.Q.value = 1.1;
  src.connect(filtre).connect(enveloppe(c, t, 0.32, 0.002, 0.04)).connect(c.destination);
  src.start(t);
  src.stop(t + 0.06);
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(190, t);
  o.frequency.exponentialRampToValueAtTime(75, t + 0.08);
  o.connect(enveloppe(c, t, 0.34, 0.003, 0.08)).connect(c.destination);
  o.start(t);
  o.stop(t + 0.1);
}

/** Tic des trois dernières secondes. */
export function tic(): void {
  const c = contexte();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.value = 1240;
  o.connect(enveloppe(c, t, 0.2, 0.003, 0.05)).connect(c.destination);
  o.start(t);
  o.stop(t + 0.07);
}

/**
 * Choc de fin de repos : deux partiels non harmoniques, attaque très courte,
 * décroissance d'environ 400 ms, un soupçon de bruit. Évoque le métal sans
 * imiter un enregistrement.
 */
export function choc(): void {
  const c = contexte();
  if (!c) return;
  const t = c.currentTime;
  const partiels: [number, number, number][] = [
    [392, 0.3, 0.42],
    [1043, 0.16, 0.3],
  ];
  for (const [freq, crete, declin] of partiels) {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(enveloppe(c, t, crete, 0.002, declin)).connect(c.destination);
    o.start(t);
    o.stop(t + declin + 0.05);
  }
  const src = c.createBufferSource();
  src.buffer = bruit(c);
  const filtre = c.createBiquadFilter();
  filtre.type = 'highpass';
  filtre.frequency.value = 3200;
  src.connect(filtre).connect(enveloppe(c, t, 0.07, 0.001, 0.03)).connect(c.destination);
  src.start(t);
  src.stop(t + 0.05);
}

/** Vibration Android (absente sur iPhone). Indépendante du réglage son. */
export function vibrer(motif: number | number[]): void {
  try {
    navigator.vibrate?.(motif);
  } catch {
    /* pas de vibration disponible */
  }
}
