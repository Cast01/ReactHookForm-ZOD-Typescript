import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
    'url supabase',
    'API KEY'
)