import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { startEmbeddedVerificationRecorder } from '../recording/verificationRecorder'
import { StaticVerificationApp } from './StaticVerificationApp'
import '../styles/globals.css'

startEmbeddedVerificationRecorder()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StaticVerificationApp />
  </StrictMode>,
)
