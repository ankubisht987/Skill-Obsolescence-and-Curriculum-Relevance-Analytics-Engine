import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#141e2e',
              color: '#dde4f0',
              border: '1px solid #1e2d45',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'Syne, sans-serif',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#141e2e' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#141e2e' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
