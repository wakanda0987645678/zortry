import { createClient } from '@supabase/supabase-js';
import { type Coin, type InsertCoin, type UpdateCoin } from '@shared/schema';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseStorage {
  async getAllCoins(): Promise<Coin[]> {
    const { data, error } = await supabase.from('coins').select('*');
    if (error) throw error;
    return data as Coin[];
  }

  async getCoin(id: string): Promise<Coin | undefined> {
    const { data, error } = await supabase.from('coins').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as Coin | undefined;
  }

  async getCoinByAddress(address: string): Promise<Coin | undefined> {
    const { data, error } = await supabase.from('coins').select('*').eq('address', address).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as Coin | undefined;
  }

  async getCoinsByCreator(creator: string): Promise<Coin[]> {
    const { data, error } = await supabase.from('coins').select('*').eq('creator', creator);
    if (error) throw error;
    return data as Coin[];
  }

  async createCoin(insertCoin: InsertCoin): Promise<Coin> {
    const { data, error } = await supabase.from('coins').insert([insertCoin]).select('*').single();
    if (error) throw error;
    return data as Coin;
  }

  async updateCoin(id: string, update: UpdateCoin): Promise<Coin | undefined> {
    const { data, error } = await supabase.from('coins').update(update).eq('id', id).select('*').single();
    if (error) throw error;
    return data as Coin | undefined;
  }
}
