# Cursor Autonomous Workflow – Minimal Docs

## Files
- `project_config.md` – long-term memory (goal, stack, rules).  
- `workflow_state.md` – dynamic state + log + rules engine.

## Loop
1. Agent reads `workflow_state.md` → `Phase` & `Status`.  
2. Reads `project_config.md` → constraints.  
3. Acts by phase: ANALYZE → BLUEPRINT → CONSTRUCT → VALIDATE.  
4. Writes back; auto-rotates log & archives blueprints.

## Updating Static Sections
Both files use markers to identify replaceable sections:
- **STATIC:** sections contain configuration that can be replaced wholesale
- **DYNAMIC:** sections are managed by the AI and should not be manually edited

### File Organization
`workflow_state.md` is organized into two main groups:
1. **Static Sections** (top) - Your configuration that rarely changes
2. **Dynamic Sections** (bottom) - AI-managed state that changes frequently

To update a static section:
1. Find the section between `<!-- STATIC:SECTION_NAME:START -->` and `<!-- STATIC:SECTION_NAME:END -->`
2. Replace the entire content between these markers
3. Keep the markers intact

### Static Sections You Can Replace:
**In workflow_state.md:**
- RULES - All workflow rules and phase definitions
- VISUALIZER - The mermaid workflow diagram

**In project_config.md:**
- GOAL - Your project's main objective
- TECH_STACK - Languages, frameworks, tools
- PATTERNS - Coding standards and practices
- CONSTRAINTS - Performance and security limits
- TOKENIZATION - Token counting settings

## Setup
System prompt:

```
You're an autonomous AI developer. Work exclusively with project_config.md and workflow_state.md. 
Before each action, read workflow_state.md to understand context, follow the rules, 
then immediately update workflow_state.md with your actions and results.
```

## Updating Dynamic Sections

Agents must update DYNAMIC sections during workflow execution. These sections are managed by the AI and should be updated using the following patterns:

### Pattern for Updating Dynamic Sections

1. **Always use START/END markers** - Each dynamic section has matching `<!-- DYNAMIC:SECTION_NAME:START -->` and `<!-- DYNAMIC:SECTION_NAME:END -->` markers
2. **Include enough context** - When using search_replace, include sufficient surrounding context to uniquely identify the section
3. **Match exact formatting** - Preserve whitespace, line breaks, and formatting exactly as it appears
4. **Update immediately** - After each action, update the relevant dynamic sections before proceeding

### Dynamic Sections in workflow_state.md

- **STATE** - Current phase, status, item, confidence, files, modules, checkpoint, last updated
- **PLAN** - List of plan items (numbered list with checkboxes)
- **ITEMS** - Table of work items with id, description, status, complexity, confidence, pattern_match, files, modules
- **METRICS** - Tasks count, success rate, quality metrics, performance metrics, diff stats, analysis stats, features
- **CHECKPOINTS** - Table of checkpoints with time, phase, confidence, safe flag, rollback_script
- **LOG** - JSON array of log entries with timestamp, action, phase, status, details
- **WORKFLOW_HISTORY** - Table of commits with commit hash, message, date
- **ARCHIVE_LOG** - Rotated log summaries (currently empty)
- **BLUEPRINT_HISTORY** - Archived plans (currently empty)
- **VERSION_CHANGELOG** - Version tracking table (currently empty)
- **DIFF_TRACKING** - Build differences (currently empty)

### Example: Updating State Section

```markdown
<!-- DYNAMIC:STATE:START -->
## State
Phase: IMPLEMENT
Status: IN_PROGRESS
Item: fix-missing-markers
Confidence: 9
Files: cursorkleosr/workflow_state.md
Modules: config
Checkpoint: markers-added

Last Updated: 2025-01-28

Added missing START markers for all DYNAMIC sections in workflow_state.md.
<!-- DYNAMIC:STATE:END -->
```

### Example: Updating Plan Section

```markdown
<!-- DYNAMIC:PLAN:START -->
## Plan
1. ✅ Analyze project structure and current state
2. ✅ Run lint, typecheck, and build validation
3. ✅ Fix missing START markers in workflow_state.md
4. ⏳ Reformat State section with proper line breaks
<!-- DYNAMIC:PLAN:END -->
```

### Example: Adding Log Entry

When adding to the Log section, append a new JSON object to the array:

```markdown
<!-- DYNAMIC:LOG:START -->
## Log
```json
{
  "timestamp": "2025-01-28",
  "action": "fix_workflow_markers",
  "phase": "IMPLEMENT",
  "status": "SUCCESS",
  "details": "Added missing START markers for all DYNAMIC sections"
}
```
<!-- DYNAMIC:LOG:END -->
```

## Troubleshooting Common Errors

