import { useEffect, useState } from 'react'
import Modal from '../Modal'
import type { Category } from '../../types'

interface BudgetFormValues {
  category_id: string
  monthly_limit: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  initial?: BudgetFormValues | null
  onSubmit: (values: BudgetFormValues) => Promise<void> | void
  submitting?: boolean
  error?: string | null
}

export default function BudgetFormModal({
  isOpen,
  onClose,
  categories,
  initial,
  onSubmit,
  submitting,
  error,
}: Props) {
  const [formData, setFormData] = useState<BudgetFormValues>({ category_id: '', monthly_limit: '' })

  useEffect(() => {
    setFormData(initial ?? { category_id: '', monthly_limit: '' })
  }, [initial, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Presupuesto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">Categoría</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full bg-background-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-blue transition-all"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-text-secondary text-sm mb-2">Límite Mensual</label>
          <input
            type="number"
            step="1000"
            min="0"
            value={formData.monthly_limit}
            onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
            className="w-full bg-background-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary font-mono focus:outline-none focus:border-accent-blue transition-all"
            placeholder="0"
            required
          />
        </div>

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
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 btn-primary rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
