# INDII.MUSIC PROJECT DATABASE
## Comprehensive Knowledge Base for Development Reference

**Last Updated:** July 2025
**Version:** 1.0
**Status:** Active Development

---

## 📋 PROJECT OVERVIEW

### Core Mission
**indii.music** (formerly IndieLeap) is a comprehensive digital ecosystem designed to empower independent music artists through integrated, transparent, and fair tools that support the entire music lifecycle.

### Four Fundamental Principles
1. **Integration** - Breaking down silos between artist tools/workflows
2. **Transparency** - Clear, understandable data and insights
3. **Fairness** - Equitable treatment and compensation structures
4. **Artist Empowerment** - Tools, data, control, and opportunities

### Target Users
- **Primary:** Independent Music Artists
- **Secondary:** Music Fans, Licensors, Service Providers

---

## 🎯 CORE VALUE PROPOSITION

### Artist Pain Points Addressed
- Complex, opaque royalty systems
- Low streaming payouts and unclear deductions
- Distribution hurdles and poor support
- High cost of professional services
- Fragmented tools requiring multiple platforms
- Difficult sync licensing access
- Limited direct fan engagement options

### Unique Selling Points
- **All-in-one platform** - Distribution, royalties, collaboration, licensing, fan engagement
- **~80% artist revenue retention** - Fair compensation model
- **AI-powered assistance** - Role-specific intelligent agents
- **Complete data ownership** - Full export capabilities
- **Transparent fee structures** - No hidden costs
- **Direct fan monetization** - Sound Locker, merchandise integration

---

## 🤖 AI AGENT SYSTEM

### Current Implementation Status: ✅ WORKING
**Platform:** Gemini-powered, multi-role system
**Location:** localhost:2001

### Six Specialized AI Assistants

#### 1. Artist Assistant (Primary)
**Role ID:** `artist`
**Icon:** 🎵
**Core Capabilities:**
- Release planning & checklist generation
- Marketing strategy & social media guidance
- Royalty explanation & analytics interpretation
- Career development advice
- Platform tutorials & task management
- Scheduling & reminders

**Key Functions to Implement:**
- Generate customized release checklists with timelines
- Draft social media posts for different platforms
- Identify relevant playlist curators
- Explain royalty data and analytics trends
- Create task reminders and priority lists

#### 2. Fan Assistant
**Role ID:** `fan`
**Icon:** 🎧
**Core Capabilities:**
- Personalized music recommendations
- AI playlist generation from natural language
- Artist discovery and exploration
- Sound Locker feature guidance
- Community interaction help

#### 3. Sync Licensing Assistant
**Role ID:** `licensor`
**Icon:** 🎬
**Core Capabilities:**
- Music search & discovery for licensing
- Licensing process guidance
- Contract explanations
- Budget recommendations
- Usage rights clarification

#### 4. Service Provider Assistant
**Role ID:** `provider`
**Icon:** 🛠️
**Core Capabilities:**
- Marketplace navigation
- Project management
- Payment processing help
- Profile optimization
- Quality standards guidance

#### 5. Music Legal Assistant
**Role ID:** `legal`
**Icon:** ⚖️
**Core Capabilities:**
- Contract explanations (NOT legal advice)
- Rights management information
- Copyright basics
- PRO registration guidance
- Industry legal concepts

#### 6. General Platform Assistant
**Role ID:** `general`
**Icon:** 🎼
**Core Capabilities:**
- Platform navigation
- Feature explanations
- Getting started guidance
- Account setup help
- General troubleshooting

---

## 🏗️ TECHNICAL SPECIFICATIONS

### Updated Tech Stack (July 2025)

#### Frontend
- **React 19** with Next.js 15 (App Router)
- **Tailwind CSS + Shadcn/ui** - Design system
- **Zustand** - Client state management
- **TanStack Query** - Server state management
- **Framer Motion** - Animations
- **React Three Fiber** - WebGL integration

#### Backend/AI
- **Multi-Provider AI:** OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini
- **Supabase** - Database, Auth, Storage
- **Vercel** - Deployment and hosting
- **tRPC** - Type-safe API layer
- **Prisma** - Database ORM
- **Upstash Redis** - Edge caching

#### Integrations
- **Resend** - Email service
- **Stripe** - Payment processing
- **Various Music APIs** - Distribution, royalty collection

### Current Architecture
- **Platform-Managed Storage** with complete data export
- **Multi-API Integration** strategy for MVP
- **Progressive Web App** capabilities
- **Mobile-first responsive design**

