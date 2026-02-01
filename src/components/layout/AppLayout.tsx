import { useState, useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { cn } from '@/lib/utils'
import type { AccountType } from '@/types'

interface AppLayoutProps {
  title?: string
  accountType?: AccountType
  children?: React.ReactNode
}

export function AppLayout({
  title,
  accountType = 'missionary',
  children,
}: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save collapsed state to localStorage
  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
  }

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar
          isCollapsed={isCollapsed}
          onToggle={handleToggle}
          accountType={accountType}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="fixed left-0 top-0 z-50 md:hidden"
            >
              <AppSidebar
                isCollapsed={false}
                onToggle={() => setIsMobileMenuOpen(false)}
                accountType={accountType}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="min-h-screen flex flex-col md:ml-0">
        {/* Desktop: Animated margin based on sidebar state */}
        <motion.div
          initial={false}
          animate={{
            marginLeft:
              typeof window !== 'undefined' && window.innerWidth >= 768
                ? isCollapsed
                  ? 72
                  : 240
                : 0,
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="min-h-screen flex flex-col"
        >
          <AppHeader
            title={title}
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
          />

          <main className="flex-1 p-4 md:p-6">{children || <Outlet />}</main>
        </motion.div>
      </div>
    </div>
  )
}

// Export a simpler version for pages that manage their own layout
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('w-full max-w-7xl mx-auto', className)}>{children}</div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
