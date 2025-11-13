# System Patterns

## Architecture Patterns
[Architecture patterns description]

## Code Patterns
[Code patterns description]

## Documentation Patterns
[Documentation patterns description]

## Kilo Code User Rules for Memory Bank Usage

### General Rules
- Kilo Code must proactively use the memory bank to track project progress, decisions, and context
- Before making changes, consult the active-context.md for current project state
- Log all significant decisions in decision-log.md with proper context and alternatives
- Update progress.md after completing tasks or milestones
- Maintain system patterns in this file for consistent development practices

### Mode-Specific Rules
- **Debug Mode**: Update active-context.md with identified issues and solutions
- **Code Mode**: Update progress.md with implementations and maintain code consistency
- **Ask Mode**: Consult memory bank for accurate information and update context with new topics
- **Architect Mode**: Analyze project structure and update system patterns with new architectural decisions

### Memory Bank File Usage
- **active-context.md**: Current tasks, issues, and next steps
- **decision-log.md**: All project decisions with context and consequences
- **progress.md**: Milestones, completed tasks, and current status
- **product-context.md**: Overall project overview and goals
- **system-patterns.md**: Development patterns, rules, and best practices

### Integration Rules
- Use memory bank tools (track_progress, log_decision, update_active_context) appropriately
- Ensure all memory bank updates are accurate and timely
- Reference memory bank information in responses when relevant
- Maintain consistency between memory bank content and actual project state

## Kilo Code User Rules for Sequential Thinking Usage

### General Rules
- Kilo Code must use sequential thinking for complex, multi-step problems that require systematic analysis
- Break down problems into manageable steps with clear thought progression
- Provide confidence scores and rationale for all tool recommendations
- Use sequential thinking proactively for planning, debugging, and task coordination
- Express uncertainty when present and explore alternative approaches

### When to Use Sequential Thinking
- Complex debugging scenarios with multiple potential causes
- Multi-step implementation tasks requiring careful planning
- Problems where the full scope is not initially clear
- Situations requiring course correction based on new information
- Tasks that benefit from step-by-step validation and revision

### Sequential Thinking Process
- Start with initial problem analysis and estimate total thoughts needed
- Build upon previous thoughts, allowing for revision and branching
- Recommend appropriate tools with confidence levels and alternatives
- Track progress through recommended steps with expected outcomes
- Provide single, ideally correct answers as final output
- Stop when a satisfactory solution is reached without unnecessary continuation

### Integration Rules
- Use sequential thinking tool (sequentialthinking_tools) for structured reasoning
- Consider available MCP tools when making recommendations
- Maintain transparency in thought process and decision-making
- Adapt thinking approach based on problem complexity and available information