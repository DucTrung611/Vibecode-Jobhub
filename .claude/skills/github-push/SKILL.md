---
name: github-push
description: Push code changes to GitHub — stage, commit with a well-formed message, and push to the correct branch/remote. Use whenever the user asks to "push code", "push lên github", "commit và push", "đẩy code lên github", "save my changes to github", or wants help writing a commit message and getting local changes onto a remote GitHub repo. Also covers first-time repo setup (git init + remote add) when no remote exists yet, and safely handling uncommitted changes, merge conflicts, or missing upstream branches encountered along the way.
---

# GitHub Push

Push local code changes to a GitHub repository safely and with a clean commit history — either for an existing repo with a remote already configured, or for a brand-new project that needs to be connected to GitHub for the first time.

## Why this matters

A bad push (force-pushing over teammates' work, pushing secrets, pushing to the wrong branch, a vague commit message) is expensive to undo. Moving carefully through checks first, then acting, avoids most of the pain.

## Step 1: Understand the current state

Before doing anything, gather context. Run these (don't ask the user to run them manually — do it yourself):

```bash
git status
git branch --show-current
git remote -v
git log --oneline -5
```

From this, determine:
- **Is this a git repo at all?** If `git status` fails with "not a git repository" → go to [First-time setup](#first-time-setup-no-remote-yet).
- **Is a remote already configured?** If `git remote -v` is empty → go to [First-time setup](#first-time-setup-no-remote-yet).
- **What's staged/unstaged/untracked?** This tells you what `git add` needs to cover.
- **Current branch** — confirm this is where the user actually wants to push (not `main`/`master` by accident, unless that's intended).

## Step 2: Check for anything that shouldn't be committed

Before staging, scan for common mistakes:

```bash
git status --short
cat .gitignore 2>/dev/null
```

Flag to the user (don't just silently commit) if you see:
- `.env`, `.env.local`, or other files that look like they hold secrets/API keys
- `node_modules/`, `dist/`, `build/`, `.DS_Store`, or other generated/dependency directories not already in `.gitignore`
- Large binary files (>5MB) that probably don't belong in git

If any of these are untracked and clearly shouldn't be pushed, add them to `.gitignore` first and confirm with the user before proceeding, rather than committing them and asking forgiveness later.

## Step 3: Stage and commit

```bash
git add <specific files>   # prefer explicit paths over blanket `git add .` when the diff is mixed/unclear
git diff --staged --stat   # sanity check what's about to be committed
git commit -m "<message>"
```

**Commit message format** — use [Conventional Commits](https://www.conventionalcommits.org/) unless the repo's existing log shows a different convention (check `git log --oneline -10` first and match it):

```
<type>(<scope>): <short summary, imperative mood, no period>

[optional body: why, not just what]
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`.

**Examples:**
- Input: added JWT-based login for the auth module
  Output: `feat(auth): add JWT-based login flow`
- Input: fixed a bug where job applications double-submitted
  Output: `fix(applications): prevent duplicate submission on double-click`
- Input: updated the README with setup instructions
  Output: `docs: add local setup instructions to README`

Keep the summary line under ~72 chars. If the change is large or non-obvious, add a short body explaining the *why*.

## Step 4: Summarize and get confirmation — REQUIRED before pushing

**Never push without explicit user confirmation.** After committing (or once the commit message is ready), stop and show the user:

1. **A summary of the changes** — what files changed and what the change does, in plain language (not just a raw diff dump). Group by feature/module if changes span multiple areas.
2. **The exact commit message** you're about to use (or already used).
3. **Target branch and remote** (e.g. "push to `origin/feature/auth-jwt`").

Then explicitly ask for confirmation, e.g.: *"Đây là tóm tắt thay đổi và commit message — bạn xác nhận để mình push lên GitHub nhé?"*

Do not run `git push` in the same turn as this summary. Wait for the user's next message. Proceed to Step 5 only after they confirm (e.g. "ok", "push đi", "confirmed"). If they ask for changes to the commit message or want to amend files, make those changes first and show the updated summary again before asking for confirmation a second time.

If the user's original request already contains an explicit, unambiguous push confirmation for this exact set of changes (e.g. they dictated the exact commit message and said "commit and push now"), you may skip the extra confirmation round — but this is the exception, not the default.

## Step 5: Push

```bash
git push origin <branch>
```

- If the branch has no upstream yet, use `git push -u origin <branch>` (sets tracking so future `git push` alone works).
- If `git push` is rejected because the remote has commits you don't have, **do not force-push**. Instead:
  ```bash
  git pull --rebase origin <branch>
  ```
  Resolve any conflicts (see below), then push again.
- Never use `git push --force` or `git push --force-with-lease` unless the user explicitly asks for it and understands it can overwrite others' work — always warn first if the branch looks shared (i.e. not just the user's personal feature branch).

## Handling merge conflicts

If `git pull --rebase` (or a merge) produces conflicts:
1. Run `git status` to list conflicted files.
2. Open each file, resolve the `<<<<<<<` / `=======` / `>>>>>>>` markers.
3. `git add <resolved files>`
4. `git rebase --continue` (or `git commit` if it was a merge, not a rebase)
5. Push again.

Never blindly pick "ours" or "theirs" for every conflict — look at each hunk. If the conflict touches logic you don't have context on, show the user the conflicting sections and ask which to keep.

## First-time setup (no remote yet)

If there's no git repo, or no GitHub remote configured:

```bash
git init                              # if not already a repo
git add .
git commit -m "chore: initial commit"
git branch -M main                    # ensure branch is named main
git remote add origin <github-url>    # e.g. https://github.com/<user>/<repo>.git
git push -u origin main
```

If the user hasn't given a GitHub URL, ask for it (or whether they want you to create the repo — creating a new GitHub repo requires the `gh` CLI or the GitHub web UI; Claude cannot create repos via plain git commands).

If `gh` CLI is available and authenticated, you can create the repo directly:
```bash
gh repo create <repo-name> --private --source=. --remote=origin --push
```

## Authentication notes

- Pushing requires the environment to already have GitHub credentials configured (SSH key or a credential helper with a personal access token). Claude does not have the ability to set up new GitHub authentication on the user's behalf — if `git push` fails with a permission/auth error, tell the user plainly and point them to check their SSH key or PAT setup rather than trying workarounds.
- Never ask the user to paste a token or password into the conversation.

## Quick checklist before every push

- [ ] `git status` reviewed — nothing unexpected staged
- [ ] No secrets/`.env` files/large binaries being committed
- [ ] Commit message follows the repo's convention and is descriptive
- [ ] Change summary + commit message shown to the user, and they confirmed
- [ ] Pushing to the intended branch
- [ ] No unresolved conflicts