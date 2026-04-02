import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Modal from '../components/Modal'
import CategoryForm from '../components/CategoryForm'

const DEFAULT_CATEGORIES = [
  { name: 'Alimentación', emoji: '🍔', color: '#F87171' },
  { name: 'Transporte', emoji: '🚗', color: '#38BDF8' },
  { name: 'Ocio', emoji: '🎬', color: '#A78BFA' },
  { name: 'Salud', emoji: '🏥', color: '#4ADE80' },
  { name: 'Ropa', emoji: '👕', color: '#F472B6' },
  { name: 'Hogar', emoji: '🏠', color: '#FBBF24' },
  { name: 'Servicios', emoji: '💡', color: '#2DD4BF' },
  { name: 'Tecnología', emoji: '📱', color: '#818CF8' },
  { name: 'Viajes', emoji: '✈️', color: '#FB923C' },
  { name: 'Otros', emoji: '📦', color: '#9CA3AF' },
]

export default function Categories() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [addingDefaults, setAddingDefaults] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [user])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      // Get transaction counts for each category
      const { data: transactionCounts } = await supabase
        .from('transactions')
        .select('category_id')
        .eq('user_id', user.id)

      const counts = {}
      transactionCounts?.forEach(t => {
        counts[t.category_id] = (counts[t.category_id] || 0) + 1
      })

      const categoriesWithCounts = data?.map(cat => ({
        ...cat,
        transactionCount: counts[cat.id] || 0,
      })) || []

      setCategories(categoriesWithCounts)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('categories').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchCategories()
  }

  const handleAddDefaults = async () => {
    try {
      setAddingDefaults(true)
      const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
        user_id: user.id,
        name: cat.name,
        emoji: cat.emoji,
        color: cat.color,
      }))
      await supabase.from('categories').insert(categoriesToInsert)
      fetchCategories()
    } catch (error) {
      console.error('Error adding default categories:', error)
    } finally {
      setAddingDefaults(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-text-primary">Categorías</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary px-4 py-2 rounded-xl transition-all"
        >
          + Nueva Categoría
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted">Cargando...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-text-muted bg-background-card border border-border-subtle rounded-xl">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>No hay categorías</p>
          <p className="text-sm mt-1">Crea tu primera categoría</p>
          <button
            onClick={handleAddDefaults}
            disabled={addingDefaults}
            className="mt-4 px-4 py-2 btn-primary rounded-xl disabled:opacity-50"
          >
            {addingDefaults ? 'Agregando...' : 'Agregar categorías por defecto'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-background-card border border-border-subtle rounded-xl p-5 hover:border-border-hover transition-all group"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary truncate">{cat.name}</h3>
                  <p className="text-sm text-text-muted">
                    {cat.transactionCount} {cat.transactionCount === 1 ? 'transacción' : 'transacciones'}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteConfirm(cat.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-expense transition-all p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Categoría">
        <CategoryForm
          onClose={() => setModalOpen(false)}
          onSuccess={fetchCategories}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar Categoría">
        <div className="space-y-4">
          <p className="text-text-secondary">
            ¿Estás seguro de que quieres eliminar esta categoría?
          </p>
          <p className="text-text-muted text-sm">
            Las transacciones asociadas no se eliminarán, pero quedarán sin categoría.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-3 border border-border-hover text-text-secondary rounded-lg hover:border-text-muted transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="flex-1 py-3 bg-accent-expense text-white font-semibold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}