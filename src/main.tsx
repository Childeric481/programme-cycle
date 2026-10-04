import { render } from 'preact';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import { App } from './app/App';
import { enregistrerServiceWorker } from './app/pwa';

const racine = document.getElementById('app');
if (racine) render(<App />, racine);
enregistrerServiceWorker();
