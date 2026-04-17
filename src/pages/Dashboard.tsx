import { useMemo, useState } from 'react'
import { useCategories, useTransactionsInMonth } from '../hooks/queries'
import type { Category, Transaction } from '../types'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })

function getMonthOptions() {
  const options: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    options.push({
      value: date.toISOString().slice(0, 7),
      label: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`,
    })
  }
  return options
}

interface Kpis {
  balance: number
  income: number
  expenses: number
  topCategory: Category | null
}

interface BurnRate {
  name: string
  value: number
}

function computeKpis(transactions: Transaction[], categoryMap: Record<string, Category>): {
  kpis: Kpis
  burn: BurnRate[]
} {
  let income = 0
  let expenses = 0
  const expensesByCategory: Record<string, number> = {}

  for (const t of transactions) {
    const amt = Number(t.amount) || 0
    if (t.type === 'income') {
      income += amt
    } else if (t.type === 'expense') {
      expenses += amt
      if (t.category_id) {
        expensesByCategory[t.category_id] = (expensesByCategory[t.category_id] || 0) + amt
      }
    }
  }

  let topCategory: Category | null = null
  let maxExpense = 0
  for (const [catId, amount] of Object.entries(expensesByCategory)) {
    if (amount > maxExpense) {
      maxExpense = amount
      topCategory = categoryMap[catId] ?? null
    }
  }

  const burn = Object.entries(expensesByCategory)
    .map(([catId, value]) => ({ name: categoryMap[catId]?.name || 'UNKNOWN', value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return {
    kpis: { balance: income - expenses, income, expenses, topCategory },
    burn,
  }
}

export default function Dashboard() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  const categoriesQ = useCategories()
  const transactionsQ = useTransactionsInMonth(month)

  const categoryMap = useMemo(() => {
    const m: Record<string, Category> = {}
    for (const c of categoriesQ.data ?? []) m[c.id] = c
    return m
  }, [categoriesQ.data])

  const { kpis, burn } = useMemo(
    () => computeKpis(transactionsQ.data ?? [], categoryMap),
    [transactionsQ.data, categoryMap]
  )

  const loading = categoriesQ.isLoading || transactionsQ.isLoading
  const error = categoriesQ.error || transactionsQ.error

  if (error) {
    return (
      <div className="flex justify-center mt-32">
        <p className="text-status-error font-mono text-sm">[ERROR: {(error as Error).message}]</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center mt-32">
        <p className="text-display animate-tick text-2xl">[LOADING_DATA...]</p>
      </div>
    )
  }

  const transactions = transactionsQ.data ?? []

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-border-strong pb-8">
        <div>
          <p className="text-label mb-2">INDEX / METRICS</p>
          <h1 className="text-4xl font-sans tracking-tight text-text-display">
            GLOBAL.STATUS
          </h1>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-base-100 border border-border-strong px-4 py-2 text-label font-bold focus:outline-none focus:border-text-primary transition-colors cursor-pointer"
        >
          {getMonthOptions().map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="nothing-container border-l-4 border-l-text-display">
        <p className="text-label mb-4">NET_BALANCE_CRC</p>
        <p className="text-display">{formatCurrency(kpis.balance)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="nothing-container">
          <p className="text-label mb-8">CASH_FLOW.IN</p>
          <p className="text-4xl font-mono text-text-primary">{formatCurrency(kpis.income)}</p>
        </div>
        <div className="nothing-container">
          <p className="text-label mb-8">CASH_FLOW.OUT</p>
          <p className="text-4xl font-mono text-text-secondary">{formatCurrency(kpis.expenses)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <p className="text-label mb-4 border-b border-border-strong pb-2">TOP_BURN_RATES</p>
          {burn.length > 0 ? (
            <div className="space-y-4">
              {burn.map((item, idx) => (
                <div key={idx} className="flex justify-between items-end border-b border-border-strong pb-2 mb-2">
                  <span className="font-mono text-sm text-text-secondary uppercase">
                    {String(idx + 1).padStart(2, '0')} / {item.name}
                  </span>
                  <span className="font-mono text-lg text-text-primary">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-label mt-4">[NO_DATA]</p>
          )}
        </div>

        <div>
          <p className="text-label mb-4 border-b border-border-strong pb-2">TRANSACTION_LOG.LATEST</p>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 7).map((t) => (
                <div key={t.id} className="flex justify-between items-start gap-4">
                  <span className="text-label text-text-disabled w-12">{formatDate(t.date)}</span>
                  <span className="font-mono text-sm text-text-secondary uppercase flex-1 truncate">
                    {t.description || categoryMap[t.category_id]?.name || 'UNKNOWN'}
                  </span>
                  <span className={`font-mono text-sm ${t.type === 'income' ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-border-strong">
                <a href="/transactions" className="text-label hover:text-text-display">VIEW_FULL_LOG ↗</a>
              </div>
            </div>
          ) : (
            <p className="text-label mt-4">[NO_DATA]</p>
          )}
        </div>
      </div>
    </div>
  )
}
