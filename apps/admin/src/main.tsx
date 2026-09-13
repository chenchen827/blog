import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AntdProvider } from '@repo/shared'

import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AntdProvider glassModal>
      <App />
    </AntdProvider>
  </StrictMode>,
)
