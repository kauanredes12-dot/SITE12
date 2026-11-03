import { supabase } from '@/lib/supabase';
import { CATEGORY_SELECT, LOAD_ERROR, mapCategory, type CategoryRow } from '@/services/catalog';
import type { Category } from '@/types/store';

const SAVE_ERROR = 'Não foi possível salvar a categoria. Tente novamente.';
const DELETE_ERROR = 'Não foi possível excluir a categoria. Tente novamente.';
const SLUG_TAKEN = 'Já existe uma categoria com este nome. Escolha outro nome.';
const UNIQUE_VIOLATION = '23505';

export type CategoryPayload = {
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export async function fetchAdminCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_SELECT)
    .order('sort_order', { ascending: true });
  if (error || !data) throw new Error(LOAD_ERROR);
  return (data as unknown as CategoryRow[]).map(mapCategory);
}

export async function saveCategory(id: string | null, payload: CategoryPayload): Promise<void> {
  const query = id
    ? supabase.from('categories').update(payload).eq('id', id)
    : supabase.from('categories').insert(payload);
  const { error } = await query;
  if (error) throw new Error(error.code === UNIQUE_VIOLATION ? SLUG_TAKEN : SAVE_ERROR);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(DELETE_ERROR);
}
