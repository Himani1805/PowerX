import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import './index.css';

// Import Redux Store
import { store } from './app/store.js'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode: For additional checks in development
  <React.StrictMode>
    {/* Connect App to Redux Store using Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
