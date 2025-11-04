import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ErrorBoundary from "./components/auth/ErrorBoundary";
import { AuthProvider } from './context/AuthContext.jsx';
import { ProductProvider } from './context/ProductContext.jsx';
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import theme from './theme'; // Import your custom theme

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ProductProvider>
            <ThemeProvider theme={theme}> {/* Wrap App with ThemeProvider */}
              <App />
            </ThemeProvider>
          </ProductProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
