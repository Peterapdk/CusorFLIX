# Project Cleanup Plan

**Created:** 2025-01-28  
**Status:** Ready for Execution  
**Purpose:** Identify and remove outdated, redundant, or unnecessary files

## Files Identified for Removal

### 1. Completed/Historical Documentation Files
These files document completed work and can be archived or removed:

- `DEBUG_PLAN.md` - All issues resolved (marked as COMPLETED in 2025-01-27)
- `COMPLETION_SUMMARY.md` - Historical summary of completed fixes
- `FRONTEND_OPTIMIZATION_PLAN.md` - Phase 1 & 2 completed (2025-01-27)
- `FRONTEND_OPTIMIZATION_SUMMARY.md` - Historical implementation summary
- `THEMING_IMPLEMENTATION_PLAN.md` - Theming system completed (2025-11-07)
- `NEXT_STEPS_COMPLETED.md` - Initial setup steps completed (outdated)

**Decision:** Archive to `docs/archive/` or remove if information is in workflow_state.md

### 2. Unused/Outdated Reference Code
- `v0-theming-reference/` - Entire directory
  - Reference code for theming implementation
  - Theming already implemented in main codebase
  - No imports found referencing this directory
  - Contains duplicate components, configs, and assets

**Decision:** Remove entire directory (theming is already implemented)

### 3. Build Artifacts
- `tsconfig.tsbuildinfo` - TypeScript build cache
  - Should be in .gitignore
  - Currently untracked (good)
  - Can be safely deleted (will regenerate on next build)

**Decision:** Add to .gitignore and delete from repository

### 4. Random/Unused Files
- `img_1762434745038.png` - Unidentified image file
  - No references found in codebase
  - Unknown purpose
  - Appears to be temporary/accidental

**Decision:** Remove if not needed

### 5. Agent Documentation (Review for Relevance)
These files may be outdated or unused:

- `AGENT_ASSIGNMENTS.md` - Multi-agent collaboration tracker
  - All tasks show "Not Started"
  - May not be actively used
  - Review if multi-agent workflow is still relevant

- `MULTI_AGENT_SETUP.md` - Setup guide for multi-agent collaboration
  - May be outdated
  - Review if still relevant

- `cursor_frontend_agent.md` - Agent documentation
- `cursor_integration_agent.md` - Agent documentation
- `docs/AGENT_WORKFLOW.md` - Agent workflow documentation

**Decision:** Review and consolidate or remove if not actively used

### 6. Prompt/Documentation Files (Review)
- `cinemarebel-prompt.md` - Review for relevance
- `cinemarebel.md` - Review for relevance
- `vidora.md` - Review for relevance
- `cinemaos API Documentation.md` - Verify if still accurate

**Decision:** Review content and keep if useful, remove if outdated

## Cleanup Actions

### Phase 1: Safe Removals (Low Risk)
1. Delete `tsconfig.tsbuildinfo` (will regenerate)
2. Delete `v0-theming-reference/` directory (unused reference code)
3. Delete `img_1762434745038.png` (unidentified file)

### Phase 2: Archive Historical Documentation (Medium Risk)
1. Create `docs/archive/` directory
2. Move completed plan files to archive:
   - `DEBUG_PLAN.md`
   - `COMPLETION_SUMMARY.md`
   - `FRONTEND_OPTIMIZATION_PLAN.md`
   - `FRONTEND_OPTIMIZATION_SUMMARY.md`
   - `THEMING_IMPLEMENTATION_PLAN.md`
   - `NEXT_STEPS_COMPLETED.md`

### Phase 3: Review and Consolidate (Requires Review)
1. Review agent documentation files
2. Review prompt/documentation files
3. Consolidate or remove based on relevance
4. Update .gitignore with build artifacts

## Verification Steps

After cleanup:
1. Run `npm run build` - Verify build still works
2. Run `npm run lint` - Verify no errors
3. Run `npx tsc --noEmit` - Verify no type errors
4. Check git status - Verify only expected changes
5. Test application - Verify functionality intact

## Risk Assessment

**Low Risk:**
- Removing build artifacts (tsconfig.tsbuildinfo)
- Removing unused reference directory (v0-theming-reference)
- Removing unidentified image file

**Medium Risk:**
- Archiving historical documentation (information preserved in workflow_state.md)
- Reviewing agent documentation (may contain useful information)

**High Risk:**
- Removing files without review (avoided by review phase)

## Execution Order

1. Add tsconfig.tsbuildinfo to .gitignore
2. Delete tsconfig.tsbuildinfo file
3. Delete v0-theming-reference directory
4. Delete img_1762434745038.png
5. Create docs/archive directory
6. Move historical docs to archive
7. Review and consolidate remaining files
8. Verify build and functionality

