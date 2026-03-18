import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const isUrlValid = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Mock implementation for demo mode
const createMockClient = () => {
  const mockStorage: Record<string, any[]> = {
    parts: JSON.parse(localStorage.getItem('mock_parts') || '[]'),
    users: JSON.parse(localStorage.getItem('mock_users') || '[]'),
    transactions: JSON.parse(localStorage.getItem('mock_transactions') || '[]'),
    notifications: JSON.parse(localStorage.getItem('mock_notifications') || '[]'),
  };

  const save = () => {
    Object.entries(mockStorage).forEach(([key, val]) => {
      localStorage.setItem(`mock_${key}`, JSON.stringify(val));
    });
  };

  const chain = (table: string) => {
    let data = [...(mockStorage[table] || [])];
    return {
      select: () => ({
        order: () => ({ data, error: null }),
        eq: () => ({ single: () => ({ data: data[0], error: null }), data, error: null }),
        data,
        error: null,
      }),
      insert: (items: any[]) => {
        const newItems = Array.isArray(items) ? items : [items];
        mockStorage[table] = [...(mockStorage[table] || []), ...newItems];
        save();
        return { error: null };
      },
      upsert: (items: any[]) => {
        const newItems = Array.isArray(items) ? items : [items];
        // Simple upsert logic for mock
        const existing = mockStorage[table] || [];
        newItems.forEach(item => {
          const idx = existing.findIndex(e => e.email === item.email || e.pn === item.pn || e.id === item.id);
          if (idx >= 0) existing[idx] = item;
          else existing.push(item);
        });
        mockStorage[table] = [...existing];
        save();
        return { error: null };
      },
      update: (item: any) => {
        return {
          eq: (key: string, val: any) => {
            const existing = mockStorage[table] || [];
            const idx = existing.findIndex(e => e[key] === val);
            if (idx >= 0) existing[idx] = { ...existing[idx], ...item };
            mockStorage[table] = [...existing];
            save();
            return { error: null };
          }
        };
      },
      delete: () => ({
        eq: (key: string, val: any) => {
          mockStorage[table] = (mockStorage[table] || []).filter(e => e[key] !== val);
          save();
          return { error: null };
        },
        neq: (key: string, val: any) => {
          mockStorage[table] = (mockStorage[table] || []).filter(e => e[key] === val);
          save();
          return { error: null };
        }
      })
    };
  };

  return {
    from: chain,
    auth: {
      signInWithPassword: async ({ email }: any) => {
        const user = (mockStorage.users || []).find(u => u.email === email);
        if (user) return { data: { user: { email, user_metadata: { fullName: user.fullName } } }, error: null };
        return { data: { user: null }, error: { message: 'User not found in mock mode' } };
      },
      signUp: async ({ email, options }: any) => {
        const newUser = { email, fullName: options.data.fullName };
        mockStorage.users = [...(mockStorage.users || []), newUser];
        save();
        return { data: { user: { email } }, error: null };
      },
      signOut: async () => ({ error: null }),
    }
  };
};

let _supabase: any = null;

export const supabase = new Proxy({} as any, {
  get(_, prop) {
    if (!_supabase) {
      if (!isUrlValid(supabaseUrl)) {
        console.info('Using Mock Supabase Client (Demo Mode). Set VITE_SUPABASE_URL to use real database.');
        _supabase = createMockClient();
      } else {
        _supabase = createClient(supabaseUrl, supabaseAnonKey);
      }
    }
    const value = _supabase[prop];
    if (typeof value === 'function') {
      return value.bind(_supabase);
    }
    return value;
  }
});
