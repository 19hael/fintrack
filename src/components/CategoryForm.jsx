import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const presetColors = [
  '#58A6FF', '#F85149', '#39D98A', '#A371F7', '#F78166',
  '#DB61A2', '#79C0FF', '#FFA657', '#8B949E', '#3FB950'
]

const presetEmojis = ['📁', '🍔', '🚗', '🏠', '💡', '📱', '✈️', '🎬', '🏥', '👕']

export default function CategoryForm({ onClose, onSuccess, editCategory }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    emoji: '📁',
    color: '#58A6FF',
  })

  useEffect(() => {
    if (editCategory) {
      setFormData({
        name: editCategory.name || '',
        emoji: editCategory.emoji || '📁',
        color: editCategory.color || '#58A6FF',
      })
    }
  }, [editCategory])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        user_id: user.id,
        name: formData.name,
        emoji: formData.emoji,
        color: formData.color,
      }

      if (editCategory?.id) {
        await supabase
          .from('categories')
          .update(payload)
          .eq('id', editCategory.id)
      } else {
        await supabase
          .from('categories')
          .insert(payload)
      }

      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-text-secondary text-sm mb-2">Nombre</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-blue transition-all"
          placeholder="Ej: Alimentación"
          required
        />
      </div>

      <div>
        <label className="block text-text-secondary text-sm mb-2">Emoji</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {presetEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setFormData({ ...formData, emoji })}
              className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                formData.emoji === emoji
                  ? 'bg-accent-gold/20 border-2 border-accent-gold'
                  : 'bg-bg-secondary border border-border-subtle hover:border-border-hover'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-text-secondary text-sm mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-8 h-8 rounded-full transition-all ${
                formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-card' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 border border-border-subtle text-text-secondary rounded-lg hover:border-border-hover transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 btn-primary rounded-xl active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}