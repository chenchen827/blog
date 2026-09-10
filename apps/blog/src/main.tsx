import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AntdProvider } from '@repo/shared'

import App from './App'
import { AuthProvider } from './auth/AuthContext'
import 'antd/dist/reset.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AntdProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AntdProvider>
  </StrictMode>,
)
