import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    const msg = this.state.error?.message || 'UNKNOWN_ERROR'

    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="nothing-container max-w-lg w-full">
          <p className="text-label text-status-error mb-4">[ SYSTEM_FAULT ]</p>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
            Algo se rompio.
          </h1>
          <p className="text-text-muted text-sm mb-6">
            Un error no capturado detuvo la app. Los detalles estan abajo.
          </p>

          <pre className="bg-base-100 border border-border-strong p-4 text-xs font-mono text-status-error whitespace-pre-wrap break-words mb-6 max-h-48 overflow-auto">
            {msg}
          </pre>

          <div className="flex gap-4">
            <button onClick={this.handleReset} className="btn-nothing flex-1">
              [ RETRY ]
            </button>
            <button onClick={this.handleReload} className="btn-nothing flex-1 border-text-display text-text-display">
              [ RELOAD ]
            </button>
          </div>
        </div>
      </div>
    )
  }
}
