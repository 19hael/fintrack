import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const OPENROUTER_MODEL = 'qwen/qwen3.6-plus-preview:free'

export default function AIAssistant({ onSuccess }) {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'error'|'success', msg: string }

  const processInput = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const apiKey = OPENROUTER_API_KEY || localStorage.getItem('openrouter_api_key')
    if (!apiKey) {
      setStatus({ type: 'error', msg: '[ERROR: OPENROUTER_API_KEY NOT FOUND. SET IN .ENV OR SETTINGS.]' })
      setTimeout(() => setStatus(null), 5000)
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      // Fetch categories for context
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)

      const categoriesContext = categories.map(c => `- ${c.name} (UUID: ${c.id})`).join('\n')

      const prompt = `You are a financial AI assistant. The user wants to register a transaction.
Extract the following data from the user input and return a pure JSON object.
JSON schema:
{
  "amount": number (positive, in CRC strictly, remove symbols),
  "description": string (brief, title-cased),
  "type": "expense" or "income",
  "category_id": string (the precise UUID from the list below matching the context, fallback to any default UUID if strictly not found),
  "date": string (ISO format YYYY-MM-DD, assume today ${new Date().toISOString().split('T')[0]} if not specified)
}

User input: "${input}"

Available Categories:
${categoriesContext}

ONLY return the JSON object. No markdown formatting, no code blocks, no other text.`

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'FinTrack AI',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: 'system', content: 'You are a precise financial data extraction assistant. Only respond with valid JSON, no markdown.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 300,
        }),
      })

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`OpenRouter ${response.status}: ${errBody}`)
      }

      const data = await response.json()
      let text = data.choices?.[0]?.message?.content || ''

      // Strip markdown code blocks if present
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim()
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in AI response')
      
      const transactionData = JSON.parse(jsonMatch[0])

      // Validate and insert
      const payload = {
        user_id: user.id,
        amount: Math.abs(parseFloat(transactionData.amount)) || 0,
        description: transactionData.description || 'AI Entry',
        category_id: transactionData.category_id || categories[0]?.id,
        type: transactionData.type || 'expense',
        date: transactionData.date || new Date().toISOString().split('T')[0],
      }

      if (payload.amount === 0) throw new Error('Amount resolved to 0')

      const { error: insertError } = await supabase.from('transactions').insert(payload)
      if (insertError) throw insertError

      setInput('')
      setStatus({ type: 'success', msg: `[SAVED] ${payload.description} — ₡${payload.amount.toLocaleString()}` })
      setTimeout(() => setStatus(null), 4000)

      if (onSuccess) onSuccess()
    } catch (err) {
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
        <span className="text-label text-text-disabled">OPENROUTER.AI</span>
      </div>

      <form onSubmit={processInput} className="flex gap-4 items-end">
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
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
