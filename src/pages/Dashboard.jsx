import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    topCategory: null,
  })
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState({})
  const [pieData, setPieData] = useState([]) // Usaremos esto para listas, no gráficos
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    fetchDashboardData()
  }, [user, month])

  const fetchDashboardData = async () => {
    try {
      const [yearStr, monthStr] = month.split('-')
      const targetYear = parseInt(yearStr)
      const targetMonth = parseInt(monthStr) - 1

      const startOfMonth = new Date(targetYear, targetMonth, 1).toISOString().split('T')[0]
      const endOfMonth = new Date(targetYear, targetMonth + 1, 0).toISOString().split('T')[0]

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)

      const categoryMap = {}
      categoriesData?.forEach(cat => {
        categoryMap[cat.id] = cat
      })
      setCategories(categoryMap)

      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('date', { ascending: false })

      setTransactions(transactionsData || [])

      const income = transactionsData
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

      const expenses = transactionsData
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

      const expensesByCategory = {}
      transactionsData?.forEach(t => {
        if (t.type === 'expense' && t.category_id) {
          expensesByCategory[t.category_id] = (expensesByCategory[t.category_id] || 0) + parseFloat(t.amount)
        }
      })

      let topCategory = null
      let maxExpense = 0
      Object.entries(expensesByCategory).forEach(([catId, amount]) => {
        if (amount > maxExpense) {
          maxExpense = amount
          topCategory = categoryMap[catId]
        }
      })

      setKpis({
        balance: income - expenses,
        income,
        expenses,
        topCategory,
      })

      const categoryArray = Object.entries(expensesByCategory).map(([catId, amount]) => ({
        name: categoryMap[catId]?.name || 'UNKNOWN',
        value: amount,
      }))
      categoryArray.sort((a, b) => b.value - a.value)
      setPieData(categoryArray.slice(0, 5))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center mt-32">
        <p className="text-display animate-tick text-2xl">[LOADING_DATA...]</p>
      </div>
    )
  }

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      options.push({
        value: date.toISOString().slice(0, 7),
        label: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2,'0')}`,
      })
    }
    return options
  }

  return (
    <div className="space-y-12">
      {/* Cabecera Mecánica */}
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

      {/* Hero Metric Layer 1: The ONE Thing */}
      <div className="nothing-container border-l-4 border-l-text-display">
        <p className="text-label mb-4">NET_BALANCE_CRC</p>
        <p className="text-display">
          {formatCurrency(kpis.balance)}
        </p>
      </div>

      {/* Layer 2: Supporting Metrics */}
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

      {/* Layer 3: Data Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Burn Rates */}
        <div>
          <p className="text-label mb-4 border-b border-border-strong pb-2">TOP_BURN_RATES</p>
          {pieData.length > 0 ? (
            <div className="space-y-4">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-end border-b border-border-strong pb-2 mb-2">
                  <span className="font-mono text-sm text-text-secondary uppercase">{String(idx+1).padStart(2,'0')} / {item.name}</span>
                  <span className="font-mono text-lg text-text-primary">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-label mt-4">[NO_DATA]</p>
          )}
        </div>

        {/* Transaction Log */}
        <div>
           <p className="text-label mb-4 border-b border-border-strong pb-2">TRANSACTION_LOG.LATEST</p>
           {transactions.length > 0 ? (
             <div className="space-y-4">
               {transactions.slice(0, 7).map((t) => (
                 <div key={t.id} className="flex justify-between items-start gap-4">
                    <span className="text-label text-text-disabled w-12">{formatDate(t.date)}</span>
                    <span className="font-mono text-sm text-text-secondary uppercase flex-1 truncate">
                      {t.description || categories[t.category_id]?.name || 'UNKNOWN'}
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
