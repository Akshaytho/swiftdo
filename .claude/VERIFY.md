# SwiftDo — Pre-Commit Verification Checklist

> Run this checklist BEFORE every commit. Do not skip any check.
> Claude: Go through each check, mark ✅ or ❌, and STOP if any check fails.

---

## Security Checks
- [ ] **Check 1:** No `.env` or `.env.local` in staged files
  - Run: `git diff --cached --name-only | grep -i "\.env"`
  - Expected: No output (empty = pass)

- [ ] **Check 2:** No hardcoded API keys, secrets, or passwords in staged files
  - Run: `git diff --cached | grep -iE "(api_key|secret|password|token)\s*[:=]"`
  - Expected: No output (empty = pass)

## Intent Checks
- [ ] **Check 3:** All staged files are intentional (no accidental files)
  - Run: `git diff --cached --name-only`
  - Action: Review the list — every file should be there on purpose

- [ ] **Check 4:** No destructive SQL (DROP, ALTER, TRUNCATE) without CONFIRM-MIGRATION
  - Run: `git diff --cached | grep -iE "(DROP|ALTER|TRUNCATE)"`
  - If found: STOP and ask the user to type CONFIRM-MIGRATION

## Code Quality Checks
- [ ] **Check 5:** No partial/incomplete files without a TODO comment explaining what's missing
  - Action: Review staged diffs for incomplete functions or placeholder code
  - If found: Add `// TODO: [explanation]` before committing

- [ ] **Check 6:** No `console.log` debugging statements left in (allow intentional logging)
  - Run: `git diff --cached | grep "console.log"`
  - Action: Remove debug logs, keep intentional ones

## Documentation Checks
- [ ] **Check 7:** HANDOFF.md has been updated with current session's work
  - Action: Verify the session number, date, and file registry are current

- [ ] **Check 8:** SPRINT.md reflects any features that were built or changed this session
  - Action: Mark newly completed features as [x]

---

## How to Use This Checklist

### Before staging:
```bash
git status                          # See what changed
git diff [filename]                 # Review each file's changes
```

### Stage specific files only:
```bash
git add src/file1.js src/file2.js   # NEVER use git add .
```

### After staging, run checks:
```bash
git diff --cached --name-only       # See what's staged
git diff --cached                   # Review all staged changes
```

### If all checks pass:
```bash
git commit -m "Session X: [description of changes]"
```

### If any check FAILS:
```bash
git reset HEAD [filename]           # Unstage the problem file
# Fix the issue
# Re-run checklist
```

---

**Remember: It's better to commit less and commit clean than to commit everything and break something.**
