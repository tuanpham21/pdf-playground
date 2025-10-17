import React from 'react'
import { createRoot } from 'react-dom/client'
import { TldrawApp } from './components/TldrawApp'
import 'tldraw/tldraw.css'
import './styles.css'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1 className="app-title">tldraw PDF Canvas</h1>
          <p className="app-subtitle">Interactive canvas with PDF background and custom tools</p>
        </div>
        <div className="tools-info">
          <span className="tool-badge">📊 Size Button (1)</span>
          <span className="tool-badge">📌 Pin (2)</span>
          <span className="tool-badge">📷 Screen Shot (3)</span>
        </div>
      </header>

      <div className="canvas-container">
        <TldrawApp />
      </div>
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  createRoot(container).render(<App />)
}
