# Multi-Agent Development Workflow

A structured system of 14 specialized agents and 7 knowledge topic files for this project.

---

## Setup

**First run:**

1. Invoke `@context-scanner` to populate `.claude/context.md` and all seven knowledge files
2. Review `.claude/knowledge/design-language.md` after the scan — it is often thin from automated inspection. If this project has a defined aesthetic (color palette, type scale, motion preferences), populate it manually.

---

## Full workflow per feature

Run agents in this order. Conditional agents are skipped when not applicable.

| Step | Agent | Condition |
|------|-------|-----------|
| 1 | `@project-manager` | Always — break down the feature |
| 2 | `@stakeholder` | Always — approve or revise scope |
| 3 | `@database-architect` | **CONDITIONAL** — only when the feature touches the data layer |
| 4 | `@backend-engineer` and/or `@frontend-engineer` | Always — implementation (may run in parallel once API contract is agreed) |
| 5 | `@ui-ux-critic` | **CONDITIONAL** — only when the change includes new or modified UI surfaces |
| 6 | `@security-auditor` | **CONDITIONAL** — only when the feature introduces or modifies auth, accepts user input, handles payments or PII, or integrates an external API |
| 7 | `@test-engineer` | Always — write automated tests |
| 8 | `@code-reviewer` | Always — review implementation and tests |
| 9 | `@qa-engineer` | Always — walkthrough plan and edge case catalog |
| 10 | `@devops-engineer` | **CONDITIONAL** — only when the feature requires deployment changes, new services, env var changes, or CI/CD updates |
| 11 | `@technical-writer` | **CONDITIONAL** — only when something externally observable or non-obvious changed |

Most features invoke six to eight of these eleven feature-time agents.

---

## Maintenance agents

These run outside the feature flow.

| Agent | When to invoke |
|-------|---------------|
| `@context-scanner` | Initial setup, framework upgrades, major refactors, new conventions adopted, or after significant drift since the last scan |
| `@knowledge-curator` | When a topic file is flagged stale via `knowledge_gaps_detected`, when the user explicitly requests a refresh, or after a major change affects stack/conventions/schema/infra/decisions |

---

## Invocation

**Manual:** `@agent-name` followed by your request. Example:

```
@project-manager Break down the new contact form feature
```

**Automatic:** When the orchestrator is active, agents are routed based on their `description` fields.

---

## State and knowledge flow

Each agent ends every response with a `STATE` block containing:

- `current_task` — what was worked on
- `decisions` — interpretive calls made
- `artifacts` — files created or modified
- `open_questions` — blockers or ambiguities
- `handoff_notes` — what the next agent needs to know
- `knowledge_gaps_detected` — stale or missing topic file content (triggers knowledge-curator)

**Knowledge files** (`.claude/knowledge/`) are read-optimized caches — narrow summaries for fast agent context loading. `.claude/context.md` is the deep reference. Agents read their assigned topic files, not the full context.md.

When `knowledge_gaps_detected` is non-empty in a STATE block, invoke `@knowledge-curator` with the specific topic files listed before continuing the feature workflow.

---

## Extending the system

To add a new agent:

1. Create `.claude/agents/your-agent-name.md` with YAML frontmatter (`name`, `description`, `tools`)
2. Structure the body as GOAL / ENVIRONMENT / PROCESS / HARD CONSTRAINTS / STATE
3. In the ENVIRONMENT section, assign specific topic files from `.claude/knowledge/`
4. Restrict tools to what the agent actually needs
5. Define explicit refusal cases (what the agent redirects elsewhere) and handoff targets
6. Add the agent to this README in the appropriate workflow step

---

## When to re-run context-scanner

- After a framework upgrade
- After a major refactor that changes file organization or conventions
- After adopting new conventions (linting rules, commit format, etc.)
- After dropping this system into a project that has changed significantly since the last scan
- When knowledge files have drifted so far that knowledge-curator alone isn't enough

---

## Knowledge file assignments by agent

| Topic file | Agents that read it |
|------------|-------------------|
| `stack.md` | backend-engineer, frontend-engineer, test-engineer, security-auditor, devops-engineer, database-architect |
| `conventions.md` | project-manager, backend-engineer, frontend-engineer, test-engineer, code-reviewer, database-architect, devops-engineer, technical-writer, ui-ux-critic |
| `schema-overview.md` | database-architect, backend-engineer |
| `api-patterns.md` | backend-engineer, frontend-engineer, test-engineer, security-auditor, qa-engineer |
| `design-language.md` | frontend-engineer, ui-ux-critic, qa-engineer |
| `infra.md` | security-auditor, devops-engineer |
| `decisions.md` | project-manager, stakeholder, database-architect, technical-writer |
