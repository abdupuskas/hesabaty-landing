import { createClient } from '@/lib/supabase/server';

export type Business = {
  id: string;
  user_id: string;
  name: string;
  industry: string;
  custom_industry_name: string | null;
};

export async function getCurrentBusiness(): Promise<Business | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('businesses')
    .select('id, user_id, name, industry, custom_industry_name')
    .eq('user_id', user.id)
    .maybeSingle();

  return data ?? null;
}
