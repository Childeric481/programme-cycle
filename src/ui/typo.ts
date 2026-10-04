// Typographie française à l'affichage. Le contenu reste stocké tel quel
// (contenu verrouillé) ; seule sa composition change à l'écran :
// apostrophe typographique, espaces insécables avant « : ; ! ? » et dans les
// guillemets, chiffre et unité solidaires.

const INSECABLE = ' ';
const FINE = ' ';

export function typo(texte: string): string {
  return texte
    .replace(/'/g, '’')
    .replace(/ :/g, `${INSECABLE}:`)
    .replace(/ ([;!?])/g, `${FINE}$1`)
    .replace(/« /g, `«${INSECABLE}`)
    .replace(/ »/g, `${INSECABLE}»`)
    .replace(/(\d) (×|kg|cm|min|s|m|h|g|%)(?=[\s.,;)]|$)/g, `$1${INSECABLE}$2`)
    .replace(/× (\d|\()/g, `×${INSECABLE}$1`);
}
