import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { aiInputSchema, aiTransactionSchema } from '../lib/schemas'

interface Props {
  onSuccess?: () => void
}

interface Status {
  type: 'error' | 'success'
  msg: string
}

export default function AIAssistant({ onSuccess }: Props) {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)

  const processInput = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedInput = aiInputSchema.safeParse(input)
    if (!parsedInput.success) {
      setStatus({ type: 'error', msg: `[INVALID_INPUT: ${parsedInput.error.issues[0].message}]` })
      setTimeout(() => setStatus(null), 5000)
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const { data: aiData, error: fnErr } = await supabase.functions.invoke('ai-transaction', {
        body: { input: parsedInput.data },
      })

      if (fnErr) {
        throw new Error(fnErr.message || 'Edge function failed')
      }
      if (aiData?.error) {
        throw new Error(aiData.error)
      }

      const validated = aiTransactionSchema.safeParse(aiData)
      if (!validated.success) {
        const first = validated.error.issues[0]
        throw new Error(`schema: ${first.path.join('.') || '_'} ${first.message}`)
      }

      const payload = { user_id: user!.id, ...validated.data }

      const { error: insertError } = await supabase.from('transactions').insert(payload)
      if (insertError) throw insertError

      setInput('')
      setStatus({
        type: 'success',
        msg: `[SAVED] ${payload.description || 'AI Entry'} — ₡${payload.amount.toLocaleString()}`,
      })
      setTimeout(() => setStatus(null), 4000)

      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error('AI Error:', err)
      setStatus({ type: 'error', msg: `[ERROR: ${err.message || 'UNKNOWN'}]` })
      setTimeout(() => setStatus(null), 6000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="nothing-container mb-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-label">AI_ENTRY // QWEN_3.6</p>
        <span className="text-label text-text-disabled">EDGE_FUNCTION</span>
      </div>

      <form onSubmit={processInput} className="flex gap-4 items-end">
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            maxLength={500}
            placeholder='[ "Hoy gasté 15330 colones en pizza" ]'
            className="input-nothing w-full disabled:opacity-30"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-nothing shrink-0 disabled:opacity-30"
        >
          {loading ? '[ PROCESSING... ]' : '[ EXECUTE ]'}
        </button>
      </form>

      {status && (
        <p className={`font-mono text-xs mt-4 uppercase tracking-widest ${
          status.type === 'error' ? 'text-status-error' : 'text-text-display'
        }`}>
          {status.msg}
        </p>
      )}
    </div>
  )
}
