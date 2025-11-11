# Agent Workflow Guide

This guide explains the workflow for agents working on the CinemaRebel project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Daily Workflow](#daily-workflow)
3. [Branch Strategy](#branch-strategy)
4. [Commit Guidelines](#commit-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Conflict Resolution](#conflict-resolution)
7. [Best Practices](#best-practices)

## Getting Started

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/Peterapdk/CusorFLIX.git
cd CinemaRebel/CinemaRebel

# Install dependencies
npm install

# Verify setup
npm run build
npm run lint
```

### 2. Claim Your Task

1. Open `AGENT_ASSIGNMENTS.md`
2. Find an unassigned task or create a new section
3. Mark status as `[IN PROGRESS]`
4. Note your agent identifier and branch name

### 3. Create Your Branch

```bash
# Always start from latest main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/[agent-id]/[task-name]

# Example:
git checkout -b feature/agent1/typescript-types
```

## Daily Workflow

### Morning Routine

```bash
# 1. Switch to main and pull latest
git checkout main
git pull origin main

# 2. Switch to your branch
git checkout feature/[agent-id]/[task-name]

# 3. Merge latest main into your branch
git merge main

# 4. Resolve any conflicts if they occur
# (See Conflict Resolution section)

# 5. Push your updated branch
git push origin feature/[agent-id]/[task-name]
```

### During Work

```bash
# Make your changes to assigned files

# Stage specific files (not all files)
git add path/to/file1.ts path/to/file2.tsx

# Commit with descriptive message
git commit -m "feat(types): Add TMDB movie type definitions"

# Push frequently
git push origin feature/[agent-id]/[task-name]
```

### End of Day

```bash
# Commit any uncommitted work
git add .
git commit -m "chore: Save work in progress"

# Push to remote
git push origin feature/[agent-id]/[task-name]

# Update AGENT_ASSIGNMENTS.md with progress
```

## Branch Strategy

### Branch Naming Convention

Use this format: `feature/[agent-id]/[task-name]`

**Examples:**
- `feature/agent1/typescript-types`
- `feature/agent2/console-cleanup`
- `feature/agent3/image-optimization`

### Branch Rules

1. **One branch per task** - Don't mix multiple tasks in one branch
2. **Keep branches focused** - Small, focused changes are easier to review
3. **Regular updates** - Merge main into your branch daily
4. **Delete after merge** - Clean up merged branches

## Commit Guidelines

### Commit Message Format

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `test`: Test changes
- `chore`: Maintenance tasks

### Examples

```bash
# Good commit messages
git commit -m "feat(types): Add TMDB API type definitions"
git commit -m "fix(images): Add missing sizes attribute to MediaCard"
git commit -m "refactor(carousel): Optimize scroll calculations"
git commit -m "docs(readme): Update setup instructions"

# Bad commit messages
git commit -m "fix stuff"
git commit -m "updates"
git commit -m "WIP"
```

### Commit Frequency

- **Commit often** - Small, logical commits are better
- **One change per commit** - Don't mix unrelated changes
- **Test before commit** - Ensure code compiles and lints

## Pull Request Process

### Before Creating PR

1. **Update AGENT_ASSIGNMENTS.md**
   - Mark your task as `[COMPLETED]`
   - Add PR link when created

2. **Ensure code quality**
   ```bash
   npm run lint
   npm run build
   npx tsc --noEmit
   ```

3. **Sync with main**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/[agent-id]/[task-name]
   git merge main
   # Resolve conflicts if any
   git push origin feature/[agent-id]/[task-name]
   ```

### Creating PR

1. **Push your branch**
   ```bash
   git push origin feature/[agent-id]/[task-name]
   ```

2. **Create PR on GitHub**
   - Go to repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out PR template
   - Add reviewers if needed

3. **PR Title Format**
   ```
   type(scope): description
   
   Example: feat(types): Add TMDB type definitions
   ```

4. **PR Description**
   - Use the PR template
   - List all changes made
   - Include testing information
   - Reference related issues

### PR Review Process

1. **Wait for CI** - Ensure all checks pass
2. **Address feedback** - Make requested changes
3. **Update PR** - Push new commits to same branch
4. **Mark ready** - Request re-review when ready

## Conflict Resolution

### When Conflicts Occur

1. **Identify conflicted files**
   ```bash
   git status
   ```

2. **Open conflicted files**
   - Look for conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`
   - Resolve conflicts manually
   - Keep both changes if needed
   - Remove conflict markers

3. **Stage resolved files**
   ```bash
   git add path/to/resolved/file.ts
   ```

4. **Complete merge**
   ```bash
   git commit -m "fix: Resolve merge conflicts with main"
   ```

### Preventing Conflicts

1. **Pull main frequently** - At least once per day
2. **Work on separate files** - Check AGENT_ASSIGNMENTS.md
3. **Communicate** - If you need to modify an assigned file
4. **Small PRs** - Easier to merge and review

## Best Practices

### Code Quality

- ✅ Write clean, readable code
- ✅ Follow TypeScript best practices
- ✅ Use meaningful variable names
- ✅ Add comments for complex logic
- ✅ Keep functions small and focused

### Git Practices

- ✅ Commit frequently with clear messages
- ✅ Pull main before starting work
- ✅ Keep branches up to date
- ✅ Test before committing
- ✅ Review your own code before PR

### Collaboration

- ✅ Update AGENT_ASSIGNMENTS.md regularly
- ✅ Communicate with other agents
- ✅ Ask for help when stuck
- ✅ Review other agents' PRs
- ✅ Be respectful and constructive

### File Management

- ✅ Only modify assigned files
- ✅ Don't delete files without checking
- ✅ Create new files in correct locations
- ✅ Follow project structure conventions

## Troubleshooting

### Build Fails Locally

```bash
# Clean and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Lint Errors

```bash
# Auto-fix what can be fixed
npm run lint -- --fix

# Check specific file
npx eslint path/to/file.tsx
```

### Type Errors

```bash
# Check types
npx tsc --noEmit

# Check specific file
npx tsc --noEmit path/to/file.ts
```

### Git Issues

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- path/to/file.ts

# Reset to remote state
git fetch origin
git reset --hard origin/main
```

## Quick Reference

### Daily Commands

```bash
# Start of day
git checkout main && git pull && git checkout your-branch && git merge main

# During work
git add . && git commit -m "type(scope): message" && git push

# End of day
git push origin your-branch
```

### Useful Aliases (Optional)

Add to `~/.gitconfig`:

```ini
[alias]
    sync = !git checkout main && git pull && git checkout -
    update = !git checkout main && git pull && git checkout - && git merge main
    save = !git add . && git commit -m "chore: Save work in progress"
```

## Support

For questions or issues:
- Check `AGENT_ASSIGNMENTS.md` for task assignments
- Review this guide for workflow questions
- Check GitHub Issues for project-specific problems
- Ask in team communication channel

