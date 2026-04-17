export type TransactionType = 'expense' | 'income'

export interface Category {
  id: string
  user_id: string
  name: string
  emoji: string
  color: string
  created_at?: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  description: string
  category_id: string
  type: TransactionType
  date: string
  created_at?: string
  categories?: Pick<Category, 'name' | 'emoji' | 'color'> | null
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  month: string
  monthly_limit: number
  created_at?: string
}

export interface AuthUser {
  id: string
  email?: string
}

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<unknown>
  signOut: () => Promise<void>
}
