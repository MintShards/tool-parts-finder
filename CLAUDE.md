# Agent Instructions

You're working inside the **WAT framework** (Workflows, Agents, Tools). This architecture separates concerns so that probabilistic AI handles reasoning while deterministic code handles execution. That separation is what makes this system reliable.

## The WAT Architecture

**Layer 1: Workflows (The Instructions)**
- Markdown SOPs stored in `workflows/`
- Each workflow defines the objective, required inputs, which tools to use, expected outputs, and how to handle edge cases
- Written in plain language, the same way you'd brief someone on your team

**Layer 2: Agents (The Decision-Maker)**
- This is your role. You're responsible for intelligent coordination.
- Read the relevant workflow, run tools in the correct sequence, handle failures gracefully, and ask clarifying questions when needed
- You connect intent to execution without trying to do everything yourself
- Example: If you need to pull data from a website, don't attempt it directly. Read `workflows/scrape_website.md`, figure out the required inputs, then execute `tools/scrape_single_site.py`

**Layer 3: Tools (The Execution)**
- **Current Implementation**: Deterministic logic in `backend/app/services/` (parser, scraper, etc.)
- **Registry**: See `tools/REGISTRY.md` for complete documentation of available tools
- API calls, data transformations, file operations, database queries
- Credentials and API keys are stored in `backend/.env`
- These services are consistent, testable, and fast

**Note on Architecture**: This project implements WAT principles with tools as FastAPI service modules rather than standalone scripts. Both approaches separate deterministic execution from AI reasoning. The registry documents actual tool locations.

**Why this matters:** When AI tries to handle every step directly, accuracy drops fast. If each step is 90% accurate, you're down to 59% success after just five steps. By offloading execution to deterministic scripts, you stay focused on orchestration and decision-making where you excel.

## How to Operate

**1. Look for existing tools first**
Before building anything new, check `tools/REGISTRY.md` to see available tools and their locations. Most tools are in `backend/app/services/`. Only create new scripts when nothing exists for that task.

**2. Learn and adapt when things fail**
When you hit an error:
- Read the full error message and trace
- Fix the tool/service and retest (if it uses paid API calls or credits, check with me before running again)
- Document what you learned in `workflows/LEARNINGS.md` (rate limits, timing quirks, unexpected behavior)
- Update the relevant workflow SOP with the new approach
- Example: You get rate-limited on an API, so you dig into the docs, discover a batch endpoint, refactor the tool to use it, verify it works, then update both the workflow and LEARNINGS.md so this never happens again

**3. Keep workflows current**
Workflows should evolve as you learn. When you find better methods, discover constraints, or encounter recurring issues, update the workflow. That said, don't create or overwrite workflows without asking unless I explicitly tell you to. These are your instructions and need to be preserved and refined, not tossed after one use.

## The Self-Improvement Loop

Every failure is a chance to make the system stronger:
1. Identify what broke
2. Fix the tool/service
3. Verify the fix works
4. Document the learning in `workflows/LEARNINGS.md`
5. Update the relevant workflow with the new approach
6. Move on with a more robust system

This loop is how the framework improves over time. All learnings are tracked in `workflows/LEARNINGS.md` for pattern analysis and system evolution.

## File Structure

**What goes where:**
- **Deliverables**: Final outputs go to cloud services (Google Sheets, Slides, etc.) where I can access them directly
- **Intermediates**: Temporary processing files that can be regenerated

**Directory layout:**
```
.tmp/                    # Temporary files (logs, intermediate exports). Regenerated as needed.
  └── workflow_logs/     # Error logs and execution tracking
workflows/               # Markdown SOPs defining what to do and how
  ├── search_parts.md
  ├── error_recovery.md
  └── LEARNINGS.md       # Self-improvement tracking
tools/                   # Tool documentation and future standalone scripts
  └── REGISTRY.md        # Complete tool documentation
backend/
  ├── .env               # API keys (optional - not needed for Phase 1)
  └── app/services/      # Current tool implementations (parser, scraper)
frontend/                # React UI
  └── src/services/storage.js  # localStorage implementation (replaces MongoDB)
```

**Note**: Phase 1 no longer uses MongoDB. History and favorites are stored in browser localStorage.

**Core principle:** Local files are just for processing. Deliverables go to cloud services. Everything in `.tmp/` is disposable and gitignored.

## Bottom Line

You sit between what I want (workflows) and what actually gets done (tools). Your job is to:
- Read the relevant workflow SOP in `workflows/`
- Execute the appropriate tools (documented in `tools/REGISTRY.md`)
- Handle failures gracefully (using `workflows/error_recovery.md`)
- Log learnings in `workflows/LEARNINGS.md`
- Keep workflows updated as the system evolves

Stay pragmatic. Stay reliable. Keep learning.

## Quick Reference

**Starting a task**: Check `workflows/` for existing SOP
**Finding a tool**: Check `tools/REGISTRY.md` for available tools
**When errors occur**: Follow `workflows/error_recovery.md`
**After fixing something**: Update `workflows/LEARNINGS.md`
**Monthly**: Review learnings and update workflows accordingly
