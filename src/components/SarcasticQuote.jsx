import { useState, useEffect } from 'react'
import { MessagesSquare } from 'lucide-react'

const quotes = [
  "Otro gasto más... ¿Acaso no conoces el concepto de ahorro?",
  "Tu contador llora sangre cada vez que abres esta pestaña.",
  "¿En serio necesitabas eso? Bueno, no me quejo, yo solo soy código.",
  "Excelente, otro número rojo que maquillar a fin de mes.",
  "Ah, veo que el salario duró exactamente 48 horas. Récord personal.",
  "La libertad financiera está a 10 años luz de estos movimientos.",
  "Tu billetera está suplicando piedad. ¿No la escuchas?",
  "Impresionante cómo conviertes oxígeno en deudas.",
  "Ese 'gustito' extra de ayer te costó un día de retiro futuro.",
  "Menos mal que los números no sangran, esto duele.",
  "Deberías considerar la fotosíntesis como estilo de vida. Es gratis.",
  "El Excel se está negando a sumar todo esto por vergüenza.",
  "Si la deuda fuera deporte olímpico, ya tendrías el oro.",
  "Recuerda: llorar en el cajero automático no devuelve el saldo.",
  "Por movimientos como estos es que los aliens no nos hablan."
]

export default function SarcasticQuote() {
  const [quote, setQuote] = useState('')

  useEffect(() => {
    // Escoger frase aleatoria al montar
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setQuote(quotes[randomIndex])
  }, [])

  return (
    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-background-secondary/50 border border-border-subtle rounded-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
      <MessagesSquare size={16} className="text-accent-teal" />
      <span className="text-[12px] text-text-muted italic max-w-sm truncate" title={quote}>
        "{quote}"
      </span>
    </div>
  )
}
