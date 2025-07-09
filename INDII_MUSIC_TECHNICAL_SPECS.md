# INDII.MUSIC TECHNICAL SPECIFICATIONS DATABASE
## Detailed Technical Reference for Development

**Last Updated:** July 2025
**Version:** 1.0

---

## 🗄️ DATABASE SCHEMAS

### User Management Schema
```sql
-- Users table (multi-role support)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('artist', 'fan', 'licensor', 'provider', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Artist profiles
CREATE TABLE artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stage_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  bio TEXT,
  website VARCHAR(255),
  pro_affiliation VARCHAR(100), -- ASCAP, BMI, SESAC
  ipi_number VARCHAR(50),
  social_links JSONB,
  profile_image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fan profiles
CREATE TABLE fan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  music_preferences JSONB, -- genres, moods, artists
  listening_history JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Licensor profiles
CREATE TABLE licensor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  industry VARCHAR(100), -- film, TV, ads, games
  budget_range VARCHAR(50),
  licensing_needs TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service provider profiles
CREATE TABLE service_provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  service_categories JSONB, -- mixing, mastering, design, etc.
  skills JSONB,
  experience_years INTEGER,
  portfolio_urls JSONB,
  rates JSONB, -- hourly, per-track, per-project
  availability_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Music & Content Schema
```sql
-- Tracks table
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  album_title VARCHAR(255),
  genre VARCHAR(100),
  mood_tags JSONB,
  instrumentation JSONB,
  tempo_bpm INTEGER,
  key_signature VARCHAR(10),
  duration_seconds INTEGER,
  isrc VARCHAR(12),
  iswc VARCHAR(15),
  explicit_content BOOLEAN DEFAULT FALSE,
  language VARCHAR(50),
  release_date DATE,
  original_release_date DATE,
  copyright_holder VARCHAR(255),
  ai_tags JSONB, -- AI-generated metadata
  file_url VARCHAR(500),
  cover_art_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Split sheets table
CREATE TABLE split_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  agreement_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, signed, rejected
  total_percentage DECIMAL(5,2) DEFAULT 100.00,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Split sheet contributors
CREATE TABLE split_sheet_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_sheet_id UUID REFERENCES split_sheets(id) ON DELETE CASCADE,
  contributor_email VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255) NOT NULL,
  role VARCHAR(100), -- lyricist, composer, producer, etc.
  pro_affiliation VARCHAR(100),
  ipi_number VARCHAR(50),
  publishing_company VARCHAR(255),
  ownership_percentage DECIMAL(5,2) NOT NULL,
  master_ownership_percentage DECIMAL(5,2),
  signature_data TEXT, -- digital signature
  signature_timestamp TIMESTAMP,
  signature_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project workspaces
