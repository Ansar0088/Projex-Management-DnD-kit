
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhvebgbotfnzktzbapuz.supabase.co';
const supabaseKey =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odmViZ2JvdGZuemt0emJhcHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MzQxNDMsImV4cCI6MjA1MzExMDE0M30.l_KuCXE00fRGWN4mqmx4S0TfnxjO62iCjO3TirgAhMs';
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('Supabase Client Initialized:', supabase);

export interface IUserLink {
  id: string;
  label: string;    
  url: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  description: string;
  avatar: string;
  created_at: Date;
  updated_at: Date;
  links: IUserLink[];
  provider: 'google' | 'github' | 'email';
}

export const users = {
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as IUser | null;
  },

  async createUser(user: Partial<IUser>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data as IUser;
  },

  async captureUserDetails(authUser: User) {
    // Check if user already exists
    const existingUser = await this.getUser(authUser.id).catch(() => null);
    if (existingUser) return existingUser;

    // Extract provider
    const provider = authUser.app_metadata.provider as IUser['provider'];

    // Create new user
    const newUser: Partial<IUser> = {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata.full_name || authUser.email!.split('@')[0],
      avatar: authUser.user_metadata.avatar_url || '',
      description: '',
      provider,
      links: [],
    };

    return await this.createUser(newUser);
  },

  async updateUser(id: string, updates: Partial<IUser>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as IUser;
  },

  async updateProfile(
    userId: string,
    updates: Partial<Omit<IUser, 'id' | 'email' | 'provider'>>
  ) {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;

    // Update auth user metadata if avatar or name changed
    const metadata: { avatar_url?: string; full_name?: string } = {};

    if (updates.avatar !== undefined) {
      metadata.avatar_url = updates.avatar;
    }

    if (updates.name !== undefined) {
      metadata.full_name = updates.name;
    }

    if (Object.keys(metadata).length > 0) {
      const { error: authError } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (authError) {
        console.error('Failed to update auth user metadata:', authError);
      }
    }
  },
};