import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import AIAssistant from '../components/AIAssistant'

export default function Transactions() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    category: '',
    type: '',
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchCategories()
  }, [user])

  useEffect(() => {
    fetchTransactions()
  }, [user, filters])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    setCategories(data || [])
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (filters.month) {
        const [year, month] = filters.month.split('-')
        const startDate = new Date(year, parseInt(month) - 1, 1).toISOString().split('T')[0]
        const endDate = new Date(year, parseInt(month), 0).toISOString().split('T')[0]
        query = query.gte('date', startDate).lte('date', endDate)
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      const { data } = await query
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('transactions').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchTransactions()
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat ? `${cat.emoji} ${cat.name}` : '-'
  }

  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      options.push({
        value: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString('es-CR', { month: 'long', year: 'numeric' }),
      })
    }
    return options
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-strong pb-8">
        <div>
          <p className="text-label mb-2">DATABASE.VIEW</p>
          <h1 className="text-4xl font-sans tracking-tight text-text-display">
            TRANSACTIONS
          </h1>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-nothing shrink-0"
        >
          [+ ADD_ENTRY ]
        </button>
      </div>

      <AIAssistant onSuccess={fetchTransactions} />

      {/* Filters */}
      <div className="nothing-container p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <label className="text-label block mb-2">MONTH_FILTER</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full bg-transparent border-b border-border-strong rounded-none px-0 py-2 text-text-primary focus:outline-none focus:border-text-display transition-all font-mono text-sm uppercase"
            >
              {getMonthOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-label block mb-2">CATEGORY_FILTER</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full bg-transparent border-b border-border-strong rounded-none px-0 py-2 text-text-primary focus:outline-none focus:border-text-display transition-all font-mono text-sm uppercase"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-label block mb-2">TYPE_FILTER</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full bg-transparent border-b border-border-strong rounded-none px-0 py-2 text-text-primary focus:outline-none focus:border-text-display transition-all font-mono text-sm uppercase"
            >
              <option value="">ALL</option>
              <option value="income">IN</option>
              <option value="expense">OUT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="nothing-container p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-32">
            <span className="text-display animate-tick text-xl">[LOADING...]</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-32 text-text-disabled">
            <p className="font-mono uppercase tracking-widest">[NO_DATA_FOUND]</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-strong">
                    <th className="text-label py-4 px-6 font-normal">DATE</th>
                    <th className="text-label py-4 px-6 font-normal">DESC</th>
                    <th className="text-label py-4 px-6 font-normal">CAT</th>
                    <th className="text-label py-4 px-6 font-normal text-right">AMOUNT</th>
                    <th className="text-label py-4 px-6 font-normal text-center">T</th>
                    <th className="text-label py-4 px-6 font-normal text-right">ACT</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-border-strong hover:bg-base-200 transition-colors"
                    >
                      <td className="py-4 px-6 text-text-disabled font-mono text-sm">
                        {t.date}
                      </td>
                      <td className="py-4 px-6 text-text-primary text-sm font-medium">
                        {t.description || '-'}
                      </td>
                      <td className="py-4 px-6 text-text-secondary text-sm">
                        {getCategoryName(t.category_id)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-sm">
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-[10px] uppercase font-mono px-2 py-1 rounded-sm border ${
                          t.type === 'income' ? 'text-text-primary border-text-primary' : 'text-text-secondary border-text-secondary'
                        }`}>
                          {t.type === 'income' ? 'IN' : 'OUT'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setDeleteConfirm(t.id)}
                          className="font-mono text-xs text-text-disabled hover:text-status-error transition-colors uppercase tracking-widest"
                        >
                          [DEL]
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 bg-base-200 border-t border-border-strong">
                <p className="text-label">
                  VIEWING {(currentPage - 1) * itemsPerPage + 1} TO {Math.min(currentPage * itemsPerPage, transactions.length)} OF {transactions.length}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="font-mono text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
                  >
                    ← PREV
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="font-mono text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
                  >
                    NEXT →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="ENTRY.ADD">
        <TransactionForm
          onClose={() => setModalOpen(false)}
          onSuccess={fetchTransactions}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="ENTRY.DELETE">
        <div className="space-y-6 pt-4">
          <p className="text-text-primary text-sm">DESTUCTIVE OPERATION. TYPE: "DELETE". PROCEED?</p>
          <div className="flex gap-4 border-t border-border-strong pt-6">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="btn-nothing border-border-strong hover:bg-base-200 flex-1"
            >
              [ CANCEL ]
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="btn-nothing-red flex-1"
            >
              [ EXECUTE_DELETE ]
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