CREATE TABLE project_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  associated_track_id UUID REFERENCES tracks(id),
  collaborators JSONB, -- array of user IDs and permissions
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workspace files
CREATE TABLE workspace_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES project_workspaces(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  file_url VARCHAR(500),
  uploaded_by UUID REFERENCES users(id),
  version_number INTEGER DEFAULT 1,
  parent_file_id UUID REFERENCES workspace_files(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workspace tasks
CREATE TABLE workspace_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES project_workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'todo', -- todo, in_progress, done
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Royalty & Revenue Schema
```sql
-- Royalty sources
CREATE TABLE royalty_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name VARCHAR(255) NOT NULL, -- Spotify, Apple Music, ASCAP, etc.
  source_type VARCHAR(100) NOT NULL, -- DSP, PRO, Sync, Direct, Content_ID
  api_config JSONB, -- API configuration for automated imports
  created_at TIMESTAMP DEFAULT NOW()
);

-- Royalty records
CREATE TABLE royalty_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id),
  source_id UUID REFERENCES royalty_sources(id),
  revenue_period_start DATE,
  revenue_period_end DATE,
  gross_revenue DECIMAL(10,2),
  platform_commission DECIMAL(10,2),
  third_party_fees DECIMAL(10,2),
  net_payout DECIMAL(10,2),
  streams_count INTEGER,
  territory VARCHAR(100),
  currency VARCHAR(3) DEFAULT 'USD',
  processed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payout records
CREATE TABLE payout_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2),
  payout_method VARCHAR(100), -- PayPal, bank_transfer, etc.
  payout_details JSONB, -- encrypted payout account info
  status VARCHAR(50) DEFAULT 'pending', -- pending, processed, failed
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Marketplace & Licensing Schema
```sql
-- Service marketplace orders
CREATE TABLE marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES service_provider_profiles(id) ON DELETE CASCADE,
  service_type VARCHAR(100),
  project_description TEXT,
  agreed_price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'requested', -- requested, accepted, in_progress, completed, cancelled
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sync licensing requests
CREATE TABLE sync_licensing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  licensor_id UUID REFERENCES licensor_profiles(id) ON DELETE CASCADE,
  media_type VARCHAR(100), -- film, TV, web_ad, game, etc.
  usage_context VARCHAR(255),
  duration_of_use VARCHAR(100),
  territory VARCHAR(100),
  exclusivity VARCHAR(50), -- exclusive, non_exclusive
  license_fee DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, signed
  contract_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sound Locker content
CREATE TABLE sound_locker_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(100), -- audio, video, image, document
  file_url VARCHAR(500),
  access_type VARCHAR(50), -- free, one_time_purchase, subscription_tier
  price DECIMAL(10,2),
  subscription_tier VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sound Locker purchases
CREATE TABLE sound_locker_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES sound_locker_content(id) ON DELETE CASCADE,
  fan_id UUID REFERENCES fan_profiles(id) ON DELETE CASCADE,
  purchase_price DECIMAL(10,2),
  payment_method VARCHAR(100),
  access_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Communication & Community Schema
```sql
-- Internal messaging
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'direct', -- direct, group, system
  context_type VARCHAR(50), -- marketplace, licensing, collaboration
  context_id UUID, -- reference to relevant record
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- new_message, royalty_payout, etc.
  title VARCHAR(255) NOT NULL,
  content TEXT,
  action_url VARCHAR(500),
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community forums
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_post_id UUID REFERENCES forum_posts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API INTEGRATION SPECIFICATIONS

### Music Distribution APIs
```javascript
// SonoSuite Integration
const SONOSUITE_CONFIG = {
  baseURL: 'https://api.sonosuite.com/v1',
  endpoints: {
    releases: '/releases',
    tracks: '/tracks',
    artists: '/artists',
    royalties: '/royalties'
  },
  authentication: 'Bearer Token',
  rateLimit: '100 requests/minute'
};

// Revelator Integration
const REVELATOR_CONFIG = {
  baseURL: 'https://api.revelator.com/v2',
  endpoints: {
    distribution: '/distribution',
    analytics: '/analytics',
    payouts: '/payouts'
  },
  authentication: 'API Key',
  rateLimit: '500 requests/hour'
};
```

### AI Provider Integration
```javascript
// Multi-Provider AI Configuration
const AI_PROVIDERS = {
  openai: {
    model: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 4000,
    temperature: 0.7
  },
  anthropic: {
    model: 'claude-3-5-sonnet-20241022',
    apiKey: process.env.ANTHROPIC_API_KEY,
    endpoint: 'https://api.anthropic.com/v1/messages',
    maxTokens: 4000,
    temperature: 0.7
  },
  google: {
    model: 'gemini-1.5-flash',
    apiKey: process.env.GOOGLE_AI_API_KEY,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    maxTokens: 2048,
    temperature: 0.7
  }
};
```

### Payment Processing
```javascript
// Stripe Configuration
const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  supportedPaymentMethods: ['card', 'paypal', 'bank_transfer'],
  currencies: ['USD', 'EUR', 'GBP', 'CAD']
};
```

---

## 🎨 UI/UX COMPONENT SPECIFICATIONS

### Dashboard Widget System
```typescript
interface DashboardWidget {
  id: string;
  type: 'royalty_snapshot' | 'recent_messages' | 'upcoming_tasks' | 'marketplace_activity' | 'fan_engagement';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  refreshInterval: number; // in seconds
  userRole: UserRole[];
  data: any;
  isVisible: boolean;
}

// Widget-specific interfaces
interface RoyaltySnapshot {
  totalEarnings: number;
  monthlyChange: number;
  topEarningTrack: string;
  lastPayoutDate: string;
}

interface RecentMessages {
  messages: {
    id: string;
    sender: string;
    subject: string;
    timestamp: Date;
    unread: boolean;
  }[];
}
```

### Audio Player Component
```typescript
interface AudioPlayerProps {
  track: {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    coverArt: string;
    duration: number;
  };
  playlist?: Track[];
  showWaveform: boolean;
  showEqualizer: boolean;
  allowComments: boolean;
  allowDownload: boolean;
  onPlay: (trackId: string) => void;
  onPause: (trackId: string) => void;
  onTimeUpdate: (currentTime: number) => void;
}
```

---

## 🛡️ SECURITY SPECIFICATIONS

### Authentication & Authorization
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

// Role-based permissions
const PERMISSIONS = {
  artist: [
    'upload_tracks',
    'create_releases',
    'manage_split_sheets',
    'access_royalties',
    'create_projects',
    'manage_sound_locker'
  ],
  fan: [
    'create_playlists',
    'purchase_content',
    'access_community',
    'follow_artists'
  ],
  licensor: [
    'search_sync_catalog',
    'request_licenses',
    'manage_projects'
  ],
  provider: [
    'list_services',
    'manage_orders',
    'access_marketplace'
  ]
};
```

### Data Encryption
```typescript
// File encryption for sensitive data
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 64,
  tagLength: 16
};

// Database field encryption
const ENCRYPTED_FIELDS = [
  'users.password_hash',
  'payout_records.payout_details',
  'split_sheet_contributors.signature_data'
];
```

---

## 🚀 DEPLOYMENT SPECIFICATIONS

### Vercel Configuration
```json
{
  "name": "indii-music",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "OPENAI_API_KEY": "@openai-api-key",
    "ANTHROPIC_API_KEY": "@anthropic-api-key",
    "GOOGLE_AI_API_KEY": "@google-ai-api-key",
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "regions": ["iad1"],
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Supabase Configuration
```sql
-- Row Level Security Policies
CREATE POLICY "Users can only access their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Artists can manage their own tracks" ON tracks
  FOR ALL USING (
    artist_id IN (
      SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public read access to published tracks" ON tracks
  FOR SELECT USING (release_date <= NOW());
```

---

## 📊 ANALYTICS & MONITORING

### Performance Metrics
```typescript
interface PlatformMetrics {
  technical: {
    responseTime: number;
    errorRate: number;
    uptime: number;
    databaseConnections: number;
    memoryUsage: number;
  };
  business: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    revenuePerUser: number;
    conversionRate: number;
    churnRate: number;
  };
  user: {
    registrationRate: number;
    onboardingCompletion: number;
    featureAdoption: Record<string, number>;
    supportTickets: number;
  };
}
```

### Event Tracking
```typescript
// Analytics event structure
interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  context: {
    userAgent: string;
    ip: string;
    referrer: string;
    page: string;
  };
}

// Key events to track
const TRACKED_EVENTS = [
  'user_registration',
  'track_upload',
  'release_creation',
  'split_sheet_signed',
  'marketplace_order',
  'sync_license_request',
  'sound_locker_purchase'
];
```

---

**END OF TECHNICAL SPECIFICATIONS DATABASE**

*This document provides comprehensive technical specifications for the indii.music platform. Use as reference for implementation and integration with other systems.*