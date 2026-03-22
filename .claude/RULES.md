# SwiftDo — Engineering Rules

These rules are NON-NEGOTIABLE. Follow them in every session.

## Security
- **R1:** Never hardcode API keys, secrets, or credentials. Always use `process.env.VARIABLE_NAME`
- **R2:** All database queries must use parameterised inputs. No string concatenation in SQL/queries

## Data Safety
- **R3:** All payment/financial operations must use database transactions with rollback on failure
- **R4:** Every background job and critical event must be logged to the analytics/events table
- **R5:** Never run DROP TABLE or ALTER TABLE without the user typing CONFIRM-MIGRATION in chat

## Git Discipline
- **R6:** Never use `git add .` — always stage specific files only
- **R7:** Never use `--force` on any git command, ever
- **R8:** Never commit without completing the VERIFY.md checklist first
- **R9:** Every commit message must follow format: `Session X: [description of what changed]`

## Code Quality
- **R10:** No TODO left without a comment explaining what's missing
- **R11:** Every new API endpoint must have input validation
- **R12:** Never delete or overwrite existing working code without confirming with the user first
