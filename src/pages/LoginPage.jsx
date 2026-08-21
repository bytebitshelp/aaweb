import { Link } from 'react-router-dom'
import LoginForm from '../components/Auth/LoginForm'

const LoginPage = () => {
  return (
    <div className="min-h-[70vh] bg-cream flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <LoginForm onToggleMode={() => window.location.assign('/')} />
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/" className="text-forest-green hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
