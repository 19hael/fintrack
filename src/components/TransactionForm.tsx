import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { transactionSchema, formatZodError } from '../lib/schemas'
import type { Category, Transaction } from '../types'

interface Props {
  onClose: () => void
  onSuccess: () => void
  editTransaction?: Transaction | null
}

export default function TransactionForm({ onClose, onSuccess, editTransaction }: Props) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchCategories()
    if (editTransaction) {
      setFormData({
        amount: String(editTransaction.amount),
        description: editTransaction.description || '',
        category_id: editTransaction.category_id || '',
        type: editTransaction.type,
        date: editTransaction.date,
      })
    }
  }, [editTransaction])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id)
      .order('name')
    setCategories((data as Category[]) || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSubmitError(null)

    const parsed = transactionSchema.safeParse(formData)
    if (!parsed.success) {
      setErrors(formatZodError(parsed.error))
      return
    }

    setLoading(true)
    try {
      const payload = { user_id: user!.id, ...parsed.data }

      const { error } = editTransaction
        ? await supabase.from('transactions').update(payload).eq('id', editTransaction.id)
        : await supabase.from('transactions').insert(payload)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving transaction:', error)
      setSubmitError(error.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const update = (patch) => setFormData({ ...formData, ...patch })

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label className="text-label block mb-2">AMOUNT_CRC</label>
        <input
          type="number"
          step="1"
          min="1"
          value={formData.amount}
          onChange={(e) => update({ amount: e.target.value })}
          className="input-nothing"
          placeholder="0"
          aria-invalid={!!errors.amount}
        />
        {errors.amount && <p className="text-status-error text-xs font-mono mt-2">[{errors.amount}]</p>}
      </div>

      <div>
        <label className="text-label block mb-2">DESCRIPTION</label>
        <input
          type="text"
          maxLength={200}
          value={formData.description}
          onChange={(e) => update({ description: e.target.value })}
          className="input-nothing"
          placeholder="Optional"
          aria-invalid={!!errors.description}
        />
        {errors.description && <p className="text-status-error text-xs font-mono mt-2">[{errors.description}]</p>}
      </div>

      <div>
        <label className="text-label block mb-2">CATEGORY</label>
        <select
          value={formData.category_id}
          onChange={(e) => update({ category_id: e.target.value })}
          className="w-full bg-base-100 border-b border-border-strong px-0 py-3 text-text-primary font-mono text-sm focus:outline-none focus:border-text-display transition-colors"
          aria-invalid={!!errors.category_id}
        >
          <option value="">-- SELECT --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && <p className="text-status-error text-xs font-mono mt-2">[{errors.category_id}]</p>}
      </div>

      <div>
        <label className="text-label block mb-2">TYPE</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={(e) => update({ type: e.target.value })}
              className="accent-white"
            />
            <span className="font-mono text-sm text-text-secondary uppercase">OUT</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="income"
              checked={formData.type === 'income'}
              onChange={(e) => update({ type: e.target.value })}
              className="accent-white"
            />
            <span className="font-mono text-sm text-text-primary uppercase">IN</span>
          </label>
        </div>
        {errors.type && <p className="text-status-error text-xs font-mono mt-2">[{errors.type}]</p>}
      </div>

      <div>
        <label className="text-label block mb-2">DATE</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => update({ date: e.target.value })}
          className="input-nothing"
          aria-invalid={!!errors.date}
        />
        {errors.date && <p className="text-status-error text-xs font-mono mt-2">[{errors.date}]</p>}
      </div>

      {submitError && (
        <p className="text-status-error text-xs font-mono uppercase tracking-widest">
          [ERROR: {submitError}]
        </p>
      )}

      <div className="flex gap-4 pt-4 border-t border-border-strong">
        <button
          type="button"
          onClick={onClose}
          className="btn-nothing flex-1"
        >
          [ CANCEL ]
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-nothing flex-1 border-text-display text-text-display hover:bg-base-400 disabled:opacity-30"
        >
          {loading ? '[ SAVING... ]' : '[ SAVE ]'}
        </button>
      </div>
    </form>
  )
}