---

## 📱 CORE PLATFORM FEATURES

### 1. Unified Dashboard
**Status:** Not Implemented
- Customizable widget-based interface
- Role-based information display
- Real-time data aggregation
- Cross-module integration

### 2. Music Distribution Workflow
**Status:** Planned
- Native distribution option
- Third-party distributor integration
- Metadata management
- Release scheduling and tracking

### 3. Royalty Management & Analytics
**Status:** Planned
- Comprehensive royalty dashboard
- Multiple revenue stream tracking
- Transparent fee breakdowns
- Performance insights engine

### 4. Collaboration Suite
**Status:** Planned
- **Split Sheets:** Digital collaboration agreements
- **Project Workspaces:** File sharing, task management
- **Time-based Audio Comments:** Precise feedback system

### 5. Service Provider Marketplace
**Status:** Planned
- Vetted professional services
- Secure project management
- Escrow payment system
- Rating and review system

### 6. Sync Licensing Portal
**Status:** Planned
- Advanced music search and filtering
- License request workflow
- Contract generation and signing
- Payment processing

### 7. Fan Engagement (Sound Locker)
**Status:** Planned
- Exclusive content monetization
- Direct fan support options
- Community interaction features

### 8. Marketing & Promotion Toolkit
**Status:** Planned
- EPK generator
- Smart links and pre-save campaigns
- Social media integration
- Analytics dashboard

---

## 💰 MONETIZATION STRATEGY

### Revenue Streams

#### Primary
1. **Artist Subscriptions** - Tiered plans for platform access
2. **Distribution Commission** - Small, transparent percentage
3. **Marketplace Transaction Fees** - Service provider commissions
4. **Sync Licensing Fees** - Commission on licensing deals

#### Secondary
5. **Premium Feature Tiers** - Enhanced analytics, AI usage, customization
6. **Direct Fan Support Fees** - Platform fee on Sound Locker transactions
7. **Add-on Services** - Extra storage, premium placement, advanced tools

#### Models to Avoid
- High upfront per-release fees
- Opaque royalty deductions
- Selling user data
- Charging for essential features
- Aggressive advertising

### Core Principle
**Fair Revenue Split:** Artists retain ~80% of earnings

---

## 👥 USER JOURNEYS

### Artist: Onboarding & First Release
1. **Sign Up** - Create account, select "Artist" role
2. **Onboarding Wizard** - Profile setup, payment methods, PRO linking
3. **Dashboard Intro** - Guided tour of features
4. **Create Release** - Upload assets, enter metadata
5. **Distribution Setup** - Select platforms, review fees
6. **Release Scheduling** - Set dates and times
7. **Submit & Track** - Monitor progress via dashboard
8. **Post-Release** - Analytics, marketing tools

### Fan: Discovery & Engagement
1. **Sign Up/Login** - Create fan account
2. **Set Preferences** - Genre/artist preferences
3. **Discover Music** - Browse, search, filter content
4. **Engage** - Create playlists, follow artists
5. **Support Artists** - Purchase content, merchandise
6. **Community** - Forums, direct messaging

### Licensor: Search & License
1. **Sign Up** - Create licensor account
2. **Access Sync Portal** - Advanced search interface
3. **Search Music** - Filters, NLP search, similarity matching
4. **Preview & Select** - Watermarked previews, metadata review
5. **License Request** - Usage details, negotiation
6. **Contract & Payment** - Electronic signing, secure payment
7. **Receive Assets** - Download high-quality files

---

## 🌳 DEVELOPMENT METHODOLOGY: TREE RING SYSTEM

### Current Status: Ring 1 (Acorn) ✅ COMPLETE
**Foundation:** Core AI agent system operational

### Upcoming Rings

#### Ring 2: Fire Wood (Progressive Enhancement)
**Focus:** Enhanced AI capabilities and user management
- **Story Ring A:** Enhanced Artist Assistant
- **Story Ring B:** User Profile System

#### Ring 3: Tree Nursery (Component Collection)
**Focus:** Reusable UI components and core modules
- Dashboard widgets
- Audio player
- File management
- Notification system

#### Ring 4: Tree Graft (Integration Layer)
**Focus:** Connecting components into workflows
- Split sheets integration
- Release workflow
- Royalty tracking
- Basic fan engagement

#### Ring 5: Oyster Mushrooms (Complex Interactions)
**Focus:** Interconnected features
- Service marketplace
- Sync licensing portal
- Advanced analytics
- Community features

