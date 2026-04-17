import { useState } from 'react'
import Sidebar from './Sidebar'
import SarcasticQuote from './SarcasticQuote'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-base-100 relative z-10 font-sans">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-base-100 border-b border-border-strong flex items-center justify-between px-6 z-50">
        <h1 className="text-display text-lg tracking-tighter">
          FinTrack
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-base-100/90 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`lg:block ${sidebarOpen ? 'block' : 'hidden'} fixed left-0 top-0 h-screen z-50`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="lg:ml-60 pt-16 lg:pt-0 min-h-screen relative flex flex-col bg-base-100">
        <div className="absolute top-8 right-8 z-40 hidden lg:block">
           <SarcasticQuote />
        </div>
        <div className="p-4 sm:p-8 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}