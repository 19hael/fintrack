import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      <div className="relative bg-base-200 border border-border-strong w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-8 border-b border-border-strong pb-4">
          <h2 className="text-label text-text-display text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="font-mono text-xs text-text-disabled hover:text-text-display transition-colors uppercase tracking-widest"
          >
            [X]
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}