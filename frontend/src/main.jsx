import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "bootstrap/dist/js/bootstrap.bundle.js"
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import GlobalNotificationListener from './context/GlobalNotificationListener.jsx';
import useGlobalReminder from './context/useGlobalReminder.js';

const AppInitializer = () => {
  useGlobalReminder();
  return null;
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AppInitializer />
      <GlobalNotificationListener />
      <App />
    </ThemeProvider>
  </BrowserRouter>
);