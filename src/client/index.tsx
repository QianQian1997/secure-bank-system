import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const rootEle = document.getElementById('root');
if (!rootEle) {
    throw new Error('Root element not founds');
}
const root = createRoot(rootEle);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
