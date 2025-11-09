# Next Steps Roadmap

**Created:** 2025-01-28  
**Status:** Ready for Implementation  
**Purpose:** Prioritized roadmap for CinemaRebel project development

## Priority Overview

### 🔴 High Priority (Blocking Production)
1. **User Authentication (NextAuth.js)**
2. **Test Coverage Setup**

### 🟡 Medium Priority (Important Features)
3. **Search Integration into Discovery Page**
4. **Performance Optimizations**
5. **Export Library Functionality**

### 🟢 Low Priority (Enhancements)
6. **Enhanced Discovery Features**
7. **Project Cleanup**

---

## 1. User Authentication (NextAuth.js) 🔴 HIGH PRIORITY

### Current Status
- ✅ Demo user system implemented in `lib/auth.ts`
- ✅ Database schema supports user accounts
- ❌ No real authentication system
- ❌ No login/register pages
- ❌ No session management

### Implementation Tasks
- [ ] Install NextAuth.js and dependencies
- [ ] Configure NextAuth.js with database adapter (Prisma)
- [ ] Set up authentication providers (Email/Password, OAuth options)
- [ ] Create login page (`/auth/login`)
- [ ] Create register page (`/auth/register`)
- [ ] Create authentication API route (`/api/auth/[...nextauth]`)
- [ ] Update `lib/auth.ts` to use NextAuth sessions
- [ ] Add authentication middleware for protected routes
- [ ] Update all server actions to use authenticated sessions
- [ ] Add logout functionality
- [ ] Add user profile page
- [ ] Update settings page with user account management
- [ ] Add environment variables documentation
- [ ] Test authentication flow end-to-end

### Dependencies
- NextAuth.js
- NextAuth Prisma adapter
- Session management

### Estimated Complexity
- **Complexity:** 4/5 (Cross-module refactor)
- **Files:** ~15-20 files
- **LOC:** ~800-1000 LOC
- **Risk:** Medium (affects all routes)

### Success Criteria
- Users can register and login
- Sessions persist across page reloads
- Protected routes require authentication
- Demo user system can be disabled
- All existing functionality works with real auth

---

## 2. Test Coverage Setup 🔴 HIGH PRIORITY

### Current Status
- ❌ No test files
- ❌ No test configuration
- ❌ No CI/CD test runs

### Implementation Tasks
- [ ] Install Vitest and testing utilities
- [ ] Configure Vitest for Next.js
- [ ] Set up test environment variables
- [ ] Create test utilities and helpers
- [ ] Add unit tests for utility functions (`lib/tmdb.ts`, `lib/library-utils.ts`)
- [ ] Add unit tests for server actions (`server/actions/lists.ts`)
- [ ] Add component tests for critical components
- [ ] Add integration tests for API routes
- [ ] Add integration tests for TMDB API (mocked)
- [ ] Add E2E tests for critical user flows
- [ ] Set up test coverage reporting
- [ ] Add test scripts to package.json
- [ ] Configure CI/CD to run tests
- [ ] Set coverage thresholds

### Dependencies
- Vitest
- @testing-library/react
- @testing-library/jest-dom
- MSW (for API mocking)

### Estimated Complexity
- **Complexity:** 3/5 (New infrastructure)
- **Files:** ~30-40 test files
- **LOC:** ~1500-2000 LOC
- **Risk:** Low (additive only)

### Success Criteria
- Test coverage >70% for critical paths
- All tests pass in CI/CD
- Tests run on every commit
- Coverage reports generated
- Mocked external API calls

---

## 3. Search Integration into Discovery Page 🟡 MEDIUM PRIORITY

### Current Status
- ✅ Search page exists at `/search`
- ✅ Search functionality works
- ❌ Not integrated into Discovery page
- ❌ No API route for search

### Implementation Tasks
- [ ] Add search tab to Discovery page
- [ ] Create SearchSection component
- [ ] Create `/api/search` route (if needed for client-side)
- [ ] Integrate search with Discovery filters
- [ ] Add search history/localStorage
- [ ] Add search suggestions/autocomplete
- [ ] Update Discovery page navigation
- [ ] Test search integration

### Dependencies
- Existing search functionality
- Discovery page components

### Estimated Complexity
- **Complexity:** 2/5 (Feature addition)
- **Files:** ~5-8 files
- **LOC:** ~300-400 LOC
- **Risk:** Low (isolated feature)

### Success Criteria
- Search works as a tab in Discovery page
- Search integrates with existing filters
- Search history persists
- Search suggestions work
- Mobile responsive

---

## 4. Performance Optimizations 🟡 MEDIUM PRIORITY

### Current Status
- ✅ Basic optimizations (Suspense, image optimization)
- ✅ React.memo on MediaCard
- ❌ No request caching
- ❌ No virtual scrolling
- ❌ No request deduplication

### Implementation Tasks
- [ ] Add request caching for common filter combinations
- [ ] Implement virtual scrolling for large result sets
- [ ] Optimize API route response times
- [ ] Add request deduplication
- [ ] Implement stale-while-revalidate pattern
- [ ] Add response compression
- [ ] Optimize database queries
- [ ] Add pagination optimizations
- [ ] Implement lazy loading for images
- [ ] Add service worker for offline support (optional)

