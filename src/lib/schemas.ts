import { z } from 'zod'

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Fecha invalida')

const uuid = z.string().uuid('ID invalido')

export const transactionSchema = z.object({
  amount: z.coerce
    .number({ message: 'Monto requerido' })
    .positive('Monto debe ser mayor a 0')
    .max(1_000_000_000, 'Monto fuera de rango')
    .finite('Monto invalido'),
  description: z
    .string()
    .trim()
    .max(200, 'Descripcion muy larga (max 200)')
    .optional()
    .transform((v) => v ?? ''),
  category_id: uuid,
  type: z.enum(['expense', 'income'], { message: 'Tipo invalido' }),
  date: isoDate,
})

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nombre requerido')
    .max(40, 'Nombre muy largo (max 40)'),
  emoji: z
    .string()
    .trim()
    .min(1, 'Emoji requerido')
    .max(8, 'Emoji invalido'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser hex #RRGGBB'),
})

export const aiInputSchema = z
  .string()
  .trim()
  .min(1, 'Escribe algo')
  .max(500, 'Input muy largo (max 500 caracteres)')

export const aiTransactionSchema = z.object({
  amount: z.coerce.number().positive().finite(),
  description: z.string().trim().max(200).optional().default(''),
  category_id: uuid,
  type: z.enum(['expense', 'income']),
  date: isoDate,
})

export type TransactionInput = z.infer<typeof transactionSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type AITransaction = z.infer<typeof aiTransactionSchema>

export function formatZodError(err: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_'
    if (!fieldErrors[key]) fieldErrors[key] = issue.message
  }
  return fieldErrors
}
