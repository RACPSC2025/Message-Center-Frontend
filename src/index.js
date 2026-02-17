
/*
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import {
  createHashRouter,
  HashRouter,
  Navigate,
  RouterProvider
} from 'react-router-dom';
import App from './App';
import MessageCenter from './features/MessageCenter';
import MessageCenterNotifications from './features/MessageCenterNotifications';
import './lib/i18n';
import store from './store';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import App from './App';
import client from './apolloClient';
import store from './store';
import { loadRuntimeConfig } from './config/runtimeConfig';
import './lib/i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Show loading screen while config loads
root.render(
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #1976d2',
        borderRadius: '50%',
        margin: '0 auto 16px',
        animation: 'spin 1s linear infinite'
      }}></div>
      <h2 style={{ margin: '0 0 8px', color: '#333' }}>Cargando configuración...</h2>
      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Por favor espere...</p>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Load runtime config before rendering the app
loadRuntimeConfig()
  .then((config) => {
    console.log('✅ Configuración cargada exitosamente');
    console.log('📍 API URL:', config.apiUrl);
    console.log('🏠 Base Name:', config.baseName);
    console.log('🌍 Environment:', config.environment);
    
    // Render the actual app after config is loaded
    root.render(
      <ApolloProvider client={client}>
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>
      </ApolloProvider>
    );
  })
  .catch((error) => {
    console.error('❌ Error al cargar configuración:', error);
    console.warn('⚠️ Usando configuración por defecto desde .env');
    
    // Render app anyway with fallback config from .env
    root.render(
      <ApolloProvider client={client}>
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>
      </ApolloProvider>
    );
  });

// import TheWorkInProgress from './components/TheWorkInProgress';

// const router = createBrowserRouter(
// const router = createHashRouter(
//   [
//     {
//       path: '/',
//       element: <App />,
//       children: [
//         {
//           path: '',
//           element: <Navigate to="view/notifications" replace />
//         },
//         {
//           path: 'view/',
//           element: <MessageCenter />,
//           children: [
//             {
//               path: '',
//               element: <Navigate to="notifications" replace />
//             },
//             {
//               path: 'notifications',
//               element: <MessageCenterNotifications />
//             },
//             {
//               path: 'events',
//               lazy: () => import('./features/MessageCenterEvents')
//             },
//             {
//               path: 'inspections',
//               lazy: () => import('./features/MessageCenterEvents')
//             },
//             {
//               path: 'actions',
//               lazy: () => import('./features/MessageCenterActions')
//             },
//             {
//               path: 'findings',
//               lazy: () => import('./features/findings/Findings')
//             },
//             {
//               path: 'LegalMatriz',
//               lazy: () => import('./features/MessageCenterLegalMatriz')
//             }
//           ]
//         }
//       ]
//     }
//   ]
//   // { basename: process.env.REACT_APP_BASE_NAME }
// );

/*
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </ApolloProvider>
);
*/


