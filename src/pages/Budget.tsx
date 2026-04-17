import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import {
  useCategories,
  useBudgets,
  useTransactionsInMonth,
  useInvalidate,
} from '../hooks/queries'
import BudgetRow from '../components/budget/BudgetRow'
import BudgetFormModal from '../components/budget/BudgetFormModal'
import BulkBudgetModal from '../components/budget/BulkBudgetModal'
import type { Budget } from '../types'

interface BudgetFormValues {
  category_id: string
  monthly_limit: string
}

export default function BudgetPage() {
  const { user } = useAuth()
  const currentMonth = new Date().toISOString().slice(0, 7)

  const categoriesQ = useCategories()
  const budgetsQ = useBudgets(currentMonth)
  const transactionsQ = useTransactionsInMonth(currentMonth)
  const invalidate = useInvalidate()

  const [modalOpen, setModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [initialForm, setInitialForm] = useState<BudgetFormValues | null>(null)

  const categories = categoriesQ.data ?? []
  const budgets = budgetsQ.data ?? []
  const loading = budgetsQ.isLoading || categoriesQ.isLoading

  const expensesByCategory = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const t of transactionsQ.data ?? []) {
      if (t.type === 'expense' && t.category_id) {
        acc[t.category_id] = (acc[t.category_id] || 0) + (Number(t.amount) || 0)
      }
    }
    return acc
  }, [transactionsQ.data])

  const saveBudget = useMutation({
    mutationFn: async (values: BudgetFormValues) => {
      const limit = parseFloat(values.monthly_limit)
      if (!Number.isFinite(limit) || limit < 0) {
        throw new Error('Límite inválido')
      }
      if (!values.category_id) throw new Error('Selecciona una categoría')

      const existing = budgets.find((b) => b.category_id === values.category_id)
      if (existing) {
        const { error } = await supabase
          .from('budgets')
          .update({ monthly_limit: limit })
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('budgets').insert({
          user_id: user!.id,
          category_id: values.category_id,
          monthly_limit: limit,
          month: currentMonth,
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      invalidate.budgets()
      setModalOpen(false)
      setInitialForm(null)
    },
  })

  const saveBulk = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const toInsert = Object.entries(values)
        .map(([category_id, raw]) => ({ category_id, monthly_limit: parseFloat(raw) }))
        .filter(({ monthly_limit }) => Number.isFinite(monthly_limit) && monthly_limit > 0)
        .map(({ category_id, monthly_limit }) => ({
          user_id: user!.id,
          category_id,
          monthly_limit,
          month: currentMonth,
        }))

      if (toInsert.length === 0) return

      const { error: delErr } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user!.id)
        .eq('month', currentMonth)
      if (delErr) throw delErr

      const { error: insErr } = await supabase.from('budgets').insert(toInsert)
      if (insErr) throw insErr
    },
    onSuccess: () => {
      invalidate.budgets()
      setBulkModalOpen(false)
    },
  })

  const openEditModal = (budget: Budget) => {
    setInitialForm({
      category_id: budget.category_id,
      monthly_limit: String(budget.monthly_limit),
    })
    setModalOpen(true)
  }

  const bulkInitial = useMemo(() => {
    const out: Record<string, string> = {}
    for (const b of budgets) out[b.category_id] = String(b.monthly_limit)
    return out
  }, [budgets])

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
              setInitialForm(null)
              setModalOpen(true)
            }}
            className="btn-primary px-4 py-2 rounded-xl transition-all"
          >
            + Nuevo
          </button>
          <button
            onClick={() => setBulkModalOpen(true)}
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
          {budgets.map((b) => (
            <BudgetRow
              key={b.id}
              budget={b}
              category={categories.find((c) => c.id === b.category_id)}
              spent={expensesByCategory[b.category_id] || 0}
              onEdit={openEditModal}
            />
          ))}
        </div>
      )}

      <BudgetFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setInitialForm(null)
        }}
        categories={categories}
        initial={initialForm}
        onSubmit={(values) => saveBudget.mutateAsync(values)}
        submitting={saveBudget.isPending}
        error={saveBudget.error ? (saveBudget.error as Error).message : null}
      />

      <BulkBudgetModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        categories={categories}
        initialValues={bulkInitial}
        onSubmit={(values) => saveBulk.mutateAsync(values)}
        submitting={saveBulk.isPending}
        error={saveBulk.error ? (saveBulk.error as Error).message : null}
      />
    </div>
  )
}
