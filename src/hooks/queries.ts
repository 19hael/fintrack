import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Category, Transaction, Budget } from '../types'

export const qk = {
  categories: (userId: string) => ['categories', userId] as const,
  transactions: (userId: string, filters?: unknown) =>
    ['transactions', userId, filters ?? {}] as const,
  transactionsRange: (userId: string, start: string, end: string) =>
    ['transactions', userId, 'range', start, end] as const,
  budgets: (userId: string, month: string) => ['budgets', userId, month] as const,
}

function requireUserId(user: { id?: string } | null | undefined): string {
  if (!user?.id) throw new Error('Not authenticated')
  return user.id
}

export function useCategories() {
  const { user } = useAuth()
  return useQuery({
    queryKey: qk.categories(user?.id ?? 'anon'),
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = requireUserId(user)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', uid)
        .order('name')
      if (error) throw error
      return (data ?? []) as Category[]
    },
  })
}

export interface TransactionFilters {
  month?: string
  category?: string
  type?: 'expense' | 'income' | ''
}

export function useTransactions(filters: TransactionFilters = {}) {
  const { user } = useAuth()
  return useQuery({
    queryKey: qk.transactions(user?.id ?? 'anon', filters),
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = requireUserId(user)
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', uid)
        .order('date', { ascending: false })

      if (filters.month) {
        const [y, m] = filters.month.split('-').map(Number)
        const start = new Date(y, m - 1, 1).toISOString().split('T')[0]
        const end = new Date(y, m, 0).toISOString().split('T')[0]
        query = query.gte('date', start).lte('date', end)
      }
      if (filters.category) query = query.eq('category_id', filters.category)
      if (filters.type) query = query.eq('type', filters.type)

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as Transaction[]
    },
  })
}

export function useTransactionsInMonth(month: string) {
  return useTransactions({ month })
}

export function useBudgets(month: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: qk.budgets(user?.id ?? 'anon', month),
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = requireUserId(user)
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', uid)
        .eq('month', month)
      if (error) throw error
      return (data ?? []) as Budget[]
    },
  })
}

export function useInvalidate() {
  const qc = useQueryClient()
  return {
    categories: () => qc.invalidateQueries({ queryKey: ['categories'] }),
    transactions: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
    budgets: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
    all: () => qc.invalidateQueries(),
  }
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
