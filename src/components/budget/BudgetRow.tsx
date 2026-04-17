import type { Budget, Category } from '../../types'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

type Status = 'normal' | 'warning' | 'danger'

function computeStatus(spent: number, limit: number): { status: Status; progress: number } {
  if (limit <= 0) return { status: 'normal', progress: 0 }
  const pct = (spent / limit) * 100
  const progress = Math.min(pct, 100)
  if (pct >= 100) return { status: 'danger', progress }
  if (pct >= 80) return { status: 'warning', progress }
  return { status: 'normal', progress }
}

interface Props {
  budget: Budget
  category: Category | undefined
  spent: number
  onEdit: (budget: Budget) => void
}

export default function BudgetRow({ budget, category, spent, onEdit }: Props) {
  const { status, progress } = computeStatus(spent, budget.monthly_limit)

  return (
    <div className="bg-background-card border border-border-subtle rounded-lg p-5">
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
          onClick={() => onEdit(budget)}
          className="text-text-muted hover:text-text-primary transition-colors p-2"
          aria-label="Editar presupuesto"
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
            backgroundColor: status === 'normal' ? category?.color : undefined,
          }}
        />
      </div>

      <div className="flex justify-between mt-2 text-sm">
        <span className={`font-mono ${
          status === 'danger' ? 'text-accent-expense' : status === 'warning' ? 'text-yellow-500' : 'text-text-secondary'
        }`}>
          {formatCurrency(spent)}
        </span>
        <span className="text-text-muted">{progress.toFixed(0)}%</span>
      </div>

      {status === 'warning' && (
        <p className="text-yellow-500 text-sm mt-2">Has usado más del 80% del presupuesto</p>
      )}
      {status === 'danger' && (
        <p className="text-accent-expense text-sm mt-2">Has superado el presupuesto</p>
      )}
    </div>
  )
}
