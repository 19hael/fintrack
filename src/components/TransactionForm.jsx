import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function TransactionForm({ onClose, onSuccess, editTransaction }) {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
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
        amount: editTransaction.amount,
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
      .eq('user_id', user.id)
      .order('name')
    setCategories(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        user_id: user.id,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category_id: formData.category_id,
        type: formData.type,
        date: formData.date,
      }

      if (editTransaction) {
        await supabase
          .from('transactions')
          .update(payload)
          .eq('id', editTransaction.id)
      } else {
        await supabase
          .from('transactions')
          .insert(payload)
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-label block mb-2">AMOUNT_CRC</label>
        <input
          type="number"
          step="1"
          min="1"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="input-nothing"
          placeholder="0"
          required
        />
      </div>

      <div>
        <label className="text-label block mb-2">DESCRIPTION</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input-nothing"
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="text-label block mb-2">CATEGORY</label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          className="w-full bg-base-100 border-b border-border-strong px-0 py-3 text-text-primary font-mono text-sm focus:outline-none focus:border-text-display transition-colors"
          required
        >
          <option value="">-- SELECT --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
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
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="accent-white"
            />
            <span className="font-mono text-sm text-text-primary uppercase">IN</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-label block mb-2">DATE</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="input-nothing"
          required
        />
      </div>

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