### Error: "The string to replace was not found in the file"

**Cause**: The search string doesn't exactly match the content in the file, often due to:
- Missing or incorrect whitespace
- Missing line breaks
- Incorrect marker names
- Missing START or END markers

**Solution**:
1. Read the file first to see the exact content
2. Include more context around the target string
3. Verify START/END markers exist and are correctly named
4. Check for exact whitespace and line break matches
5. Use unique identifying strings (e.g., include section headers)

### Error: "model supplied an ambiguous edit"

**Cause**: The search string appears multiple times in the file, making it impossible to determine which occurrence to replace.

**Solution**:
1. Include more unique context (surrounding lines, section headers)
2. Include START/END markers in the search string
3. Use a longer, more specific search string
4. Target the specific section by including section markers

### Error: Section markers not found

**Cause**: Missing START or END markers for the section you're trying to update.

**Solution**:
1. Verify all sections have matching START/END markers
2. Check marker syntax: `<!-- DYNAMIC:SECTION_NAME:START -->` and `<!-- DYNAMIC:SECTION_NAME:END -->`
3. Ensure marker names match exactly (case-sensitive)
4. If markers are missing, add them before updating the section

### Best Practices for Reliable Updates

1. **Always read the file first** - Use read_file to see current state before making changes
2. **Include section markers** - Include START/END markers in your search string when updating sections
3. **Use unique identifiers** - Include section headers, timestamps, or IDs to make strings unique
4. **Preserve formatting** - Match exact whitespace, line breaks, and indentation
5. **Test with small changes** - Make smaller, incremental updates rather than large replacements
6. **Verify after updates** - Read the file again after updates to confirm changes were applied correctly

## Examples of Proper Section Updates

### Example 1: Updating State Section

**Before:**
```markdown
<!-- DYNAMIC:STATE:START -->
## State
Phase: COMPLETED
Status: SUCCESS
...
<!-- DYNAMIC:STATE:END -->
```

**Update:**
```markdown
<!-- DYNAMIC:STATE:START -->
## State
Phase: IMPLEMENT
Status: IN_PROGRESS
Item: new-feature
Confidence: 8
Files: app/new-feature/page.tsx
Modules: frontend
Checkpoint: feature-started

Last Updated: 2025-01-28

Started implementing new feature.
<!-- DYNAMIC:STATE:END -->
```

**Search string should include:**
- The START marker
- Section header (## State)
- Enough of the old content to be unique
- The END marker

### Example 2: Adding to Plan Section

**Before:**
```markdown
<!-- DYNAMIC:PLAN:START -->
## Plan
1. ✅ Task 1
2. ✅ Task 2
<!-- DYNAMIC:PLAN:END -->
```

**After:**
```markdown
<!-- DYNAMIC:PLAN:START -->
## Plan
1. ✅ Task 1
2. ✅ Task 2
3. ⏳ Task 3
<!-- DYNAMIC:PLAN:END -->
```

**Search string:** Include the last completed task and the END marker to ensure uniqueness.

### Example 3: Adding Log Entry

**Before:**
```markdown
<!-- DYNAMIC:LOG:START -->
## Log
```json
{
  "timestamp": "2025-01-27",
  "action": "previous_action",
  ...
}
```
<!-- DYNAMIC:LOG:END -->
```

**After:**
```markdown
<!-- DYNAMIC:LOG:START -->
## Log
```json
{
  "timestamp": "2025-01-27",
  "action": "previous_action",
  ...
},
{
  "timestamp": "2025-01-28",
  "action": "new_action",
  "phase": "IMPLEMENT",
  "status": "SUCCESS"
}
```
<!-- DYNAMIC:LOG:END -->
```

**Search string:** Include the last log entry and the closing markers to ensure you're appending correctly.

## File Structure Validation

Before making updates, validate that:
1. All DYNAMIC sections have matching START/END markers
2. All STATIC sections have matching START/END markers
3. Section names are consistent (case-sensitive)
4. Markers use correct syntax: `<!-- DYNAMIC:SECTION_NAME:START -->`
5. No duplicate section names exist
6. File structure matches expected format

## Quick Reference

- **Static Sections**: RULES, VISUALIZER, VERSION_INFO (in workflow_state.md)
- **Dynamic Sections**: STATE, PLAN, ITEMS, METRICS, CHECKPOINTS, LOG, WORKFLOW_HISTORY, ARCHIVE_LOG, BLUEPRINT_HISTORY, VERSION_CHANGELOG, DIFF_TRACKING
- **Marker Format**: `<!-- STATIC|DYNAMIC:SECTION_NAME:START|END -->`
- **Update Pattern**: Read → Identify section → Include markers in search → Replace with new content → Verify
