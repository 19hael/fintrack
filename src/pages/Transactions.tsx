import { useMemo, useState } from 'react'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import AIAssistant from '../components/AIAssistant'
import {
  useCategories,
  useTransactions,
  useDeleteTransaction,
  useInvalidate,
  type TransactionFilters,
} from '../hooks/queries'

const ITEMS_PER_PAGE = 20

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

function getMonthOptions() {
  const options: { value: string; label: string }[] = []
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

export default function Transactions() {
  const [filters, setFilters] = useState<TransactionFilters>({
    month: new Date().toISOString().slice(0, 7),
    category: '',
    type: '',
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const categoriesQ = useCategories()
  const transactionsQ = useTransactions(filters)
  const deleteTx = useDeleteTransaction()
  const invalidate = useInvalidate()

  const categories = categoriesQ.data ?? []
  const transactions = transactionsQ.data ?? []
  const loading = transactionsQ.isLoading
  const error = transactionsQ.error

  const categoryMap = useMemo(() => {
    const m: Record<string, { emoji: string; name: string }> = {}
    for (const c of categories) m[c.id] = { emoji: c.emoji, name: c.name }
    return m
  }, [categories])

  const getCategoryName = (categoryId: string) => {
    const cat = categoryMap[categoryId]
    return cat ? `${cat.emoji} ${cat.name}` : '-'
  }

  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE))
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const updateFilter = (patch: Partial<TransactionFilters>) => {
    setFilters({ ...filters, ...patch })
    setCurrentPage(1)
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
        <button onClick={() => setModalOpen(true)} className="btn-nothing shrink-0">
          [+ ADD_ENTRY ]
        </button>
      </div>

      <AIAssistant onSuccess={invalidate.transactions} />

      {error && (
        <p className="text-status-error font-mono text-xs">[ERROR: {(error as Error).message}]</p>
      )}

      <div className="nothing-container p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <label className="text-label block mb-2">MONTH_FILTER</label>
            <select
              value={filters.month}
              onChange={(e) => updateFilter({ month: e.target.value })}
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
              onChange={(e) => updateFilter({ category: e.target.value })}
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
              onChange={(e) => updateFilter({ type: e.target.value as TransactionFilters['type'] })}
              className="w-full bg-transparent border-b border-border-strong rounded-none px-0 py-2 text-text-primary focus:outline-none focus:border-text-display transition-all font-mono text-sm uppercase"
            >
              <option value="">ALL</option>
              <option value="income">IN</option>
              <option value="expense">OUT</option>
            </select>
          </div>
        </div>
      </div>

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
                      <td className="py-4 px-6 text-text-disabled font-mono text-sm">{t.date}</td>
                      <td className="py-4 px-6 text-text-primary text-sm font-medium">{t.description || '-'}</td>
                      <td className="py-4 px-6 text-text-secondary text-sm">{getCategoryName(t.category_id)}</td>
                      <td className="py-4 px-6 text-right font-mono text-sm">{formatCurrency(t.amount)}</td>
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
                  VIEWING {(currentPage - 1) * ITEMS_PER_PAGE + 1} TO {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)} OF {transactions.length}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="font-mono text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
                  >
                    ← PREV
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="ENTRY.ADD">
        <TransactionForm
          onClose={() => setModalOpen(false)}
          onSuccess={invalidate.transactions}
        />
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="ENTRY.DELETE">
        <div className="space-y-6 pt-4">
          <p className="text-text-primary text-sm">DESTUCTIVE OPERATION. TYPE: "DELETE". PROCEED?</p>
          {deleteTx.error && (
            <p className="text-status-error text-xs font-mono">[{(deleteTx.error as Error).message}]</p>
          )}
          <div className="flex gap-4 border-t border-border-strong pt-6">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="btn-nothing border-border-strong hover:bg-base-200 flex-1"
            >
              [ CANCEL ]
            </button>
            <button
              onClick={() => {
                if (deleteConfirm) {
                  deleteTx.mutate(deleteConfirm, {
                    onSuccess: () => setDeleteConfirm(null),
                  })
                }
              }}
              disabled={deleteTx.isPending}
              className="btn-nothing-red flex-1 disabled:opacity-30"
            >
              {deleteTx.isPending ? '[ DELETING... ]' : '[ EXECUTE_DELETE ]'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