#### Ring 6: Fall Colors (Polish & Enhancement)
**Focus:** UI/UX improvements
- WebGL customization
- Advanced theming
- Mobile optimization
- Accessibility

#### Ring 7: Spring is in the Air (Platform Maturity)
**Focus:** Plugin architecture and extensibility
- Third-party integrations
- API ecosystem
- Advanced automation
- Enterprise features

### Metaphorical Keywords
- **Tree ring:** Next layer of functionality
- **Fire wood:** Progressive prompt sequences
- **Oyster mushrooms:** Complex interconnected features
- **Acorn:** Foundational elements
- **Tree graft:** Combining existing components
- **Tree nursery:** Collection of reusable components
- **Fall colors:** UI/UX enhancements
- **Winter came:** Optimization and simplification
- **Spring is in the air:** Major overhauls and new architectures
- **Story Rings:** User story-based development layers

---

## 🎵 PLATFORM FEATURES SPECIFICATION

### Core Integration Requirements
1. **Breaking Down Silos**
   - Unified dashboard consolidating all data
   - Cross-module workflow integration
   - Centralized communication system
   - Single sign-on experience

2. **Transparency Implementation**
   - Itemized royalty breakdowns
   - Clear fee structures
   - Process visibility dashboards
   - AI explainability features

3. **Fairness Mechanisms**
   - Artist-friendly terms of service
   - Standardized agreement templates
   - Dispute resolution system
   - Vetted marketplace standards

4. **Artist Empowerment Tools**
   - Complete data export capabilities
   - Granular control settings
   - Direct fan engagement features
   - Educational resources

---

## 📊 CURRENT IMPLEMENTATION STATUS

### ✅ COMPLETED
- Multi-role AI agent system (6 assistants)
- Basic chat interface with system commands
- Knowledge base with music industry expertise
- Role-based contextual responses
- Multi-API architecture foundation
- Gemini integration working

### 🟡 IN PROGRESS
- Enhanced AI agent capabilities
- User profile system design
- File upload architecture

### ❌ NOT STARTED
- Unified dashboard
- Distribution workflow
- Royalty management
- Collaboration suite
- Service marketplace
- Sync licensing portal
- Fan engagement features
- Marketing toolkit

---

## 🔧 DEVELOPMENT TOOLS & ENVIRONMENT

### Current Setup
- **Platform:** Next.js application
- **Port:** localhost:2001
- **AI Provider:** Google Gemini
- **Database:** Not yet implemented
- **Storage:** Not yet implemented

### Required Integrations
- **Music Distribution APIs:** SonoSuite, Revelator, DistroKid
- **Payment Processing:** Stripe, PayPal
- **Storage Solutions:** Supabase Storage
- **Email Services:** Resend
- **Analytics:** Custom implementation
- **PRO Integration:** ASCAP, BMI, SESAC APIs

---

## 📝 NEXT IMMEDIATE ACTIONS

### Ring 2 Implementation Priority
1. **Enhanced Artist Assistant Capabilities**
   - Release checklist generation
   - Social media post drafting
   - Task management system
   - Analytics interpretation

2. **User Profile System**
   - Multi-role user management
   - Profile customization
   - File upload capabilities
   - Basic project workspace

3. **Infrastructure Updates**
   - Migrate to updated tech stack
   - Implement database layer
   - Set up authentication system
   - Create file storage solution

---

## 🎯 SUCCESS METRICS

### Technical KPIs
- AI response accuracy and relevance
- Platform performance and uptime
- User onboarding completion rates
- Feature adoption rates

### Business KPIs
- Artist retention rate
- Revenue per artist
- Platform transaction volume
- User satisfaction scores

### Community KPIs
- Daily/monthly active users
- Community engagement levels
- Support ticket resolution times
- Feature request implementation rate

---

## 🔮 FUTURE VISION

### Year 1 Goals
- Complete core artist workflow
- Launch MVP with distribution integration
- Onboard first 1,000 artists
- Establish basic revenue streams

### Year 2 Goals
- Full feature platform launch
- Service marketplace maturity
- Fan engagement ecosystem
- International expansion

### Year 3+ Goals
- Industry standard platform
- Plugin ecosystem
- Enterprise solutions
- Global music industry transformation

---

**END OF DATABASE**

*This document serves as the comprehensive reference for the indii.music project development. Update regularly as features are implemented and requirements evolve.*