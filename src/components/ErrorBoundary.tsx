import { Component, type ReactNode } from 'react'
import { controlClass } from './ThemeControls'

type State = { error?: Error }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = {}

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="card space-y-3 p-5 text-sm">
        <p className="font-medium">No se pudo mostrar esta pantalla.</p>
        <p className="text-muted-foreground">{this.state.error.message}</p>
        {/* recargar también recupera chunks de un deploy nuevo */}
        <button type="button" onClick={() => location.reload()} className={controlClass}>
          Recargar
        </button>
      </div>
    )
  }
}
