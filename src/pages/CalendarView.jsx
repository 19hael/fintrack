import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function CalendarView() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  
  useEffect(() => {
    fetchMonthData()
  }, [user, currentDate])

  const fetchMonthData = async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()

      const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0]
      const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)

      const categoryMap = {}
      categoriesData?.forEach(cat => { categoryMap[cat.id] = cat })
      setCategories(categoryMap)

      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('date', { ascending: false })

      setTransactions(transactionsData || [])
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
    setSelectedDate(null)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Generar calendario
  const generateGrid = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // getDay() is 0 (Sunday) to 6 (Saturday). We'll make Monday=0, Sunday=6
    let startOffset = firstDay.getDay() - 1
    if (startOffset === -1) startOffset = 6

    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // Fill empty slots at start
    for (let i = 0; i < startOffset; i++) {
        days.push(null)
    }

    // Fill days
    for (let i = 1; i <= daysInMonth; i++) {
        const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        
        // Calcular sumas
        const dayTrans = transactions.filter(t => t.date === fullDate)
        const income = dayTrans.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0)
        const expense = dayTrans.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0)

        days.push({
            date: i,
            fullDate,
            income,
            expense,
            hasData: dayTrans.length > 0,
            transactions: dayTrans
        })
    }

    return days
  }

  const gridDays = generateGrid()
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  
  const selectedTransactions = selectedDate ? transactions.filter(t => t.date === selectedDate.fullDate) : []

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold text-text-primary tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Calendario Interactivo
        </h1>
        
        <div className="flex items-center gap-4 bg-background-secondary border border-border-subtle rounded-xl px-2 py-1">
          <button onClick={() => navigateMonth(-1)} className="p-2 text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-sm font-medium text-text-primary min-w-[120px] text-center capitalize">
            {currentDate.toLocaleDateString('es-CR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => navigateMonth(1)} className="p-2 text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grilla Calendario */}
        <div className="lg:col-span-2 glass-card p-5">
            <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-[11px] uppercase tracking-wider text-text-muted font-medium py-2">
                        {d}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
                {loading ? (
                    <div className="col-span-7 flex justify-center py-12">
                        <div className="cosmic-spinner" />
                    </div>
                ) : (
                    gridDays.map((day, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => day ? setSelectedDate(day) : null}
                            className={`
                                min-h-[80px] rounded-xl p-2 transition-all 
                                ${!day ? 'bg-transparent' : 'bg-background-secondary/40 border border-border-subtle cursor-pointer hover:border-accent-blue'}
                                ${selectedDate?.fullDate === day?.fullDate ? 'border-accent-blue ring-1 ring-accent-blue/50 bg-accent-blue/5' : ''}
                            `}
                        >
                            {day && (
                                <div className="h-full flex flex-col justify-between">
                                    <span className={`text-sm font-medium ${day.hasData ? 'text-text-primary' : 'text-text-muted'}`}>
                                        {day.date}
                                    </span>
                                    {day.hasData && (
                                        <div className="flex flex-col gap-1 mt-1">
                                            {day.income > 0 && <span className="text-[10px] text-accent-teal font-mono">+{formatCurrency(day.income)}</span>}
                                            {day.expense > 0 && <span className="text-[10px] text-accent-expense font-mono">-{formatCurrency(day.expense)}</span>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Detalles del día seleccionado */}
        <div className="glass-card p-5 h-full min-h-[400px]">
           <h2 className="text-sm font-medium text-text-primary mb-5 tracking-wide flex items-center gap-2">
               Detalles del Día
           </h2>
           
           {!selectedDate ? (
               <div className="flex flex-col items-center justify-center h-48 text-text-muted">
                   <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   <p className="text-xs">Selecciona un día para ver datos</p>
               </div>
           ) : selectedTransactions.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-48 text-text-muted">
                   <p className="text-sm text-text-secondary">{selectedDate.fullDate}</p>
                   <p className="text-xs mt-2">Día libre de actividad.</p>
               </div>
           ) : (
               <div className="space-y-4">
                   <p className="text-sm font-mono text-text-secondary pb-3 border-b border-border-subtle">{selectedDate.fullDate}</p>
                   {selectedTransactions.map(t => {
                       const cat = categories[t.category_id]
                       return (
                           <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-background-secondary/50 border border-border-subtle">
                               <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat?.color || '#506080'}20` }}>
                                       {cat?.emoji || '🏷️'}
                                   </div>
                                   <div>
                                       <p className="text-xs font-medium text-text-primary">{t.description || cat?.name || 'Desconocido'}</p>
                                       <p className="text-[10px] text-text-muted">{t.type === 'income' ? 'Ingreso' : 'Gasto'}</p>
                                   </div>
                               </div>
                               <span className={`text-xs font-mono font-medium ${t.type === 'income' ? 'text-accent-teal' : 'text-accent-expense'}`}>
                                   {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                               </span>
                           </div>
                       )
                   })}
               </div>
           )}
        </div>
      </div>
    </div>
  )
}
