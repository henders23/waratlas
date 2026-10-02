import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces'; // map labels only
import '@fontsource/libre-caslon-display';
import '@fontsource/libre-caslon-text/400.css';
import '@fontsource/libre-caslon-text/400-italic.css';
import '@fontsource-variable/source-sans-3';
import './styles.css';
import { Root } from './Root';

createRoot(document.getElementById('root')!).render(<Root />);
