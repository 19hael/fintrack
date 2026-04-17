import { useEffect, useState } from 'react'
import Modal from '../Modal'
import type { Category } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  initialValues?: Record<string, string>
  onSubmit: (values: Record<string, string>) => Promise<void> | void
  submitting?: boolean
  error?: string | null
}

export default function BulkBudgetModal({
  isOpen,
  onClose,
  categories,
  initialValues,
  onSubmit,
  submitting,
  error,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    setValues(initialValues ?? {})
  }, [initialValues, isOpen])

  const handleChange = (categoryId: string, value: string) => {
    setValues((prev) => ({ ...prev, [categoryId]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Presupuestos">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${cat.color}20` }}
            >
              {cat.emoji}
            </div>
            <span className="text-text-primary flex-1">{cat.name}</span>
            <input
              type="number"
              step="1000"
              min="0"
              value={values[cat.id] || ''}
              onChange={(e) => handleChange(cat.id, e.target.value)}
              className="w-28 bg-background-secondary border border-border-subtle rounded-lg px-3 py-2 text-text-primary font-mono text-right focus:outline-none focus:border-accent-blue transition-all"
              placeholder="0"
            />
          </div>
        ))}

        {error && <p className="text-status-error text-sm">{error}</p>}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-border-subtle text-text-secondary rounded-lg hover:border-text-muted transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSubmit(values)}
            disabled={submitting}
            className="flex-1 py-3 btn-primary rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
