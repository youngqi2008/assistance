import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './app/App'
import { startStagingRrwebMonitor } from './recording/rrwebTestMonitorStore'
import { startEmbeddedVerificationRecorder } from './recording/verificationRecorder'
import './styles/globals.css'

function startApp() {
  startEmbeddedVerificationRecorder()
  startStagingRrwebMonitor()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

if (new URLSearchParams(window.location.search).get('debugVConsole') === '1') {
  void import('vconsole').then(({ default: VConsole }) => {
    new VConsole()
  }).catch((error: unknown) => {
    console.error('[verification] vConsole 加载失败', error)
  }).finally(startApp)
} else {
  startApp()
}
