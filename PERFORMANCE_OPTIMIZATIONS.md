# 🚀 Performance Optimization Plan

## 🔍 Issues Identified

### Critical Issues
1. **Multiple Supabase Queries on Auth** - `auth-context.tsx` fetches profile on every auth state change
2. **Duplicate Subscription Checks** - Two hooks (`use-subscription.ts` and `use-subscription-status.ts`) doing similar queries
3. **Real-time Subscriptions** - `use-subscription-status.ts` creates real-time channel on every mount
4. **No Redis Configuration** - Health check shows `redis: missing`
5. **Large Bundle Size** - Many Radix UI components imported
6. **No Code Splitting** - All AI flows imported in `actions.ts`

### Medium Issues
7. **Unoptimized Images** - No lazy loading configuration
8. **No Caching Strategy** - API responses not cached
9. **Blocking Data Fetches** - Sequential Supabase queries
10. **Heavy Dependencies** - KaTeX, Recharts loaded on every page

---

## ✅ Optimizations to Implement

### 1. Optimize Auth Context (Critical)
**Problem:** Fetches profile on every auth change  
**Solution:** Cache profile, debounce updates

### 2. Consolidate Subscription Hooks (Critical)
**Problem:** Two hooks doing same work  
**Solution:** Merge into one optimized hook

### 3. Remove Real-time Subscription (High)
**Problem:** Creates WebSocket connection unnecessarily  
**Solution:** Use polling or remove if not needed

### 4. Add Redis Configuration (High)
**Problem:** Missing Redis for caching  
**Solution:** Configure Upstash Redis properly

### 5. Dynamic Imports for AI Flows (High)
**Problem:** All AI flows loaded upfront  
**Solution:** Lazy load AI flows

### 6. Optimize Component Imports (Medium)
**Problem:** Large Radix UI bundle  
**Solution:** Tree-shake unused components

### 7. Add Response Caching (Medium)
**Problem:** No API caching  
**Solution:** Add SWR or React Query

### 8. Lazy Load Heavy Components (Medium)
**Problem:** KaTeX, Recharts loaded immediately  
**Solution:** Dynamic imports with loading states

---

## 📝 Implementation Priority

### Phase 1: Quick Wins (30 min)
- ✅ Fix Redis configuration
- ✅ Remove duplicate subscription hook
- ✅ Add profile caching in auth context
- ✅ Disable unnecessary real-time subscriptions

### Phase 2: Code Splitting (1 hour)
- ✅ Dynamic import AI flows
- ✅ Lazy load heavy components
- ✅ Split vendor chunks

### Phase 3: Advanced (2 hours)
- Add SWR for data fetching
- Implement service worker
- Add image optimization
- Bundle analysis and tree-shaking

---

## 🎯 Expected Results

**Before:**
- Initial Load: ~3-5s
- Time to Interactive: ~4-6s
- Bundle Size: ~800KB
- Redis: Missing

**After Phase 1:**
- Initial Load: ~2-3s (33% faster)
- Time to Interactive: ~3-4s (33% faster)
- Bundle Size: ~600KB (25% smaller)
- Redis: Configured

**After Phase 2:**
- Initial Load: ~1-2s (60% faster)
- Time to Interactive: ~2-3s (50% faster)
- Bundle Size: ~400KB (50% smaller)

**After Phase 3:**
- Initial Load: <1s (80% faster)
- Time to Interactive: <2s (67% faster)
- Bundle Size: ~300KB (62% smaller)
