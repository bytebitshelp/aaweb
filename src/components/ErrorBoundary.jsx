import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  handleReload = () => {
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <img src="/logo.jpg" alt="Arty Affairs" className="w-20 h-20 object-cover rounded-xl mx-auto mb-4" />
            <h1 className="font-display text-3xl text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-600 mb-8">
              Please refresh the page. If this keeps happening, try signing in again.
            </p>
            <button onClick={this.handleReload} className="btn-primary">
              Go home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
