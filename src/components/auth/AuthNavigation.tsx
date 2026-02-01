import { Link } from '@tanstack/react-router'
import { Compass, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AuthNavigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none text-slate-900">
                MissionSend
              </span>
              <span className="text-xs leading-none text-slate-600">
                Fund Your Mission
              </span>
            </div>
          </Link>

          {/* Back to Home Link */}
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
