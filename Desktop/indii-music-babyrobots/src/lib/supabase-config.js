import { createClient } from '@supabase/supabase-js';

// Environment configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Configuration validation
export const validateSupabaseConfig = () => {
  const errors = [];
  
  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  
  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  
  if (!supabaseServiceKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey
  };
};

// Create Supabase clients
let supabaseClientInstance = null;
let supabaseAdminInstance = null;

export const createSupabaseClient = () => {
  if (!supabaseClientInstance && supabaseUrl && supabaseAnonKey) {
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      }
    });
  }
  return supabaseClientInstance;
};

export const createSupabaseAdmin = () => {
  if (!supabaseAdminInstance && supabaseUrl && supabaseServiceKey) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });
  }
  return supabaseAdminInstance;
};

// Health check function
export const checkSupabaseConnection = async () => {
  try {
    const config = validateSupabaseConfig();
    
    if (!config.isValid) {
      return {
        connected: false,
        error: 'Configuration invalid',
        details: config.errors
      };
    }
    
    const client = createSupabaseClient();
    
    if (!client) {
      return {
        connected: false,
        error: 'Failed to create Supabase client'
      };
    }
    
    // Test connection with a simple query
    const { data, error } = await client
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      // If users table doesn't exist yet, that's okay for setup
      if (error.code === 'PGRST116' || error.message.includes('relation "users" does not exist')) {
        return {
          connected: true,
          warning: 'Database connected but schema not yet created',
          needsMigration: true
        };
      }
      
      return {
        connected: false,
        error: error.message,
        code: error.code
      };
    }
    
    return {
      connected: true,
      message: 'Supabase connection successful'
    };
    
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

// Auth helpers
export const supabaseAuth = {
  signUp: async (email, password, metadata = {}) => {
    const client = createSupabaseClient();
    return await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },
  
  signIn: async (email, password) => {
    const client = createSupabaseClient();
    return await client.auth.signInWithPassword({
      email,
      password
    });
  },
  
  signOut: async () => {
    const client = createSupabaseClient();
    return await client.auth.signOut();
  },
  
  getUser: async () => {
    const client = createSupabaseClient();
    return await client.auth.getUser();
  },
  
  getSession: async () => {
    const client = createSupabaseClient();
    return await client.auth.getSession();
  }
};

// Database helpers
export const supabaseDB = {
  // User operations
  createUser: async (userData) => {
    const admin = createSupabaseAdmin();
    return await admin
      .from('users')
      .insert(userData)
      .select()
      .single();
  },
  
  getUserByEmail: async (email) => {
    const client = createSupabaseClient();
    return await client
      .from('users')
      .select('*, artistProfile(*), fanProfile(*), licensorProfile(*), serviceProviderProfile(*)')
      .eq('email', email)
      .single();
  },
  
  getUserById: async (id) => {
    const client = createSupabaseClient();
    return await client
      .from('users')
      .select('*, artistProfile(*), fanProfile(*), licensorProfile(*), serviceProviderProfile(*)')
      .eq('id', id)
      .single();
  },
  
  // Profile operations
  createProfile: async (table, profileData) => {
    const client = createSupabaseClient();
    return await client
      .from(table)
      .insert(profileData)
      .select()
      .single();
  },
  
  updateProfile: async (table, id, profileData) => {
    const client = createSupabaseClient();
    return await client
      .from(table)
      .update(profileData)
      .eq('userId', id)
      .select()
      .single();
  }
};

// Storage helpers
export const supabaseStorage = {
  uploadFile: async (bucket, fileName, file, options = {}) => {
    const client = createSupabaseClient();
    return await client.storage
      .from(bucket)
      .upload(fileName, file, options);
  },
  
  downloadFile: async (bucket, fileName) => {
    const client = createSupabaseClient();
    return await client.storage
      .from(bucket)
      .download(fileName);
  },
  
  getPublicUrl: (bucket, fileName) => {
    const client = createSupabaseClient();
    return client.storage
      .from(bucket)
      .getPublicUrl(fileName);
  },
  
  deleteFile: async (bucket, fileName) => {
    const client = createSupabaseClient();
    return await client.storage
      .from(bucket)
      .remove([fileName]);
  }
};

// Main exports
export const supabase = createSupabaseClient();
export const supabaseAdmin = createSupabaseAdmin();

export default {
  client: supabase,
  admin: supabaseAdmin,
  auth: supabaseAuth,
  db: supabaseDB,
  storage: supabaseStorage,
  config: validateSupabaseConfig,
  checkConnection: checkSupabaseConnection
};