### Dependencies
- React Virtual (for virtual scrolling)
- SWR or React Query (for caching)
- Next.js caching strategies

### Estimated Complexity
- **Complexity:** 3/5 (Performance optimization)
- **Files:** ~10-15 files
- **LOC:** ~500-700 LOC
- **Risk:** Medium (performance-critical)

### Success Criteria
- API response times <200ms for cached requests
- Smooth scrolling for 1000+ items
- Reduced API calls by 50%+
- Improved Lighthouse scores
- Better user experience

---

## 5. Export Library Functionality 🟡 MEDIUM PRIORITY

### Current Status
- ❌ No export functionality
- ✅ Library data structure exists
- ✅ Database schema supports export

### Implementation Tasks
- [ ] Create export API route (`/api/export`)
- [ ] Add export button to library page
- [ ] Implement CSV export format
- [ ] Implement JSON export format
- [ ] Include watchlist in export
- [ ] Include custom lists in export
- [ ] Add export options (format, date range)
- [ ] Add export progress indicator
- [ ] Test export with large libraries
- [ ] Add export documentation

### Dependencies
- Existing library data structure
- CSV/JSON generation libraries

### Estimated Complexity
- **Complexity:** 2/5 (Feature addition)
- **Files:** ~3-5 files
- **LOC:** ~200-300 LOC
- **Risk:** Low (isolated feature)

### Success Criteria
- Users can export library to CSV/JSON
- Export includes all lists and items
- Export works with large libraries
- Export formats are valid and usable
- Export button is accessible

---

## 6. Enhanced Discovery Features 🟢 LOW PRIORITY

### Current Status
- ✅ Core discovery functionality complete
- ✅ Filters and sorting work
- ❌ No filter presets
- ❌ No filter preferences persistence
- ❌ No multi-language enhancement

### Implementation Tasks
- [ ] Add filter presets (e.g., "Action Movies 2020s", "European Films")
- [ ] Save filter preferences to localStorage
- [ ] Add filter history/undo functionality
- [ ] Improve multi-language support (multiple API calls)
- [ ] Add collection sharing functionality
- [ ] Add custom collection creation
- [ ] Improve mobile filter drawer UX
- [ ] Add filter animation/transitions

### Dependencies
- Existing discovery components
- localStorage API
- TMDB API

### Estimated Complexity
- **Complexity:** 2/5 (Feature enhancements)
- **Files:** ~8-12 files
- **LOC:** ~400-600 LOC
- **Risk:** Low (enhancement only)

### Success Criteria
- Filter presets work correctly
- Filter preferences persist across sessions
- Multi-language support improved
- Better mobile UX
- Enhanced user experience

---

## 7. Project Cleanup 🟢 LOW PRIORITY

### Current Status
- ✅ Project structure organized
- ❌ Old documentation files need archiving
- ❌ Unused reference code exists
- ❌ Build artifacts not in .gitignore

### Implementation Tasks
- [ ] Create `docs/archive/` directory
- [ ] Archive completed plan files
- [ ] Remove unused reference code (`v0-theming-reference/`)
- [ ] Clean up build artifacts
- [ ] Review and consolidate agent documentation
- [ ] Update .gitignore
- [ ] Remove unused image files
- [ ] Update documentation references

### Dependencies
- None

### Estimated Complexity
- **Complexity:** 1/5 (Cleanup)
- **Files:** ~10-15 files to archive/remove
- **LOC:** N/A (removal)
- **Risk:** Low (cleanup only)

### Success Criteria
- Old documentation archived
- Unused code removed
- Build artifacts ignored
- Documentation consolidated
- Project structure cleaner

---

## Implementation Order Recommendation

1. **User Authentication** (Week 1-2)
   - Critical for production deployment
   - Blocks other user-facing features

2. **Test Coverage Setup** (Week 2-3)
   - Important for code quality
   - Prevents regressions
   - Can be done in parallel with other features

3. **Search Integration** (Week 3-4)
   - Improves user experience
   - Relatively quick to implement

4. **Performance Optimizations** (Week 4-5)
   - Important for scale
   - Can be iterative

5. **Export Functionality** (Week 5-6)
   - User-requested feature
   - Quick to implement

6. **Enhanced Discovery Features** (Week 6-7)
   - Nice-to-have enhancements
   - Can be done incrementally

7. **Project Cleanup** (Ongoing)
   - Maintenance task
   - Can be done anytime

---

## Notes

- All priorities are suggestions and can be adjusted based on user needs
- Some tasks can be done in parallel (e.g., test setup + other features)
- Complexity estimates are rough and may vary
- Success criteria should be validated with users
- Each feature should be validated before moving to the next

---

## Questions to Consider

1. **Authentication**: Which auth providers are needed? (Email/Password, Google, GitHub, etc.)
2. **Testing**: What coverage threshold is acceptable? (70%? 80%?)
3. **Performance**: What are the performance targets? (API response time, page load time)
4. **Export**: What formats are needed? (CSV, JSON, XML?)
5. **Discovery**: Which enhancements are most important to users?

---

## Next Action

**Recommended:** Start with **User Authentication (NextAuth.js)** as it's blocking production deployment and is a foundation for other features.

