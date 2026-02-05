import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext/ToastContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>,
)
