import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Modal from '../components/Modal'

export default function Budget() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [expenses, setExpenses] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    category_id: '',
    monthly_limit: '',
  })
  const [bulkData, setBulkData] = useState({})

  const currentMonth = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      setCategories(categoriesData || [])

      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)

      setBudgets(budgetsData || [])

      const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate)

      const expensesByCategory = {}
      transactionsData?.forEach(t => {
        if (t.category_id) {
          expensesByCategory[t.category_id] = (expensesByCategory[t.category_id] || 0) + parseFloat(t.amount)
        }
      })

      setExpenses(expensesByCategory)
    } catch (error) {
      console.error('Error fetching budget data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBudget = async (e) => {
    e.preventDefault()

    const existingBudget = budgets.find(b => b.category_id === formData.category_id)

    if (existingBudget) {
      await supabase
        .from('budgets')
        .update({ monthly_limit: parseFloat(formData.monthly_limit) })
        .eq('id', existingBudget.id)
    } else {
      await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: formData.category_id,
          monthly_limit: parseFloat(formData.monthly_limit),
          month: currentMonth,
        })
    }

    setModalOpen(false)
    setFormData({ category_id: '', monthly_limit: '' })
    fetchData()
  }

  const handleBulkSave = async () => {
    try {
      const budgetsToInsert = Object.entries(bulkData)
        .filter(([_, limit]) => limit && parseFloat(limit) > 0)
        .map(([category_id, monthly_limit]) => ({
          user_id: user.id,
          category_id,
          monthly_limit: parseFloat(monthly_limit),
          month: currentMonth,
        }))

      if (budgetsToInsert.length > 0) {
        await supabase
          .from('budgets')
          .delete()
          .eq('user_id', user.id)
          .eq('month', currentMonth)

        await supabase.from('budgets').insert(budgetsToInsert)
      }

      setBulkModalOpen(false)
      setBulkData({})
      fetchData()
    } catch (error) {
      console.error('Error saving bulk budgets:', error)
    }
  }

  const handleBulkChange = (categoryId, value) => {
    setBulkData(prev => ({ ...prev, [categoryId]: value }))
  }

  // Formatear moneda en colones costarricenses
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getBudgetProgress = (categoryId, limit) => {
    const spent = expenses[categoryId] || 0
    return Math.min((spent / limit) * 100, 100)
  }

  const getBudgetStatus = (categoryId, limit) => {
    const spent = expenses[categoryId] || 0
    const percentage = (spent / limit) * 100
    if (percentage >= 100) return 'danger'
    if (percentage >= 80) return 'warning'
    return 'normal'
  }

  const openEditModal = (budget) => {
    setFormData({
      category_id: budget.category_id,
      monthly_limit: budget.monthly_limit,
    })
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Presupuesto</h1>
          <p className="text-text-muted text-sm mt-1">
            {new Date().toLocaleDateString('es-CR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFormData({ category_id: '', monthly_limit: '' })
              setModalOpen(true)
            }}
            className="btn-primary px-4 py-2 rounded-xl transition-all"
          >
            + Nuevo
          </button>
          <button
            onClick={() => {
              const existing = {}
              budgets.forEach(b => { existing[b.category_id] = b.monthly_limit })
              setBulkData(existing)
              setBulkModalOpen(true)
            }}
            className="px-4 py-2 border border-border-subtle text-text-secondary rounded-lg hover:border-text-muted transition-all"
          >
            Editar todos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted">Cargando...</div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-text-muted bg-background-card border border-border-subtle rounded-lg">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No hay presupuestos configurados</p>
          <p className="text-sm mt-1">Crea tu primer presupuesto</p>
          {categories.length > 0 && (
            <button
              onClick={() => setBulkModalOpen(true)}
              className="mt-4 btn-primary px-4 py-2 rounded-xl transition-all"
            >
              Configurar presupuestos
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const category = categories.find(c => c.id === budget.category_id)
            const spent = expenses[budget.category_id] || 0
            const progress = getBudgetProgress(budget.category_id, budget.monthly_limit)
            const status = getBudgetStatus(budget.category_id, budget.monthly_limit)

            return (
              <div
                key={budget.id}
                className="bg-background-card border border-border-subtle rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${category?.color}20` }}
                    >
                      {category?.emoji}
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary">{category?.name}</h3>
                      <p className="text-sm text-text-muted">
                        Límite: {formatCurrency(budget.monthly_limit)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(budget)}
                    className="text-text-muted hover:text-text-primary transition-colors p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>

                <div className={`relative h-3 bg-background-secondary rounded-full overflow-hidden flex ${status === 'danger' ? 'ring-1 ring-accent-expense/50 shadow-[0_0_20px_rgba(248,113,113,0.3)] animate-pulse' : ''}`}>
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                      status === 'danger'
                        ? 'bg-accent-expense shadow-[0_0_15px_rgba(248,113,113,0.9)]'
                        : status === 'warning'
                        ? 'bg-accent-gold shadow-[0_0_10px_rgba(200,165,90,0.7)]'
                        : ''
                    }`}
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: status === 'normal' ? category?.color : undefined
                    }}
                  />
                </div>

                <div className="flex justify-between mt-2 text-sm">
                  <span className={`font-mono ${
                    status === 'danger' ? 'text-accent-expense' : status === 'warning' ? 'text-yellow-500' : 'text-text-secondary'
                  }`}>
                    {formatCurrency(spent)}
                  </span>
                  <span className="text-text-muted">
                    {progress.toFixed(0)}%
                  </span>
                </div>

                {status === 'warning' && (
                  <p className="text-yellow-500 text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Has usado más del 80% del presupuesto
                  </p>
                )}

                {status === 'danger' && (
                  <p className="text-accent-expense text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Has superado el presupuesto
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Budget Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Presupuesto">
        <form onSubmit={handleSaveBudget} className="space-y-4">
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-3 border border-border-subtle text-text-secondary rounded-lg hover:border-text-muted transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 btn-primary rounded-xl active:scale-[0.98] transition-all"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Budget Modal */}
      <Modal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Configurar Presupuestos">
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
                value={bulkData[cat.id] || ''}
                onChange={(e) => handleBulkChange(cat.id, e.target.value)}
                className="w-28 bg-background-secondary border border-border-subtle rounded-lg px-3 py-2 text-text-primary font-mono text-right focus:outline-none focus:border-accent-blue transition-all"
                placeholder="0"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setBulkModalOpen(false)}
              className="flex-1 py-3 border border-border-subtle text-text-secondary rounded-lg hover:border-text-muted transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleBulkSave}
              className="flex-1 py-3 btn-primary rounded-xl active:scale-[0.98] transition-all"
            >
              Guardar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}