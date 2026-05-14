import { createClient } from '@/lib/supabase/server';

export type AIInsight = {
  content: string;
  generated_at: string;
};

async function readCached(
  businessId: string,
  insightType: 'daily' | 'report',
  contextKey?: string
): Promise<AIInsight | null> {
  const supabase = await createClient();
  let query = supabase
    .from('ai_insights')
    .select('content, generated_at, context_data')
    .eq('business_id', businessId)
    .eq('insight_type', insightType)
    .gt('expires_at', new Date().toISOString())
    .order('generated_at', { ascending: false })
    .limit(1);

  const { data } = await query;
  const row = data?.[0];
  if (!row) return null;

  if (contextKey) {
    const ctx = row.context_data as { key?: string } | null;
    if (ctx?.key && ctx.key !== contextKey) return null;
  }

  return { content: row.content, generated_at: row.generated_at };
}

async function invokeGenerate(body: Record<string, unknown>): Promise<AIInsight | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.functions.invoke('generate-insights', { body });
  if (error || !data || typeof data !== 'object') return null;
  const d = data as { content?: string; generated_at?: string; error?: string };
  if (d.error || !d.content) return null;
  return {
    content: d.content,
    generated_at: d.generated_at ?? new Date().toISOString(),
  };
}

export async function getDailyInsight(businessId: string): Promise<AIInsight | null> {
  const cached = await readCached(businessId, 'daily');
  if (cached) return cached;
  return invokeGenerate({ insight_type: 'daily' });
}

export async function getReportInsight(
  businessId: string,
  month: number,
  year: number
): Promise<AIInsight | null> {
  const key = `${year}-${String(month).padStart(2, '0')}`;
  const cached = await readCached(businessId, 'report', key);
  if (cached) return cached;
  return invokeGenerate({ insight_type: 'report', month, year });
}
