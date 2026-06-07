import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#111' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>Something went wrong</p>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}>Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)
