import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dkukufaeeuoigogbytrw.supabase.co';
const supabaseAnonKey = 'sb_publishable_l2Kcg0mMQhgScvvNeiTEHQ_zz--KRsH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
