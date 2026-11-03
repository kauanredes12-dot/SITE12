import { supabase } from '@/lib/supabase';
import type { HomeContentItem, HomeItemContent, HomeItemKind } from '@/types/homeContent';

const TABLE = 'home_page_items';
const PUBLIC_COLUMNS = 'id, kind, item_key, section_id, label, sort_order, is_visible, published, updated_at';
const LOAD_ERROR = 'Não foi possível carregar o conteúdo da página inicial. Tente novamente.';
const SAVE_ERROR = 'Não foi possível salvar as alterações. Tente novamente.';
const DELETE_ERROR = 'Não foi possível excluir este item. Tente novamente.';

type HomeItemRow = {
  id: string;
  kind: HomeItemKind;
  item_key: string | null;
  section_id: string | null;
  label: string;
  sort_order: number;
  is_visible: boolean;
  published: HomeItemContent | null;
  draft?: HomeItemContent | null;
  updated_at: string;
};

export type NewHomeItemInput = {
  kind: 'text' | 'button';
  sectionId: string;
  label: string;
  sortOrder: number;
  content: HomeItemContent;
  publish: boolean;
};

function mapItem(row: HomeItemRow): HomeContentItem {
  return {
    id: row.id,
    kind: row.kind,
    itemKey: row.item_key,
    sectionId: row.section_id,
    label: row.label,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    published: row.published ?? {},
    draft: row.draft ?? null,
    updatedAt: row.updated_at,
  };
}

export function validateHomeHref(value: string): string | null {
  return /^\/\S*$/.test(value) || /^https:\/\/\S+$/i.test(value)
    ? null
    : 'Use um caminho do site (começando com /) ou um endereço que comece com https://';
}

export async function fetchPublicHomeItems(): Promise<HomeContentItem[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(PUBLIC_COLUMNS)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });
  if (error || !data) throw new Error(LOAD_ERROR);
  return (data as unknown as HomeItemRow[]).map(mapItem);
}

export async function fetchAdminHomeItems(): Promise<HomeContentItem[]> {
  const { data, error } = await supabase.rpc('admin_list_home_page_items');
  if (error || !data) throw new Error(LOAD_ERROR);
  return (data as unknown as HomeItemRow[]).map(mapItem);
}

async function updateItem(id: string, patch: Record<string, unknown>, errorMessage: string): Promise<void> {
  const { data, error } = await supabase.from(TABLE).update(patch).eq('id', id).select('id');
  if (error || !data || data.length === 0) throw new Error(errorMessage);
}

async function insertItem(payload: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.from(TABLE).insert(payload).select('id');
  if (error || !data || data.length === 0) throw new Error(SAVE_ERROR);
  return (data as unknown as { id: string }[])[0].id;
}

export async function saveHomeItemDraft(id: string, content: HomeItemContent): Promise<void> {
  await updateItem(id, { draft: content }, SAVE_ERROR);
}

export async function publishHomeItem(id: string, content: HomeItemContent): Promise<void> {
  await updateItem(id, { published: content, draft: null }, SAVE_ERROR);
}

export async function setHomeItemVisibility(id: string, isVisible: boolean): Promise<void> {
  await updateItem(id, { is_visible: isVisible }, SAVE_ERROR);
}

export async function renameHomeItem(id: string, label: string): Promise<void> {
  await updateItem(id, { label }, SAVE_ERROR);
}

export async function saveHomeItemOrder(entries: { id: string; sortOrder: number }[]): Promise<void> {
  await Promise.all(entries.map(({ id, sortOrder }) => updateItem(id, { sort_order: sortOrder }, SAVE_ERROR)));
}

export async function deleteHomeItem(id: string): Promise<void> {
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('id');
  if (error || !data || data.length === 0) throw new Error(DELETE_ERROR);
}

export async function createHomeItem(input: NewHomeItemInput): Promise<void> {
  await insertItem({
    kind: input.kind,
    section_id: input.sectionId,
    label: input.label,
    sort_order: input.sortOrder,
    is_visible: true,
    published: input.publish ? input.content : {},
    draft: input.publish ? null : input.content,
  });
}

export async function createHomeSection(input: {
  label: string;
  sortOrder: number;
  title: HomeItemContent;
  description: HomeItemContent | null;
  publish: boolean;
}): Promise<void> {
  const sectionId = await insertItem({
    kind: 'section',
    section_id: null,
    label: input.label,
    sort_order: input.sortOrder,
    is_visible: true,
    published: {},
    draft: null,
  });

  await createHomeItem({
    kind: 'text',
    sectionId,
    label: 'Título da seção',
    sortOrder: 20,
    content: input.title,
    publish: input.publish,
  });

  if (input.description) {
    await createHomeItem({
      kind: 'text',
      sectionId,
      label: 'Descrição da seção',
      sortOrder: 30,
      content: input.description,
      publish: input.publish,
    });
  }
}
